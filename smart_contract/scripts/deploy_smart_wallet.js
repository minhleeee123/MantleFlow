const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("\n🚀 ============================================");
    console.log("   DEPLOYING SMART WALLET SYSTEM");
    console.log("============================================\n");

    const [deployer] = await ethers.getSigners();
    console.log("📍 Deploying with account:", deployer.address);

    // 1. Deploy Implementation (TradingWallet)
    console.log("\n📦 Deploying Wallet Implementation...");
    const TradingWallet = await ethers.getContractFactory("TradingWallet");
    const implementation = await TradingWallet.deploy();
    await implementation.waitForDeployment();
    const implementationAddr = await implementation.getAddress();
    console.log("   ✅ Implementation:", implementationAddr);

    // 2. Deploy Factory
    console.log("\n🏭 Deploying Wallet Factory...");
    const WalletFactory = await ethers.getContractFactory("WalletFactory");
    const factory = await WalletFactory.deploy(implementationAddr);
    await factory.waitForDeployment();
    const factoryAddr = await factory.getAddress();
    console.log("   ✅ Factory:", factoryAddr);

    // Save Info
    const deployment = {
        network: "mantleSepolia",
        implementation: implementationAddr,
        factory: factoryAddr,
        deployer: deployer.address, // Usually Owner of Factory
        timestamp: new Date().toISOString()
    };

    fs.writeFileSync("deployment-wallet.json", JSON.stringify(deployment, null, 2));
    console.log("\n✅ Deployment saved to deployment-wallet.json");

    console.log("\n============================================");
    console.log("   NEXT STEP: Create generic test script");
    console.log("============================================\n");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
