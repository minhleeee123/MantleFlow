const { ethers } = require("hardhat");
require("dotenv").config();

/**
 * Debug: Check actual token balances in contract vs accounting
 */

const CONTRACT_V2 = '0xFaEDc6793E72AFF05d29e6f0550d0FF8b90c4c05';
const USDC_ADDRESS = '0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080';
const WMNT_ADDRESS = '0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF';

const CONTRACT_ABI = [
    'function getBalance(address user, address token) external view returns (uint256)',
    'function balances(address user, address token) external view returns (uint256)'
];

const ERC20_ABI = [
    'function balanceOf(address) external view returns (uint256)',
    'function allowance(address owner, address spender) external view returns (uint256)'
];

async function main() {
    console.log("\n🔍 DEBUG: Contract Balances vs Accounting\n");

    const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.mantle.xyz");
    const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
    
    const contract = new ethers.Contract(CONTRACT_V2, CONTRACT_ABI, provider);
    const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
    const wmnt = new ethers.Contract(WMNT_ADDRESS, ERC20_ABI, provider);
    
    console.log("Your address:", wallet.address);
    console.log("Contract:", CONTRACT_V2, "\n");
    
    console.log("═══════════════════════════════════════");
    console.log("ACCOUNTING BALANCES (in contract state)");
    console.log("═══════════════════════════════════════\n");
    
    const accountingUsdc = await contract.getBalance(wallet.address, USDC_ADDRESS);
    const accountingWmnt = await contract.getBalance(wallet.address, WMNT_ADDRESS);
    const accountingMnt = await contract.getBalance(wallet.address, ethers.ZeroAddress);
    
    console.log("User USDC balance (accounting):", ethers.formatUnits(accountingUsdc, 6), "USDC");
    console.log("User WMNT balance (accounting):", ethers.formatEther(accountingWmnt), "WMNT");
    console.log("User MNT balance (accounting): ", ethers.formatEther(accountingMnt), "MNT\n");
    
    console.log("═══════════════════════════════════════");
    console.log("ACTUAL TOKENS (in contract address)");
    console.log("═══════════════════════════════════════\n");
    
    const actualUsdc = await usdc.balanceOf(CONTRACT_V2);
    const actualWmnt = await wmnt.balanceOf(CONTRACT_V2);
    const actualMnt = await provider.getBalance(CONTRACT_V2);
    
    console.log("Contract USDC balance (actual):  ", ethers.formatUnits(actualUsdc, 6), "USDC");
    console.log("Contract WMNT balance (actual):  ", ethers.formatEther(actualWmnt), "WMNT");
    console.log("Contract MNT balance (actual):   ", ethers.formatEther(actualMnt), "MNT\n");
    
    console.log("═══════════════════════════════════════");
    console.log("ROUTER ALLOWANCES");
    console.log("═══════════════════════════════════════\n");
    
    const AGNI_ROUTER = '0xb5Dc27be0a565A4A80440f41c74137001920CB22';
    const usdcAllowance = await usdc.allowance(CONTRACT_V2, AGNI_ROUTER);
    const wmntAllowance = await wmnt.allowance(CONTRACT_V2, AGNI_ROUTER);
    
    console.log("Contract → Router USDC allowance:", ethers.formatUnits(usdcAllowance, 6), "USDC");
    console.log("Contract → Router WMNT allowance:", ethers.formatEther(wmntAllowance), "WMNT\n");
    
    console.log("═══════════════════════════════════════");
    console.log("ANALYSIS");
    console.log("═══════════════════════════════════════\n");
    
    if (actualUsdc > 0n && accountingUsdc > 0n) {
        console.log("✅ Contract HAS USDC tokens");
        console.log("✅ User HAS accounting balance");
        console.log("   → Ready to swap USDC → WMNT\n");
        
        if (usdcAllowance < actualUsdc) {
            console.log("⚠️  BUT: Router allowance is low!");
            console.log("   Contract needs to approve router before swap\n");
        }
    } else {
        console.log("❌ Missing tokens or accounting balance\n");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
