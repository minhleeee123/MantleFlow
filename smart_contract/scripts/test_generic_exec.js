const { ethers } = require("hardhat");
const fs = require("fs");
require("dotenv").config();

async function main() {
    console.log("\n🧪 TESTING GENERIC EXECUTION (BACKEND BOT SIMULATION)");
    console.log("=====================================================\n");

    const [deployer] = await ethers.getSigners();
    const deployment = JSON.parse(fs.readFileSync("deployment-wallet.json"));

    const FUSIONX_ROUTER = "0x8fC0B6585d73C94575555B3970D7A79c5bfc6E36";
    const WMNT = "0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF";
    const USDC = "0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080";

    const factoryAddr = deployment.factory;
    const Factory = await ethers.getContractAt("WalletFactory", factoryAddr, deployer);

    // 1. Get/Create Wallet
    let walletAddr = await Factory.userWallets(deployer.address);
    if (walletAddr === ethers.ZeroAddress) {
        console.log("   ℹ️  Creating new wallet...");
        await (await Factory.deployWallet(deployer.address)).wait();
        walletAddr = await Factory.userWallets(deployer.address);
    }
    console.log("   📍 User Wallet:", walletAddr);

    const UserWallet = await ethers.getContractAt("TradingWallet", walletAddr, deployer);

    // 2. Wrap MNT (Deposit) if needed
    // The generic wallet doesn't auto-wrap in executeCall anymore (it's dumb). 
    // So the Bot must tell it to wrap, or User deposits WETH directly.
    // For simplicity, let's wrap manually first or assume User sent MNT.
    // Wait, the generic executor can call WETH.deposit()!

    const balMnt = await ethers.provider.getBalance(walletAddr);
    console.log("   💰 Wallet MNT Balance:", ethers.formatEther(balMnt));

    if (balMnt < ethers.parseEther("0.1")) {
        console.log("   ⚠️ Sending MNT to wallet...");
        await (await deployer.sendTransaction({ to: walletAddr, value: ethers.parseEther("0.1") })).wait();
    }

    // ---------------------------------------------------------
    // BOT LOGIC STARTS HERE (Off-chain Construction)
    // ---------------------------------------------------------
    console.log("\n🤖 BOT: Constructing Calldata for Actions...");

    const amountIn = ethers.parseEther("0.05");

    // A. Construct "Wrap MNT" Call (Optional, if we want to use MNT)
    // WMNT.deposit()
    const wmntInterface = new ethers.Interface(["function deposit() payable"]);
    const dataWrap = wmntInterface.encodeFunctionData("deposit", []);

    // B. Construct "Approve Router" Call
    // IERC20(WMNT).approve(FUSIONX_ROUTER, amount)
    const erc20Interface = new ethers.Interface([
        "function approve(address spender, uint256 amount) external returns (bool)"
    ]);
    const dataApprove = erc20Interface.encodeFunctionData("approve", [FUSIONX_ROUTER, amountIn]);

    // C. Construct "Swap" Call
    // FusionX might use same ExactInputSingle or slightly different. 
    // Assuming V3 compatible based on earlier research.
    const routerABI = [
        "function exactInputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96) params) external payable returns (uint256 amountOut)"
    ];
    const routerInterface = new ethers.Interface(routerABI);

    // Try generic fee for FusionX
    const swapParams = {
        tokenIn: WMNT,
        tokenOut: USDC,
        fee: 3000, // 0.3% is common default
        recipient: walletAddr,
        deadline: Math.floor(Date.now() / 1000) + 1200,
        amountIn: amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0
    };

    // NOTE: If generic exactInputSingle fails, FusionX might check for 'deadline' differently or use 'amountOutMin'.
    const dataSwap = routerInterface.encodeFunctionData("exactInputSingle", [swapParams]);

    // ---------------------------------------------------------
    // EXECUTION ON WALLET
    // ---------------------------------------------------------

    // Step 1: Wrap MNT -> WMNT
    console.log("\n1️⃣  Bot -> Wallet: Execute WRAP...");
    try {
        // value: amountIn (send MNT along with call to deposit)
        const txWrap = await UserWallet.executeCall(WMNT, amountIn, dataWrap);
        await txWrap.wait();
        console.log("   ✅ Wrapped MNT to WMNT");
    } catch (e) {
        console.error("   ❌ Wrap Failed:", e.message);
        return;
    }

    // Step 2: Approve
    console.log("\n2️⃣  Bot -> Wallet: Execute APPROVE...");
    try {
        const txApprove = await UserWallet.executeCall(WMNT, 0, dataApprove);
        await txApprove.wait();
        console.log("   ✅ Approved Agni Router");
    } catch (e) {
        console.error("   ❌ Approve Failed:", e.message);
        return;
    }

    // Step 3: Swap
    console.log("\n3️⃣  Bot -> Wallet: Execute SWAP (FusionX)...");
    try {
        const txSwap = await UserWallet.executeCall(FUSIONX_ROUTER, 0, dataSwap);
        console.log("   ⏳ Tx sent:", txSwap.hash);
        await txSwap.wait();
        console.log("   ✅ Swap Success!");
    } catch (e) {
        console.error("   ❌ Swap Failed:", e.message);
        if (e.data) console.error("   Revert Data:", e.data);
    }

    // Check USDC
    const usdc = await ethers.getContractAt("IERC20", USDC, deployer);
    const balUsdc = await usdc.balanceOf(walletAddr);
    console.log("\n💰 Wallet USDC Balance:", ethers.formatUnits(balUsdc, 6));
}

main().catch(console.error);
