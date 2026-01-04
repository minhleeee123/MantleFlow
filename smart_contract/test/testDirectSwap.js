const { ethers } = require("hardhat");
require("dotenv").config();

/**
 * Test swap đơn giản: WMNT → USDC (không qua native MNT)
 * Giống như Uniswap docs example
 */

const AGNI_ROUTER = '0xb5Dc27be0a565A4A80440f41c74137001920CB22';
const USDC_ADDRESS = '0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080';
const WMNT_ADDRESS = '0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF';

const ROUTER_ABI = [
    'function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)'
];

const ERC20_ABI = [
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function balanceOf(address) external view returns (uint256)',
    'function symbol() external view returns (string)'
];

async function main() {
    console.log("\n🧪 DIRECT ROUTER CALL TEST (Like Wallet)\n");

    const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.mantle.xyz");
    const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
    
    console.log("Wallet:", wallet.address);
    
    const router = new ethers.Contract(AGNI_ROUTER, ROUTER_ABI, wallet);
    const wmnt = new ethers.Contract(WMNT_ADDRESS, ERC20_ABI, wallet);
    const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, wallet);
    
    // Check balance
    const wmntBalance = await wmnt.balanceOf(wallet.address);
    console.log("WMNT Balance:", ethers.formatEther(wmntBalance), "WMNT\n");
    
    if (wmntBalance === 0n) {
        console.log("❌ No WMNT in wallet. Wrap some MNT first.\n");
        return;
    }
    
    // Swap 0.1 WMNT → USDC
    const amountIn = ethers.parseEther("0.1");
    
    console.log("════════════════════════════════════");
    console.log("STEP 1: APPROVE ROUTER");
    console.log("════════════════════════════════════\n");
    
    console.log("Approving", ethers.formatEther(amountIn), "WMNT to router...");
    const approveTx = await wmnt.approve(AGNI_ROUTER, amountIn);
    await approveTx.wait();
    console.log("✅ Approved\n");
    
    console.log("════════════════════════════════════");
    console.log("STEP 2: EXECUTE SWAP");
    console.log("════════════════════════════════════\n");
    
    const params = {
        tokenIn: WMNT_ADDRESS,
        tokenOut: USDC_ADDRESS,
        fee: 500, // 0.05%
        recipient: wallet.address,
        deadline: Math.floor(Date.now() / 1000) + 1200,
        amountIn: amountIn,
        amountOutMinimum: 0, // No slippage check for test
        sqrtPriceLimitX96: 0
    };
    
    console.log("Swapping 0.1 WMNT → USDC...");
    console.log("Params:", JSON.stringify({
        ...params,
        amountIn: ethers.formatEther(params.amountIn),
        deadline: new Date(params.deadline * 1000).toISOString()
    }, null, 2));
    
    try {
        const swapTx = await router.exactInputSingle(params);
        console.log("\nTx hash:", swapTx.hash);
        
        const receipt = await swapTx.wait();
        console.log("✅ SWAP SUCCESS!");
        console.log("Gas used:", receipt.gasUsed.toString());
        console.log("Block:", receipt.blockNumber, "\n");
        
        // Check balances after
        const usdcAfter = await usdc.balanceOf(wallet.address);
        console.log("USDC after swap:", ethers.formatUnits(usdcAfter, 6), "USDC\n");
        
        console.log("🎉 WALLET-STYLE SWAP WORKS!\n");
        
    } catch (error) {
        console.error("❌ Swap failed:", error.message);
        
        if (error.message.includes("STF")) {
            console.log("\n⚠️  'STF' error = Slippage Too Far or insufficient liquidity");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
