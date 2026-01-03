const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying TradingBot to Mantle Testnet...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer:", deployer.address);

    // Check balance
    try {
        const balance = await hre.ethers.provider.getBalance(deployer.address);
        console.log("Balance:", hre.ethers.formatEther(balance), "MNT\n");

        if (balance === 0n) {
            console.log("❌ No MNT! Get from: https://faucet.testnet.mantle.xyz");
            process.exit(1);
        }
    } catch (error) {
        console.log("⚠️ Could not check balance, continuing anyway...\n");
    }

    // Deploy
    console.log("Deploying TradingBot...");
    const TradingBot = await hre.ethers.getContractFactory("TradingBot");
    const tradingBot = await TradingBot.deploy();

    await tradingBot.waitForDeployment();
    const address = await tradingBot.getAddress();

    console.log("\n✅ SUCCESS!");
    console.log("Contract:", address);
    console.log("Owner:", deployer.address);
    console.log("\nExplorer:", `https://explorer.testnet.mantle.xyz/address/${address}`);

    // Save to file
    const fs = require('fs');
    fs.writeFileSync('deployment.json', JSON.stringify({
        contract: address,
        deployer: deployer.address,
        network: "mantleTestnet",
        timestamp: new Date().toISOString()
    }, null, 2));

    console.log("\n💾 Saved to deployment.json");
}

main().catch((error) => {
    console.error("\n❌ ERROR:", error.message);
    process.exit(1);
});
