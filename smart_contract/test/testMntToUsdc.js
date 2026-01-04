const { ethers } = require("hardhat");
require("dotenv").config();

/**
 * Test swap MNT → USDC (giống như wallet của bạn)
 */

const CONTRACT_V2 = '0x8648c3a4dB1298f101eFA813D4C711512aDCfee3'; // FINAL with wrapping
const USDC_ADDRESS = '0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080';
const WMNT_ADDRESS = '0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF';
const NATIVE_MNT = ethers.ZeroAddress;

const CONTRACT_ABI = [
    'function deposit(address token, uint256 amount) external payable',
    'function executeSwapOnDex(address user, address tokenIn, address tokenOut, uint256 amountIn, uint256 expectedAmountOut, string calldata triggerId) external returns (uint256)',
    'function getBalance(address user, address token) external view returns (uint256)',
    'function withdraw(address token, uint256 amount) external'
];

async function main() {
    console.log("\n🧪 ============================================");
    console.log("   TEST: MNT → USDC (Same as your wallet)");
    console.log("============================================\n");

    const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.mantle.xyz");
    const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
    
    console.log("Wallet:", wallet.address);
    console.log("Contract:", CONTRACT_V2, "\n");

    const contract = new ethers.Contract(CONTRACT_V2, CONTRACT_ABI, wallet);
    
    const mntBalance = await provider.getBalance(wallet.address);
    console.log("MNT Balance:", ethers.formatEther(mntBalance), "MNT\n");
    
    if (mntBalance < ethers.parseEther("1")) {
        console.log("❌ Not enough MNT\n");
        return;
    }
    
    // Step 1: Deposit 1 MNT (small test)
    const depositAmount = ethers.parseEther("1"); // 1 MNT
    
    console.log("═══════════════════════════════════════");
    console.log("STEP 1: DEPOSIT 1 MNT");
    console.log("═══════════════════════════════════════\n");
    
    console.log("Depositing 1 MNT...");
    const depositTx = await contract.deposit(NATIVE_MNT, depositAmount, {
        value: depositAmount
    });
    await depositTx.wait();
    console.log("✅ Deposited\n");
    
    const contractBalance = await contract.getBalance(wallet.address, NATIVE_MNT);
    console.log("Contract balance:", ethers.formatEther(contractBalance), "MNT\n");
    
    // Step 2: Swap MNT → USDC
    console.log("═══════════════════════════════════════");
    console.log("STEP 2: SWAP MNT → USDC");
    console.log("═══════════════════════════════════════\n");
    
    // Expected: ~6.97 USDC for 1 MNT (based on your tx rate)
    const expectedOutput = ethers.parseUnits("3", 6); // Lower to 3 USDC minimum (safer)
    
    console.log("Input:  1 MNT");
    console.log("Expected: ~7 USDC\n");
    
    try {
        const swapTx = await contract.executeSwapOnDex(
            wallet.address,
            NATIVE_MNT,        // tokenIn: Native MNT
            USDC_ADDRESS,      // tokenOut: USDC
            depositAmount,
            expectedOutput,
            "test-mnt-to-usdc"
        );
        
        console.log("Tx:", swapTx.hash);
        const receipt = await swapTx.wait();
        console.log("✅ SWAP SUCCESS!");
        console.log("Gas used:", receipt.gasUsed.toString(), "\n");
        
        // Check balance after
        const usdcAfter = await contract.getBalance(wallet.address, USDC_ADDRESS);
        console.log("Contract USDC after:", ethers.formatUnits(usdcAfter, 6), "USDC");
        
        const mntAfter = await contract.getBalance(wallet.address, NATIVE_MNT);
        console.log("Contract MNT after:", ethers.formatEther(mntAfter), "MNT\n");
        
        console.log("🎉 REAL DEX SWAP WORKS! 🔥\n");
        console.log("Actual rate:", (Number(ethers.formatUnits(usdcAfter, 6)) / 1).toFixed(2), "USDC per MNT\n");
        
    } catch (error) {
        console.error("❌ Swap failed:", error.message, "\n");
        
        if (error.message.includes("STF")) {
            console.log("⚠️  Pool liquidity issue or slippage too high\n");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
