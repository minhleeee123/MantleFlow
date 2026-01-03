import axios from 'axios';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

const SYMBOL_MAP: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'MATIC': 'matic-network',
    'AVAX': 'avalanche-2',
    'MNT': 'mantle'
};

// Simple in-memory cache
const priceCache: Record<string, { price: number; timestamp: number }> = {};
const CACHE_TTL = 10000; // 10 seconds

export async function getCurrentPrice(symbol: string): Promise<number> {
    const now = Date.now();

    // Check cache
    if (priceCache[symbol] && now - priceCache[symbol].timestamp < CACHE_TTL) {
        return priceCache[symbol].price;
    }

    const coinId = SYMBOL_MAP[symbol];

    if (!coinId) {
        throw new Error(`Unknown symbol: ${symbol}`);
    }

    try {
        const response = await axios.get(`${COINGECKO_API}/simple/price`, {
            params: {
                ids: coinId,
                vs_currencies: 'usd'
            }
        });

        const price = response.data[coinId].usd;

        // Update cache
        priceCache[symbol] = { price, timestamp: now };

        return price;
    } catch (error) {
        console.error('Error fetching price:', error);
        throw new Error('Failed to fetch price');
    }
}

export async function getMultiplePrices(symbols: string[]): Promise<Record<string, number>> {
    const prices: Record<string, number> = {};

    for (const symbol of symbols) {
        try {
            prices[symbol] = await getCurrentPrice(symbol);
        } catch (error) {
            console.error(`Error fetching price for ${symbol}:`, error);
        }
    }

    return prices;
}
