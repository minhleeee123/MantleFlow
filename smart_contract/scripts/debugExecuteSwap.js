const hre = require("hardhat");

async function main() {
    console.log("🛠️  Debug Script (Final Fix) Started");

    const ethers = hre.ethers;
    console.log("   Ethers Version:", ethers.version);

    // Helper functions for V5/V6 compatibility
    const getAddress = ethers.utils ? ethers.utils.getAddress : ethers.getAddress;
    const parseEther = ethers.utils ? ethers.utils.parseEther : ethers.parseEther;
    const parseUnits = ethers.utils ? ethers.utils.parseUnits : ethers.parseUnits;
    const formatEther = ethers.utils ? ethers.utils.formatEther : ethers.formatEther;
    const formatUnits = ethers.utils ? ethers.utils.formatUnits : ethers.formatUnits;

    // Handle ZeroAddress
    const ZERO_ADDRESS = ethers.constants ? ethers.constants.AddressZero : ethers.ZeroAddress;

    const [deployer] = await ethers.getSigners();

    // Correct Contract Address (40 chars)
    const contractAddress = "0xaD893d3b35FA8cc23A24a0fdF0B79cc22a1a5E44";
    const usdcAddress = "0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080";

    // Force Checksum Addresses (lowercase first just in case)
    const deployerAddr = getAddress(deployer.address.toLowerCase());
    const contractAddr = getAddress(contractAddress.toLowerCase());
    const usdcAddr = getAddress(usdcAddress.toLowerCase());

    console.log("   Deployer:", deployerAddr);
    console.log("   Contract:", contractAddr);
    console.log("   USDC:", usdcAddr);

    // Attach Contract
    const TradingBot = await ethers.getContractAt("TradingBot", contractAddr);
    const botWithSigner = TradingBot.connect(deployer);

    // 1. Test getBalance(MNT)
    console.log("\n1. Testing getBalance(MNT)...");
    try {
        const balanceMnt = await botWithSigner.getBalance(deployerAddr, ZERO_ADDRESS);
        console.log("   ✅ MNT Balance:", formatEther(balanceMnt));
    } catch (error) {
        console.error("   ❌ Failed getBalance(MNT):", error.message);
    }

    // 2. Test getBalance(USDC)
    console.log("\n2. Testing getBalance(USDC)...");
    try {
        const balanceUsdc = await botWithSigner.getBalance(deployerAddr, usdcAddr);
        console.log("   ✅ USDC Balance:", formatUnits(balanceUsdc, 6));
    } catch (error) {
        console.error("   ❌ Failed getBalance(USDC):", error.message);
    }

    // 3. Deposit 0.01 MNT
    console.log("\n3. Testing Deposit 0.01 MNT...");
    try {
        const tx = await botWithSigner.deposit(
            ZERO_ADDRESS,
            parseEther("0.01"),
            { value: parseEther("0.01") }
        );
        console.log("   ⏳ Deposit Sent, waiting...", tx.hash);
        await tx.wait();
        console.log("   ✅ Deposit Confirmed");
    } catch (error) {
        console.error("   ❌ Deposit Failed:", error.message);
    }

    // 4. Execute Swap
    console.log("\n4. Testing executeSwap...");
    try {
        const amountIn = parseEther("0.001"); // Swap small amount
        const amountOut = parseUnits("0.1", 6);
        const triggerId = "debug-test-final";

        // IMPORTANT: executeSwap signature
        // executeSwap(user, tokenIn, tokenOut, amountIn, amountOut, triggerId)

        const txSwap = await botWithSigner.executeSwap(
            deployerAddr,  // user
            ZERO_ADDRESS,  // tokenIn (MNT)
            usdcAddr,      // tokenOut (USDC)
            amountIn,
            amountOut,
            triggerId
        );
        console.log("   ⏳ Swap Sent, waiting...", txSwap.hash);
        await txSwap.wait();
        console.log("   ✅ Swap Confirmed");

    } catch (error) {
        console.error("   ❌ Swap Failed:", error.message);
        // Log extra details if needed
        if (error.transaction) console.log("   Tx Data:", error.transaction.data);
    }
}

main().catch(console.error);
