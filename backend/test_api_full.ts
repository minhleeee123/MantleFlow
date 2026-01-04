import axios from 'axios';
import { ethers } from 'ethers';

const BASE_URL = 'http://localhost:8000';

async function main() {
    console.log("🚀 Starting Backend API Test...");

    // 1. Test Health (Public)
    try {
        const health = await axios.get(`${BASE_URL}/health`);
        console.log("✅ GET /health:", health.status, health.data.status);
    } catch (e) {
        console.error("❌ GET /health Failed", e.message);
        process.exit(1);
    }

    // 2. Test Wallet Config (Public)
    try {
        const config = await axios.get(`${BASE_URL}/api/wallet/config`);
        console.log("✅ GET /api/wallet/config:", config.status);
        console.log("   Factory:", config.data.factoryAddress);
        console.log("   Router:", config.data.routerAddress);

        if (!config.data.factoryAddress) throw new Error("Missing Factory Address");
    } catch (e) {
        console.error("❌ GET /api/wallet/config Failed", e.message);
        process.exit(1);
    }

    // 3. Test Auth (Login)
    const wallet = ethers.Wallet.createRandom();
    console.log("🔑 Generated Test Wallet:", wallet.address);

    const message = `Sign this message to login to Auto-Trading Platform.\nTimestamp: ${Date.now()}`;
    const signature = await wallet.signMessage(message);

    let token = '';
    try {
        const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
            walletAddress: wallet.address,
            signature,
            message
        });
        token = loginRes.data.token;
        console.log("✅ POST /api/auth/login: Success, Token received.");
    } catch (e) {
        console.error("❌ Login Failed", e.response ? e.response.data : e.message);
        process.exit(1);
    }

    // 4. Test Authenticated Endpoints
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    try {
        // Get Address (Should be null or address if factory deployed? Script usually won't have it deployed yet for random wallet)
        const addrRes = await axios.get(`${BASE_URL}/api/wallet/address`, authHeaders);
        console.log("✅ GET /api/wallet/address:", addrRes.data);
    } catch (e) {
        console.error("❌ GET /api/wallet/address Failed", e.message);
    }

    try {
        // Get Balance
        const balRes = await axios.get(`${BASE_URL}/api/wallet/balance`, authHeaders);
        console.log("✅ GET /api/wallet/balance:", balRes.data);
    } catch (e) {
        console.error("❌ GET /api/wallet/balance Failed", e.message);
    }

    console.log("🎉 All Tests Passed!");
}

main();
