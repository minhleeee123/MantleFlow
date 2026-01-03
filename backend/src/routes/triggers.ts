import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { AuthRequest, CreateTriggerRequest } from '../types';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authMiddleware);

// Get all triggers for current user
router.get('/', async (req: AuthRequest, res) => {
    try {
        const triggers = await prisma.trigger.findMany({
            where: { userId: req.user!.userId },
            orderBy: { createdAt: 'desc' },
            include: {
                executions: {
                    orderBy: { executedAt: 'desc' },
                    take: 1
                }
            }
        });

        res.json({ triggers });
    } catch (error) {
        console.error('Error fetching triggers:', error);
        res.status(500).json({ error: 'Failed to fetch triggers' });
    }
});

// Get single trigger
router.get('/:id', async (req: AuthRequest, res) => {
    try {
        const trigger = await prisma.trigger.findFirst({
            where: {
                id: req.params.id,
                userId: req.user!.userId
            },
            include: {
                executions: {
                    orderBy: { executedAt: 'desc' }
                }
            }
        });

        if (!trigger) {
            return res.status(404).json({ error: 'Trigger not found' });
        }

        res.json({ trigger });
    } catch (error) {
        console.error('Error fetching trigger:', error);
        res.status(500).json({ error: 'Failed to fetch trigger' });
    }
});

// Create new trigger
router.post('/', async (req: AuthRequest, res) => {
    try {
        const { symbol, targetPrice, condition, amount, type, smartConditions } = req.body;

        // Validate input
        if (!symbol || !targetPrice || !condition || !amount || !type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (condition !== 'ABOVE' && condition !== 'BELOW') {
            return res.status(400).json({ error: 'Invalid condition. Must be ABOVE or BELOW' });
        }

        if (type !== 'BUY' && type !== 'SELL') {
            return res.status(400).json({ error: 'Invalid type. Must be BUY or SELL' });
        }

        if (amount <= 0 || targetPrice <= 0) {
            return res.status(400).json({ error: 'Amount and price must be positive' });
        }

        const trigger = await prisma.trigger.create({
            data: {
                userId: req.user!.userId,
                symbol: symbol.toUpperCase(),
                targetPrice,
                condition,
                amount,
                type,
                smartConditions: smartConditions || null, // Store smart conditions from frontend
                status: 'ACTIVE'
            }
        });

        res.status(201).json({ trigger });
    } catch (error) {
        console.error('Error creating trigger:', error);
        res.status(500).json({ error: 'Failed to create trigger' });
    }
});

// Update trigger
router.patch('/:id', async (req: AuthRequest, res) => {
    try {
        const { targetPrice, condition, amount, status } = req.body;

        const trigger = await prisma.trigger.findFirst({
            where: {
                id: req.params.id,
                userId: req.user!.userId
            }
        });

        if (!trigger) {
            return res.status(404).json({ error: 'Trigger not found' });
        }

        const updated = await prisma.trigger.update({
            where: { id: req.params.id },
            data: {
                ...(targetPrice && { targetPrice }),
                ...(condition && { condition }),
                ...(amount && { amount }),
                ...(status && { status })
            }
        });

        res.json({ trigger: updated });
    } catch (error) {
        console.error('Error updating trigger:', error);
        res.status(500).json({ error: 'Failed to update trigger' });
    }
});

// Cancel trigger
router.delete('/:id', async (req: AuthRequest, res) => {
    try {
        const trigger = await prisma.trigger.findFirst({
            where: {
                id: req.params.id,
                userId: req.user!.userId
            }
        });

        if (!trigger) {
            return res.status(404).json({ error: 'Trigger not found' });
        }

        await prisma.trigger.update({
            where: { id: req.params.id },
            data: { status: 'CANCELLED' }
        });

        res.json({ success: true, message: 'Trigger cancelled' });
    } catch (error) {
        console.error('Error cancelling trigger:', error);
        res.status(500).json({ error: 'Failed to cancel trigger' });
    }
});

export default router;
