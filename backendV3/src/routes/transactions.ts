import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';
import { AuthRequest } from '../types/index.js';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authMiddleware as any);

/**
 * POST /api/transactions
 * Create transaction record
 */
router.post('/', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.userId;
        const { type, token, amount, txHash } = req.body;

        // Validate input
        if (!type || !token || !amount) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        // Map token to tokenIn/tokenOut
        let tokenIn = token;
        let tokenOut: string | undefined;

        if (type.includes('SWAP')) {
            // SWAP_MNT_USDT or SWAP_USDT_MNT
            if (type === 'SWAP_MNT_USDT') {
                tokenIn = 'MNT';
                tokenOut = 'USDT';
            } else if (type === 'SWAP_USDT_MNT') {
                tokenIn = 'USDT';
                tokenOut = 'MNT';
            } else {
                tokenIn = token;
                tokenOut = token === 'MNT' ? 'USDT' : 'MNT';
            }
        }

        // Create transaction
        const transaction = await prisma.transaction.create({
            data: {
                userId,
                type,
                tokenIn,
                tokenOut,
                amountIn: parseFloat(amount.toString()),
                amountOut: undefined, // Can be updated later if needed
                txHash: txHash || undefined,
                status: 'SUCCESS'
            }
        });

        res.json({
            success: true,
            transaction
        });
    } catch (error: any) {
        console.error('Create transaction error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/transactions
 * Get user's transaction history
 */
router.get('/', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.userId;

        const transactions = await prisma.transaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50 // Last 50 transactions
        });

        res.json(transactions);
    } catch (error: any) {
        console.error('List transactions error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/transactions/:id
 * Get specific transaction
 */
router.get('/:id', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.userId;
        const { id } = req.params;

        const transaction = await prisma.transaction.findFirst({
            where: {
                id: id as string,
                userId
            }
        });

        if (!transaction) {
            res.status(404).json({ error: 'Transaction not found' });
            return;
        }

        res.json(transaction);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
