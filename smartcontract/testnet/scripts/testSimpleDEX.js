import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '..', '.env');
dotenv.config({ path: envPath });

const MANTLE_TESTNET_RPC = 'https://rpc.sepolia.mantle.xyz';
const USDT_ADDRESS = '0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080';

// Load deployed contract addresses
const addressesPath = join(__dirname, '..', 'addresses.json');
const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
const DEX_ADDRESS = addresses.simpleDEX;

const USDT_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];

const DEX_ABI = [
  "function addLiquidity(uint256 tokenAmount) external payable",
  "function removeLiquidity(uint256 liquidity) external",
  "function swapMntForToken(uint256 minTokenOut) external payable",
  "function swapTokenForMnt(uint256 tokenAmount, uint256 minMntOut) external",
  "function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256)",
  "function mntReserve() external view returns (uint256)",
  "function tokenReserve() external view returns (uint256)",
  "function totalLiquidity() external view returns (uint256)",
  "function liquidityBalance(address) external view returns (uint256)"
];

async function main() {
  console.log('\n============================================');
  console.log('🧪 TESTING SimpleDEX (AMM/Swap)');
  console.log('============================================\n');

  const provider = new ethers.JsonRpcProvider(MANTLE_TESTNET_RPC);
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
  const wallet = new ethers.Wallet(privateKey, provider);
  
  const usdt = new ethers.Contract(USDT_ADDRESS, USDT_ABI, wallet);
  const dex = new ethers.Contract(DEX_ADDRESS, DEX_ABI, wallet);

  console.log('📍 DEX Address:', DEX_ADDRESS);
  console.log('📍 User:', wallet.address);

  // Check balances
  const mntBalance = await provider.getBalance(wallet.address);
  const usdtBalance = await usdt.balanceOf(wallet.address);
  
  console.log('\n💰 Initial Balances:');
  console.log('   MNT:', ethers.formatEther(mntBalance));
  console.log('   USDT:', ethers.formatUnits(usdtBalance, 6));

  // Check DEX reserves before
  let mntReserve = await dex.mntReserve();
  let tokenReserve = await dex.tokenReserve();
  let totalLiquidity = await dex.totalLiquidity();
  let userLiquidity = await dex.liquidityBalance(wallet.address);

  console.log('\n📊 DEX Initial State:');
  console.log('   MNT Reserve:', ethers.formatEther(mntReserve));
  console.log('   USDT Reserve:', ethers.formatUnits(tokenReserve, 6));
  console.log('   Total Liquidity:', ethers.formatEther(totalLiquidity));
  console.log('   Your Liquidity:', ethers.formatEther(userLiquidity));

  try {
    // Test 1: Add Liquidity
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 TEST 1: Add Liquidity');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const mntAmount = ethers.parseEther('10'); // 10 MNT
    const tokenAmount = ethers.parseUnits('100', 6); // 100 USDT
    
    console.log(`\n💧 Adding liquidity: ${ethers.formatEther(mntAmount)} MNT + ${ethers.formatUnits(tokenAmount, 6)} USDT`);
    
    // Approve USDT
    console.log('📝 Approving USDT...');
    const approveTx = await usdt.approve(DEX_ADDRESS, tokenAmount);
    await approveTx.wait();
    console.log('✅ USDT approved');
    
    // Add liquidity
    console.log('📝 Adding liquidity...');
    const addLiqTx = await dex.addLiquidity(tokenAmount, { value: mntAmount });
    const receipt1 = await addLiqTx.wait();
    console.log('✅ Liquidity added!');
    console.log('📤 TX:', receipt1.hash);

    // Check updated state
    mntReserve = await dex.mntReserve();
    tokenReserve = await dex.tokenReserve();
    totalLiquidity = await dex.totalLiquidity();
    userLiquidity = await dex.liquidityBalance(wallet.address);

    console.log('\n📊 DEX After Add Liquidity:');
    console.log('   MNT Reserve:', ethers.formatEther(mntReserve));
    console.log('   USDT Reserve:', ethers.formatUnits(tokenReserve, 6));
    console.log('   Total Liquidity:', ethers.formatEther(totalLiquidity));
    console.log('   Your Liquidity:', ethers.formatEther(userLiquidity));

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test 2: Swap MNT for USDT
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 TEST 2: Swap MNT → USDT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const swapMntAmount = ethers.parseEther('1'); // 1 MNT
    
    // Calculate expected output
    const expectedOut = await dex.getAmountOut(swapMntAmount, mntReserve, tokenReserve);
    console.log(`\n💱 Swapping ${ethers.formatEther(swapMntAmount)} MNT`);
    console.log('   Expected USDT out:', ethers.formatUnits(expectedOut, 6));
    
    const minOut = expectedOut * 95n / 100n; // 5% slippage
    
    console.log('📝 Executing swap...');
    const swapTx1 = await dex.swapMntForToken(minOut, { value: swapMntAmount });
    const receipt2 = await swapTx1.wait();
    console.log('✅ Swap completed!');
    console.log('📤 TX:', receipt2.hash);

    const usdtBalanceAfterSwap = await usdt.balanceOf(wallet.address);
    console.log('💰 USDT Balance After Swap:', ethers.formatUnits(usdtBalanceAfterSwap, 6));

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test 3: Swap USDT for MNT
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 TEST 3: Swap USDT → MNT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const swapTokenAmount = ethers.parseUnits('20', 6); // 20 USDT
    
    // Get updated reserves
    mntReserve = await dex.mntReserve();
    tokenReserve = await dex.tokenReserve();
    
    // Calculate expected output
    const expectedMntOut = await dex.getAmountOut(swapTokenAmount, tokenReserve, mntReserve);
    console.log(`\n💱 Swapping ${ethers.formatUnits(swapTokenAmount, 6)} USDT`);
    console.log('   Expected MNT out:', ethers.formatEther(expectedMntOut));
    
    const minMntOut = expectedMntOut * 95n / 100n; // 5% slippage
    
    // Approve USDT for swap
    console.log('📝 Approving USDT for swap...');
    const approveTx2 = await usdt.approve(DEX_ADDRESS, swapTokenAmount);
    await approveTx2.wait();
    console.log('✅ USDT approved');
    
    console.log('📝 Executing swap...');
    const swapTx2 = await dex.swapTokenForMnt(swapTokenAmount, minMntOut);
    const receipt3 = await swapTx2.wait();
    console.log('✅ Swap completed!');
    console.log('📤 TX:', receipt3.hash);

    const mntBalanceAfterSwap = await provider.getBalance(wallet.address);
    console.log('💰 MNT Balance After Swap:', ethers.formatEther(mntBalanceAfterSwap));

    // Final state
    mntReserve = await dex.mntReserve();
    tokenReserve = await dex.tokenReserve();
    totalLiquidity = await dex.totalLiquidity();
    userLiquidity = await dex.liquidityBalance(wallet.address);

    console.log('\n📊 Final DEX State:');
    console.log('   MNT Reserve:', ethers.formatEther(mntReserve));
    console.log('   USDT Reserve:', ethers.formatUnits(tokenReserve, 6));
    console.log('   Total Liquidity:', ethers.formatEther(totalLiquidity));
    console.log('   Your Liquidity:', ethers.formatEther(userLiquidity));

    console.log('\n============================================');
    console.log('✅ ALL SimpleDEX TESTS PASSED!');
    console.log('============================================\n');

  } catch (error) {
    console.error('\n❌ Error during testing:', error.message);
    if (error.data) {
      console.error('Error data:', error.data);
    }
  }
}

main().catch(console.error);
