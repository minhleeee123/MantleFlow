import axios from 'axios';
import { ethers } from 'ethers';

const BASE_URL = 'http://localhost:8000';

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║      🧪 BACKEND V3 - COMPREHENSIVE API TESTING            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

let passed = 0;
let failed = 0;
let authToken = '';

async function test(name, testFn) {
    try {
        console.log(`\n🔍 ${name}`);
        console.log('─'.repeat(60));
        await testFn();
        console.log('✅ PASSED');
        passed++;
    } catch (error) {
        console.log(`❌ FAILED: ${error.message}`);
        failed++;
    }
}

(async () => {
    // Test 1: Health Check
    await test('TEST 1: Health Check', async () => {
        const res = await axios.get(`${BASE_URL}/health`);
        console.log(`   Status: ${res.data.status}`);
        console.log(`   Version: ${res.data.version}`);
        if (res.data.status !== 'ok') throw new Error('Health check failed');
    });

    // Test 2: Login (Get JWT Token)
    await test('TEST 2: Wallet Authentication', async () => {
        // Create test wallet
        const wallet = ethers.Wallet.createRandom();
        const message = 'Login to Backend V3';
        const signature = await wallet.signMessage(message);

        const res = await axios.post(`${BASE_URL}/api/auth/login`, {
            walletAddress: wallet.address,
            message,
            signature
        });

        console.log(`   Wallet: ${wallet.address.substring(0, 10)}...`);
        console.log(`   Token: ${res.data.token.substring(0, 20)}...`);
        console.log(`   User ID: ${res.data.user.id.substring(0, 8)}...`);

        if (!res.data.token) throw new Error('No token returned');
        authToken = res.data.token;
    });

    // Test 3: Create Trigger
    let triggerId = '';
    await test('TEST 3: Create Trigger', async () => {
        const res = await axios.post(
            `${BASE_URL}/api/triggers`,
            {
                symbol: 'BTC',
                targetPrice: 50000,
                condition: 'BELOW',
                amount: 10,
                type: 'BUY',
                slippage: 5
            },
            {
                headers: { Authorization: `Bearer ${authToken}` }
            }
        );

        console.log(`   Symbol: ${res.data.trigger.symbol}`);
        console.log(`   Target: $${res.data.trigger.targetPrice}`);
        console.log(`   Condition: ${res.data.trigger.condition}`);
        console.log(`   Type: ${res.data.trigger.type}`);
        console.log(`   Status: ${res.data.trigger.status}`);

        if (!res.data.trigger.id) throw new Error('Trigger not created');
        triggerId = res.data.trigger.id;
    });

    // Test 4: Get All Triggers
    await test('TEST 4: Get All Triggers', async () => {
        const res = await axios.get(`${BASE_URL}/api/triggers`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        console.log(`   Total triggers: ${res.data.count}`);
        console.log(`   Triggers: ${res.data.triggers.map(t => t.symbol).join(', ')}`);

        if (res.data.count === 0) throw new Error('No triggers found');
    });

    // Test 5: Get Specific Trigger
    await test('TEST 5: Get Specific Trigger', async () => {
        const res = await axios.get(`${BASE_URL}/api/triggers/${triggerId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        console.log(`   ID: ${res.data.trigger.id.substring(0, 8)}...`);
        console.log(`   Symbol: ${res.data.trigger.symbol}`);
        console.log(`   Status: ${res.data.trigger.status}`);
        console.log(`   Created: ${new Date(res.data.trigger.createdAt).toLocaleString()}`);

        if (!res.data.trigger) throw new Error('Trigger not found');
    });

    // Test 6: Update Trigger Status
    await test('TEST 6: Update Trigger Status', async () => {
        const res = await axios.patch(
            `${BASE_URL}/api/triggers/${triggerId}`,
            { status: 'CANCELLED' },
            { headers: { Authorization: `Bearer ${authToken}` } }
        );

        console.log(`   Previous status: ACTIVE`);
        console.log(`   New status: ${res.data.trigger.status}`);

        if (res.data.trigger.status !== 'CANCELLED') throw new Error('Status not updated');
    });

    // Test 7: Bot Status Check
    await test('TEST 7: Check Bot Authorization Status', async () => {
        const res = await axios.get(`${BASE_URL}/api/swap/bot-status`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        console.log(`   Bot Address: ${res.data.botAddress}`);
        console.log(`   Authorized: ${res.data.authorized}`);
        console.log(`   Message: ${res.data.message}`);

        if (typeof res.data.authorized !== 'boolean') throw new Error('Invalid response');
    });

    // Test 8: Swap Estimate
    await test('TEST 8: Estimate Swap Output', async () => {
        const res = await axios.get(
            `${BASE_URL}/api/swap/estimate?fromToken=MNT&amount=1`,
            { headers: { Authorization: `Bearer ${authToken}` } }
        );

        console.log(`   From: ${res.data.fromToken}`);
        console.log(`   To: ${res.data.toToken}`);
        console.log(`   Amount In: ${res.data.amountIn}`);
        console.log(`   Estimated Out: ${res.data.estimatedOut}`);

        if (!res.data.estimatedOut) throw new Error('No estimate returned');
    });

    // Test 9: Delete Trigger
    await test('TEST 9: Delete Trigger', async () => {
        const res = await axios.delete(`${BASE_URL}/api/triggers/${triggerId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        console.log(`   Message: ${res.data.message}`);

        if (!res.data.success) throw new Error('Trigger not deleted');
    });

    // Test 10: Verify Deletion
    await test('TEST 10: Verify Trigger Deleted', async () => {
        try {
            await axios.get(`${BASE_URL}/api/triggers/${triggerId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            throw new Error('Trigger still exists');
        } catch (error) {
            if (error.response?.status === 404) {
                console.log('   Trigger successfully deleted (404)');
            } else {
                throw error;
            }
        }
    });

    // Summary
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    TEST SUMMARY                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`\n✅ Passed: ${passed}/10`);
    console.log(`❌ Failed: ${failed}/10`);

    if (failed === 0) {
        console.log('\n🎉 ALL COMPREHENSIVE TESTS PASSED!');
        console.log('\n✨ Verified Features:');
        console.log('   ✅ Server health check');
        console.log('   ✅ Wallet authentication & JWT');
        console.log('   ✅ Create trigger');
        console.log('   ✅ Get all triggers');
        console.log('   ✅ Get specific trigger');
        console.log('   ✅ Update trigger status');
        console.log('   ✅ Check bot authorization');
        console.log('   ✅ Estimate swap output');
        console.log('   ✅ Delete trigger');
        console.log('   ✅ Verify deletion (404)');
        console.log('\n🚀 Backend V3 is production-ready!');
        console.log('\n📋 Next: Phase 3 - Frontend Integration\n');
    } else {
        console.log('\n⚠️  Some tests failed. Please review.\n');
    }

    process.exit(failed > 0 ? 1 : 0);
})();
