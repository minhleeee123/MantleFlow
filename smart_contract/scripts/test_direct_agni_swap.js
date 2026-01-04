const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("🧪 Testing Direct Agni Swap (Bypassing Contract)");

    const [deployer] = await ethers.getSigners();
    console.log("📍 Account:", deployer.address);

    const AGNI_ROUTER = '0xb5Dc27be0a565A4A80440f41c74137001920CB22';
    const WMNT = '0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF';
    const USDC = '0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080';
    const FEE = 500; // 0.05%

    const WMNT_ABI = [
        'function deposit() external payable',
        'function approve(address spender, uint256 amount) external returns (bool)',
        'function balanceOf(address) external view returns (uint256)'
    ];

    const ROUTER_ABI = [
        'function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)'
    ];

    const USDC_ABI = [
        'function balanceOf(address) external view returns (uint256)',
        'function decimals() external view returns (uint8)'
    ];

    const wmntContract = new ethers.Contract(WMNT, WMNT_ABI, deployer);
    const routerContract = new ethers.Contract(AGNI_ROUTER, ROUTER_ABI, deployer);
    const usdcContract = new ethers.Contract(USDC, USDC_ABI, deployer);

    // 1. Wrap MNT
    const amountIn = ethers.parseEther("0.1"); // 0.1 MNT
    console.log("\n1. Wrapping 0.1 MNT -> WMNT...");
    try {
        const txWrap = await wmntContract.deposit({ value: amountIn });
        await txWrap.wait();
        console.log("   ✅ Wrapped");
    } catch (e) {
        console.error("   ❌ Wrap failed:", e.message);
        return;
    }

    // 2. Approve Router
    console.log("\n2. Approving Router...");
    try {
        const txApprove = await wmntContract.approve(AGNI_ROUTER, amountIn);
        await txApprove.wait();
        console.log("   ✅ Approved");
    } catch (e) {
        console.error("   ❌ Approve failed:", e.message);
        return;
    }

    // 3. Swap
    console.log("\n3. Swapping WMNT -> USDC on Agni...");
    const params = {
        tokenIn: WMNT,
        tokenOut: USDC,
        fee: FEE,
        recipient: deployer.address,
        deadline: Math.floor(Date.now() / 1000) + 300,
        amountIn: amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0
    };

    try {
        const txSwap = await routerContract.exactInputSingle(params);
        console.log("   ⏳ Tx sent:", txSwap.hash);
        const receipt = await txSwap.wait();
        console.log("   ✅ Swap Success!");
    } catch (e) {
        console.error("   ❌ Swap failed:", e.message);
        console.error("   Possible reasons: high slippage (min=0 should be fine), no liquidity, wrong fee tier.");
    }

    // Check balance
    const usdcBal = await usdcContract.balanceOf(deployer.address);
    console.log("\n💰 Final USDC Balance:", ethers.formatUnits(usdcBal, 6));
}

main().catch(console.error);
