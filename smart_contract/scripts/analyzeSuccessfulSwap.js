const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("\n🔍 ANALYZING YOUR SUCCESSFUL SWAP TRANSACTION\n");
    
    const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.mantle.xyz");
    
    // Your successful tx
    const txHash = '0xc76348ecba0f036e5b10ada5ea315ed73f482c1f014053243f027276d5cf9ba4';
    
    const tx = await provider.getTransaction(txHash);
    const receipt = await provider.getTransactionReceipt(txHash);
    
    console.log("📊 TRANSACTION DETAILS:");
    console.log("Gas Used:", receipt.gasUsed.toString());
    console.log("Gas Price:", tx.gasPrice.toString());
    console.log("Value:", ethers.formatEther(tx.value), "MNT\n");
    
    // Decode input data
    console.log("Raw data length:", tx.data.length);
    console.log("Function selector:", tx.data.slice(0, 10), "\n");
    
    if (tx.data.length > 10) {
        const routerAbi = [
            'function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)'
        ];
        
        try {
            const iface = new ethers.Interface(routerAbi);
            const decoded = iface.parseTransaction({ data: tx.data, value: tx.value });
            
            console.log("📋 SWAP PARAMETERS:");
            console.log("Function:", decoded.name);
            console.log("Token In:", decoded.args[0].tokenIn);
            console.log("Token Out:", decoded.args[0].tokenOut);
            console.log("Fee:", decoded.args[0].fee);
            console.log("Amount In:", ethers.formatEther(decoded.args[0].amountIn), "tokens");
            console.log("Min Out:", ethers.formatUnits(decoded.args[0].amountOutMinimum, 6), "USDC\n");
        } catch (e) {
            console.log("Could not decode, raw data:", tx.data.slice(0, 200));
        }
    }
    
    // Check logs for actual amounts
    console.log("📝 LOGS:");
    for (const log of receipt.logs) {
        console.log("  Topic 0:", log.topics[0]);
        if (log.topics.length > 1) {
            console.log("  Topic 1:", log.topics[1]);
        }
    }
    
    console.log("\n✅ KEY INSIGHT:");
    console.log("   When wallet swaps MNT → USDC:");
    console.log("   1. Wallet sends MNT with transaction (value field)");
    console.log("   2. Router auto-wraps MNT → WMNT");
    console.log("   3. Router swaps WMNT → USDC");
    console.log("   4. No separate approve needed for native MNT!\n");
}

main().catch(console.error);
