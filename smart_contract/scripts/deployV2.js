const { ethers } = require("hardhat");

async function main() {
    console.log("\n🚀 ============================================");
    console.log("   DEPLOYING TRADING BOT V2");
    console.log("============================================\n");

    const [deployer] = await ethers.getSigners();
    console.log("📍 Deploying with account:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "MNT\n");

    // Deploy
    console.log("🔨 Deploying TradingBotV2...");
    const TradingBotV2 = await ethers.getContractFactory("TradingBotV2");
    const contract = await TradingBotV2.deploy();
    
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

    console.log("✅ TradingBotV2 deployed!");
    console.log("📦 Contract Address:", contractAddress);

    // Verify configuration
    console.log("\n═══════════════════════════════════════════");
    console.log("📊 CONTRACT CONFIGURATION");
    console.log("═══════════════════════════════════════════\n");

    const agniRouter = await contract.AGNI_ROUTER();
    const wmnt = await contract.WMNT();
    const owner = await contract.owner();
    const slippage = await contract.slippageTolerance();
    const fee = await contract.DEFAULT_FEE();

    console.log("🔧 Agni Router:", agniRouter);
    console.log("🪙  WMNT Address:", wmnt);
    console.log("👑 Owner:", owner);
    console.log("📊 Slippage Tolerance:", (Number(slippage) / 100).toFixed(2) + "%");
    console.log("💰 Default Fee:", (Number(fee) / 10000).toFixed(2) + "%\n");

    // Save deployment info
    const deployment = {
        network: "mantleSepolia",
        contractAddress: contractAddress,
        agniRouter: agniRouter,
        wmnt: wmnt,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        blockNumber: await ethers.provider.getBlockNumber()
    };

    const fs = require("fs");
    fs.writeFileSync(
        "deployment-v2.json",
        JSON.stringify(deployment, null, 2)
    );

    console.log("✅ Deployment info saved to deployment-v2.json\n");

    console.log("═══════════════════════════════════════════");
    console.log("🎯 NEXT STEPS");
    console.log("═══════════════════════════════════════════\n");
    
    console.log("1. Verify contract on explorer:");
    console.log(`   https://sepolia.mantlescan.xyz/address/${contractAddress}\n`);
    
    console.log("2. Update backend với contract address mới:");
    console.log("   backend/src/services/blockchain.ts\n");
    
    console.log("3. Deposit tokens vào contract:");
    console.log("   contract.deposit(token, amount)\n");
    
    console.log("4. Test real swap:");
    console.log("   npx hardhat run test/testRealSwap.js\n");

    console.log("============================================\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
