const { ethers } = require("hardhat");

async function main() {
    console.log("\n🔍 CHECKING WMNT CONTRACT INTERFACE\n");
    
    const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.mantle.xyz");
    const WMNT = '0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF';
    
    // WETH9 standard interface
    const WETH_ABI = [
        'function deposit() external payable',
        'function withdraw(uint256) external',
        'function balanceOf(address) external view returns (uint256)',
        'function approve(address, uint256) external returns (bool)',
        'function name() external view returns (string)',
        'function symbol() external view returns (string)'
    ];
    
    const wmnt = new ethers.Contract(WMNT, WETH_ABI, provider);
    
    try {
        const name = await wmnt.name();
        const symbol = await wmnt.symbol();
        console.log("Token:", name, "(" + symbol + ")");
        console.log("Address:", WMNT);
        console.log("\n✅ WMNT supports WETH9 interface!");
        console.log("   Functions available:");
        console.log("   - deposit() payable → Wrap MNT to WMNT");
        console.log("   - withdraw(amount) → Unwrap WMNT to MNT");
        console.log("   - approve(), transfer(), etc.\n");
        
        console.log("💡 SOLUTION FOR CONTRACT:");
        console.log("   When swapping native MNT:");
        console.log("   1. Call WMNT.deposit{value: amount}()");
        console.log("   2. Approve WMNT to router");
        console.log("   3. Call router.exactInputSingle()");
        console.log("   4. Receive output tokens\n");
        
    } catch (error) {
        console.log("❌ WMNT might not support WETH9 interface");
        console.log("Error:", error.message);
    }
}

main().catch(console.error);
