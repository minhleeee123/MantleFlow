const { ethers } = require("hardhat");
require("dotenv").config();

const USDC_ADDRESS = '0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080';
const AGNI_ROUTER = '0xb5Dc27be0a565A4A80440f41c74137001920CB22';
const CONTRACT_V2 = '0xFaEDc6793E72AFF05d29e6f0550d0FF8b90c4c05';

const ERC20_ABI = [
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function allowance(address owner, address spender) external view returns (uint256)',
    'function name() external view returns (string)',
    'function symbol() external view returns (string)'
];

async function main() {
    console.log("\n🧪 TEST: Can contract approve USDC to router?\n");

    const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.mantle.xyz");
    const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
    
    const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
    
    const name = await usdc.name();
    const symbol = await usdc.symbol();
    console.log("Token:", name, "(" + symbol + ")");
    console.log("Address:", USDC_ADDRESS, "\n");
    
    // Check if wallet can approve (as test)
    console.log("Test 1: Can WALLET approve USDC?");
    const usdcWithSigner = usdc.connect(wallet);
    
    try {
        const tx = await usdcWithSigner.approve(AGNI_ROUTER, ethers.parseUnits("1", 6));
        await tx.wait();
        console.log("✅ Wallet CAN approve\n");
        
        const allowance = await usdc.allowance(wallet.address, AGNI_ROUTER);
        console.log("Allowance after approve:", ethers.formatUnits(allowance, 6), "USDC\n");
        
    } catch (error) {
        console.log("❌ Wallet CANNOT approve:", error.message, "\n");
    }
    
    // Now check from contract perspective
    console.log("Test 2: Check CONTRACT's ability to approve");
    console.log("(Contract needs to call approve() internally)\n");
    
    const contractAllowance = await usdc.allowance(CONTRACT_V2, AGNI_ROUTER);
    console.log("Current contract → router allowance:", ethers.formatUnits(contractAllowance, 6), "USDC");
    
    if (contractAllowance === 0n) {
        console.log("\n💡 SOLUTION:");
        console.log("   Contract executeSwapOnDex() needs to:");
        console.log("   1. Call IERC20(USDC).approve(AGNI_ROUTER, amount)");
        console.log("   2. NOT use SafeERC20.forceApprove (may not work)");
        console.log("   3. Use low-level approve() like Uniswap docs\n");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
