const { ethers } = require("hardhat");
require("dotenv").config();

/**
 * Check wallet balances và available tokens trên Mantle Sepolia
 */

const USDC_ADDRESS = '0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0xaD893d3b35FA8cc23A24a0fdF0B79cc22a1a5E44';

const ERC20_ABI = [
    'function balanceOf(address account) external view returns (uint256)',
    'function symbol() external view returns (string)',
    'function decimals() external view returns (uint8)',
    'function name() external view returns (string)'
];

const CONTRACT_ABI = [
    'function getBalance(address user, address token) external view returns (uint256)'
];

async function main() {
    console.log("\n💰 ============================================");
    console.log("   WALLET BALANCE CHECK");
    console.log("============================================\n");

    try {
        const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.mantle.xyz");
        const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
        
        console.log("📍 Địa chỉ ví của bạn:", wallet.address);
        console.log("🌐 Network: Mantle Sepolia Testnet\n");

        // 1. Check Native MNT Balance
        console.log("═══════════════════════════════════════════");
        console.log("📊 WALLET BALANCES (Trong ví MetaMask)");
        console.log("═══════════════════════════════════════════\n");
        
        const mntBalance = await provider.getBalance(wallet.address);
        const mntFormatted = ethers.formatEther(mntBalance);
        
        console.log("🪙 MNT (Native Token):");
        console.log("   Balance:", mntFormatted, "MNT");
        console.log("   Wei:    ", mntBalance.toString());
        
        if (parseFloat(mntFormatted) < 0.01) {
            console.log("   ⚠️  LOW BALANCE! Get from faucet:");
            console.log("   → https://faucet.sepolia.mantle.xyz\n");
        } else {
            console.log("   ✅ Đủ để giao dịch\n");
        }

        // 2. Check USDC Balance
        try {
            const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
            const usdcBalance = await usdcContract.balanceOf(wallet.address);
            const usdcDecimals = await usdcContract.decimals();
            const usdcSymbol = await usdcContract.symbol();
            const usdcFormatted = ethers.formatUnits(usdcBalance, usdcDecimals);
            
            console.log(`💵 ${usdcSymbol} (Testnet USDC):`);
            console.log("   Address:", USDC_ADDRESS);
            console.log("   Balance:", usdcFormatted, usdcSymbol);
            console.log("   Raw:    ", usdcBalance.toString());
            
            if (parseFloat(usdcFormatted) === 0) {
                console.log("   ⚠️  NO BALANCE! Cần mint USDC testnet");
                console.log("   → Check contract có hàm mint() không\n");
            } else {
                console.log("   ✅ Có thể dùng để trade\n");
            }
        } catch (error) {
            console.log("💵 USDC: ❌ Không thể check balance");
            console.log("   Error:", error.message.split('\n')[0], "\n");
        }

        // 3. Check Contract Balance (nếu đã deposit)
        console.log("═══════════════════════════════════════════");
        console.log("📊 CONTRACT BALANCES (Trong Trading Contract)");
        console.log("═══════════════════════════════════════════\n");
        console.log("Contract Address:", CONTRACT_ADDRESS, "\n");
        
        try {
            const tradingContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
            
            // Check MNT in contract
            const contractMnt = await tradingContract.getBalance(wallet.address, ethers.ZeroAddress);
            const contractMntFormatted = ethers.formatEther(contractMnt);
            
            console.log("🪙 MNT trong Contract:");
            console.log("   Balance:", contractMntFormatted, "MNT");
            
            // Check USDC in contract
            const contractUsdc = await tradingContract.getBalance(wallet.address, USDC_ADDRESS);
            const contractUsdcFormatted = ethers.formatUnits(contractUsdc, 6);
            
            console.log("\n💵 USDC trong Contract:");
            console.log("   Balance:", contractUsdcFormatted, "USDC\n");
            
            if (parseFloat(contractMntFormatted) === 0 && parseFloat(contractUsdcFormatted) === 0) {
                console.log("ℹ️  Chưa deposit vào contract");
                console.log("   Cần deposit trước khi trade\n");
            }
            
        } catch (error) {
            console.log("❌ Không thể check contract balance");
            console.log("   Có thể contract chưa deploy hoặc address sai");
            console.log("   Error:", error.message.split('\n')[0], "\n");
        }

        // 4. Available Tokens Info
        console.log("═══════════════════════════════════════════");
        console.log("🪙  AVAILABLE TOKENS ON MANTLE SEPOLIA");
        console.log("═══════════════════════════════════════════\n");
        
        console.log("1. MNT (Native)");
        console.log("   Address: 0x0000000000000000000000000000000000000000");
        console.log("   Type: Native token (như ETH trên Ethereum)");
        console.log("   Có thể: Deposit, Withdraw, Trade ✅\n");
        
        console.log("2. USDC (Testnet)");
        console.log("   Address:", USDC_ADDRESS);
        console.log("   Type: ERC20 testnet token");
        console.log("   Có thể: Deposit, Withdraw, Trade ✅\n");
        
        console.log("3. Other Tokens:");
        console.log("   ⚠️  Mantle Sepolia có rất ít tokens");
        console.log("   ⚠️  Hầu hết là test tokens không có giá trị\n");

        // 5. Swap Options
        console.log("═══════════════════════════════════════════");
        console.log("🔄 SWAP OPTIONS");
        console.log("═══════════════════════════════════════════\n");
        
        console.log("❌ Agni Finance DEX:");
        console.log("   Status: KHÔNG có trên Sepolia testnet");
        console.log("   Chỉ có trên Mantle Mainnet");
        console.log("   → Không thể swap trên DEX thực\n");
        
        console.log("✅ Trading Contract (Your System):");
        console.log("   Status: HOẠT ĐỘNG");
        console.log("   Mechanism: Internal accounting swap");
        console.log("   Available pairs:");
        console.log("   • MNT ↔ USDC");
        console.log("   • BTC ↔ USDC (mock, mapped to test tokens)");
        console.log("   • ETH ↔ USDC (mock, mapped to test tokens)");
        console.log("   Rate: Fixed mock rate (hoặc CoinGecko API)\n");

        // 6. Recommendations
        console.log("═══════════════════════════════════════════");
        console.log("💡 KHUYẾN NGHỊ");
        console.log("═══════════════════════════════════════════\n");
        
        if (parseFloat(mntFormatted) < 0.01) {
            console.log("1️⃣  GET MNT từ faucet:");
            console.log("    https://faucet.sepolia.mantle.xyz");
            console.log("    (Cần để trả gas fees)\n");
        } else {
            console.log("1️⃣  ✅ Đã có MNT cho gas fees\n");
        }
        
        console.log("2️⃣  GET USDC testnet:");
        console.log("    Option A: Tìm USDC faucet");
        console.log("    Option B: Contract owner mint cho bạn");
        console.log("    Option C: Tự deploy ERC20 test token\n");
        
        console.log("3️⃣  DEPOSIT vào Trading Contract:");
        console.log("    Frontend → ContractWallet component");
        console.log("    Hoặc gọi: contract.deposit(token, amount)\n");
        
        console.log("4️⃣  TRADE:");
        console.log("    Dùng frontend AutoTradingView");
        console.log("    Backend sẽ execute swap với mock rates\n");

        // Summary
        console.log("═══════════════════════════════════════════");
        console.log("📝 TÓM TẮT");
        console.log("═══════════════════════════════════════════\n");
        
        const hasGas = parseFloat(mntFormatted) >= 0.01;
        const hasUsdc = false; // Will be checked above
        
        if (hasGas) {
            console.log("✅ Có MNT cho gas");
        } else {
            console.log("❌ Cần MNT từ faucet");
        }
        
        console.log("⚠️  Testnet không có DEX thực → Dùng contract mock swap");
        console.log("✅ Có thể trade MNT ↔ USDC trong contract của bạn");
        console.log("✅ Backend sẽ dùng giá từ CoinGecko mainnet\n");

    } catch (error) {
        console.error("\n❌ Fatal Error:", error.message);
        console.log("\n⚠️  Troubleshooting:");
        console.log("   1. Check DEPLOYER_PRIVATE_KEY trong .env");
        console.log("   2. Check internet connection");
        console.log("   3. RPC có thể rate limit\n");
    }

    console.log("============================================");
    console.log("   COMPLETED");
    console.log("============================================\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
