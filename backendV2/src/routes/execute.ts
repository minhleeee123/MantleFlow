import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware as any);

/**
 * GET /api/execute/history
 * Get execution history for authenticated user
 * Auto-executor handles all executions automatically
 */
router.get('/history', async (req: AuthRequest, res) => {
    try {
        const executions = await prisma.execution.findMany({
            where: { userId: req.user!.userId },
            include: {
                trigger: {
                    select: {
                        symbol: true,
                        type: true,
                        targetPrice: true,
                        smartConditions: true
                    }
                }
            },
            orderBy: { executedAt: 'desc' },
            take: 50 // Last 50 executions
        });

        res.json(executions);
    } catch (error: any) {
        console.error('Error fetching execution history:', error);
        res.status(500).json({
            error: 'Failed to fetch execution history'
        });
    }
});

export default router;
