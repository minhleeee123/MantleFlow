import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { AuthRequest, BotSwapRequest } from '../types/index.js';
import { blockchainService } from '../services/blockchain.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware as any);

/**
 * POST /api/swap/bot
 * Execute swap via bot (no user signature needed)
 */
router.post('/bot', async (req: AuthRequest, res) => {
    try {
        console.log('Bot swap payload:', JSON.stringify(req.body, null, 2));
        const { fromToken, amount, slippagePercent }: BotSwapRequest = req.body;
        const userAddress = req.user!.walletAddress;

        // Validate input
        if (!fromToken || !amount) {
            res.status(400).json({ error: 'Missing required fields: fromToken, amount' });
            return;
        }

        if (fromToken !== 'MNT' && fromToken !== 'USDT') {
            res.status(400).json({ error: 'Invalid token. Must be MNT or USDT' });
            return;
        }

        if (amount <= 0) {
            res.status(400).json({ error: 'Amount must be positive' });
            return;
        }

        // Check if user authorized bot
        const isAuthorized = await blockchainService.isUserAuthorizedBot(userAddress);
        if (!isAuthorized) {
            res.status(403).json({
                error: 'Bot not authorized',
                message: 'Please authorize bot in frontend first using authorizeBot() function',
                botAddress: blockchainService.getBotAddress()
            });
            return;
        }

        // Check balance
        const hasBalance = await blockchainService.checkVaultBalance(
            userAddress,
            fromToken,
            amount
        );

        if (!hasBalance) {
            const balances = await blockchainService.getUserVaultBalances(userAddress);
            res.status(400).json({
                error: 'Insufficient balance in vault',
                balance: fromToken === 'MNT' ? balances.mnt : balances.usdt,
                required: amount
            });
            return;
        }

        // Execute bot swap
        console.log(`\n🤖 [API] Bot swap request from ${userAddress}`);
        const result = await blockchainService.executeBotSwap({
            userAddress,
            fromToken,
            amount,
            slippagePercent: slippagePercent || 5
        });

        res.json({
            success: true,
            ...result,
            message: 'Swap executed successfully by bot'
        });

    } catch (error: any) {
        console.error('Bot swap API failed:', error);
        res.status(500).json({
            error: 'Swap failed',
            message: error.message
        });
    }
});

/**
 * GET /api/swap/bot-status
 * Check if user authorized bot
 */
router.get('/bot-status', async (req: AuthRequest, res) => {
    try {
        const userAddress = req.user!.walletAddress;
        const isAuthorized = await blockchainService.isUserAuthorizedBot(userAddress);
        const botAddress = blockchainService.getBotAddress();

        res.json({
            authorized: isAuthorized,
            botAddress,
            message: isAuthorized
                ? 'Bot is authorized. You can use bot swap and auto-trading.'
                : 'Bot not authorized. Call authorizeBot() in frontend to enable.'
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/swap/estimate
 * Estimate swap output
 */
router.get('/estimate', async (req: AuthRequest, res) => {
    try {
        const { fromToken, amount } = req.query;

        if (!fromToken || !amount) {
            res.status(400).json({ error: 'Missing fromToken or amount' });
            return;
        }

        const amountNum = parseFloat(amount as string);
        if (isNaN(amountNum) || amountNum <= 0) {
            res.status(400).json({ error: 'Invalid amount' });
            return;
        }

        const estimatedOut = await blockchainService.estimateSwapOutput(
            fromToken as 'MNT' | 'USDT',
            amountNum
        );

        res.json({
            fromToken,
            toToken: fromToken === 'MNT' ? 'USDT' : 'MNT',
            amountIn: amountNum,
            estimatedOut,
            slippage5: estimatedOut * 0.95,
            slippage10: estimatedOut * 0.90
        });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/swap/balances
 * Get user's vault balances
 */
router.get('/balances', async (req: AuthRequest, res) => {
    try {
        const userAddress = req.user!.walletAddress;
        const balances = await blockchainService.getUserVaultBalances(userAddress);

        res.json({
            userAddress,
            balances
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
