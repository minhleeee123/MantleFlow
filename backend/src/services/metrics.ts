import { getCurrentPrice } from './market';
import { calculateRSI, calculateMA } from './technicalAnalysis';
import axios from 'axios';

// Simple in-memory cache
interface CacheEntry<T> {
    value: T;
    timestamp: number;
}
const cache: Record<string, CacheEntry<any>> = {};

const getCached = <T>(key: string, ttl: number): T | null => {
    const entry = cache[key];
    if (entry && Date.now() - entry.timestamp < ttl) {
        return entry.value;
    }
    return null;
};

const setCache = <T>(key: string, value: T) => {
    cache[key] = { value, timestamp: Date.now() };
};

export const getMetric = async (metric: string, symbol: string): Promise<number> => {
    const key = `${metric}_${symbol}`;

    // Define TTLs (Time To Live in ms)
    const TTL_SENTIMENT = 30 * 60 * 1000; // 30 minutes
    const TTL_GAS = 15 * 1000;            // 15 seconds
    const TTL_Technical = 60 * 1000;      // 1 minute (RSI, MA, Volume)
    const TTL_PRICE = 10 * 1000;          // 10 seconds

    let ttl = TTL_PRICE;
    if (metric === 'SENTIMENT') ttl = TTL_SENTIMENT;
    if (metric === 'GAS') ttl = TTL_GAS;
    if (['RSI', 'MA', 'VOLUME'].includes(metric)) ttl = TTL_Technical;

    const cached = getCached<number>(key, ttl);
    if (cached !== null) return cached;

    let value = 0;
    try {
        switch (metric) {
            case 'PRICE':
                value = await getCurrentPrice(symbol);
                break;

            case 'RSI':
                value = await calculateRSI(symbol);
                break;

            case 'MA':
                value = await calculateMA(symbol);
                break;

            case 'SENTIMENT':
                // Fetch Fear & Greed Index
                const sentimentRes = await axios.get('https://api.alternative.me/fng/?limit=1');
                value = parseInt(sentimentRes.data.data[0].value);
                break;

            case 'GAS':
                // Fetch Gas from Etherscan
                const gasRes = await axios.get('https://api.etherscan.io/api', {
                    params: { module: 'gastracker', action: 'gasoracle' }
                });
                if (gasRes.data.status === '1') {
                    value = parseInt(gasRes.data.result.ProposeGasPrice);
                } else {
                    throw new Error('Gas API Error');
                }
                break;

            case 'VOLUME':
                // Fetch 24h Volume
                const coinId = symbol === 'MNT' ? 'mantle' : symbol.toLowerCase() === 'eth' ? 'ethereum' : 'bitcoin'; // Simple map
                const volRes = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_vol=true`);
                value = volRes.data[coinId].usd_24h_vol / 1000000; // In Millions
                break;

            default:
                throw new Error(`Unknown metric: ${metric}`);
        }
    } catch (error) {
        console.error(`Error fetching metric ${metric}:`, error);
        // Return 0 or rethrow? 
        // For frontend display, maybe return -1 to indicate error?
        // But autoExecutor expects number.
        // Let's rely on fallback or previous cache if possible? 
        // For now, throw so caller handles it.
        throw error;
    }

    setCache(key, value);
    return value;
};
