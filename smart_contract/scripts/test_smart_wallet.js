const { ethers } = require("hardhat");
const fs = require("fs");
require("dotenv").config();

async function main() {
    console.log("\n🧪 TESTING SMART WALLET SYSTEM");
    console.log("================================\n");

    const [deployer] = await ethers.getSigners();
    const deployment = JSON.parse(fs.readFileSync("deployment-wallet.json"));

    // Addresses
    const factoryAddr = deployment.factory;
    const USDC = '0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080';
    const WMNT = '0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF';

    console.log("📍 User:", deployer.address);
    console.log("🏭 Factory:", factoryAddr);

    const Factory = await ethers.getContractAt("WalletFactory", factoryAddr, deployer);

    // 1. Create Wallet
    console.log("\n1️⃣  Deploying User Wallet...");
    let walletAddr;

    // Check if wallet exists first (for re-runs)
    walletAddr = await Factory.userWallets(deployer.address);

    if (walletAddr === ethers.ZeroAddress) {
        // Operator = deployer for test (so we can call executeSwapOnAgni)
        const tx = await Factory.deployWallet(deployer.address);
        console.log("   ⏳ Tx sent:", tx.hash);
        const receipt = await tx.wait();

        // Find event
        const log = receipt.logs.find(l => {
            try { return Factory.interface.parseLog(l).name === "WalletCreated"; }
            catch { return false; }
        });
        walletAddr = Factory.interface.parseLog(log).args.wallet;
        console.log("   ✅ Wallet Created:", walletAddr);
    } else {
        console.log("   ℹ️  Wallet already exists:", walletAddr);
    }

    const UserWallet = await ethers.getContractAt("TradingWallet", walletAddr, deployer);

    // 2. Deposit MNT
    console.log("\n2️⃣  Sending 0.1 MNT to Wallet...");
    const depositAmt = ethers.parseEther("0.1");
    // Simple transfer
    const txSend = await deployer.sendTransaction({
        to: walletAddr,
        value: depositAmt
    });
    await txSend.wait();
    console.log("   ✅ Sent");

    // Check Balance
    const balMnt = await ethers.provider.getBalance(walletAddr);
    console.log("   💰 Wallet Balance:", ethers.formatEther(balMnt), "MNT");

    // 3. Execute Swap (MNT -> USDC)
    console.log("\n3️⃣  Executing Swap (Bot Action)...");
    try {
        const amountIn = ethers.parseEther("0.05");

        // Bot calls this
        const txSwap = await UserWallet.executeSwapOnAgni(
            ethers.ZeroAddress, // MNT
            USDC,
            500, // 0.05% fee
            amountIn,
            0 // min out
        );
        console.log("   ⏳ Tx sent:", txSwap.hash);
        await txSwap.wait();
        console.log("   ✅ Swap Success!");

    } catch (e) {
        console.error("   ❌ Swap Failed:", e.message);
        if (e.data) console.error("   Revert Data:", e.data);
    }

    // 4. Check USDC Balance
    const usdc = await ethers.getContractAt("IERC20", USDC, deployer);
    const balUsdc = await usdc.balanceOf(walletAddr);
    console.log("   💰 Wallet USDC:", ethers.formatUnits(balUsdc, 6));

    // 5. Withdraw USDC (User Action)
    if (balUsdc > 0n) {
        console.log("\n4️⃣  Withdrawing USDC (User Action)...");
        try {
            const txWd = await UserWallet.withdraw(USDC, balUsdc);
            await txWd.wait();
            console.log("   ✅ Withdrawn to User");
        } catch (e) {
            console.error("   ❌ Withdraw Failed:", e.message);
        }
    }
}

main().catch(console.error);
