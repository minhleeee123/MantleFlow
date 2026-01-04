import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { AuthRequest } from '../types';
import { getCurrentPrice } from '../services/market';
import { executeSwap } from '../services/blockchain';
import { sendSwapSuccessEmail } from '../services/emailService';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// Check if trigger condition is met
router.post('/check/:triggerId', async (req: AuthRequest, res) => {
    try {
        const trigger = await prisma.trigger.findFirst({
            where: {
                id: req.params.triggerId,
                userId: req.user!.userId
            }
        });

        if (!trigger) {
            return res.status(404).json({ error: 'Trigger not found' });
        }

        if (trigger.status !== 'ACTIVE') {
            return res.status(400).json({ error: 'Trigger is not active' });
        }

        const currentPrice = await getCurrentPrice(trigger.symbol);

        const canExecute =
            (trigger.condition === 'BELOW' && currentPrice <= trigger.targetPrice) ||
            (trigger.condition === 'ABOVE' && currentPrice >= trigger.targetPrice);

        res.json({
            canExecute,
            currentPrice,
            targetPrice: trigger.targetPrice,
            condition: trigger.condition,
            symbol: trigger.symbol
        });
    } catch (error) {
        console.error('Error checking trigger:', error);
        res.status(500).json({ error: 'Failed to check trigger' });
    }
});

// Execute trigger manually
router.post('/:triggerId', async (req: AuthRequest, res) => {
    try {
        const trigger = await prisma.trigger.findFirst({
            where: {
                id: req.params.triggerId,
                userId: req.user!.userId
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

        // Check if condition is met
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

        // Create pending execution
        const execution = await prisma.execution.create({
            data: {
                triggerId: trigger.id,
                symbol: trigger.symbol,
                price: currentPrice,
                amount: trigger.amount,
                type: trigger.type,
                status: 'PENDING'
            }
        });

        try {
            // Execute on blockchain
            const txHash = await executeSwap(
                req.user!.walletAddress,
                trigger.symbol,
                trigger.amount,
                trigger.type as 'BUY' | 'SELL'
            );

            // Update execution with success
            await prisma.execution.update({
                where: { id: execution.id },
                data: {
                    txHash,
                    status: 'SUCCESS'
                }
            });

            // Update trigger status
            await prisma.trigger.update({
                where: { id: trigger.id },
                data: { status: 'EXECUTED' }
            });

            // [NEW] Gửi email thông báo
            const user = await prisma.user.findUnique({
                where: { id: req.user!.userId },
                select: { email: true }
            });

            let emailSent = false;
            let emailAddress = null;

            if (user?.email) {
                console.log(`📧 Sending email to ${user.email}...`);
                emailSent = await sendSwapSuccessEmail(
                    user.email,
                    txHash,
                    trigger.symbol,
                    trigger.amount,
                    trigger.type as 'BUY' | 'SELL',
                    currentPrice
                );
                emailAddress = user.email;
            }

            res.json({
                success: true,
                txHash,
                executionId: execution.id,
                message: 'Trade executed successfully',
                emailNotification: emailSent ? {
                    sent: true,
                    to: emailAddress,
                    checkInbox: 'https://mail.google.com/mail/u/0/#inbox'
                } : {
                    sent: false,
                    reason: 'No email configured for this user'
                }
            });
        } catch (blockchainError) {
            // Update execution with failure
            await prisma.execution.update({
                where: { id: execution.id },
                data: {
                    status: 'FAILED',
                    errorMessage: blockchainError instanceof Error ? blockchainError.message : 'Unknown error'
                }
            });

            throw blockchainError;
        }
    } catch (error) {
        console.error('Error executing trigger:', error);
        res.status(500).json({
            error: 'Failed to execute trigger',
            details: error instanceof Error ? error.message : 'Unknown error'
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
