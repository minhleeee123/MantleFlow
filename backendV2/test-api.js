// Backend API Testing Script
// Run with: node test-api.js

const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

// Test wallet address (replace with your actual test wallet)
const TEST_WALLET = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
const TEST_SIGNATURE = 'dummy-signature-for-testing'; // Will be replaced with real signature
const TEST_MESSAGE = `Sign this message to login to Auto-Trading Platform.\nTimestamp: ${Date.now()}`;

let authToken = '';
let userId = '';
let triggerId = '';

async function testHealth() {
    console.log('\n🧪 Test 1: Health Check');
    try {
        const res = await axios.get(`${BASE_URL}/`);
        console.log('✅ PASS:', res.data);
        return true;
    } catch (error) {
        console.error('❌ FAIL:', error.message);
        return false;
    }
}

async function testAuth() {
    console.log('\n🧪 Test 2: Authentication');
    console.log('⚠️  NOTE: This will fail without real wallet signature');
    console.log('   Use frontend to login and get real JWT token');

    try {
        const res = await axios.post(`${BASE_URL}/api/auth/login`, {
            walletAddress: TEST_WALLET,
            signature: TEST_SIGNATURE,
            message: TEST_MESSAGE
        });
        authToken = res.data.token;
        userId = res.data.user.id;
        console.log('✅ PASS: Token obtained');
        return true;
    } catch (error) {
        console.log('❌ EXPECTED FAIL (need real signature):', error.response?.data || error.message);
        return false;
    }
}

async function testCreateTrigger() {
    console.log('\n🧪 Test 3: Create Trigger');

    if (!authToken) {
        console.log('⚠️  SKIP: No auth token (login failed)');
        return false;
    }

    try {
        const res = await axios.post(
            `${BASE_URL}/api/triggers`,
            {
                symbol: 'MNT',
                targetPrice: 5.5,
                condition: 'ABOVE',
                amount: 10,
                type: 'SELL'
            },
            {
                headers: { Authorization: `Bearer ${authToken}` }
            }
        );
        triggerId = res.data.trigger.id;
        console.log('✅ PASS: Trigger created:', res.data.trigger);
        return true;
    } catch (error) {
        console.error('❌ FAIL:', error.response?.data || error.message);
        return false;
    }
}

async function testListTriggers() {
    console.log('\n🧪 Test 4: List Triggers');

    if (!authToken) {
        console.log('⚠️  SKIP: No auth token');
        return false;
    }

    try {
        const res = await axios.get(`${BASE_URL}/api/triggers`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log(`✅ PASS: Found ${res.data.triggers.length} triggers`);
        return true;
    } catch (error) {
        console.error('❌ FAIL:', error.response?.data || error.message);
        return false;
    }
}

async function testExecuteTrigger() {
    console.log('\n🧪 Test 5: Execute Trigger');
    console.log('⚠️  NOTE: This requires:');
    console.log('   1. Bot wallet funded with MNT');
    console.log('   2. User has balance in Vault');
    console.log('   3. Price condition met');

    if (!authToken || !triggerId) {
        console.log('⚠️  SKIP: No auth token or trigger ID');
        return false;
    }

    try {
        const res = await axios.post(
            `${BASE_URL}/api/execute/${triggerId}`,
            {},
            {
                headers: { Authorization: `Bearer ${authToken}` }
            }
        );
        console.log('✅ PASS: Trigger executed:', res.data);
        return true;
    } catch (error) {
        console.log('❌ EXPECTED FAIL (vault balance or condition not met):',
            error.response?.data || error.message);
        return false;
    }
}

async function testExecutionHistory() {
    console.log('\n🧪 Test 6: Execution History');

    if (!authToken) {
        console.log('⚠️  SKIP: No auth token');
        return false;
    }

    try {
        const res = await axios.get(`${BASE_URL}/api/execute/history`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log(`✅ PASS: Found ${res.data.executions.length} executions`);
        if (res.data.executions.length > 0) {
            console.log('   Latest execution:', res.data.executions[0]);
        }
        return true;
    } catch (error) {
        console.error('❌ FAIL:', error.response?.data || error.message);
        return false;
    }
}

async function testProtectedRoute() {
    console.log('\n🧪 Test 7: Protected Route (No Token)');

    try {
        await axios.get(`${BASE_URL}/api/triggers`);
        console.log('❌ FAIL: Should have been blocked');
        return false;
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ PASS: Correctly blocked unauthorized access');
            return true;
        }
        console.error('❌ FAIL: Wrong error:', error.response?.data);
        return false;
    }
}

async function runAllTests() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║   Backend V2 API Testing Suite        ║');
    console.log('╚════════════════════════════════════════╝');

    const results = [];

    results.push(await testHealth());
    results.push(await testProtectedRoute());
    results.push(await testAuth());
    results.push(await testCreateTrigger());
    results.push(await testListTriggers());
    results.push(await testExecuteTrigger());
    results.push(await testExecutionHistory());

    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${results.length}`);
    console.log(`Passed: ${results.filter(r => r).length}`);
    console.log(`Failed: ${results.filter(r => !r).length}`);
    console.log('='.repeat(50));

    console.log('\n💡 NEXT STEPS:');
    console.log('1. Fund bot wallet: 0xB693B5eb62d5E37480F9D9390135E16405F211D5');
    console.log('2. Use frontend to get real JWT token');
    console.log('3. Deposit funds to Vault via frontend');
    console.log('4. Run tests again with real token');
}

// Run tests
runAllTests().catch(console.error);
