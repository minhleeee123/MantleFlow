/**
 * Test Backend APIs
 * Kiểm tra tất cả endpoints backend hiện tại
 */

const axios = require('axios');
const { ethers } = require('ethers');

const API_BASE = 'http://localhost:8000/api';

let authToken = '';
let testTriggerId = '';

// Create a test wallet
const testWallet = ethers.Wallet.createRandom();

console.log('\n');
console.log('═'.repeat(80));
console.log('🧪 TESTING BACKEND APIs');
console.log('═'.repeat(80));
console.log('\n');

// ============================================================
// TEST 1: Health Check
// ============================================================
async function testHealthCheck() {
    console.log('🏥 TEST 1: Health Check');
    console.log('─'.repeat(80));
    
    try {
        const response = await axios.get('http://localhost:8000/');
        
        console.log('✅ SUCCESS');
        console.log('   Status:', response.status);
        console.log('   Message:', response.data.message);
        console.log('   Version:', response.data.version);
        console.log('   Vault:', response.data.vault || 'Not set');
        console.log('   DEX:', response.data.dex || 'Not set');
        console.log('\n');
        
        return true;
    } catch (error) {
        console.log('❌ FAILED:', error.message);
        console.log('⚠️  Backend is not running! Start it first:\n');
        console.log('   cd backendV2');
        console.log('   npm run dev\n');
        return false;
    }
}

// ============================================================
// TEST 2: Auth - Login (Real wallet signature)
// ============================================================
async function testAuthLogin() {
    console.log('🔐 TEST 2: Auth - Login');
    console.log('─'.repeat(80));
    console.log('Endpoint: POST /api/auth/login');
    console.log('Expected: JWT token\n');
    
    try {
        // Real wallet signature
        const walletAddress = testWallet.address;
        const message = 'Sign in to MantleFlow Auto-Trading';
        const signature = await testWallet.signMessage(message);
        
        console.log('   Test Wallet:', walletAddress);
        console.log('   Signing message...\n');
        
        const response = await axios.post(`${API_BASE}/auth/login`, {
            walletAddress,
            message,
            signature
        });
        
        authToken = response.data.token;
        
        console.log('✅ SUCCESS');
        console.log('   Status:', response.status);
        console.log('   Token:', authToken.substring(0, 30) + '...');
        console.log('   User ID:', response.data.user?.id);
        console.log('   Wallet:', response.data.user?.walletAddress);
        console.log('\n');
        
        return true;
    } catch (error) {
        console.log('❌ FAILED:', error.response?.data?.error || error.message);
        if (error.response?.data) {
            console.log('   Response:', JSON.stringify(error.response.data, null, 2));
        }
        console.log('\n');
        return false;
    }
}

// ============================================================
// TEST 3: Auth - Verify Token
// ============================================================
async function testAuthVerify() {
    console.log('🔐 TEST 3: Auth - Verify Token');
    console.log('─'.repeat(80));
    console.log('Endpoint: POST /api/auth/verify');
    console.log('Expected: User info\n');
    
    if (!authToken) {
        console.log('⚠️  SKIPPED: No auth token\n');
        return false;
    }
    
    try {
        const response = await axios.post(`${API_BASE}/auth/verify`, {}, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        console.log('✅ SUCCESS');
        console.log('   Status:', response.status);
        console.log('   User ID:', response.data.user?.userId);
        console.log('   Wallet:', response.data.user?.walletAddress);
        console.log('\n');
        
        return true;
    } catch (error) {
        console.log('❌ FAILED:', error.response?.data?.error || error.message);
        console.log('\n');
        return false;
    }
}

// ============================================================
// TEST 4: Triggers - Create Simple Trigger
// ============================================================
async function testCreateSimpleTrigger() {
    console.log('📊 TEST 4: Triggers - Create Simple Trigger');
    console.log('─'.repeat(80));
    console.log('Endpoint: POST /api/triggers');
    console.log('Expected: Trigger created\n');
    
    if (!authToken) {
        console.log('⚠️  SKIPPED: No auth token\n');
        return false;
    }
    
    try {
        const response = await axios.post(`${API_BASE}/triggers`, {
            symbol: 'BTC',
            targetPrice: 90000,
            condition: 'BELOW',
            amount: 100,
            type: 'BUY'
        }, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        testTriggerId = response.data.trigger.id;
        
        console.log('✅ SUCCESS');
        console.log('   Status:', response.status);
        console.log('   Trigger ID:', testTriggerId);
        console.log('   Symbol:', response.data.trigger.symbol);
        console.log('   Target:', response.data.trigger.targetPrice);
        console.log('   Type:', response.data.trigger.type);
        console.log('   Status:', response.data.trigger.status);
        console.log('\n');
        
        return true;
    } catch (error) {
        console.log('❌ FAILED:', error.response?.data?.error || error.message);
        console.log('\n');
        return false;
    }
}

// ============================================================
// TEST 5: Triggers - Create Smart Trigger
// ============================================================
async function testCreateSmartTrigger() {
    console.log('🤖 TEST 5: Triggers - Create Smart Trigger');
    console.log('─'.repeat(80));
    console.log('Endpoint: POST /api/triggers (with smartConditions)');
    console.log('Expected: Smart trigger created\n');
    
    if (!authToken) {
        console.log('⚠️  SKIPPED: No auth token\n');
        return false;
    }
    
    try {
        const response = await axios.post(`${API_BASE}/triggers`, {
            symbol: 'ETH',
            targetPrice: 0,
            condition: 'ABOVE',
            amount: 50,
            type: 'BUY',
            smartConditions: [
                { metric: 'PRICE', operator: 'LT', value: 3000, description: 'Price < 3000' },
                { metric: 'RSI', operator: 'LT', value: 30, description: 'RSI < 30' }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        console.log('✅ SUCCESS');
        console.log('   Status:', response.status);
        console.log('   Trigger ID:', response.data.trigger.id);
        console.log('   Symbol:', response.data.trigger.symbol);
        console.log('   Smart Conditions:', JSON.stringify(response.data.trigger.smartConditions, null, 2));
        console.log('   Status:', response.data.trigger.status);
        console.log('\n');
        
        return true;
    } catch (error) {
        console.log('❌ FAILED:', error.response?.data?.error || error.message);
        console.log('\n');
        return false;
    }
}

// ============================================================
// TEST 6: Triggers - Get All Triggers
// ============================================================
async function testGetTriggers() {
    console.log('📊 TEST 6: Triggers - Get All');
    console.log('─'.repeat(80));
    console.log('Endpoint: GET /api/triggers');
    console.log('Expected: List of triggers\n');
    
    if (!authToken) {
        console.log('⚠️  SKIPPED: No auth token\n');
        return false;
    }
    
    try {
        const response = await axios.get(`${API_BASE}/triggers`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        console.log('✅ SUCCESS');
        console.log('   Status:', response.status);
        console.log('   Total Triggers:', response.data.triggers.length);
        
        if (response.data.triggers.length > 0) {
            console.log('\n   Triggers:');
            response.data.triggers.forEach((t, i) => {
                console.log(`   ${i + 1}. ${t.symbol} - ${t.type} @ $${t.targetPrice} - ${t.status}`);
            });
        }
        console.log('\n');
        
        return true;
    } catch (error) {
        console.log('❌ FAILED:', error.response?.data?.error || error.message);
        console.log('\n');
        return false;
    }
}

// ============================================================
// TEST 7: Triggers - Get Single Trigger
// ============================================================
async function testGetSingleTrigger() {
    console.log('📊 TEST 7: Triggers - Get Single Trigger');
    console.log('─'.repeat(80));
    console.log('Endpoint: GET /api/triggers/:id');
    console.log('Expected: Trigger details\n');
    
    if (!authToken || !testTriggerId) {
        console.log('⚠️  SKIPPED: No auth token or trigger ID\n');
        return false;
    }
    
    try {
        const response = await axios.get(`${API_BASE}/triggers/${testTriggerId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        console.log('✅ SUCCESS');
        console.log('   Status:', response.status);
        console.log('   Trigger ID:', response.data.trigger.id);
        console.log('   Symbol:', response.data.trigger.symbol);
        console.log('   Target:', response.data.trigger.targetPrice);
        console.log('   Status:', response.data.trigger.status);
        console.log('\n');
        
        return true;
    } catch (error) {
        console.log('❌ FAILED:', error.response?.data?.error || error.message);
        console.log('\n');
        return false;
    }
}

// ============================================================
// TEST 8: Execute - Get History
// ============================================================
async function testGetExecutionHistory() {
    console.log('📊 TEST 8: Execute - Get History');
    console.log('─'.repeat(80));
    console.log('Endpoint: GET /api/execute/history');
    console.log('Expected: List of executions\n');
    
    if (!authToken) {
        console.log('⚠️  SKIPPED: No auth token\n');
        return false;
    }
    
    try {
        const response = await axios.get(`${API_BASE}/execute/history`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        console.log('✅ SUCCESS');
        console.log('   Status:', response.status);
        console.log('   Total Executions:', response.data.executions.length);
        
        if (response.data.executions.length > 0) {
            console.log('\n   Recent Executions:');
            response.data.executions.slice(0, 3).forEach((e, i) => {
                console.log(`   ${i + 1}. ${e.symbol} - ${e.type} @ $${e.executionPrice} - ${e.status}`);
            });
        } else {
            console.log('   No executions yet');
        }
        console.log('\n');
        
        return true;
    } catch (error) {
        console.log('❌ FAILED:', error.response?.data?.error || error.message);
        console.log('\n');
        return false;
    }
}

// ============================================================
// TEST 9: Transactions - Get List
// ============================================================
async function testGetTransactions() {
    console.log('📊 TEST 9: Transactions - Get List');
    console.log('─'.repeat(80));
    console.log('Endpoint: GET /api/transactions');
    console.log('Expected: List of transactions\n');
    
    if (!authToken) {
        console.log('⚠️  SKIPPED: No auth token\n');
        return false;
    }
    
    try {
        const response = await axios.get(`${API_BASE}/transactions`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        console.log('✅ SUCCESS');
        console.log('   Status:', response.status);
        console.log('   Total Transactions:', response.data.length);
        
        if (response.data.length > 0) {
            console.log('\n   Recent Transactions:');
            response.data.slice(0, 3).forEach((tx, i) => {
                console.log(`   ${i + 1}. ${tx.type} - ${tx.tokenIn} ${tx.amountIn} - ${tx.status}`);
            });
        } else {
            console.log('   No transactions yet');
        }
        console.log('\n');
        
        return true;
    } catch (error) {
        console.log('❌ FAILED:', error.response?.data?.error || error.message);
        console.log('\n');
        return false;
    }
}

// ============================================================
// TEST 10: Triggers - Delete Trigger
// ============================================================
async function testDeleteTrigger() {
    console.log('🗑️  TEST 10: Triggers - Delete (Cancel)');
    console.log('─'.repeat(80));
    console.log('Endpoint: DELETE /api/triggers/:id');
    console.log('Expected: Trigger cancelled\n');
    
    if (!authToken || !testTriggerId) {
        console.log('⚠️  SKIPPED: No auth token or trigger ID\n');
        return false;
    }
    
    try {
        const response = await axios.delete(`${API_BASE}/triggers/${testTriggerId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        console.log('✅ SUCCESS');
        console.log('   Status:', response.status);
        console.log('   Message:', response.data.message);
        console.log('\n');
        
        return true;
    } catch (error) {
        console.log('❌ FAILED:', error.response?.data?.error || error.message);
        console.log('\n');
        return false;
    }
}

// ============================================================
// RUN ALL TESTS
// ============================================================
async function runAll() {
    const results = [];
    
    // Test 1: Health Check
    const health = await testHealthCheck();
    results.push({ test: 'Health Check', status: health });
    
    if (!health) {
        console.log('\n❌ Backend is not running. Please start it first!\n');
        return;
    }
    
    // Test 2-3: Auth
    const login = await testAuthLogin();
    results.push({ test: 'Auth - Login', status: login });
    
    const verify = await testAuthVerify();
    results.push({ test: 'Auth - Verify', status: verify });
    
    // Test 4-7: Triggers
    const createSimple = await testCreateSimpleTrigger();
    results.push({ test: 'Trigger - Create Simple', status: createSimple });
    
    const createSmart = await testCreateSmartTrigger();
    results.push({ test: 'Trigger - Create Smart', status: createSmart });
    
    const getTriggers = await testGetTriggers();
    results.push({ test: 'Trigger - Get All', status: getTriggers });
    
    const getSingle = await testGetSingleTrigger();
    results.push({ test: 'Trigger - Get Single', status: getSingle });
    
    // Test 8: Execute History
    const getHistory = await testGetExecutionHistory();
    results.push({ test: 'Execute - History', status: getHistory });
    
    // Test 9: Transactions
    const getTransactions = await testGetTransactions();
    results.push({ test: 'Transactions - List', status: getTransactions });
    
    // Test 10: Delete
    const deleteTrigger = await testDeleteTrigger();
    results.push({ test: 'Trigger - Delete', status: deleteTrigger });
    
    // Summary
    console.log('\n');
    console.log('═'.repeat(80));
    console.log('📊 TEST SUMMARY');
    console.log('═'.repeat(80));
    console.log('\n');
    
    results.forEach((r, i) => {
        const icon = r.status ? '✅' : '❌';
        console.log(`${icon} ${(i + 1).toString().padStart(2)}. ${r.test}`);
    });
    
    const passed = results.filter(r => r.status).length;
    const total = results.length;
    
    console.log('\n');
    console.log('─'.repeat(80));
    console.log(`\nResult: ${passed}/${total} tests passed\n`);
    
    if (passed === total) {
        console.log('🎉 ALL TESTS PASSED!');
        console.log('✅ Backend APIs are working correctly\n');
    } else if (passed >= total * 0.7) {
        console.log('⚠️  MOST TESTS PASSED');
        console.log('🔧 Some features may need attention\n');
    } else {
        console.log('❌ MANY TESTS FAILED');
        console.log('🛠️  Backend needs fixes\n');
    }
    
    console.log('═'.repeat(80));
    console.log('\n');
}

// Run
runAll().catch(console.error);
