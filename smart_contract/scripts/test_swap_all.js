const { ethers } = require("hardhat");
const fs = require("fs");
require("dotenv").config();

async function main() {
    console.log("\n🧪 TESTING SWAP COMPATIBILITY FOR MULTIPLE TOKENS");
    console.log("=====================================================\n");

    const [deployer] = await ethers.getSigners();
    const deployment = JSON.parse(fs.readFileSync("deployment-wallet.json"));

    const FUSIONX_ROUTER = "0x8fC0B6585d73C94575555B3970D7A79c5bfc6E36";
    const WMNT = "0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF";

    // Candidate Tokens
    const TOKENS = {
        "USDC": "0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080", // Works
        "USDT": "0x863aE464D7E8e6F95b845FD3AF0f9A2B2034D6dD", // Test Sepolia
        "WETH": "0x7D28E3d55403Ab9116c3B6183EB811a542DB9086" // Test Sepolia
    };

    const factoryAddr = deployment.factory;
    const Factory = await ethers.getContractAt("WalletFactory", factoryAddr, deployer);

    // Get Wallet
    let walletAddr = await Factory.userWallets(deployer.address);
    if (walletAddr === ethers.ZeroAddress) {
        console.error("❌ No wallet found.");
        return;
    }
    const UserWallet = await ethers.getContractAt("TradingWallet", walletAddr, deployer);

    // Ensure MNT
    const balMnt = await ethers.provider.getBalance(walletAddr);
    if (balMnt < ethers.parseEther("0.1")) {
        console.log("   ⚠️ Topup MNT...");
        await (await deployer.sendTransaction({ to: walletAddr, value: ethers.parseEther("0.1") })).wait();
    }

    // Prepare Exec
    const amountIn = ethers.parseEther("0.001"); // Tiny amount for testing
    const routerInterface = new ethers.Interface([
        "function exactInputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96) params) external payable returns (uint256 amountOut)"
    ]);

    // Loop execute
    for (const [symbol, tokenOut] of Object.entries(TOKENS)) {
        console.log(`\n🔄 Testing Swap MNT -> ${symbol}...`);

        try {
            // 1. Wrap (Always wrap a bit to be safe, or check balance)
            // Just wrap 0.001
            const wmntInt = new ethers.Interface(["function deposit() payable"]);
            await (await UserWallet.executeCall(WMNT, amountIn, wmntInt.encodeFunctionData("deposit", []))).wait();

            // 2. Approve
            const erc20Int = new ethers.Interface(["function approve(address, uint256) returns (bool)"]);
            await (await UserWallet.executeCall(WMNT, 0, erc20Int.encodeFunctionData("approve", [FUSIONX_ROUTER, amountIn]))).wait();

            // 3. Swap (Try fee 3000)
            const params = {
                tokenIn: WMNT,
                tokenOut: tokenOut,
                fee: 3000,
                recipient: walletAddr,
                deadline: Math.floor(Date.now() / 1000) + 120,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            };
            const dataSwap = routerInterface.encodeFunctionData("exactInputSingle", [params]);

            const tx = await UserWallet.executeCall(FUSIONX_ROUTER, 0, dataSwap);
            await tx.wait();
            console.log(`   ✅ SUCCESS: MNT -> ${symbol} works!`);

        } catch (e) {
            console.log(`   ❌ FAILED: MNT -> ${symbol}`);
            // console.log("      Error:", e.message);
        }
    }
}

main().catch(console.error);
