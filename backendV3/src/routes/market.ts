import express from 'express';
import { getPricesBatch, getRSI, get24hVolume, getGasPrice, getMovingAverage, getSentimentScore } from '../services/market.js';

const router = express.Router();

// GET /api/market/prices?symbols=BTC,ETH,MNT
router.get('/prices', async (req, res) => {
    try {
        const symbolsStr = req.query.symbols as string;
        if (!symbolsStr) {
            res.json({ prices: {} });
            return;
        }

        const symbols = symbolsStr.split(',').map(s => s.trim());
        const priceMap = await getPricesBatch(symbols);

        // Convert Map to Object for JSON serialization
        const prices: Record<string, number> = {};
        priceMap.forEach((value, key) => {
            prices[key] = value;
        });

        res.json({ prices });
    } catch (error: any) {
        console.error('Error fetching prices:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/market/metrics?symbol=MNT&metrics=RSI,VOLUME,GAS
router.get('/metrics', async (req, res) => {
    try {
        const symbol = req.query.symbol as string;
        const metricsStr = req.query.metrics as string;

        if (!symbol || !metricsStr) {
            res.status(400).json({ error: 'Missing symbol or metrics' });
            return;
        }

        const metrics = metricsStr.split(',').map(s => s.trim());
        const result: Record<string, number> = {};

        for (const metric of metrics) {
            switch (metric) {
                case 'PRICE':
                    const priceMap = await getPricesBatch([symbol]);
                    result['PRICE'] = priceMap.get(symbol) || 0;
                    break;
                case 'RSI':
                    result['RSI'] = await getRSI(symbol);
                    break;
                case 'VOLUME':
                    result['VOLUME'] = await get24hVolume(symbol);
                    break;
                case 'GAS':
                    result['GAS'] = await getGasPrice();
                    break;
                case 'MA':
                    result['MA'] = await getMovingAverage(symbol);
                    break;
                case 'SENTIMENT':
                    result['SENTIMENT'] = await getSentimentScore() * 100;
                    break;
            }
        }

        res.json(result);
    } catch (error: any) {
        console.error('Error fetching metrics:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
