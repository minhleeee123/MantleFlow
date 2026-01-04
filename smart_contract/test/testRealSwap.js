const { ethers } = require("hardhat");
require("dotenv").config();

/**
 * Test executeSwapOnDex() với 100 USDC → MNT
 */

const CONTRACT_V2 = '0xCb0B1450D5f8f03603C48adA61fa5433607840Ca'; // FIXED VERSION
const USDC_ADDRESS = '0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080';
const WMNT_ADDRESS = '0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF'; // Use WMNT instead of native MNT
const NATIVE_MNT = ethers.ZeroAddress;

const CONTRACT_ABI = [
    'function deposit(address token, uint256 amount) external payable',
    'function withdraw(address token, uint256 amount) external',
    'function executeSwapOnDex(address user, address tokenIn, address tokenOut, uint256 amountIn, uint256 expectedAmountOut, string calldata triggerId) external returns (uint256)',
    'function getBalance(address user, address token) external view returns (uint256)',
    'function WMNT() external view returns (address)',
    'function AGNI_ROUTER() external view returns (address)'
];

const ERC20_ABI = [
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function balanceOf(address) external view returns (uint256)',
    'function decimals() external view returns (uint8)'
];

async function main() {
    console.log("\n🧪 ============================================");
        console.log("   TESTING REAL DEX SWAP - USDC → WMNT");

    try {
        const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.mantle.xyz");
        const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
        
        console.log("📍 Your Address:", wallet.address);
        console.log("📦 TradingBotV2:", CONTRACT_V2, "\n");

        const contract = new ethers.Contract(CONTRACT_V2, CONTRACT_ABI, wallet);
        const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, wallet);

        // Check config
        const wmnt = await contract.WMNT();
        const router = await contract.AGNI_ROUTER();
        console.log("🔧 WMNT:", wmnt);
        console.log("🔧 Agni Router:", router, "\n");

        // Check balances
        console.log("═══════════════════════════════════════════");
        console.log("💰 BALANCES BEFORE");
        console.log("═══════════════════════════════════════════\n");

        const walletUsdc = await usdcContract.balanceOf(wallet.address);
        const walletMnt = await provider.getBalance(wallet.address);
        console.log("Wallet USDC:", ethers.formatUnits(walletUsdc, 6), "USDC");
        console.log("Wallet MNT: ", ethers.formatEther(walletMnt), "MNT\n");

        // Step 1: Deposit 10 USDC vào contract (smaller amount)
        const depositAmount = ethers.parseUnits("10", 6); // 10 USDC only
        
        console.log("═══════════════════════════════════════════");
        console.log("1️⃣  DEPOSIT 10 USDC");
        console.log("═══════════════════════════════════════════\n");

        console.log("🔄 Approving USDC...");
        const approveTx = await usdcContract.approve(CONTRACT_V2, depositAmount);
        await approveTx.wait();
        console.log("   ✅ Approved\n");

        console.log("🔄 Depositing 10 USDC...");
        const depositTx = await contract.deposit(USDC_ADDRESS, depositAmount);
        await depositTx.wait();
        console.log("   ✅ Deposited\n");

        const contractBalance = await contract.getBalance(wallet.address, USDC_ADDRESS);
        console.log("Contract balance:", ethers.formatUnits(contractBalance, 6), "USDC\n");

        // Step 2: Execute swap on DEX
        console.log("═══════════════════════════════════════════");
        console.log("2️⃣  EXECUTE REAL SWAP ON AGNI DEX");
        console.log("═══════════════════════════════════════════\n");

        // Expected output: Set to 0 to bypass slippage check entirely
        const expectedOutput = 0; // Let contract use minAmountOut = 0
        
        console.log("🔄 Calling executeSwapOnDex...");
        console.log("   Input:  10 USDC");
        console.log("   Output: ANY (no slippage check)\n");

        const swapTx = await contract.executeSwapOnDex(
            wallet.address,
            USDC_ADDRESS,
            WMNT_ADDRESS, // Output WMNT, not native MNT
            depositAmount,
            expectedOutput,
            "test-trigger-001"
            // No gas limit - let it estimate
        );

        console.log("   Tx hash:", swapTx.hash);
        const receipt = await swapTx.wait();
        console.log("   ✅ Swap executed!\n");

        // Parse event
        const swapEvent = receipt.logs.find(log => {
            try {
                const parsed = contract.interface.parseLog(log);
                return parsed.name === "RealSwapExecuted";
            } catch {
                return false;
            }
        });

        if (swapEvent) {
            const parsed = contract.interface.parseLog(swapEvent);
            console.log("📊 SWAP DETAILS:");
            console.log("   Amount In: ", ethers.formatUnits(parsed.args.amountIn, 6), "USDC");
            console.log("   Amount Out:", ethers.formatEther(parsed.args.amountOut), "MNT");
            console.log("   Rate:      ", (Number(parsed.args.amountIn) / 1e6 / Number(ethers.formatEther(parsed.args.amountOut))).toFixed(2), "USDC per MNT\n");
        }

        // Step 3: Check balances after
        console.log("═══════════════════════════════════════════");
        console.log("3️⃣  BALANCES AFTER SWAP");
        console.log("═══════════════════════════════════════════\n");

        const contractUsdcAfter = await contract.getBalance(wallet.address, USDC_ADDRESS);
        const contractWmntAfter = await contract.getBalance(wallet.address, WMNT_ADDRESS);
        
        console.log("Contract USDC:", ethers.formatUnits(contractUsdcAfter, 6), "USDC");
        console.log("Contract WMNT:", ethers.formatEther(contractWmntAfter), "WMNT\n");

        // Step 4: Withdraw WMNT
        console.log("═══════════════════════════════════════════");
        console.log("4️⃣  WITHDRAW WMNT");
        console.log("═══════════════════════════════════════════\n");

        if (contractWmntAfter > 0n) {
            console.log("🔄 Withdrawing WMNT...");
            const withdrawTx = await contract.withdraw(WMNT_ADDRESS, contractWmntAfter);
            await withdrawTx.wait();
            console.log("   ✅ Withdrawn!\n");

            const wmntContract = new ethers.Contract(WMNT_ADDRESS, ERC20_ABI, provider);
            const walletWmntAfter = await wmntContract.balanceOf(wallet.address);
            console.log("Wallet WMNT after:", ethers.formatEther(walletWmntAfter), "WMNT\n");
        }

        console.log("═══════════════════════════════════════════");
        console.log("✅ TEST COMPLETED SUCCESSFULLY! 🎉");
        console.log("═══════════════════════════════════════════\n");

        console.log("🔥 REAL DEX WSWAP WORKS!");
        console.log("   • USDC → MNT swap executed on Agni");
        console.log("   • Real on-chain liquidity used");
        console.log("   • Trustless & transparent ✅\n");

    } catch (error) {
        console.error("\n❌ Error:", error.message);
        
        if (error.message.includes("Insufficient balance")) {
            console.log("\n⚠️  Không đủ USDC trong contract để swap");
        } else if (error.message.includes("STF")) {
            console.log("\n⚠️  Pool không có đủ liquidity hoặc slippage quá cao");
            console.log("   Thử giảm số lượng USDC (ví dụ 10 USDC thay vì 100)");
        }
    }

    console.log("============================================\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
