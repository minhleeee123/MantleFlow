import { PrismaClient, TriggerStatus, TriggerType } from '@prisma/client';
import {
    getCurrentPrice,
    getRSI,
    get24hVolume,
    getMovingAverage,
    getSentimentScore,
    getGasPrice
} from './market';
import { executeVaultSwap } from './blockchain';

const prisma = new PrismaClient();

let isRunning = false;
let intervalId: NodeJS.Timeout | null = null;

const CHECK_INTERVAL = 30000; // 30 seconds (giảm từ 10s để tránh rate limit)

/**
 * Smart Condition Operators
 */
type Operator = 'GT' | 'LT' | 'GTE' | 'LTE' | 'EQ';

interface SmartCondition {
    metric: 'PRICE' | 'RSI' | 'VOLUME' | 'MA' | 'SENTIMENT' | 'GAS';
    operator: Operator;
    value: number;
    description?: string;
}

/**
 * Evaluate a single condition
 */
function evaluateCondition(currentValue: number, operator: Operator, targetValue: number): boolean {
    switch (operator) {
        case 'GT': return currentValue > targetValue;
        case 'LT': return currentValue < targetValue;
        case 'GTE': return currentValue >= targetValue;
        case 'LTE': return currentValue <= targetValue;
        case 'EQ': return Math.abs(currentValue - targetValue) < 0.01; // Allow small float variance
        default: return false;
    }
}

/**
 * Check if all smart conditions are met
 */
async function checkSmartConditions(
    symbol: string,
    conditions: SmartCondition[]
): Promise<{ met: boolean; details: string[] }> {
    const details: string[] = [];

    try {
        // Fetch all required metrics in parallel
        const metricsNeeded = new Set(conditions.map(c => c.metric));
        const metricValues: Record<string, number> = {};

        const promises: Promise<void>[] = [];

        if (metricsNeeded.has('PRICE')) {
            promises.push(getCurrentPrice(symbol).then(v => { metricValues.PRICE = v; }));
        }
        if (metricsNeeded.has('RSI')) {
            promises.push(getRSI(symbol).then(v => { metricValues.RSI = v; }));
        }
        if (metricsNeeded.has('VOLUME')) {
            promises.push(get24hVolume(symbol).then(v => { metricValues.VOLUME = v; }));
        }
        if (metricsNeeded.has('MA')) {
            promises.push(getMovingAverage(symbol).then(v => { metricValues.MA = v; }));
        }
        if (metricsNeeded.has('SENTIMENT')) {
            promises.push(getSentimentScore().then(v => { metricValues.SENTIMENT = v; }));
        }
        if (metricsNeeded.has('GAS')) {
            promises.push(getGasPrice().then(v => { metricValues.GAS = v; }));
        }

        await Promise.all(promises);

        // Check each condition
        let allMet = true;
        for (const condition of conditions) {
            const currentValue = metricValues[condition.metric];
            const met = evaluateCondition(currentValue, condition.operator, condition.value);

            const status = met ? '✅' : '❌';
            details.push(
                `${status} ${condition.metric}: ${currentValue} ${condition.operator} ${condition.value}`
            );

            if (!met) {
                allMet = false;
            }
        }

        return { met: allMet, details };
    } catch (error) {
        console.error('Error checking smart conditions:', error);
        details.push(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return { met: false, details };
    }
}

/**
 * Check and execute a single trigger
 */
async function checkAndExecuteTrigger(trigger: any): Promise<void> {
    try {
        console.log(`\n🔍 Checking trigger ${trigger.id} (${trigger.symbol} ${trigger.type})`);

        let shouldExecute = false;
        let executionDetails: string[] = [];

        // Check if it's a simple trigger or smart trigger
        if (trigger.smartConditions && trigger.smartConditions.length > 0) {
            // Smart Trigger - check all conditions
            console.log(`   📊 Smart trigger with ${trigger.smartConditions.length} conditions`);

            const result = await checkSmartConditions(trigger.symbol, trigger.smartConditions);
            shouldExecute = result.met;
            executionDetails = result.details;

            console.log('   Conditions:', result.details.join(', '));
        } else {
            // Simple Trigger - check price target
            const currentPrice = await getCurrentPrice(trigger.symbol);
            console.log(`   💰 Price: $${currentPrice} (target: $${trigger.targetPrice})`);

            if (trigger.type === TriggerType.BUY) {
                shouldExecute = currentPrice <= trigger.targetPrice;
            } else {
                shouldExecute = currentPrice >= trigger.targetPrice;
            }

            executionDetails.push(
                `${shouldExecute ? '✅' : '❌'} PRICE: ${currentPrice} ${trigger.type === TriggerType.BUY ? '<=' : '>='} ${trigger.targetPrice}`
            );
        }

        if (shouldExecute) {
            console.log(`   ✅ CONDITIONS MET! Executing ${trigger.type}...`);

            // Execute the swap
            const fromToken = trigger.type === TriggerType.BUY ? 'USDT' : 'MNT';
            const amountToSwap = trigger.amount || 10; // Default 10 if not specified

            try {
                const swapResult = await executeVaultSwap(
                    trigger.userId,
                    fromToken as 'USDT' | 'MNT',
                    amountToSwap,
                    trigger.slippage || 5
                );

                console.log(`   🎉 Swap executed! TxHash: ${swapResult.txHash}`);

                // Update trigger status to EXECUTED
                await prisma.trigger.update({
                    where: { id: trigger.id },
                    data: { status: TriggerStatus.EXECUTED }
                });

                // Create execution record
                await prisma.execution.create({
                    data: {
                        triggerId: trigger.id,
                        userId: trigger.userId,
                        symbol: trigger.symbol,
                        type: trigger.type,
                        amount: amountToSwap,
                        txHash: swapResult.txHash,
                        details: JSON.stringify({
                            conditions: executionDetails,
                            swapResult
                        })
                    }
                });

                console.log(`   ✅ Trigger ${trigger.id} marked as EXECUTED`);
            } catch (execError) {
                console.error(`   ❌ Execution failed:`, execError);

                // Mark as FAILED
                await prisma.trigger.update({
                    where: { id: trigger.id },
                    data: { status: TriggerStatus.FAILED }
                });
            }
        } else {
            console.log(`   ⏳ Conditions not met yet`);
        }
    } catch (error) {
        console.error(`Error processing trigger ${trigger.id}:`, error);
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
            console.log('   No active triggers to check');
            return;
        }

        // Check each trigger sequentially to avoid rate limits
        for (const trigger of activeTriggers) {
            await checkAndExecuteTrigger(trigger);
            // Delay 3s between triggers to avoid rate limit
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        console.log(`\n✅ Check completed at ${new Date().toLocaleTimeString()}`);
    } catch (error) {
        console.error('❌ Error in executor loop:', error);
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
    console.log(`📊 Monitoring: PRICE, RSI, VOLUME, MA, SENTIMENT, GAS`);
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
