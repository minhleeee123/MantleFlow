import dotenv from 'dotenv';
import path from 'path';
import { ethers } from 'ethers';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const SMART_WALLET = '0x2ECA994e6f8fb0663039C14df63AB88CBb3C0750';
const OFFICIAL_RPC = 'https://rpc.sepolia.mantle.xyz';

async function verify() {
    console.log('--- ENVIRONMENT CONFIG ---');
    console.log('RPC URL:', process.env.MANTLE_RPC_URL);
    console.log('WMNT Addr:', process.env.WMNT_ADDRESS);

    // Check using ENV RPC
    try {
        const providerEnv = new ethers.JsonRpcProvider(process.env.MANTLE_RPC_URL);
        const balNativeEnv = await providerEnv.getBalance(SMART_WALLET);
        console.log('\n--- CHECK via ENV RPC ---');
        console.log('Native Balance:', ethers.formatEther(balNativeEnv));
    } catch (e: any) {
        console.log('Env RPC Error:', e.message);
    }

    // Check using OFFICIAL RPC
    try {
        const providerOfficial = new ethers.JsonRpcProvider(OFFICIAL_RPC);
        const balNativeOfficial = await providerOfficial.getBalance(SMART_WALLET);
        console.log('\n--- CHECK via OFFICIAL RPC ---');
        console.log('Native Balance:', ethers.formatEther(balNativeOfficial));
    } catch (e: any) {
        console.log('Official RPC Error:', e.message);
    }
}

verify();
