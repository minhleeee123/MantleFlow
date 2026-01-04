
import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
    const rpcUrl = process.env.MANTLE_RPC_URL || 'https://rpc.sepolia.mantle.xyz';
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const privateKey = process.env.ADMIN_PRIVATE_KEY;
    if (!privateKey) {
        console.error("❌ ADMIN_PRIVATE_KEY is missing in .env");
        return;
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    console.log(`🤖 Admin (Bot) Address: ${wallet.address}`);

    try {
        const balance = await provider.getBalance(wallet.address);
        console.log(`💰 Balance: ${ethers.formatEther(balance)} MNT`);

        if (balance < ethers.parseEther("0.01")) {
            console.warn("⚠️  WARNING: Low balance! Bot needs at least ~0.01 MNT to pay for gas.");
        } else {
            console.log("✅ Balance sufficient for gas.");
        }
    } catch (e) {
        console.error("Error fetching balance:", e.message);
    }
}

main();
