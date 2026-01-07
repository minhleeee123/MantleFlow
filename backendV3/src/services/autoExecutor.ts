import { PrismaClient } from '@prisma/client';
import { getCurrentPrice, getPricesBatch, getRSI, get24hVolume, getGasPrice, getMovingAverage, getSentimentScore } from './market.js';
import { blockchainService } from './blockchain.js';
import { sendEmail } from './email.js';

const prisma = new PrismaClient();

// Constants (since we removed enums for SQLite)
const TriggerType = {
    BUY: 'BUY',
    SELL: 'SELL'
} as const;

const TriggerStatus = {
    ACTIVE: 'ACTIVE',
    EXECUTED: 'EXECUTED',
    CANCELLED: 'CANCELLED',
    FAILED: 'FAILED'
} as const;

let isRunning = false;
let intervalId: NodeJS.Timeout | null = null;

const CHECK_INTERVAL = 30000; // 30 seconds

/**
 * Check and execute a single trigger using bot delegated swap
 */
async function checkAndExecuteTrigger(trigger: any, currentPrice: number): Promise<void> {
    try {
        console.log(`\n🔍 Checking trigger ${trigger.id.substring(0, 8)}... (${trigger.symbol} ${trigger.type})`);

        let shouldExecute = false;

        // 1. Basic Price Condition Check
        if (trigger.condition === 'ABOVE') {
            shouldExecute = currentPrice >= trigger.targetPrice;
        } else if (trigger.condition === 'BELOW') {
            shouldExecute = currentPrice <= trigger.targetPrice;
        } else {
            // Fallback legacy logic
            if (trigger.type === TriggerType.BUY) {
                shouldExecute = currentPrice <= trigger.targetPrice;
            } else {
                shouldExecute = currentPrice >= trigger.targetPrice;
            }
        }

        console.log(`   Price Check: $${currentPrice} vs Target $${trigger.targetPrice} (${trigger.condition}) => ${shouldExecute}`);

        // 2. ✨ Smart Conditions Check (RSI, Volume, Gas, etc.)
        if (shouldExecute && trigger.smartConditions) {
            try {
                const conditions = JSON.parse(trigger.smartConditions);
                if (Array.isArray(conditions) && conditions.length > 0) {
                    console.log(`   🧠 Checking ${conditions.length} smart conditions...`);

                    for (const cond of conditions) {
                        let realValue = 0;
                        let metricName = cond.metric;

                        switch (cond.metric) {
                            case 'PRICE':
                                realValue = currentPrice;
                                break;
                            case 'RSI':
                                realValue = await getRSI(trigger.symbol);
                                break;
                            case 'VOLUME':
                                realValue = await get24hVolume(trigger.symbol);
                                // Convert volume to millions for easier comparison if user inputs "100" for "100M"
                                // But usually AI agent handles raw numbers. Let's assume raw for now or Agent handles it.
                                // Re-reading agent prompt: Agent outputs raw numbers. CoinGecko returns raw.
                                // Improvement: specific handling might be needed but raw is safest.
                                break;
                            case 'GAS':
                                realValue = await getGasPrice();
                                break;
                            case 'MA':
                                realValue = await getMovingAverage(trigger.symbol);
                                break;
                            case 'SENTIMENT':
                                realValue = await getSentimentScore() * 100; // Convert 0-1 to 0-100
                                break;
                            default:
                                console.warn(`   ⚠️ Unknown metric: ${cond.metric}`);
                                continue;
                        }

                        // Evaluate
                        const isGT = cond.operator === 'GT';
                        const isMet = isGT ? (realValue > cond.value) : (realValue < cond.value);

                        console.log(`      [${cond.metric}] Real: ${realValue.toFixed(2)} | Target: ${cond.operator} ${cond.value} => ${isMet ? '✅' : '❌'}`);

                        if (!isMet) {
                            shouldExecute = false;
                            break; // Stop checking if one fails
                        }
                    }
                }
            } catch (err) {
                console.error('   ❌ Error parsing smart conditions:', err);
                // Don't convert to false, maybe? Or play safe? 
                // Play safe: if we can't verify, we don't execute.
                shouldExecute = false;
            }
        }

        console.log(`   Current: $${currentPrice} | Target: $${trigger.targetPrice} | Execute: ${shouldExecute}`);

        if (!shouldExecute) {
            return;
        }

        console.log(`   ✅ CONDITIONS MET! Executing ${trigger.type}...`);

        // Determine swap direction
        const fromToken = trigger.type === TriggerType.BUY ? 'USDT' : 'MNT';
        const amountToSwap = trigger.amount || 10;

        // Check if bot is authorized
        const isAuthorized = await blockchainService.isUserAuthorizedBot(trigger.user.walletAddress);
        if (!isAuthorized) {
            console.log(`   ⚠️ Bot not authorized by user. Skipping...`);
            await prisma.trigger.update({
                where: { id: trigger.id },
                data: { status: TriggerStatus.FAILED }
            });
            return;
        }

        // 🛡️ RACE CONDITION CHECK: Re-fetch trigger status before execution
        // This prevents double execution if multiple bot instances are running
        const freshTrigger = await prisma.trigger.findUnique({ where: { id: trigger.id } });
        if (!freshTrigger || freshTrigger.status !== TriggerStatus.ACTIVE) {
            console.log(`   ⚠️ Trigger ${trigger.id.substring(0, 8)} checks failed or already executed. Skipping.`);
            return;
        }

        // Check balance
        const hasBalance = await blockchainService.checkVaultBalance(
            trigger.user.walletAddress,
            fromToken,
            amountToSwap
        );

        if (!hasBalance) {
            console.log(`   ❌ Insufficient balance. Skipping...`);
            return; // Keep ACTIVE, user might deposit later
        }

        try {
            // Execute bot swap
            const swapResult = await blockchainService.executeBotSwap({
                userAddress: trigger.user.walletAddress,
                fromToken: fromToken as 'MNT' | 'USDT',
                amount: amountToSwap,
                slippagePercent: trigger.slippage || 5
            });

            console.log(`   🎉 Swap executed! TxHash: ${swapResult.txHash}`);

            // Update trigger status
            await prisma.trigger.update({
                where: { id: trigger.id },
                data: { status: TriggerStatus.EXECUTED }
            });

            // Create execution record
            await prisma.execution.create({
                data: {
                    triggerId: trigger.id,
                    userId: trigger.user.id,
                    symbol: trigger.symbol,
                    type: trigger.type,
                    amount: amountToSwap,
                    txHash: swapResult.txHash,
                    details: JSON.stringify({
                        currentPrice,
                        targetPrice: trigger.targetPrice,
                        swapResult
                    })
                }
            });

            // ✨ NEW: Create Transaction record so it shows up in history
            await prisma.transaction.create({
                data: {
                    userId: trigger.user.id,
                    type: trigger.type === 'BUY' ? 'AUTO_SWAP_USDT_MNT' : 'AUTO_SWAP_MNT_USDT',
                    tokenIn: fromToken,
                    tokenOut: fromToken === 'MNT' ? 'USDT' : 'MNT',
                    amountIn: amountToSwap,
                    amountOut: swapResult.amountOut,
                    txHash: swapResult.txHash,
                    status: 'SUCCESS'
                }
            });

            console.log(`   ✅ Trigger ${trigger.id.substring(0, 8)} marked as EXECUTED`);

            // 📧 Send email notification
            if (trigger.user.email) {
                console.log(`   📧 Sending notification to ${trigger.user.email}...`);
                try {
                    const subject = `🚀 Trade Executed: ${trigger.type} ${trigger.symbol}`;
                    const message = `
                        <h2>🚀 Auto-Trade Executed Successfully!</h2>
                        <p>Your smart agent has executed a trade based on your trigger.</p>
                        <ul>
                            <li><strong>Type:</strong> ${trigger.type}</li>
                            <li><strong>Pair:</strong> ${trigger.symbol}</li>
                            <li><strong>Amount:</strong> ${amountToSwap} ${fromToken}</li>
                            <li><strong>Execution Price:</strong> $${currentPrice}</li>
                            <li><strong>Transaction Hash:</strong> <a href="https://sepolia.mantlescan.xyz/tx/${swapResult.txHash}">${swapResult.txHash}</a></li>
                        </ul>
                        <p>Login to the platform to see full details.</p>
                        <br>
                        <p><em>Auto-Trading Bot @ MantleFlow</em></p>
                    `;

                    // We use dynamic import for email service to avoid circular dependencies if any, 
                    // or just import at top. Let's send it in background (no await) to not block loop
                    // But importing at top is better.
                    // Assuming sendEmail is imported at the top.
                    sendEmail(trigger.user.email, subject, message).catch(err => console.error('Failed to send email:', err));

                } catch (emailErr) {
                    console.error('   ⚠️ Failed to prepare email:', emailErr);
                }
            }

        } catch (execError: any) {
            console.error(`   ❌ Execution failed:`, execError.message);

            // Parse error types
            const errorMsg = execError.message || execError.toString();

            // Retry-able errors
            if (errorMsg.includes('nonce') || errorMsg.includes('replacement')) {
                console.log('   ⚠️ Nonce issue, will retry next cycle');
                return; // Keep ACTIVE
            }

            if (errorMsg.includes('slippage')) {
                console.log('   ⚠️ Slippage exceeded, will retry');
                return; // Keep ACTIVE
            }

            // Permanent failures
            await prisma.trigger.update({
                where: { id: trigger.id },
                data: { status: TriggerStatus.FAILED }
            });
        }

    } catch (error: any) {
        console.error(`Error processing trigger ${trigger.id}:`, error.message);
    }
}

/**
 * Main auto-executor loop
 */
async function executorLoop(): Promise<void> {
    try {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`🤖 Auto-Executor Check: ${new Date().toLocaleTimeString()}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Get all ACTIVE triggers
        const activeTriggers = await prisma.trigger.findMany({
            where: { status: TriggerStatus.ACTIVE },
            include: { user: true }
        });

        console.log(`📊 Found ${activeTriggers.length} active trigger(s)`);

        if (activeTriggers.length === 0) {
            return;
        }

        // Batch fetch prices for all unique symbols (1 API call!)
        const symbols = [...new Set(activeTriggers.map(t => t.symbol))];
        console.log(`📊 Fetching prices for ${symbols.length} symbol(s): ${symbols.join(', ')}`);

        const pricesMap = await getPricesBatch(symbols);
        console.log(`✅ Prices fetched in 1 API call`);

        // Check each trigger with cached prices
        for (const trigger of activeTriggers) {
            const currentPrice = pricesMap.get(trigger.symbol);

            if (!currentPrice) {
                console.log(`⚠️ No price for ${trigger.symbol}, skipping`);
                continue;
            }

            await checkAndExecuteTrigger(trigger, currentPrice);

            // Small delay between triggers to avoid overwhelming network
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log(`\n✅ Check completed at ${new Date().toLocaleTimeString()}`);

    } catch (error: any) {
        console.error('❌ Error in executor loop:', error.message);
    }
}

/**
 * Start the auto-executor service
 */
export function startAutoExecutor(): void {
    if (isRunning) {
        console.log('⚠️  Auto-executor is already running');
        return;
    }

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║         🤖 AUTO-EXECUTOR SERVICE STARTING                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`⏱️  Check interval: ${CHECK_INTERVAL / 1000}s`);
    console.log(`🔧 Bot address: ${blockchainService.getBotAddress()}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    isRunning = true;

    // Run immediately on start
    executorLoop();

    // Then run on interval
    intervalId = setInterval(executorLoop, CHECK_INTERVAL);
}

/**
 * Stop the auto-executor service
 */
export function stopAutoExecutor(): void {
    if (!isRunning) {
        console.log('⚠️  Auto-executor is not running');
        return;
    }

    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }

    isRunning = false;
    console.log('\n🛑 Auto-executor service stopped');
}

/**
 * Get auto-executor status
 */
export function getExecutorStatus(): { running: boolean; interval: number } {
    return {
        running: isRunning,
        interval: CHECK_INTERVAL
    };
}
