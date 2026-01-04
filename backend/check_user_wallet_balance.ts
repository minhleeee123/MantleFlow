
import { ethers } from 'ethers';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const MANTLE_RPC = process.env.MANTLE_RPC_URL || 'https://rpc.sepolia.mantle.xyz';
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS!;
const WMNT_ADDRESS = process.env.WMNT_ADDRESS!;
const USDC_ADDRESS = process.env.USDC_ADDRESS!;

const FACTORY_ABI = ["function userWallets(address user) view returns (address)"];
const ERC20_ABI = ["function balanceOf(address account) view returns (uint256)"];

async function main() {
    console.log("🔍 Inspecting User Smart Wallet...");

    // 1. Get User
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error("❌ No user found in DB");
        return;
    }
    console.log(`👤 User EOA: ${user.walletAddress}`);

    // 2. Get Smart Wallet
    const provider = new ethers.JsonRpcProvider(MANTLE_RPC);
    const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);
    const walletAddr = await factory.userWallets(user.walletAddress);

    if (walletAddr === ethers.ZeroAddress) {
        console.error("❌ No Smart Wallet deployed for this user.");
        return;
    }
    console.log(`💳 Smart Wallet: ${walletAddr}`);

    // 3. Check Balances
    // Native MNT
    const mntNativeWei = await provider.getBalance(walletAddr);
    const mntNative = ethers.formatEther(mntNativeWei);

    // Wrapped MNT
    const wmntContract = new ethers.Contract(WMNT_ADDRESS, ERC20_ABI, provider);
    const wmntWei = await wmntContract.balanceOf(walletAddr);
    const wmnt = ethers.formatEther(wmntWei);

    // USDC
    const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
    const usdcWei = await usdcContract.balanceOf(walletAddr);
    const usdc = ethers.formatUnits(usdcWei, 6);

    console.log("\n💰 BALANCE REPORT:");
    console.log(`   - Native MNT: ${mntNative}`);
    console.log(`   - Wrapped MNT: ${wmnt}`);
    console.log(`   - TOTAL MNT:  ${(parseFloat(mntNative) + parseFloat(wmnt)).toFixed(4)}`);
    console.log(`   - USDC:       ${usdc}`);
    console.log("\n---------------------------------------------------");

    await prisma.$disconnect();
}

main();
