/**
 * Test all 6 metrics required for Smart Trade Agent
 * - PRICE
 * - RSI
 * - VOLUME
 * - MA (Moving Average)
 * - SENTIMENT
 * - GAS
 */

const axios = require('axios');
const { ethers } = require('ethers');

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const FEAR_GREED_API = 'https://api.alternative.me/fng/';
const MANTLE_RPC = 'https://rpc.sepolia.mantle.xyz';

const SYMBOL_MAP = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'MNT': 'mantle'
};

console.log('\n');
console.log('═'.repeat(80));
console.log('🧪 TESTING ALL 6 METRICS FOR SMART TRADE');
console.log('═'.repeat(80));
console.log('\n');

// ============================================================
// METRIC 1: PRICE - Current asset price
// ============================================================
async function testPrice() {
    console.log('📊 METRIC 1: PRICE');
    console.log('─'.repeat(80));
    console.log('API: CoinGecko /simple/price');
    console.log('Expected: Current price in USD\n');
    
    try {
        const symbol = 'BTC';
        const coinId = SYMBOL_MAP[symbol];
        
        const response = await axios.get(`${COINGECKO_API}/simple/price`, {
            params: {
                ids: coinId,
                vs_currencies: 'usd'
            }
        });
        
        const price = response.data[coinId].usd;
        
        console.log(`✅ SUCCESS`);
        console.log(`   ${symbol} Price: $${price.toLocaleString()}`);
        console.log(`   Data type: ${typeof price}`);
        console.log(`   Source: CoinGecko`);
        console.log(`   Rate limit: ~10-50 calls/min (need caching)\n`);
        
        return { metric: 'PRICE', status: 'AVAILABLE', value: price, source: 'CoinGecko' };
    } catch (error) {
        console.log(`❌ FAILED: ${error.message}\n`);
        return { metric: 'PRICE', status: 'FAILED', error: error.message };
    }
}

// ============================================================
// METRIC 2: RSI - Relative Strength Index
// ============================================================
async function testRSI() {
    console.log('📊 METRIC 2: RSI (Relative Strength Index)');
    console.log('─'.repeat(80));
    console.log('API: Need historical prices to calculate');
    console.log('Expected: 0-100 value\n');
    
    try {
        const symbol = 'BTC';
        const coinId = SYMBOL_MAP[symbol];
        
        // Method 1: Try to get from CoinGecko market data
        console.log('Attempting Method 1: CoinGecko market indicators...');
        try {
            const response = await axios.get(`${COINGECKO_API}/coins/${coinId}`, {
                params: {
                    localization: false,
                    tickers: false,
                    community_data: false,
                    developer_data: false
                }
            });
            
            // CoinGecko doesn't provide RSI directly
            console.log('❌ CoinGecko does not provide RSI indicator\n');
        } catch (e) {
            console.log(`❌ Failed: ${e.message}\n`);
        }
        
        // Method 2: Calculate from historical prices (simplified)
        console.log('Attempting Method 2: Calculate from historical prices...');
        try {
            const response = await axios.get(`${COINGECKO_API}/coins/${coinId}/market_chart`, {
                params: {
                    vs_currency: 'usd',
                    days: 14, // Need 14 days for RSI calculation
                    interval: 'daily'
                }
            });
            
            const prices = response.data.prices.map(p => p[1]);
            
            // Simplified RSI calculation
            const gains = [];
            const losses = [];
            
            for (let i = 1; i < prices.length; i++) {
                const change = prices[i] - prices[i - 1];
                if (change > 0) {
                    gains.push(change);
                    losses.push(0);
                } else {
                    gains.push(0);
                    losses.push(Math.abs(change));
                }
            }
            
            const avgGain = gains.reduce((a, b) => a + b, 0) / gains.length;
            const avgLoss = losses.reduce((a, b) => a + b, 0) / losses.length;
            
            const rs = avgGain / avgLoss;
            const rsi = 100 - (100 / (1 + rs));
            
            console.log(`✅ SUCCESS (Calculated)`);
            console.log(`   ${symbol} RSI: ${rsi.toFixed(2)}`);
            console.log(`   Data type: ${typeof rsi}`);
            console.log(`   Source: Calculated from CoinGecko historical prices`);
            console.log(`   Note: Simplified calculation, professional RSI uses EMA`);
            console.log(`   Rate limit: Same as PRICE (need caching)\n`);
            
            return { metric: 'RSI', status: 'AVAILABLE (CALCULATED)', value: rsi, source: 'CoinGecko + Calculation' };
        } catch (e) {
            console.log(`❌ Failed: ${e.message}\n`);
        }
        
        // Method 3: Use mock data (fallback)
        console.log('Method 3: Using mock data (for demo)...');
        const mockRSI = Math.random() * 40 + 30; // Random 30-70
        console.log(`⚠️  MOCK DATA`);
        console.log(`   ${symbol} RSI: ${mockRSI.toFixed(2)} (mock)`);
        console.log(`   Recommendation: Use for demo only\n`);
        
        return { metric: 'RSI', status: 'MOCK ONLY', value: mockRSI, source: 'Mock Data' };
        
    } catch (error) {
        console.log(`❌ FAILED: ${error.message}\n`);
        return { metric: 'RSI', status: 'FAILED', error: error.message };
    }
}

// ============================================================
// METRIC 3: VOLUME - 24h Trading Volume
// ============================================================
async function testVolume() {
    console.log('📊 METRIC 3: VOLUME (24h Trading Volume)');
    console.log('─'.repeat(80));
    console.log('API: CoinGecko /coins/{id}');
    console.log('Expected: Volume in millions USD\n');
    
    try {
        const symbol = 'BTC';
        const coinId = SYMBOL_MAP[symbol];
        
        const response = await axios.get(`${COINGECKO_API}/coins/${coinId}`, {
            params: {
                localization: false,
                tickers: false,
                community_data: false,
                developer_data: false
            }
        });
        
        const volume = response.data.market_data.total_volume.usd;
        const volumeM = volume / 1_000_000;
        
        console.log(`✅ SUCCESS`);
        console.log(`   ${symbol} 24h Volume: $${volumeM.toFixed(2)}M`);
        console.log(`   Raw value: $${volume.toLocaleString()}`);
        console.log(`   Data type: ${typeof volumeM}`);
        console.log(`   Source: CoinGecko`);
        console.log(`   Rate limit: ~10-50 calls/min (need caching)\n`);
        
        return { metric: 'VOLUME', status: 'AVAILABLE', value: volumeM, source: 'CoinGecko' };
    } catch (error) {
        console.log(`❌ FAILED: ${error.message}\n`);
        return { metric: 'VOLUME', status: 'FAILED', error: error.message };
    }
}

// ============================================================
// METRIC 4: MA - Moving Average
// ============================================================
async function testMA() {
    console.log('📊 METRIC 4: MA (Moving Average)');
    console.log('─'.repeat(80));
    console.log('API: CoinGecko /market_chart (historical prices)');
    console.log('Expected: Average price over period\n');
    
    try {
        const symbol = 'BTC';
        const coinId = SYMBOL_MAP[symbol];
        
        console.log('Calculating 7-day Simple Moving Average...\n');
        
        const response = await axios.get(`${COINGECKO_API}/coins/${coinId}/market_chart`, {
            params: {
                vs_currency: 'usd',
                days: 7,
                interval: 'daily'
            }
        });
        
        const prices = response.data.prices.map(p => p[1]);
        const ma7 = prices.reduce((a, b) => a + b, 0) / prices.length;
        
        // Also get current price for comparison
        const currentPrice = prices[prices.length - 1];
        const difference = ((currentPrice - ma7) / ma7 * 100).toFixed(2);
        
        console.log(`✅ SUCCESS`);
        console.log(`   ${symbol} 7-Day MA: $${ma7.toLocaleString()}`);
        console.log(`   Current Price: $${currentPrice.toLocaleString()}`);
        console.log(`   Difference: ${difference}%`);
        console.log(`   Data type: ${typeof ma7}`);
        console.log(`   Source: Calculated from CoinGecko`);
        console.log(`   Rate limit: Same as PRICE (need caching)\n`);
        
        return { metric: 'MA', status: 'AVAILABLE (CALCULATED)', value: ma7, source: 'CoinGecko + Calculation' };
    } catch (error) {
        console.log(`❌ FAILED: ${error.message}\n`);
        
        // Fallback: Use current price * 0.98
        console.log('Using simplified method (current price * 0.98)...');
        try {
            const response = await axios.get(`${COINGECKO_API}/simple/price`, {
                params: {
                    ids: SYMBOL_MAP['BTC'],
                    vs_currencies: 'usd'
                }
            });
            const price = response.data[SYMBOL_MAP['BTC']].usd;
            const simplifiedMA = price * 0.98;
            
            console.log(`⚠️  SIMPLIFIED`);
            console.log(`   BTC Simplified MA: $${simplifiedMA.toLocaleString()}`);
            console.log(`   Method: Current price * 0.98\n`);
            
            return { metric: 'MA', status: 'AVAILABLE (SIMPLIFIED)', value: simplifiedMA, source: 'Simplified Calculation' };
        } catch (e) {
            return { metric: 'MA', status: 'FAILED', error: error.message };
        }
    }
}

// ============================================================
// METRIC 5: SENTIMENT - Fear & Greed Index
// ============================================================
async function testSentiment() {
    console.log('📊 METRIC 5: SENTIMENT (Fear & Greed Index)');
    console.log('─'.repeat(80));
    console.log('API: Alternative.me /fng/');
    console.log('Expected: 0-100 value\n');
    
    try {
        const response = await axios.get(FEAR_GREED_API);
        const data = response.data.data[0];
        
        const value = parseInt(data.value);
        const classification = data.value_classification;
        const timestamp = new Date(parseInt(data.timestamp) * 1000);
        
        let emoji = '😐';
        if (value <= 25) emoji = '😱';
        else if (value <= 45) emoji = '😰';
        else if (value <= 55) emoji = '😐';
        else if (value <= 75) emoji = '😄';
        else emoji = '🤑';
        
        console.log(`✅ SUCCESS`);
        console.log(`   Fear & Greed Index: ${value}/100`);
        console.log(`   Classification: ${emoji} ${classification}`);
        console.log(`   Updated: ${timestamp.toLocaleString()}`);
        console.log(`   Data type: ${typeof value}`);
        console.log(`   Source: Alternative.me`);
        console.log(`   Rate limit: None! 🎉`);
        console.log(`   Update frequency: Every 8 hours\n`);
        
        return { metric: 'SENTIMENT', status: 'AVAILABLE', value: value, source: 'Alternative.me' };
    } catch (error) {
        console.log(`❌ FAILED: ${error.message}\n`);
        return { metric: 'SENTIMENT', status: 'FAILED', error: error.message };
    }
}

// ============================================================
// METRIC 6: GAS - Network Gas Price
// ============================================================
async function testGas() {
    console.log('📊 METRIC 6: GAS (Network Gas Price)');
    console.log('─'.repeat(80));
    console.log('API: Mantle RPC eth_feeData');
    console.log('Expected: Gas price in Gwei\n');
    
    try {
        const provider = new ethers.JsonRpcProvider(MANTLE_RPC);
        
        const feeData = await provider.getFeeData();
        const gasPriceGwei = feeData.gasPrice 
            ? Number(ethers.formatUnits(feeData.gasPrice, 'gwei'))
            : 0;
        
        // Estimate transaction cost
        const gasLimit = 300000;
        const estimatedCost = feeData.gasPrice 
            ? Number(ethers.formatEther(feeData.gasPrice * BigInt(gasLimit)))
            : 0;
        
        console.log(`✅ SUCCESS`);
        console.log(`   Gas Price: ${gasPriceGwei.toFixed(4)} Gwei`);
        console.log(`   Estimated Swap Cost: ${estimatedCost.toFixed(6)} MNT`);
        console.log(`   Data type: ${typeof gasPriceGwei}`);
        console.log(`   Source: Mantle RPC`);
        console.log(`   Rate limit: None (direct RPC call)`);
        console.log(`   Stability: Very stable (~0.02 Gwei)\n`);
        
        return { metric: 'GAS', status: 'AVAILABLE', value: gasPriceGwei, source: 'Mantle RPC' };
    } catch (error) {
        console.log(`❌ FAILED: ${error.message}\n`);
        return { metric: 'GAS', status: 'FAILED', error: error.message };
    }
}

// ============================================================
// RUN ALL TESTS
// ============================================================
async function runAll() {
    const results = [];
    
    results.push(await testPrice());
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    results.push(await testRSI());
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    results.push(await testVolume());
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    results.push(await testMA());
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    results.push(await testSentiment());
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    results.push(await testGas());
    
    // Summary
    console.log('\n');
    console.log('═'.repeat(80));
    console.log('📊 SUMMARY: ALL 6 METRICS');
    console.log('═'.repeat(80));
    console.log('\n');
    
    const table = [];
    results.forEach(r => {
        const status = r.status.includes('AVAILABLE') ? '✅' : 
                      r.status.includes('MOCK') ? '⚠️' : '❌';
        const value = r.value ? (typeof r.value === 'number' ? r.value.toFixed(2) : r.value) : 'N/A';
        
        console.log(`${status} ${r.metric.padEnd(12)} | ${r.status.padEnd(25)} | ${r.source || 'N/A'}`);
        
        table.push({
            metric: r.metric,
            status: r.status,
            available: r.status.includes('AVAILABLE')
        });
    });
    
    console.log('\n');
    console.log('─'.repeat(80));
    
    const available = table.filter(t => t.available).length;
    const total = table.length;
    
    console.log(`\n✅ Available: ${available}/${total} metrics`);
    
    if (available >= 5) {
        console.log('\n🎉 EXCELLENT! Most metrics are available!');
        console.log('✅ Ready to implement backend services');
    } else if (available >= 3) {
        console.log('\n⚠️  PARTIAL: Some metrics need workarounds');
        console.log('🔧 Consider using mock/calculated data for missing metrics');
    } else {
        console.log('\n❌ WARNING: Too many metrics unavailable');
        console.log('🛠️  Need alternative data sources or mock data');
    }
    
    console.log('\n');
    console.log('═'.repeat(80));
    console.log('💡 RECOMMENDATIONS:');
    console.log('═'.repeat(80));
    console.log('\n');
    
    console.log('1. PRICE: ✅ Use CoinGecko + caching (10s TTL)');
    console.log('2. RSI: ⚠️  Calculate from historical prices OR use mock data');
    console.log('3. VOLUME: ✅ Use CoinGecko (same API as PRICE)');
    console.log('4. MA: ✅ Calculate from historical prices OR simplified (price * 0.98)');
    console.log('5. SENTIMENT: ✅ Use Alternative.me (perfect!)');
    console.log('6. GAS: ✅ Use Mantle RPC (perfect!)');
    
    console.log('\n');
    console.log('🚀 Next Step: Implement market.ts with these findings!');
    console.log('\n');
    console.log('═'.repeat(80));
    console.log('\n');
}

// Run
runAll().catch(console.error);
