
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// 1. Load Environment Variables FIRST
const __filename = fileURLToPath(import.meta.url);
const pathEnv = path.resolve(process.cwd(), '.env');
console.log('📂 Loading .env from:', pathEnv);

if (fs.existsSync(pathEnv)) {
    dotenv.config({ path: pathEnv });
    console.log('✅ .env loaded');
} else {
    console.error('❌ .env not found');
    process.exit(1);
}

// 2. Validate Key BEFORE importing service
const botKey = process.env.BOT_PRIVATE_KEY;
if (!botKey) {
    console.error('❌ BOT_PRIVATE_KEY is missing from process.env', Object.keys(process.env));
    process.exit(1);
}
console.log(`🔑 Key detected. Length: ${botKey.length}`);

// 3. Dynamic Import of Service (after env is set)
console.log('📦 Importing Blockchain Service...');
const { blockchainService } = await import('../src/services/blockchain.js');

async function testBotSwap() {
    console.log('🧪 Starting Bot Swap Verification...');

    try {
        const rpcUrl = process.env.MANTLE_RPC_URL || 'https://rpc.sepolia.mantle.xyz';
        const provider = new ethers.JsonRpcProvider(rpcUrl);

        let validBotKey = botKey!;
        if (!validBotKey.startsWith('0x')) validBotKey = '0x' + validBotKey;

        const botWallet = new ethers.Wallet(validBotKey, provider);
        console.log(`🤖 Bot Wallet: ${botWallet.address}`);

        // Ensure user wallet works
        const userWallet = ethers.Wallet.createRandom().connect(provider);
        console.log(`👤 User: ${userWallet.address}`);

        // 0. Fund User
        console.log('\n💸 Funding User from Bot Wallet...');
        const botBalance = await provider.getBalance(botWallet.address);
        console.log(`   Bot Balance: ${ethers.formatEther(botBalance)} MNT`);

        // Need > 0.05 MNT for verification
        if (botBalance < ethers.parseEther('0.05')) {
            console.warn("⚠️ Bot balance low. Test might fail if authorization gas is needed.");
        }

        const fundTx = await botWallet.sendTransaction({
            to: userWallet.address,
            value: ethers.parseEther('0.02') // Small amount to save gas
        });
        await fundTx.wait();
        console.log('   ✅ Funded 0.02 MNT');

        // 1. Authorize Bot
        console.log('\n🔍 Authorization...');
        const vaultAddr = process.env.VAULT_ADDRESS;
        const vault = new ethers.Contract(
            vaultAddr!,
            [
                'function authorizeBot(address bot, bool status) external',
                'function depositMnt() external payable'
            ],
            userWallet
        );

        const txAuth = await vault.authorizeBot(botWallet.address, true);
        await txAuth.wait();
        console.log('   ✅ Bot Authorized!');

        // 2. Deposit Funds
        console.log('\n💰 User Depositing...');
        // We only possess 0.02 MNT. Deposit 0.01.
        const txDeposit = await vault.depositMnt({ value: ethers.parseEther('0.01') });
        await txDeposit.wait();
        console.log('   ✅ Deposited 0.01 MNT');

        // 3. Execute Bot Swap
        console.log('\n🔄 Executing Bot Swap via Service...');

        const result = await blockchainService.executeBotSwap({
            userAddress: userWallet.address,
            fromToken: 'MNT',
            amount: 0.005,
            slippagePercent: 5
        });

        console.log('✅ Swap Result:', result);
        console.log('🎉 Backend Bot Swap Verification PASSED!');

    } catch (error: any) {
        console.error('❌ Test Failed:', error);
    }
}

testBotSwap();
