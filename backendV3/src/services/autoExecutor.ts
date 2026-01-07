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
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f0f2f5; margin: 0; padding: 0; }
                                .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.08); border: 1px solid #e1e4e8; }
                                
                                .header { background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); color: #ffffff; padding: 30px 20px; text-align: center; }
                                .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px; }
                                .header-subtitle { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 2px; margin-top: 8px; }

                                .content { padding: 40px 30px; color: #333333; }
                                
                                .hero-section { text-align: center; margin-bottom: 35px; border-bottom: 2px dashed #f0f0f0; padding-bottom: 30px; }
                                .status-badge { background-color: #e3f9e5; color: #1b5e20; padding: 8px 16px; border-radius: 20px; font-weight: 700; font-size: 13px; display: inline-block; margin-bottom: 15px; border: 1px solid #c8e6c9; }
                                .hero-title { font-size: 20px; margin: 10px 0 5px; color: #111; font-weight: 700; }
                                .hero-desc { color: #666; font-size: 15px; line-height: 1.5; margin: 0; }

                                .details-box { background-color: #f8f9fa; border-radius: 8px; padding: 20px; border: 1px solid #eaeaea; }
                                .metric-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #ececec; }
                                .metric-row:last-child { border-bottom: none; }
                                
                                .metric-label { font-weight: 600; color: #555555; font-size: 14px; display: flex; align-items: center; gap: 8px; }
                                .metric-value { font-weight: 700; color: #000000; font-size: 14px; font-family: 'SF Mono', 'Segoe UI Mono', 'Roboto Mono', monospace; text-align: right; }
                                
                                .cta-button { display: block; width: 100%; text-align: center; background-color: #000000; color: #ffffff; padding: 18px 0; text-decoration: none; font-weight: 700; margin-top: 30px; border-radius: 8px; transition: transform 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
                                .cta-button:hover { background-color: #333; transform: translateY(-1px); }

                                .footer { background-color: #fafafa; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eaeaea; line-height: 1.6; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>MANTLEFLOW</h1>
                                    <div class="header-subtitle">Strategy Execution Report</div>
                                </div>
                                <div class="content">
                                    <div class="hero-section">
                                        <span class="status-badge">✅ EXECUTION SUCCESSFUL</span>
                                        <h2 class="hero-title">${trigger.type} Order Filling</h2>
                                        <p class="hero-desc">Your autonomous AI agent has successfully executed a smart contract interaction based on predefined market conditions.</p>
                                    </div>
                                    
                                    <div class="details-box">
                                        <div class="metric-row">
                                            <span class="metric-label">💎 Asset Pair:</span>
                                            <span class="metric-value">${trigger.symbol}</span>
                                        </div>
                                        <div class="metric-row">
                                            <span class="metric-label">📊 Strategy Type:</span>
                                            <span class="metric-value" style="color: ${trigger.type === 'BUY' ? '#2e7d32' : '#c62828'}">${trigger.type}</span>
                                        </div>
                                        <div class="metric-row">
                                            <span class="metric-label">💰 Amount Swapped:</span>
                                            <span class="metric-value">${amountToSwap} ${fromToken}</span>
                                        </div>
                                        <div class="metric-row">
                                            <span class="metric-label">🏷️ Execution Price:</span>
                                            <span class="metric-value">$${currentPrice}</span>
                                        </div>
                                        <div class="metric-row">
                                            <span class="metric-label">🌐 Network:</span>
                                            <span class="metric-value">Mantle Sepolia</span>
                                        </div>
                                         <div class="metric-row" style="border-bottom: none;">
                                            <span class="metric-label">📅 Time:</span>
                                            <span class="metric-value">${new Date().toLocaleTimeString()}</span>
                                        </div>
                                    </div>

                                    <a href="https://sepolia.mantlescan.xyz/tx/${swapResult.txHash}" class="cta-button">VIEW TRANSACTION ON EXPLORER &rarr;</a>
                                </div>
                                <div class="footer">
                                    <p>Trigger ID: #${trigger.id.substring(0, 8)}<br>
                                    Automated execution by MantleFlow Trading Node.</p>
                                    <p>&copy; 2024 MantleFlow Finance. All rights reserved.</p>
                                </div>
                            </div>
                        </body>
                        </html>
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
