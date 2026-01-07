
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// 1. Load Environment Variables
const __filename = fileURLToPath(import.meta.url);
const pathEnv = path.resolve(process.cwd(), '.env');
console.log('📂 Loading .env from:', pathEnv);

if (fs.existsSync(pathEnv)) {
    dotenv.config({ path: pathEnv });
} else {
    console.error('❌ .env not found');
    process.exit(1);
}

// 2. Dynamic Import
const { blockchainService } = await import('../src/services/blockchain.js');

async function run() {
    // Get address from args
    const userAddress = process.argv[2];
    if (!userAddress || !userAddress.startsWith('0x')) {
        console.error("❌ ERROR: Please provide a valid wallet address.");
        console.error("👉 Usage: npx tsx scripts/test_user_bot_swap.ts <YOUR_WALLET_ADDRESS>");
        process.exit(1);
    }

    console.log(`\n🧪 Testing Bot Swap for User: ${userAddress}`);

    try {
        // 1. Check Auth
        console.log('1️⃣  Checking Bot Authorization...');
        const isAuth = await blockchainService.isUserAuthorizedBot(userAddress);
        console.log(`   Status: ${isAuth ? '✅ AUTHORIZED' : '❌ NOT AUTHORIZED'}`);

        if (!isAuth) {
            console.error("\n⚠️  User has NOT authorized the bot yet.");
            console.error("   Please go to Frontend -> Vault Wallet -> Click 'Authorize Bot'");
            return;
        }

        // 2. Check Balance
        console.log('\n2️⃣  Checking Vault Balance...');
        const balances = await blockchainService.getUserVaultBalances(userAddress);
        console.log(`   MNT : ${balances.mnt}`);
        console.log(`   USDT: ${balances.usdt}`);

        const amountToSwap = 0.01;
        if (balances.mnt < amountToSwap) {
            console.error(`\n⚠️  Insufficient MNT in Vault (Has: ${balances.mnt}, Need: ${amountToSwap})`);
            console.error("   Please Deposit MNT first via Frontend.");
            return;
        }

        // 3. Execute Swap
        console.log(`\n3️⃣  Executing Bot Swap (${amountToSwap} MNT -> USDT)...`);
        const result = await blockchainService.executeBotSwap({
            userAddress,
            fromToken: 'MNT',
            amount: amountToSwap,
            slippagePercent: 5
        });

        console.log('\n✅ SWAP SUCCESS!');
        console.log('   Tx Hash:', result.txHash);
        console.log('   Amount Out:', result.amountOut, result.tokenOut);

    } catch (e: any) {
        console.error("\n❌ FAILED:", e.message);
        if (e.reason) console.error("   Reason:", e.reason);
    }
}

run();
