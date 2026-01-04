
import { PrismaClient } from '@prisma/client';
import { executeSwap, getSmartWalletAddress } from './src/services/blockchain';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Starting Manual Execution Test...");

    try {
        // 1. Get First User
        const user = await prisma.user.findFirst();
        if (!user) {
            console.error("❌ No users found in DB. Please create one via frontend first.");
            process.exit(1);
        }
        console.log(`👤 Testing with User: ${user.walletAddress}`);

        // 2. Check Smart Wallet
        let walletAddr;
        try {
            walletAddr = await getSmartWalletAddress(user.walletAddress);
            console.log(`💳 Smart Wallet: ${walletAddr}`);
        } catch (e) {
            console.error("❌ No Smart Wallet found for user", e.message);
            process.exit(1);
        }

        // 3. Force Swap Execution (MNT -> USDC)
        // We simulate a SELL MNT trigger
        // Need very small amount for safety
        const amount = 0.001;
        console.log(`🔄 Attempting to SWAP ${amount} MNT -> USDC...`);

        const txHash = await executeSwap(
            user.walletAddress,
            'MNT',
            amount,
            'SELL'
        );

        console.log(`✅ EXECUTION SUCCESS!`);
        console.log(`🔗 Tx Hash: ${txHash}`);
        console.log(`👉 View on Explorer: https://sepolia.mantlescan.xyz/tx/${txHash}`);

    } catch (error: any) {
        console.error("❌ Execution Failed:", error);
        if (error.message.includes("Not authorized")) {
            console.error("⚠️  This confirms the bot still lacks operator permissions on the wallet.");
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
