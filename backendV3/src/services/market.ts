import axios from 'axios';

// In-memory cache
interface PriceCache {
    [symbol: string]: {
        price: number;
        timestamp: number;
    };
}

const priceCache: PriceCache = {};
const CACHE_TTL = 60000; // 60 seconds

/**
 * Get current price for a symbol
 */
export async function getCurrentPrice(symbol: string): Promise<number> {
    // Check cache first
    const cached = priceCache[symbol];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`💾 Cache hit for ${symbol}: $${cached.price}`);
        return cached.price;
    }

    // Fetch fresh data
    const coinId = symbolToCoinGeckoId(symbol);

    try {
        const response = await axios.get(
            'https://api.coingecko.com/api/v3/simple/price',
            {
                params: {
                    ids: coinId,
                    vs_currencies: 'usd'
                },
                timeout: 5000
            }
        );

        const price = response.data[coinId]?.usd;
        if (!price) {
            throw new Error(`Price not found for ${symbol}`);
        }

        // Update cache
        priceCache[symbol] = {
            price,
            timestamp: Date.now()
        };

        console.log(`📊 Fetched ${symbol}: $${price}`);
        return price;
    } catch (error: any) {
        console.error(`Failed to fetch price for ${symbol}:`, error.message);

        // Return cached price if available (even if expired)
        if (cached) {
            console.log(`⚠️ Using stale cache for ${symbol}`);
            return cached.price;
        }

        throw error;
    }
}

/**
 * Batch fetch prices for multiple symbols (1 API call)
 */
export async function getPricesBatch(symbols: string[]): Promise<Map<string, number>> {
    const uniqueSymbols = [...new Set(symbols)];

    // Check cache
    const needFetch: string[] = [];
    const result = new Map<string, number>();

    for (const symbol of uniqueSymbols) {
        const cached = priceCache[symbol];
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            result.set(symbol, cached.price);
        } else {
            needFetch.push(symbol);
        }
    }

    // Batch fetch uncached symbols
    if (needFetch.length > 0) {
        const coinIds = needFetch.map(s => symbolToCoinGeckoId(s)).join(',');

        try {
            const response = await axios.get(
                'https://api.coingecko.com/api/v3/simple/price',
                {
                    params: {
                        ids: coinIds,
                        vs_currencies: 'usd'
                    },
                    timeout: 5000
                }
            );

            // Update cache and result
            for (const symbol of needFetch) {
                const coinId = symbolToCoinGeckoId(symbol);
                const price = response.data[coinId]?.usd || 0;

                priceCache[symbol] = { price, timestamp: Date.now() };
                result.set(symbol, price);
            }

            console.log(`📊 Batch fetched ${needFetch.length} prices`);
        } catch (error: any) {
            console.error('Batch fetch failed:', error.message);

            // Use stale cache for failed fetches
            for (const symbol of needFetch) {
                if (priceCache[symbol]) {
                    result.set(symbol, priceCache[symbol].price);
                }
            }
        }
    }

    return result;
}

/**
 * Symbol to CoinGecko ID mapping
 */
function symbolToCoinGeckoId(symbol: string): string {
    const mapping: { [key: string]: string } = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'MNT': 'mantle',
        'USDT': 'tether',
        'USDC': 'usd-coin',
        'BNB': 'binancecoin',
        'SOL': 'solana',
        'ADA': 'cardano',
        'XRP': 'ripple',
        'DOT': 'polkadot'
    };

    return mapping[symbol.toUpperCase()] || symbol.toLowerCase();
}

/**
 * Get RSI (simplified - returns mock data)
 */
export async function getRSI(symbol: string, period: number = 14): Promise<number> {
    // TODO: Implement real RSI calculation using historical data
    // For now, return a random value between 30-70
    return 50 + (Math.random() - 0.5) * 40;
}

/**
 * Get 24h volume
 */
export async function get24hVolume(symbol: string): Promise<number> {
    const coinId = symbolToCoinGeckoId(symbol);

    try {
        const response = await axios.get(
            `https://api.coingecko.com/api/v3/coins/${coinId}`,
            { timeout: 5000 }
        );

        return response.data.market_data?.total_volume?.usd || 0;
    } catch (error) {
        console.error(`Failed to fetch volume for ${symbol}`);
        return 0;
    }
}

/**
 * Get moving average (simplified)
 */
export async function getMovingAverage(symbol: string, period: number = 20): Promise<number> {
    // TODO: Implement real MA calculation
    const currentPrice = await getCurrentPrice(symbol);
    return currentPrice * (0.98 + Math.random() * 0.04); // ±2% from current
}

/**
 * Get sentiment score (mock)
 */
export async function getSentimentScore(): Promise<number> {
    // TODO: Implement real sentiment analysis
    return 0.5 + (Math.random() - 0.5) * 0.4; // 0.3 to 0.7
}

/**
 * Get gas price (Mantle)
 */
export async function getGasPrice(): Promise<number> {
    try {
        const response = await axios.post(
            process.env.MANTLE_RPC_URL!,
            {
                jsonrpc: '2.0',
                method: 'eth_gasPrice',
                params: [],
                id: 1
            },
            { timeout: 3000 }
        );

        const gasPrice = parseInt(response.data.result, 16);
        return gasPrice / 1e9; // Convert to Gwei
    } catch (error) {
        console.error('Failed to fetch gas price');
        return 20; // Default 20 Gwei
    }
}
