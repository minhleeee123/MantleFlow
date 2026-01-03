import axios from 'axios';

// Calculate RSI from price data
export async function calculateRSI(symbol: string, period: number = 14): Promise<number> {
    try {
        // Fetch historical price data from CoinGecko (last 15 days for 14-period RSI)
        const coinId = symbol.toLowerCase();
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`, {
            params: {
                vs_currency: 'usd',
                days: period + 1, // Need one extra day for calculation
                interval: 'daily'
            }
        });

        const prices = response.data.prices.map((p: [number, number]) => p[1]); // Extract price values

        if (prices.length < period + 1) {
            throw new Error('Insufficient price data for RSI calculation');
        }

        // Calculate price changes
        const changes: number[] = [];
        for (let i = 1; i < prices.length; i++) {
            changes.push(prices[i] - prices[i - 1]);
        }

        // Separate gains and losses
        const gains = changes.map(change => change > 0 ? change : 0);
        const losses = changes.map(change => change < 0 ? Math.abs(change) : 0);

        // Calculate initial average gain and loss (first 14 periods)
        let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
        let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

        // Apply Wilder's smoothing for subsequent periods
        for (let i = period; i < gains.length; i++) {
            avgGain = ((avgGain * (period - 1)) + gains[i]) / period;
            avgLoss = ((avgLoss * (period - 1)) + losses[i]) / period;
        }

        // Calculate RS and RSI
        if (avgLoss === 0) return 100; // No losses means RSI = 100
        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));

        return Math.round(rsi * 100) / 100; // Round to 2 decimal places
    } catch (error) {
        console.error('Error calculating RSI:', error);
        throw error;
    }
}

// Calculate Moving Average from price data
export async function calculateMA(symbol: string, period: number = 50): Promise<number> {
    try {
        // Fetch historical price data from CoinGecko
        const coinId = symbol.toLowerCase();
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`, {
            params: {
                vs_currency: 'usd',
                days: period,
                interval: 'daily'
            }
        });

        const prices = response.data.prices.map((p: [number, number]) => p[1]); // Extract price values

        if (prices.length < period) {
            throw new Error('Insufficient price data for MA calculation');
        }

        // Calculate Simple Moving Average (SMA)
        const sum = prices.slice(-period).reduce((a: number, b: number) => a + b, 0);
        const ma = sum / period;

        return Math.round(ma * 100) / 100; // Round to 2 decimal places
    } catch (error) {
        console.error('Error calculating MA:', error);
        throw error;
    }
}
