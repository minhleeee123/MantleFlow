const { ethers } = require("hardhat");

async function main() {
    console.log("\n🔍 DEEP ANALYSIS: Why wallet works but contract fails\n");
    
    const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.mantle.xyz");
    const txHash = '0xc76348ecba0f036e5b10ada5ea315ed73f482c1f014053243f027276d5cf9ba4';
    
    const receipt = await provider.getTransactionReceipt(txHash);
    const tx = await provider.getTransaction(txHash);
    
    console.log("═══════════════════════════════════════");
    console.log("YOUR SUCCESSFUL SWAP (Wallet)");
    console.log("═══════════════════════════════════════\n");
    
    console.log("From:", tx.from);
    console.log("To (Router):", tx.to);
    console.log("Value:", ethers.formatEther(tx.value), "MNT");
    console.log("Gas Used:", receipt.gasUsed.toString());
    console.log("Status:", receipt.status === 1 ? "✅ SUCCESS" : "❌ FAILED\n");
    
    // Parse logs to find actual swap amounts
    console.log("\n📝 LOGS ANALYSIS:");
    console.log("Total logs:", receipt.logs.length, "\n");
    
    const ERC20_TRANSFER = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
    
    for (let i = 0; i < receipt.logs.length; i++) {
        const log = receipt.logs[i];
        
        if (log.topics[0] === ERC20_TRANSFER) {
            const from = '0x' + log.topics[1].slice(26);
            const to = '0x' + log.topics[2].slice(26);
            const amount = BigInt(log.data);
            
            console.log(`Transfer #${i + 1}:`);
            console.log(`  Token: ${log.address}`);
            console.log(`  From: ${from}`);
            console.log(`  To: ${to}`);
            
            if (log.address.toLowerCase() === '0x67a1f4a939b477a6b7c5bf94d97e45de87e608ef'.toLowerCase()) {
                console.log(`  Amount: ${ethers.formatEther(amount)} WMNT`);
            } else if (log.address.toLowerCase() === '0xacab8129e2ce587fd203fd770ec9ecafa2c88080'.toLowerCase()) {
                console.log(`  Amount: ${ethers.formatUnits(amount, 6)} USDC`);
            } else {
                console.log(`  Amount: ${amount.toString()}`);
            }
            console.log();
        }
    }
    
    console.log("═══════════════════════════════════════");
    console.log("🔑 KEY DIFFERENCES: Wallet vs Contract");
    console.log("═══════════════════════════════════════\n");
    
    console.log("✅ WALLET SWAP:");
    console.log("   1. User sends 10 MNT with tx (value field)");
    console.log("   2. Router RECEIVES native MNT");
    console.log("   3. Router auto-wraps MNT → WMNT internally");
    console.log("   4. Router swaps WMNT → USDC");
    console.log("   5. User receives USDC directly\n");
    
    console.log("❌ CONTRACT SWAP (Current implementation):");
    console.log("   1. User deposits USDC to contract");
    console.log("   2. Contract tries to swap USDC → WMNT");
    console.log("   3. Contract calls approve(USDC, router, amount)");
    console.log("   4. Contract calls router.exactInputSingle()");
    console.log("   5. ??? Something fails here\n");
    
    console.log("═══════════════════════════════════════");
    console.log("🐛 POTENTIAL ISSUES");
    console.log("═══════════════════════════════════════\n");
    
    console.log("Issue 1: USDC approve might fail silently");
    console.log("   → Check if USDC.approve returns false\n");
    
    console.log("Issue 2: Pool liquidity for USDC → WMNT might be low");
    console.log("   → Your tx: MNT → USDC (opposite direction)");
    console.log("   → Contract: USDC → WMNT (might have less liquidity)\n");
    
    console.log("Issue 3: Fee tier might be wrong");
    console.log("   → Let me check actual pool fee from your tx...\n");
    
    // Decode input to check fee
    const inputData = tx.data;
    console.log("Input data length:", inputData.length);
    console.log("Function selector:", inputData.slice(0, 10));
    
    // Manually decode fee (it's at a specific position)
    if (inputData.length > 200) {
        // Fee is typically at byte offset 64-68 after selector
        const feeHex = '0x' + inputData.slice(138, 146); // Position may vary
        console.log("Fee hex from tx data:", feeHex);
    }
    
    console.log("\n═══════════════════════════════════════");
    console.log("💡 RECOMMENDED FIX");
    console.log("═══════════════════════════════════════\n");
    
    console.log("Option 1: Test MNT → USDC (same direction as wallet)");
    console.log("   → Deposit native MNT to contract");
    console.log("   → Contract wraps MNT → WMNT");
    console.log("   → Contract swaps WMNT → USDC\n");
    
    console.log("Option 2: Check approve() return value");
    console.log("   → Require approve returns true");
    console.log("   → Add error logging\n");
    
    console.log("Option 3: Call router with Try/Catch");
    console.log("   → Capture actual revert reason\n");
}

main().catch(console.error);
