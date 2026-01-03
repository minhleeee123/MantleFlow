
// This service simulates 6 different data APIs for the Smart Trade feature.
// In a real app, these would fetch from different endpoints (CoinGecko, Etherscan, etc.)

const randomVariation = (base: number, percent: number) => {
    const change = base * (percent / 100);
    return base - change + Math.random() * (change * 2);
};

// 1. Current Price API
export const getMockPrice = async (symbol: string): Promise<number> => {
    // Simulate API latency
    await new Promise(r => setTimeout(r, 200)); 
    
    // Base prices
    const bases: Record<string, number> = { 'BTC': 64000, 'ETH': 3400, 'SOL': 145, 'BNB': 590 };
    const base = bases[symbol.toUpperCase()] || 100;
    return parseFloat(randomVariation(base, 0.5).toFixed(2));
};

// 2. RSI (Relative Strength Index) API
export const getMockRSI = async (symbol: string): Promise<number> => {
    await new Promise(r => setTimeout(r, 150));
    // Return RSI between 20 and 80
    return parseFloat((Math.random() * 60 + 20).toFixed(2));
};

// 3. 24h Volume API
export const getMockVolume = async (symbol: string): Promise<number> => {
    await new Promise(r => setTimeout(r, 100));
    // Return volume in millions
    return parseFloat((Math.random() * 500 + 100).toFixed(2)); // 100M to 600M
};

// 4. Moving Average (SMA 20) API
export const getMockMA = async (symbol: string): Promise<number> => {
    await new Promise(r => setTimeout(r, 200));
    const price = await getMockPrice(symbol);
    // MA is usually close to price
    return parseFloat(randomVariation(price, 2).toFixed(2));
};

// 5. Market Sentiment API (Fear & Greed)
export const getMockSentiment = async (): Promise<number> => {
    await new Promise(r => setTimeout(r, 100));
    // 0-100 score
    return Math.floor(Math.random() * 100);
};

// 6. Network Gas Price API (Gwei)
export const getMockGas = async (): Promise<number> => {
    await new Promise(r => setTimeout(r, 100));
    // 5 to 50 gwei
    return Math.floor(Math.random() * 45 + 5);
};
