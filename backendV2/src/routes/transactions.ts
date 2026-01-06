import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// Get user's transaction history
router.get('/', async (req: AuthRequest, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId: req.user!.userId },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// Record a new transaction
router.post('/', async (req: AuthRequest, res) => {
    try {
        // Frontend sends: { type, token, amount, txHash }
        // We need to map to: { type, tokenIn, tokenOut, amountIn, amountOut }
        const { type, token, amount, txHash, status } = req.body;

        const transaction = await prisma.transaction.create({
            data: {
                userId: req.user!.userId,
                type,
                tokenIn: token, // Map 'token' to 'tokenIn'
                tokenOut: null,
                amountIn: amount, // Map 'amount' to 'amountIn'
                amountOut: null,
                txHash: txHash || null,
                status: status || 'SUCCESS'
            }
        });

        res.status(201).json(transaction);
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ error: 'Failed to create transaction' });
    }
});

export default router;
