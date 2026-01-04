const { ethers } = require("hardhat");
const fs = require("fs");
require("dotenv").config();

async function main() {
    const deployment = JSON.parse(fs.readFileSync("deployment-v2.json"));
    const contractAddress = deployment.contractAddress;
    const USDC_ADDRESS = '0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080';
    // WMNT is used internally but good to know
    const WMNT_ADDRESS = '0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF';

    const [deployer] = await ethers.getSigners();
    console.log("\n🧪 Testing with account:", deployer.address);
    console.log("📦 Contract:", contractAddress);

    const TradingBotV2 = await ethers.getContractFactory("TradingBotV2");
    const contract = TradingBotV2.attach(contractAddress);

    // 1. DEPOSIT MNT
    console.log("\n1️⃣  Depositing 1 MNT...");
    const depositAmount = ethers.parseEther("1");
    try {
        const tx = await contract.deposit(ethers.ZeroAddress, depositAmount, { value: depositAmount });
        await tx.wait();
        console.log("   ✅ Deposited 1 MNT");
    } catch (e) {
        console.log("   ❌ Deposit failed:", e.message);
        return;
    }

    // Check Balance
    let balanceMnt = await contract.getBalance(deployer.address, ethers.ZeroAddress);
    console.log("   💰 Contract MNT Balance:", ethers.formatEther(balanceMnt));

    // 2. SWAP MNT -> USDC
    console.log("\n2️⃣  Swapping 0.5 MNT to USDC...");
    const swapAmount = ethers.parseEther("0.5");
    try {
        const txSwap = await contract.executeSwapOnDex(
            deployer.address,
            ethers.ZeroAddress, // tokenIn (MNT)
            USDC_ADDRESS, // tokenOut (USDC)
            swapAmount,
            0, // expectedAmountOut (0 for test)
            "trigger-test-1"
        );
        console.log("   ⏳ Transaction sent:", txSwap.hash);
        await txSwap.wait();
        console.log("   ✅ Swapped 0.5 MNT -> USDC");
    } catch (e) {
        console.log("   ❌ Swap MNT->USDC failed message:", e.message);
        if (e.data) console.log("   ❌ Revert Data:", e.data);
        if (e.receipt) console.log("   ❌ Receipt Status:", e.receipt.status);
    }

    // Check Balances
    balanceMnt = await contract.getBalance(deployer.address, ethers.ZeroAddress);
    let balanceUsdc = await contract.getBalance(deployer.address, USDC_ADDRESS);
    console.log("   💰 Contract MNT Balance:", ethers.formatEther(balanceMnt));
    console.log("   💰 Contract USDC Balance:", ethers.formatUnits(balanceUsdc, 6));

    // DEPOSIT USDC if needed
    if (balanceUsdc < 10n) {
        console.log("\n   ⚠️ Insufficient USDC in contract, trying to deposit...");
        const usdcContract = await ethers.getContractAt("IERC20", USDC_ADDRESS, deployer);
        const usdcAmt = ethers.parseUnits("10", 6);
        try {
            await (await usdcContract.approve(contractAddress, usdcAmt)).wait();
            await (await contract.deposit(USDC_ADDRESS, usdcAmt)).wait();
            balanceUsdc = await contract.getBalance(deployer.address, USDC_ADDRESS);
            console.log("   ✅ Deposited 10 USDC");
        } catch (e) {
            console.log("   ❌ Failed to deposit USDC:", e.message);
        }
    }

    // 3. SWAP USDC -> MNT
    if (balanceUsdc > 0n) {
        console.log("\n3️⃣  Swapping USDC back to MNT...");
        try {
            const txSwapBack = await contract.executeSwapOnDex(
                deployer.address,
                USDC_ADDRESS, // tokenIn
                ethers.ZeroAddress, // tokenOut (MNT)
                // Use smaller amount to be safe
                ethers.parseUnits("5", 6),
                0,
                "trigger-test-2"
            );
            console.log("   ⏳ Transaction sent:", txSwapBack.hash);
            await txSwapBack.wait();
            console.log("   ✅ Swapped USDC -> MNT");

            const finalBalanceMnt = await contract.getBalance(deployer.address, ethers.ZeroAddress);
            console.log("   💰 Final Contract MNT Balance:", ethers.formatEther(finalBalanceMnt));
        } catch (e) {
            // Extract revert reason if possible
            if (e.data) {
                console.log("   ❌ Swap USDC->MNT failed (Revert Data):", e.data);
            } else {
                console.log("   ❌ Swap USDC->MNT failed:", e.message);
            }
        }
    } else {
        console.log("\n⚠️  Skipping USDC -> MNT swap because USDC balance is 0 or swap failed.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
