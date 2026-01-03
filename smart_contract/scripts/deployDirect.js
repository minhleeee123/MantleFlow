const { ethers } = require("ethers");

async function deployToMantle() {
    console.log("🚀 Deploying TradingBot to Mantle Testnet...\n");

    const privateKey = "0x7302adb08ab8e3d0de0f658a4b73f953203bae0b61b6b8b6b03d0b3bd3c02e7a";

    // Try multiple RPC endpoints
    const rpcEndpoints = [
        "https://rpc.testnet.mantle.xyz",
        "https://rpc.sepolia.mantle.xyz",
        "https://mantle-testnet.rpc.thirdweb.com"
    ];

    let provider;
    let rpcUrl;

    // Find working RPC
    for (const rpc of rpcEndpoints) {
        try {
            console.log(`Trying RPC: ${rpc}`);
            const testProvider = new ethers.JsonRpcProvider(rpc);
            await testProvider.getBlockNumber();
            provider = testProvider;
            rpcUrl = rpc;
            console.log(`✅ Connected to: ${rpc}\n`);
            break;
        } catch (error) {
            console.log(`❌ Failed: ${rpc}`);
        }
    }

    if (!provider) {
        console.log("\n❌ Could not connect to any Mantle RPC!");
        console.log("Please provide a working RPC URL.");
        process.exit(1);
    }

    // Create wallet
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log("Deployer:", wallet.address);

    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log("Balance:", ethers.formatEther(balance), "MNT\n");

    if (balance === 0n) {
        console.log("❌ No MNT! Get from: https://faucet.testnet.mantle.xyz");
        process.exit(1);
    }

    // Load contract
    const fs = require('fs');
    const contractJson = JSON.parse(
        fs.readFileSync('./artifacts/contracts/TradingBot.sol/TradingBot.json', 'utf8')
    );

    // Deploy
    console.log("Deploying contract...");
    const factory = new ethers.ContractFactory(
        contractJson.abi,
        contractJson.bytecode,
        wallet
    );

    const contract = await factory.deploy();
    await contract.waitForDeployment();

    const address = await contract.getAddress();

    console.log("\n✅ SUCCESS!");
    console.log("Contract:", address);
    console.log("RPC Used:", rpcUrl);
    console.log("Explorer:", `https://explorer.testnet.mantle.xyz/address/${address}`);

    // Save deployment info
    const deployment = {
        contract: address,
        deployer: wallet.address,
        network: "mantleTestnet",
        rpc: rpcUrl,
        tokens: {
            usdc: "0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080",
            mnt: "0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF"
        },
        timestamp: new Date().toISOString()
    };

    fs.writeFileSync('deployment.json', JSON.stringify(deployment, null, 2));
    console.log("\n💾 Saved to deployment.json");
}

deployToMantle().catch(console.error);
