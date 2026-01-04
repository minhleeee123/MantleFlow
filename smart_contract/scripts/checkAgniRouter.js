const { ethers } = require("hardhat");

async function main() {
    // Từ transaction của bạn
    const txHash = '0xc76348ecba0f036e5b10ada5ea315ed73f482c1f014053243f027276d5cf9ba4';
    
    const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.mantle.xyz");
    
    console.log("\n🔍 Analyzing Agni Transaction...\n");
    
    const tx = await provider.getTransaction(txHash);
    
    if (!tx) {
        console.log("❌ Transaction not found!");
        return;
    }
    
    console.log("✅ Transaction Found!");
    console.log("─────────────────────────────────────────");
    console.log("From:", tx.from);
    console.log("To (Router):", tx.to);
    console.log("Value:", ethers.formatEther(tx.value), "MNT");
    console.log("Gas Used:", tx.gasLimit.toString());
    console.log("\n📋 Input Data:");
    console.log(tx.data.substring(0, 200) + "...\n");
    
    // Parse function selector
    const selector = tx.data.substring(0, 10);
    console.log("Function Selector:", selector);
    
    // Common Uniswap V3 selectors
    const knownSelectors = {
        '0x04e45aaf': 'exactInputSingle',
        '0xb858183f': 'exactInput',
        '0x5023b4df': 'exactOutputSingle',
        '0x09b81346': 'exactOutput',
        '0x414bf389': 'swapExactTokensForTokens (V2)',
    };
    
    console.log("Function:", knownSelectors[selector] || "Unknown");
    
    console.log("\n✅ AGNI ROUTER ADDRESS:");
    console.log("─────────────────────────────────────────");
    console.log(tx.to);
    console.log("\nCopy address này để update vào code! 🎯\n");
    
    // Check if it's a contract
    const code = await provider.getCode(tx.to);
    if (code === '0x') {
        console.log("❌ WARNING: Not a contract!");
    } else {
        console.log("✅ Confirmed: This is a smart contract");
        console.log("   Code size:", (code.length / 2 - 1), "bytes\n");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
