import { PrismaClient } from '@prisma/client';
import { getCurrentPrice } from '../services/market';
import { executeSwap } from '../services/blockchain';
import { calculateRSI, calculateMA } from '../services/technicalAnalysis';
import axios from 'axios';
import { sendSwapSuccessEmail } from '../services/emailService';

const prisma = new PrismaClient();

// Check if smart conditions are met
async function checkSmartConditions(
    symbol: string,
    conditions: any[]
): Promise<{ met: boolean; details: string[] }> {
    const details: string[] = [];

    for (const condition of conditions) {
        const { metric, operator, value, description } = condition;

        let realValue: number;

        try {
            switch (metric) {
                case 'PRICE':
                    realValue = await getCurrentPrice(symbol);
                    break;

                case 'RSI':
                    // Calculate RSI from historical price data
                    try {
                        realValue = await calculateRSI(symbol, 14); // 14-period RSI
                    } catch (error) {
                        details.push(`⚠️ RSI calculation failed: ${error}`);
                        continue;
                    }
                    break;

                case 'VOLUME':
                    // Fetch 24h volume from CoinGecko
                    try {
                        const coinId = symbol.toLowerCase();
                        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}`, {
                            params: {
                                localization: false,
                                tickers: false,
                                community_data: false,
                                developer_data: false
                            }
                        });
                        realValue = response.data.market_data.total_volume.usd / 1000000; // Convert to millions
                    } catch (error) {
                        details.push(`⚠️ VOLUME check failed: ${error}`);
                        continue;
                    }
                    break;

                case 'MA':
                    // Calculate Moving Average from historical data
                    try {
                        realValue = await calculateMA(symbol, 50); // 50-period MA (default)
                    } catch (error) {
                        details.push(`⚠️ MA calculation failed: ${error}`);
                        continue;
                    }
                    break;

                case 'SENTIMENT':
                    // Fetch Fear & Greed Index from Alternative.me
                    try {
                        const response = await axios.get('https://api.alternative.me/fng/?limit=1');
                        realValue = parseInt(response.data.data[0].value);
                    } catch (error) {
                        details.push(`⚠️ SENTIMENT check failed: ${error}`);
                        continue;
                    }
                    break;

                case 'GAS':
                    // Fetch Ethereum gas price from Etherscan
                    try {
                        const response = await axios.get('https://api.etherscan.io/api', {
                            params: {
                                module: 'gastracker',
                                action: 'gasoracle'
                            }
                        });
                        if (response.data.status === '1') {
                            realValue = parseInt(response.data.result.ProposeGasPrice);
                        } else {
                            details.push(`⚠️ GAS check failed: API error`);
                            continue;
                        }
                    } catch (error) {
                        details.push(`⚠️ GAS check failed: ${error}`);
                        continue;
                    }
                    break;

                default:
                    details.push(`❌ Unknown metric: ${metric}`);
                    continue;
            }

            // Check condition
            const conditionMet =
                (operator === 'GT' && realValue > value) ||
                (operator === 'LT' && realValue < value);

            if (!conditionMet) {
                details.push(`❌ ${description}: ${realValue} (not ${operator === 'GT' ? '>' : '<'} ${value})`);
                return { met: false, details };
            }

            details.push(`✅ ${description}: ${realValue} ${operator === 'GT' ? '>' : '<'} ${value}`);
        } catch (error) {
            details.push(`❌ Error checking ${metric}: ${error}`);
            return { met: false, details };
        }
    }

    return { met: true, details };
}

// Auto-executor worker
export async function startAutoExecutor() {
    console.log('🤖 Auto-executor worker started');

    setInterval(async () => {
        try {
            // Get all ACTIVE triggers
            const triggers = await prisma.trigger.findMany({
                where: { status: 'ACTIVE' },
                include: { user: true }
            });

            if (triggers.length === 0) return;

            console.log(`[Auto-Executor] Checking ${triggers.length} active triggers...`);

            for (const trigger of triggers) {
                try {
                    const currentPrice = await getCurrentPrice(trigger.symbol);
                    console.log(`\n[Trigger ${trigger.id.slice(0, 8)}] ${trigger.symbol}:`);
                    console.log(`  Current Price: $${currentPrice}`);
                    console.log(`  Target Price: $${trigger.targetPrice}`);
                    console.log(`  Condition: ${trigger.condition}`);

                    let shouldExecute = false;
                    const checkDetails: string[] = [];

                    // Check if trigger has smart conditions
                    if (trigger.smartConditions && Array.isArray((trigger.smartConditions as any).conditions)) {
                        console.log(`  Type: SMART TRIGGER`);
                        const conditions = (trigger.smartConditions as any).conditions;
                        const smartCheck = await checkSmartConditions(trigger.symbol, conditions);
                        shouldExecute = smartCheck.met;
                        checkDetails.push(...smartCheck.details);

                        console.log(`[Smart Trigger ${trigger.id}] ${trigger.symbol}:`);
                        smartCheck.details.forEach(detail => console.log(`  ${detail}`));
                    } else {
                        console.log(`  Type: SIMPLE TRIGGER`);
                        // Simple condition check
                        shouldExecute =
                            (trigger.condition === 'BELOW' && currentPrice <= trigger.targetPrice) ||
                            (trigger.condition === 'ABOVE' && currentPrice >= trigger.targetPrice);

                        console.log(`  Should Execute: ${shouldExecute ? '✅ YES' : '❌ NO'}`);
                        console.log(`  Logic: ${currentPrice} ${trigger.condition === 'BELOW' ? '<=' : '>='} ${trigger.targetPrice} = ${shouldExecute}`);

                        if (shouldExecute) {
                            console.log(`[Simple Trigger ${trigger.id}] ${trigger.symbol}: $${currentPrice} ${trigger.condition === 'BELOW' ? '≤' : '≥'} $${trigger.targetPrice} ✅`);
                        }
                    }

                    if (shouldExecute) {
                        console.log(`🚀 Executing trigger ${trigger.id}...`);

                        // Execute trade on blockchain
                        const txHash = await executeSwap(
                            trigger.user.walletAddress,
                            trigger.symbol,
                            trigger.amount,
                            trigger.type as 'BUY' | 'SELL'
                        );

                        // [NEW] Gửi email thông báo
                        // Fetch user email
                        const user = await prisma.user.findUnique({
                            where: { id: trigger.userId },
                            select: { email: true }
                        });

                        if (user?.email) {
                            console.log(`📧 Sending email to ${user.email}...`);
                            await sendSwapSuccessEmail(
                                user.email,
                                txHash,
                                trigger.symbol,
                                trigger.amount,
                                trigger.type as 'BUY' | 'SELL',
                                currentPrice
                            );
                        }

                        // Record execution
                        await prisma.execution.create({
                            data: {
                                triggerId: trigger.id,
                                symbol: trigger.symbol,
                                price: currentPrice,
                                amount: trigger.amount,
                                type: trigger.type,
                                txHash,
                                status: 'SUCCESS'
                            }
                        });

                        // Update trigger status
                        await prisma.trigger.update({
                            where: { id: trigger.id },
                            data: { status: 'EXECUTED' }
                        });

                        // Sync to Wallet Transaction History
                        await prisma.transaction.create({
                            data: {
                                userId: trigger.userId,
                                type: trigger.type, // BUY or SELL
                                token: trigger.symbol,
                                amount: trigger.amount, // Note: For BUY uses Quote? No, trigger.amount is usually Base or Quote based on logic. 
                                // In blockchain.ts: If BUY -> amount is Quote (USDC). If SELL -> amount is Base (MNT).
                                // But here we just log what was in trigger.
                                txHash,
                                status: 'SUCCESS'
                            }
                        });

                        console.log(`✅ Successfully executed trigger ${trigger.id} | TX: ${txHash}`);
                    }
                } catch (error) {
                    console.error(`❌ Failed to execute trigger ${trigger.id}:`, error);

                    // Record failed execution
                    await prisma.execution.create({
                        data: {
                            triggerId: trigger.id,
                            symbol: trigger.symbol,
                            price: 0,
                            amount: trigger.amount,
                            type: trigger.type,
                            status: 'FAILED',
                            errorMessage: error instanceof Error ? error.message : 'Unknown error'
                        }
                    });
                }
            }
        } catch (error) {
            console.error('[Auto-Executor] Worker error:', error);
        }
    }, 10000); // Check every 10 seconds
}
