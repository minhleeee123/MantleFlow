import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';
import { AuthRequest } from '../types/index.js';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authMiddleware as any);

/**
 * GET /api/triggers
 * Get all triggers for current user
 */
router.get('/', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.userId;

        const triggers = await prisma.trigger.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            triggers,
            count: triggers.length
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/triggers
 * Create new trigger
 */
router.post('/', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.userId;
        const { symbol, targetPrice, condition, amount, type, slippage, smartConditions } = req.body;

        // Validate input
        if (!symbol || !targetPrice || !condition || !amount || !type) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        if (!['ABOVE', 'BELOW'].includes(condition)) {
            res.status(400).json({ error: 'Invalid condition. Must be ABOVE or BELOW' });
            return;
        }

        if (!['BUY', 'SELL'].includes(type)) {
            res.status(400).json({ error: 'Invalid type. Must be BUY or SELL' });
            return;
        }

        // Create trigger
        const trigger = await prisma.trigger.create({
            data: {
                userId,
                symbol,
                targetPrice: parseFloat(targetPrice),
                condition,
                amount: parseFloat(amount),
                type,
                slippage: slippage ? parseFloat(slippage) : 5,
                smartConditions: smartConditions ? JSON.stringify(smartConditions) : null,
                status: 'ACTIVE'
            }
        });

        res.json({
            success: true,
            trigger,
            message: 'Trigger created successfully'
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/triggers/:id
 * Get specific trigger
 */
router.get('/:id', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.userId;
        const { id } = req.params;

        const trigger = await prisma.trigger.findFirst({
            where: {
                id: id as string,
                userId
            },
            include: {
                executions: {
                    orderBy: { executedAt: 'desc' },
                    take: 10
                }
            }
        });

        if (!trigger) {
            res.status(404).json({ error: 'Trigger not found' });
            return;
        }

        res.json({
            success: true,
            trigger
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * PATCH /api/triggers/:id
 * Update trigger (mainly for status changes)
 */
router.patch('/:id', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.userId;
        const { id } = req.params;
        const { status } = req.body;

        // Verify ownership
        const trigger = await prisma.trigger.findFirst({
            where: { id: id as string, userId }
        });

        if (!trigger) {
            res.status(404).json({ error: 'Trigger not found' });
            return;
        }

        // Update
        const updated = await prisma.trigger.update({
            where: { id: id as string },
            data: { status }
        });

        res.json({
            success: true,
            trigger: updated,
            message: 'Trigger updated successfully'
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/triggers/:id
 * Delete trigger
 */
router.delete('/:id', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.userId;
        const { id } = req.params;

        // Verify ownership
        const trigger = await prisma.trigger.findFirst({
            where: { id: id as string, userId }
        });

        if (!trigger) {
            res.status(404).json({ error: 'Trigger not found' });
            return;
        }

        // Delete
        await prisma.trigger.delete({ where: { id: id as string } });

        res.json({
            success: true,
            message: 'Trigger deleted successfully'
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
