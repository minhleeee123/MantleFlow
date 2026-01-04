import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { AuthRequest } from '../types';
import { PrismaClient } from '@prisma/client';
import { getUserBalance, getSmartWalletAddress } from '../services/blockchain';

const router = Router();
import { ethers } from 'ethers';

const MANTLE_RPC = process.env.MANTLE_RPC_URL!;
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS!;
const FUSIONX_ROUTER = process.env.FUSIONX_ROUTER!;
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY!;

// Derive Operator Address
const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY);
const OPERATOR_ADDRESS = wallet.address;

// GET /api/wallet/config
// Sends public contract config to frontend
router.get('/config', (req, res) => {
    res.json({
        factoryAddress: FACTORY_ADDRESS,
        routerAddress: FUSIONX_ROUTER,
        rpcUrl: MANTLE_RPC,
        chainId: process.env.CHAIN_ID,
        operatorAddress: OPERATOR_ADDRESS
    });
});

router.use(authMiddleware);

// GET /api/wallet/address
// Get user's Smart Wallet Address
router.get('/address', async (req: AuthRequest, res) => {
    try {
        const walletAddress = await getSmartWalletAddress(req.user!.walletAddress);
        res.json({ address: walletAddress });
    } catch (error) {
        // likely no wallet yet
        res.json({ address: null });
    }
});

// GET /api/wallet/balance
// Fetch official contract balance for user
router.get('/balance', async (req: AuthRequest, res) => {
    try {
        const userAddress = req.user!.walletAddress;

        // Fetch balances
        const usdcBal = await getUserBalance(userAddress, 'USDC');
        const mntBal = await getUserBalance(userAddress, 'MNT');

        res.json({
            address: userAddress,
            balances: {
                USDC: usdcBal,
                MNT: mntBal
            }
        });
    } catch (error: any) {
        console.error('Balance fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch balances' });
    }
});

const prisma = new PrismaClient();

// GET /api/wallet/transactions
// List user's transactions
router.get('/transactions', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.userId;
        const transactions = await prisma.transaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(transactions);
    } catch (error) {
        console.error('Fetch transactions error:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// POST /api/wallet/transactions
// Record a new transaction (from frontend)
router.post('/transactions', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.userId;
        const { type, token, amount, txHash } = req.body;

        if (!['DEPOSIT', 'WITHDRAW', 'DEPLOY'].includes(type) || !amount) {
            return res.status(400).json({ error: 'Invalid transaction data' });
        }

        const transaction = await prisma.transaction.create({
            data: {
                userId,
                type,
                token,
                amount: parseFloat(amount),
                txHash,
                status: 'SUCCESS'
            }
        });

        res.json(transaction);
    } catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({ error: 'Failed to record transaction' });
    }
});

export default router;
