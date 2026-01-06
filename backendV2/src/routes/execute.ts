import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { AuthRequest } from '../types';
import { getCurrentPrice } from '../services/market';
import { executeVaultSwap, checkVaultBalance } from '../services/blockchain';
import { sendSwapSuccessEmail } from '../services/emailService';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// Manual execute trigger
router.post('/:triggerId', async (req: AuthRequest, res) => {
    try {
        const trigger = await prisma.trigger.findFirst({
            where: {
                id: req.params.triggerId,
                userId: req.user!.userId
            },
            include: {
                user: true
            }
        });

        if (!trigger) {
            return res.status(404).json({ error: 'Trigger not found' });
        }

        if (trigger.status !== 'ACTIVE') {
            return res.status(400).json({ error: 'Trigger is not active' });
        }

        // Get current price
        const currentPrice = await getCurrentPrice(trigger.symbol);

        // Check if condition is met (for simple triggers)
        if (!trigger.smartConditions) {
            const conditionMet =
                (trigger.condition === 'BELOW' && currentPrice <= trigger.targetPrice) ||
                (trigger.condition === 'ABOVE' && currentPrice >= trigger.targetPrice);

            if (!conditionMet) {
                return res.status(400).json({
                    error: 'Trigger condition not met',
                    currentPrice,
                    targetPrice: trigger.targetPrice,
                    condition: trigger.condition
                });
            }
        }

        // Check vault balance
        const fromToken = trigger.type === 'SELL' ? 'MNT' : 'USDT';
        const hasBalance = await checkVaultBalance(
            req.user!.walletAddress,
            fromToken as 'MNT' | 'USDT',
            trigger.amount
        );

        if (!hasBalance) {
            return res.status(400).json({
                error: 'Insufficient balance in vault',
                required: trigger.amount,
                token: fromToken
            });
        }

        // Create pending execution
        const execution = await prisma.execution.create({
            data: {
                triggerId: trigger.id,
                symbol: trigger.symbol,
                executionPrice: currentPrice,
                amount: trigger.amount,
                type: trigger.type,
                amountIn: trigger.amount,
                tokenIn: fromToken,
                tokenOut: fromToken === 'MNT' ? 'USDT' : 'MNT',
                status: 'PENDING'
            }
        });

        try {
            // Execute swap on Vault
            const result = await executeVaultSwap(
                req.user!.walletAddress,
                fromToken as 'MNT' | 'USDT',
                trigger.amount,
                5 // 5% slippage
            );

            // Update execution with success
            await prisma.execution.update({
                where: { id: execution.id },
                data: {
                    txHash: result.txHash,
                    amountOut: result.amountOut,
                    status: 'SUCCESS'
                }
            });

            // Update trigger status
            await prisma.trigger.update({
                where: { id: trigger.id },
                data: { status: 'EXECUTED' }
            });

            // Send email notification
            if (trigger.user.email) {
                console.log(`📧 Sending email to ${trigger.user.email}...`);
                await sendSwapSuccessEmail(
                    trigger.user.email,
                    result.txHash,
                    trigger.symbol,
                    trigger.amount,
                    trigger.type as 'BUY' | 'SELL',
                    currentPrice
                );
            }

            res.json({
                success: true,
                txHash: result.txHash,
                executionId: execution.id,
                amountOut: result.amountOut,
                message: 'Trade executed successfully'
            });

        } catch (blockchainError: any) {
            // Update execution with failure
            await prisma.execution.update({
                where: { id: execution.id },
                data: {
                    status: 'FAILED',
                    errorMessage: blockchainError.message
                }
            });

            throw blockchainError;
        }
    } catch (error: any) {
        console.error('Error executing trigger:', error);
        res.status(500).json({
            error: 'Failed to execute trigger',
            details: error.message
        });
    }
});

// Get execution history
router.get('/history', async (req: AuthRequest, res) => {
    try {
        const executions = await prisma.execution.findMany({
            where: {
                trigger: {
                    userId: req.user!.userId
                }
            },
            include: {
                trigger: {
                    select: {
                        symbol: true,
                        type: true,
                        targetPrice: true
                    }
                }
            },
            orderBy: { executedAt: 'desc' },
            take: 50
        });

        res.json({ executions });
    } catch (error) {
        console.error('Error fetching execution history:', error);
        res.status(500).json({ error: 'Failed to fetch execution history' });
    }
});

export default router;
