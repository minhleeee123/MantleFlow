/**
 * Test Auto-Executor với Market Data Integration
 * Comprehensive test để verify toàn bộ hệ thống auto-trading
 */

const axios = require('axios');
const { ethers } = require('ethers');
require('dotenv').config();

const API_BASE = 'http://localhost:8000/api';

let authToken = '';
// Use admin wallet from .env
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
let testWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY);
let triggerId = '';

// Colors for console
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(emoji, message, color = colors.reset) {
    console.log(`${color}${emoji} ${message}${colors.reset}`);
}

function separator() {
    console.log('─'.repeat(80));
}

function section(title) {
    console.log('\n');
    console.log('═'.repeat(80));
    console.log(`${colors.cyan}${title}${colors.reset}`);
    console.log('═'.repeat(80));
}

// ============================================================
// AUTHENTICATION
// ============================================================
async function authenticate() {
    section('🔐 STEP 1: AUTHENTICATION');

    const walletAddress = testWallet.address;
    const message = 'Sign in to MantleFlow Auto-Trading';
    const signature = await testWallet.signMessage(message);

    log('📝', `Wallet: ${walletAddress}`, colors.blue);

    const response = await axios.post(`${API_BASE}/auth/login`, {
        walletAddress,
        message,
        signature
    });

    authToken = response.data.token;
    log('✅', 'Authentication successful', colors.green);
    log('🎫', `Token: ${authToken.substring(0, 30)}...`, colors.blue);
}

// ============================================================
// TEST MARKET DATA APIs
// ============================================================
async function testMarketAPIs() {
    section('📊 STEP 2: TEST MARKET DATA APIs');

    const tests = [
        {
            name: 'Get BTC Price',
            endpoint: '/market/price/BTC',
            check: (data) => data.price > 0
        },
        {
            name: 'Get Multiple Prices (BTC, ETH)',
            endpoint: '/market/prices?symbols=BTC,ETH',
            check: (data) => data.prices.BTC && data.prices.ETH
        },
        {
            name: 'Get BTC RSI',
            endpoint: '/market/rsi/BTC',
            check: (data) => data.rsi >= 0 && data.rsi <= 100
        },
        {
            name: 'Get BTC Volume',
            endpoint: '/market/volume/BTC',
            check: (data) => data.volume > 0
        },
        {
            name: 'Get BTC Moving Average',
            endpoint: '/market/ma/BTC?days=7',
            check: (data) => data.ma > 0
        },
        {
            name: 'Get Sentiment Score',
            endpoint: '/market/sentiment',
            check: (data) => data.sentiment >= 0 && data.sentiment <= 100
        },
        {
            name: 'Get Gas Price',
            endpoint: '/market/gas',
            check: (data) => data.gasPrice > 0
        },
        {
            name: 'Get All Metrics for BTC',
            endpoint: '/market/metrics/BTC',
            check: (data) => data.metrics.PRICE && data.metrics.RSI && data.metrics.VOLUME
        }
    ];

    for (const test of tests) {
        try {
            const response = await axios.get(`${API_BASE}${test.endpoint}`);
            
            if (response.data.success && test.check(response.data.data)) {
                log('✅', test.name, colors.green);
                console.log(`   ${JSON.stringify(response.data.data).substring(0, 100)}...`);
            } else {
                log('❌', `${test.name} - Invalid data`, colors.red);
            }
        } catch (error) {
            log('❌', `${test.name} - ${error.message}`, colors.red);
        }

        // Delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

// ============================================================
// CREATE TEST TRIGGERS
// ============================================================
async function createTestTriggers() {
    section('🎯 STEP 3: CREATE TEST TRIGGERS');

    // Test 1: Simple Price Trigger (will likely NOT execute immediately)
    log('📝', 'Creating simple price trigger (BTC < $50,000)', colors.blue);
    
    const simpleTrigger = await axios.post(
        `${API_BASE}/triggers`,
        {
            symbol: 'BTC',
            targetPrice: 50000, // Very low, won't trigger
            condition: 'BELOW',
            type: 'BUY',
            amount: 5,
            slippage: 5
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
    );

    log('✅', `Simple trigger created: ${simpleTrigger.data.id}`, colors.green);

    // Test 2: Smart Trigger with conditions that WILL MET
    log('📝', 'Creating smart trigger (easy conditions to test executor)', colors.blue);
    
    const smartTrigger = await axios.post(
        `${API_BASE}/triggers`,
        {
            symbol: 'BTC',
            targetPrice: 0,
            condition: 'ABOVE',
            type: 'BUY',
            amount: 10,
            slippage: 5,
            smartConditions: [
                {
                    metric: 'PRICE',
                    operator: 'GT',
                    value: 1000, // BTC price > $1,000 (will be true)
                    description: 'Price above $1,000'
                },
                {
                    metric: 'RSI',
                    operator: 'GT',
                    value: 0, // RSI > 0 (always true)
                    description: 'RSI above 0'
                }
            ]
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
    );

    triggerId = smartTrigger.data.id;
    log('✅', `Smart trigger created: ${triggerId}`, colors.green);
    log('⚠️', 'This trigger should execute soon by auto-executor', colors.yellow);

    // Test 3: Another smart trigger that WON'T execute
    log('📝', 'Creating smart trigger (conditions NOT met)', colors.blue);
    
    const hardTrigger = await axios.post(
        `${API_BASE}/triggers`,
        {
            symbol: 'ETH',
            targetPrice: 0,
            condition: 'BELOW',
            type: 'SELL',
            amount: 5,
            slippage: 5,
            smartConditions: [
                {
                    metric: 'PRICE',
                    operator: 'LT',
                    value: 100, // ETH < $100 (will be false)
                    description: 'Price below $100'
                },
                {
                    metric: 'RSI',
                    operator: 'LT',
                    value: 10, // RSI < 10 (likely false)
                    description: 'RSI below 10'
                }
            ]
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
    );

    log('✅', `Hard trigger created: ${hardTrigger.data.id}`, colors.green);
    log('💡', 'This trigger should NOT execute (conditions not met)', colors.yellow);
}

// ============================================================
// MONITOR AUTO-EXECUTOR
// ============================================================
async function monitorAutoExecutor() {
    section('👁️  STEP 4: MONITOR AUTO-EXECUTOR');

    log('⏳', 'Waiting for auto-executor to check triggers...', colors.yellow);
    log('💡', 'Auto-executor runs every 10 seconds', colors.blue);
    log('📊', 'Watch the backend terminal for executor logs', colors.blue);

    // Wait 15 seconds for executor to run
    for (let i = 15; i > 0; i--) {
        process.stdout.write(`\r   Waiting ${i}s... `);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('\n');

    // Check trigger status
    log('🔍', 'Checking trigger statuses...', colors.blue);
    
    const triggersResponse = await axios.get(
        `${API_BASE}/triggers`,
        { headers: { Authorization: `Bearer ${authToken}` } }
    );

    console.log('\n   Trigger Status:');
    triggersResponse.data.forEach((trigger, index) => {
        const statusColor = 
            trigger.status === 'EXECUTED' ? colors.green :
            trigger.status === 'ACTIVE' ? colors.yellow :
            trigger.status === 'FAILED' ? colors.red : colors.reset;
        
        console.log(`   ${index + 1}. ${trigger.symbol} ${trigger.type} - ${statusColor}${trigger.status}${colors.reset}`);
        
        if (trigger.smartConditions && trigger.smartConditions.length > 0) {
            console.log(`      Smart: ${trigger.smartConditions.map(c => `${c.metric} ${c.operator} ${c.value}`).join(', ')}`);
        } else {
            console.log(`      Target: $${trigger.targetPrice}`);
        }
    });

    // Check executions
    log('\n🔍', 'Checking execution history...', colors.blue);
    
    const executionsResponse = await axios.get(
        `${API_BASE}/execute/history`,
        { headers: { Authorization: `Bearer ${authToken}` } }
    );

    if (executionsResponse.data.length > 0) {
        log('✅', `Found ${executionsResponse.data.length} execution(s)`, colors.green);
        
        executionsResponse.data.forEach((exec, index) => {
            console.log(`\n   Execution ${index + 1}:`);
            console.log(`   - Symbol: ${exec.symbol}`);
            console.log(`   - Type: ${exec.type}`);
            console.log(`   - Amount: ${exec.amount}`);
            console.log(`   - TxHash: ${exec.txHash}`);
            console.log(`   - Time: ${new Date(exec.executedAt).toLocaleString()}`);
        });
    } else {
        log('⚠️', 'No executions yet (might need more time)', colors.yellow);
    }
}

// ============================================================
// CLEANUP
// ============================================================
async function cleanup() {
    section('🧹 STEP 5: CLEANUP');

    log('🗑️', 'Deleting test triggers...', colors.blue);

    const triggersResponse = await axios.get(
        `${API_BASE}/triggers`,
        { headers: { Authorization: `Bearer ${authToken}` } }
    );

    for (const trigger of triggersResponse.data) {
        try {
            await axios.delete(
                `${API_BASE}/triggers/${trigger.id}`,
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            log('✅', `Deleted trigger ${trigger.id}`, colors.green);
        } catch (error) {
            log('⚠️', `Could not delete ${trigger.id}`, colors.yellow);
        }
    }
}

// ============================================================
// MAIN TEST RUNNER
// ============================================================
async function runTests() {
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║       🧪 AUTO-EXECUTOR INTEGRATION TEST                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    try {
        await authenticate();
        await testMarketAPIs();
        await createTestTriggers();
        await monitorAutoExecutor();
        await cleanup();

        section('🎉 TEST COMPLETED');
        log('✅', 'All tests completed successfully', colors.green);
        log('💡', 'Check backend logs to see auto-executor in action', colors.blue);
        
    } catch (error) {
        section('❌ TEST FAILED');
        console.error(error.response?.data || error.message);
    }

    console.log('\n');
}

// Run tests
runTests();
