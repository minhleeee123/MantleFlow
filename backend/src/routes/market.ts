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

import { getMetric } from '../services/metrics';

// ... existing code ...

// Get advanced metrics
router.get('/metrics', async (req, res) => {
    try {
        const symbol = (req.query.symbol as string) || 'MNT';
        const metricsStr = (req.query.metrics as string) || 'PRICE';
        const metrics = metricsStr.split(',').map(m => m.trim().toUpperCase());

        const results: Record<string, number | null> = {};

        await Promise.all(metrics.map(async (metric) => {
            try {
                const val = await getMetric(metric, symbol);
                results[metric] = val;
            } catch (error) {
                console.error(`Failed to fetch ${metric}:`, error);
                results[metric] = null;
            }
        }));

        res.json(results);
    } catch (error) {
        console.error('Metrics API Error:', error);
        res.status(500).json({ error: 'Failed to fetch metrics' });
    }
});

export default router;
