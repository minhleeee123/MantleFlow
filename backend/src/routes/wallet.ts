import { Router } from 'express';
import { ethers } from 'ethers';
import { authMiddleware } from '../middleware/auth';
import { AuthRequest } from '../types';
import { PrismaClient } from '@prisma/client';

const router = Router();
router.use(authMiddleware);

const MANTLE_RPC = process.env.MANTLE_RPC_URL!;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;
const USDC_ADDRESS = process.env.USDC_ADDRESS!;
const MNT_ADDRESS = process.env.MNT_ADDRESS!;

const CONTRACT_ABI = [
    'function getBalance(address user, address token) external view returns (uint256)',
    'function deposit(address token, uint256 amount) external payable', // Just for info ABI
    'function withdraw(address token, uint256 amount) external', // Just for info ABI
];

const TOKEN_ADDRESSES: Record<string, string> = {
    'USDC': USDC_ADDRESS,
    'MNT': '0x0000000000000000000000000000000000000000', // Native address logic for internal use if needed, but contract uses native logic
    'ETH': MNT_ADDRESS // Mapping ETH to MNT for demo
};

// GET /api/wallet/config
// Sends public contract config to frontend
router.get('/config', (req, res) => {
    res.json({
        contractAddress: CONTRACT_ADDRESS,
        rpcUrl: MANTLE_RPC,
        chainId: process.env.CHAIN_ID,
        tokens: TOKEN_ADDRESSES
    });
});

// GET /api/wallet/balance
// Fetch official contract balance for user
router.get('/balance', async (req: AuthRequest, res) => {
    try {
        const userAddress = req.user!.walletAddress;

        const provider = new ethers.JsonRpcProvider(MANTLE_RPC);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

        // Get USDC Balance
        const usdcBalWei = await contract.getBalance(userAddress, USDC_ADDRESS);
        const usdcBal = ethers.formatUnits(usdcBalWei, 6);

        // Get Native MNT Balance (Stored in contract as address(0))
        const mntBalWei = await contract.getBalance(userAddress, ethers.ZeroAddress);
        const mntBal = ethers.formatEther(mntBalWei);

        res.json({
            address: userAddress,
            balances: {
                USDC: parseFloat(usdcBal),
                MNT: parseFloat(mntBal)
            }
        });
    } catch (error: any) {
        console.error('Balance fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch balances' });
    }
});

const prisma = new PrismaClient();
// Force restart

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

        if (!['DEPOSIT', 'WITHDRAW'].includes(type) || !amount) {
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
