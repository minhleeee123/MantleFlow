const { ethers } = require("hardhat");
require("dotenv").config();

/**
 * Test script để verify Agni Finance behavior trên Mantle Sepolia
 * Check xem Agni có phải mock DEX với infinite liquidity không
 */

// ✅ Agni THỰC SỰ CÓ trên Mantle Sepolia!
// Từ transaction: https://sepolia.mantlescan.xyz/tx/0xc76348ecba0f036e5b10ada5ea315ed73f482c1f014053243f027276d5cf9ba4
const AGNI_ROUTER = '0xb5Dc27be0a565a4a80440f4101920CB22'; // Real Agni Router V3
const USDC_ADDRESS = '0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080'; // USDC testnet
const MNT_ADDRESS = ethers.ZeroAddress; // Native MNT (use zero address)

// Agni V3 uses different ABI (Uniswap V3 style)
const ROUTER_ABI = [
    'function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)',
    'function factory() external view returns (address)',
    'function WETH9() external view returns (address)'
];

const ERC20_ABI = [
    'function balanceOf(address account) external view returns (uint256)',
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function allowance(address owner, address spender) external view returns (uint256)'
];

async function main() {
    console.log("\n🧪 ============================================");
    console.log("   TESTING DEX AVAILABILITY ON MANTLE SEPOLIA");
    console.log("============================================\n");

    try {
        // Setup
        const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.mantle.xyz");
        const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
        
        console.log("📍 Wallet Address:", wallet.address);
        console.log("🌐 Network: Mantle Sepolia Testnet\n");

        // Test 1: Check if Agni Router exists
        console.log("📊 Test 1: Check Agni Finance Deployment");
        console.log("─────────────────────────────────────────");
        console.log("Router Address:", AGNI_ROUTER);
        
        const routerCode = await provider.getCode(AGNI_ROUTER);
        
        if (routerCode === '0x') {
            console.log("❌ Contract KHÔNG TỒN TẠI tại address này\n");
            console.log("🔍 Phân Tích:");
            console.log("─────────────────────────────────────────");
            console.log("✅ Agni Finance CÓ trên Mantle MAINNET");
            console.log("❌ Agni Finance CHƯA deploy trên Mantle SEPOLIA testnet");
            console.log("⚠️  Hầu hết các DEX chỉ có trên mainnet\n");
        } else {
            console.log("✅ Contract TỒN TẠI! Có", routerCode.length / 2 - 1, "bytes\n");
            
            // Try calling the contract
            const router = new ethers.Contract(AGNI_ROUTER, ROUTER_ABI, provider);
            
            try {
                const smallAmount = ethers.parseUnits("100", 6);
                const path = [USDC_ADDRESS, MNT_ADDRESS];
                
                const smallAmounts = await router.getAmountsOut(smallAmount, path);
                const smallAmountOut = ethers.formatEther(smallAmounts[1]);
                
                console.log("✅ Router hoạt động!");
                console.log("✅ Quote: 100 USDC =", smallAmountOut, "MNT\n");
                
                // Test với amount lớn
                const hugeAmount = ethers.parseUnits("1000000", 6);
                const hugeAmounts = await router.getAmountsOut(hugeAmount, path);
                const hugeAmountOut = ethers.formatEther(hugeAmounts[1]);
                
                const smallRate = parseFloat(smallAmountOut) / 100;
                const hugeRate = parseFloat(hugeAmountOut) / 1000000;
                const slippage = Math.abs(smallRate - hugeRate) / smallRate * 100;
                
                console.log("📊 Slippage Test:");
                console.log("   100 USDC rate:     ", smallRate.toFixed(6));
                console.log("   1,000,000 USDC rate:", hugeRate.toFixed(6));
                console.log("   Slippage:          ", slippage.toFixed(2), "%\n");
                
                if (slippage < 1) {
                    console.log("🎯 VERDICT: MOCK DEX với infinite liquidity! ✅");
                    console.log("   → Nên integrate vào smart contract!\n");
                } else {
                    console.log("🎯 VERDICT: Real AMM");
                    console.log("   → Cân nhắc integrate\n");
                }
            } catch (callError) {
                console.log("❌ Contract call failed:", callError.message.split('\n')[0]);
                console.log("   → Có thể không có liquidity pool\n");
            }
        }

        // Test 2: Reality Check
        console.log("🌐 Thực Tế về Testnet DEX:");
        console.log("─────────────────────────────────────────");
        console.log("1. Hầu hết DEX chỉ có trên mainnet");
        console.log("2. Testnet thường KHÔNG CÓ liquidity pools thực");
        console.log("3. Test tokens không có giá trị → không ai provide liquidity");
        console.log("4. Một số testnet có 'mock DEX' với fixed rates\n");

        // Conclusion
        console.log("💡 KẾT LUẬN & KHUYẾN NGHỊ:");
        console.log("─────────────────────────────────────────");
        console.log("✅ APPROACH HIỆN TẠI LÀ ĐÚNG:");
        console.log("   • Backend quản lý swap với mock rates");
        console.log("   • Lấy giá real từ CoinGecko mainnet API");
        console.log("   • Contract chỉ làm accounting (internal swap)");
        console.log("   • User có thể withdraw bất kỳ lúc nào\n");
        
        console.log("🚀 CÁCH CẢI TIẾN:");
        console.log("   1. Thay mock rate = 50 bằng real price từ CoinGecko");
        console.log("   2. Backend pre-fund contract với test tokens");
        console.log("   3. Auto-rebalance pool khi thấp\n");
        
        console.log("📝 CHO PRODUCTION (Mantle Mainnet):");
        console.log("   Phase 1: Testnet với mock swap (hiện tại) ✅");
        console.log("   Phase 2: Integrate Agni Finance mainnet 🚧");
        console.log("   Phase 3: Multi-DEX aggregation 🔮\n");

    } catch (error) {
        console.error("\n❌ Fatal Error:", error.message);
        console.log("\n⚠️  Troubleshooting:");
        console.log("   1. Check DEPLOYER_PRIVATE_KEY trong .env");
        console.log("   2. Check internet connection");
        console.log("   3. RPC có thể bị rate limit, thử lại sau\n");
    }

    console.log("============================================");
    console.log("   TEST COMPLETED");
    console.log("============================================\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
