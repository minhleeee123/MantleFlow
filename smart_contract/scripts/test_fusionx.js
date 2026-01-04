const { ethers } = require("hardhat");
const fs = require("fs");
require("dotenv").config();

async function main() {
    console.log("\n🧪 TESTING FUSIONX SWAP");
    console.log("================================\n");

    const [deployer] = await ethers.getSigners();
    const deployment = JSON.parse(fs.readFileSync("deployment-wallet.json"));

    // FusionX V3 Router
    const FUSIONX_ROUTER = "0x8fC0B6585d73C94575555B3970D7A79c5bfc6E36";
    const WMNT = "0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF";
    // NOTE: FSX is FusionX Token, but we need something liquid. 
    // Let's try to find a pool. MNT/USDT or MNT/USDC usually exists.
    // Assuming USDC address is same or we verify if USDC exists on FusionX.
    // On Mantle Testnet, USDC is commonly 0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080
    const USDC = "0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080";

    const factoryAddr = deployment.factory;
    const Factory = await ethers.getContractAt("WalletFactory", factoryAddr, deployer);

    // 1. Get Wallet
    let walletAddr = await Factory.userWallets(deployer.address);

    if (walletAddr === ethers.ZeroAddress) {
        console.log("   ℹ️  No wallet found, creating one...");
        const tx = await Factory.deployWallet(deployer.address);
        await tx.wait();
        walletAddr = await Factory.userWallets(deployer.address);
    }
    console.log("   📍 Wallet:", walletAddr);

    const UserWallet = await ethers.getContractAt("TradingWallet", walletAddr, deployer);

    // 2. Check Balance
    const balMnt = await ethers.provider.getBalance(walletAddr);
    console.log("   💰 Wallet Balance:", ethers.formatEther(balMnt), "MNT");

    if (balMnt < ethers.parseEther("0.1")) {
        console.log("   ⚠️ Low balance, sending MNT...");
        await (await deployer.sendTransaction({ to: walletAddr, value: ethers.parseEther("0.1") })).wait();
    }

    // 3. Execute Swap on FusionX (MNT -> USDC)
    console.log("\n3️⃣  Executing Swap on FusionX...");
    try {
        const amountIn = ethers.parseEther("0.02"); // Small amount

        // Fee might be different on FusionX. 
        // Common fees: 500 (0.05%), 3000 (0.3%), 10000 (1%). 
        // Let's try 3000 (0.3%) for FusionX standard pools, or 500.
        // We can try 500 first.
        const fee = 500;

        const txSwap = await UserWallet.executeSwap(
            FUSIONX_ROUTER,
            ethers.ZeroAddress, // MNT
            USDC,
            fee,
            amountIn,
            0 // min out
        );
        console.log("   ⏳ Tx sent:", txSwap.hash);
        const receipt = await txSwap.wait();
        console.log("   ✅ Swap Success! Gas used:", receipt.gasUsed.toString());

    } catch (e) {
        console.error("   ❌ Swap Failed:", e.message);
        if (e.data) console.error("   Revert Data:", e.data);
        // Try with higher fee tier if failed
        console.log("   🔄 Retrying with fee 3000...");
        try {
            const amountIn = ethers.parseEther("0.01");
            const txSwap2 = await UserWallet.executeSwap(
                FUSIONX_ROUTER,
                ethers.ZeroAddress,
                USDC,
                3000,
                amountIn,
                0
            );
            await txSwap2.wait();
            console.log("   ✅ Retry Success (Fee 3000)!");
        } catch (e2) {
            console.error("   ❌ Retry Failed:", e2.message);
        }
    }

    // 4. Check USDC Balance
    const usdc = await ethers.getContractAt("IERC20", USDC, deployer);
    const balUsdc = await usdc.balanceOf(walletAddr);
    console.log("   💰 Wallet USDC:", ethers.formatUnits(balUsdc, 6));
}

main().catch(console.error);
