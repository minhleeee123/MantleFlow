const { ethers } = require("hardhat");
require("dotenv").config();

const OLD_CONTRACT = '0xaD893d3b35FA8cc23A24a0fdF0B79cc22a1a5E44';
const USDC_ADDRESS = '0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080';

const TRADING_BOT_ABI = [
    'function emergencyWithdraw(address token, uint256 amount) external'
];

async function main() {
    console.log("\n🚨 EMERGENCY WITHDRAW REMAINING USDC\n");
    
    const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.mantle.xyz");
    const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
    
    const contract = new ethers.Contract(OLD_CONTRACT, TRADING_BOT_ABI, wallet);
    
    // Withdraw 5 USDC (actual balance)
    const amount = ethers.parseUnits("5", 6);
    
    console.log("🔄 Withdrawing 5 USDC via emergencyWithdraw...");
    const tx = await contract.emergencyWithdraw(USDC_ADDRESS, amount);
    console.log("Tx:", tx.hash);
    
    await tx.wait();
    console.log("✅ Emergency withdraw successful!\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
