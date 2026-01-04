const { ethers } = require("hardhat");
require("dotenv").config();

/**
 * Withdraw tất cả token từ contract cũ
 */

const OLD_CONTRACT = '0xaD893d3b35FA8cc23A24a0fdF0B79cc22a1a5E44';
const USDC_ADDRESS = '0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080';

const TRADING_BOT_ABI = [
    'function withdraw(address token, uint256 amount) external',
    'function getBalance(address user, address token) external view returns (uint256)',
    'function owner() external view returns (address)',
    'function emergencyWithdraw(address token, uint256 amount) external'
];

const ERC20_ABI = [
    'function balanceOf(address) external view returns (uint256)',
    'function symbol() external view returns (string)',
    'function decimals() external view returns (uint8)'
];

async function main() {
    console.log("\n💰 ============================================");
    console.log("   WITHDRAWING ALL TOKENS FROM OLD CONTRACT");
    console.log("============================================\n");

    try {
        const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.mantle.xyz");
        const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
        
        console.log("📍 Your Address:", wallet.address);
        console.log("📦 Old Contract:", OLD_CONTRACT, "\n");

        const contract = new ethers.Contract(OLD_CONTRACT, TRADING_BOT_ABI, wallet);

        // Check owner
        const owner = await contract.owner();
        console.log("👑 Contract Owner:", owner);
        console.log("✅ You are owner:", owner.toLowerCase() === wallet.address.toLowerCase(), "\n");

        // Get balances
        console.log("═══════════════════════════════════════════");
        console.log("📊 CURRENT BALANCES IN CONTRACT");
        console.log("═══════════════════════════════════════════\n");

        // Native MNT
        const mntBalance = await contract.getBalance(wallet.address, ethers.ZeroAddress);
        console.log("MNT: ", ethers.formatEther(mntBalance), "MNT");

        // USDC
        const usdcBalance = await contract.getBalance(wallet.address, USDC_ADDRESS);
        const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
        const usdcDecimals = await usdcContract.decimals();
        console.log("USDC:", ethers.formatUnits(usdcBalance, usdcDecimals), "USDC\n");

        // Withdraw
        console.log("═══════════════════════════════════════════");
        console.log("🔄 WITHDRAWING TOKENS");
        console.log("═══════════════════════════════════════════\n");

        // Withdraw MNT if any
        if (mntBalance > 0n) {
            console.log("🔄 Withdrawing MNT...");
            const tx1 = await contract.withdraw(ethers.ZeroAddress, mntBalance);
            console.log("   Tx:", tx1.hash);
            await tx1.wait();
            console.log("   ✅ MNT withdrawn!\n");
        } else {
            console.log("⚠️  No MNT to withdraw\n");
        }

        // Withdraw USDC if any
        if (usdcBalance > 0n) {
            console.log("🔄 Withdrawing USDC...");
            const tx2 = await contract.withdraw(USDC_ADDRESS, usdcBalance);
            console.log("   Tx:", tx2.hash);
            await tx2.wait();
            console.log("   ✅ USDC withdrawn!\n");
        } else {
            console.log("⚠️  No USDC to withdraw\n");
        }

        // Verify
        console.log("═══════════════════════════════════════════");
        console.log("✅ VERIFICATION");
        console.log("═══════════════════════════════════════════\n");

        const mntBalanceAfter = await contract.getBalance(wallet.address, ethers.ZeroAddress);
        const usdcBalanceAfter = await contract.getBalance(wallet.address, USDC_ADDRESS);

        console.log("Contract balances after withdrawal:");
        console.log("MNT: ", ethers.formatEther(mntBalanceAfter), "MNT");
        console.log("USDC:", ethers.formatUnits(usdcBalanceAfter, usdcDecimals), "USDC\n");

        // Check wallet balance
        const walletMnt = await provider.getBalance(wallet.address);
        const walletUsdc = await usdcContract.balanceOf(wallet.address);

        console.log("Your wallet balances:");
        console.log("MNT: ", ethers.formatEther(walletMnt), "MNT");
        console.log("USDC:", ethers.formatUnits(walletUsdc, usdcDecimals), "USDC\n");

        console.log("✅ ALL TOKENS WITHDRAWN SUCCESSFULLY! 🎉\n");

    } catch (error) {
        console.error("\n❌ Error:", error.message);
        
        if (error.message.includes("Ownable")) {
            console.log("\n⚠️  Only owner can withdraw!");
            console.log("   Make sure you're using the correct private key.\n");
        }
    }

    console.log("============================================\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
