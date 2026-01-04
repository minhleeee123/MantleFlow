const { ethers } = require("hardhat");
require("dotenv").config();

const OLD_CONTRACT = '0xFaEDc6793E72AFF05d29e6f0550d0FF8b90c4c05'; // V2
const USDC_ADDRESS = '0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080';

const ERC20_ABI = [
    'function balanceOf(address) external view returns (uint256)',
    'function decimals() external view returns (uint8)'
];

async function main() {
    const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.mantle.xyz");
    const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
    
    const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
    
    // Actual USDC balance in contract
    const actualBalance = await usdcContract.balanceOf(OLD_CONTRACT);
    const decimals = await usdcContract.decimals();
    
    console.log("\n📊 ACTUAL USDC IN CONTRACT:");
    console.log("Contract:", OLD_CONTRACT);
    console.log("Actual USDC balance:", ethers.formatUnits(actualBalance, decimals), "USDC");
    console.log("Raw:", actualBalance.toString(), "\n");
    
    // User's actual balance
    const userBalance = await usdcContract.balanceOf(wallet.address);
    console.log("Your wallet USDC:", ethers.formatUnits(userBalance, decimals), "USDC\n");
}

main().catch(console.error);
