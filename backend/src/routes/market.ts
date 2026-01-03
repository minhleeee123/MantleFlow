import { Router } from 'express';
import { getCurrentPrice, getMultiplePrices } from '../services/market';

const router = Router();

// Get current price for a symbol
router.get('/price/:symbol', async (req, res) => {
    try {
        const symbol = req.params.symbol.toUpperCase();
        const price = await getCurrentPrice(symbol);

        res.json({
            symbol,
            price,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching price:', error);
        res.status(500).json({
            error: 'Failed to fetch price',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Get multiple prices
router.get('/prices', async (req, res) => {
    try {
        const symbolsParam = req.query.symbols as string;

        if (!symbolsParam) {
            return res.status(400).json({ error: 'Missing symbols parameter' });
        }

        const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase());
        const prices = await getMultiplePrices(symbols);

        res.json({
            prices,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching prices:', error);
        res.status(500).json({ error: 'Failed to fetch prices' });
    }
});

export default router;
