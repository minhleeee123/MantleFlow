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

// Load addresses
const addressesPath = join(__dirname, '..', 'addressesV2.json');
const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
const DEX_ADDRESS = addresses.simpleDEXV2;
const VAULT_ADDRESS = addresses.vaultWithSwap;

const USDT_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];

const DEX_ABI = [
  "function addLiquidity(uint256 usdtAmount) external payable",
  "function removeLiquidity(uint256 liquidity) external",
  "function swapMntForUsdt(uint256 minUsdtOut) external payable",
  "function swapUsdtForMnt(uint256 usdtAmount, uint256 minMntOut) external",
  "function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) external pure returns (uint256)",
  "function mntReserve() external view returns (uint256)",
  "function usdtReserve() external view returns (uint256)",
  "function totalLiquidity() external view returns (uint256)",
  "function liquidityBalance(address) external view returns (uint256)",
  "function getPrice() external view returns (uint256 mntPerUsdt, uint256 usdtPerMnt)"
];

const VAULT_ABI = [
  "function depositMnt() external payable",
  "function depositUsdt(uint256 amount) external",
  "function withdrawMnt(uint256 amount) external",
  "function withdrawUsdt(uint256 amount) external",
  "function swapMntToUsdt(uint256 mntAmount, uint256 minUsdtOut) external",
  "function swapUsdtToMnt(uint256 usdtAmount, uint256 minMntOut) external",
  "function getUserBalances(address user) external view returns (uint256 mnt, uint256 usdt)",
  "function estimateSwap(bool mntToUsdt, uint256 amountIn) external view returns (uint256 amountOut)",
  "function getTotalDeposits() external view returns (uint256 mnt, uint256 usdt)"
];

async function main() {
  console.log('\n============================================');
  console.log('🧪 TESTING V2 CONTRACTS');
  console.log('============================================\n');

  const provider = new ethers.JsonRpcProvider(MANTLE_TESTNET_RPC);
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
  const wallet = new ethers.Wallet(privateKey, provider);
  
  const usdt = new ethers.Contract(USDT_ADDRESS, USDT_ABI, wallet);
  const dex = new ethers.Contract(DEX_ADDRESS, DEX_ABI, wallet);
  const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, wallet);

  console.log('📍 SimpleDEXV2:', DEX_ADDRESS);
  console.log('📍 VaultWithSwap:', VAULT_ADDRESS);
  console.log('📍 User:', wallet.address);

  // Check balances
  const mntBalance = await provider.getBalance(wallet.address);
  const usdtBalance = await usdt.balanceOf(wallet.address);
  
  console.log('\n💰 Wallet Balances:');
  console.log('   MNT:', ethers.formatEther(mntBalance));
  console.log('   USDT:', ethers.formatUnits(usdtBalance, 6));

  try {
    // ============ TEST 1: Add Liquidity to DEX ============
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 TEST 1: Add Liquidity (500 MNT + 2500 USDT)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const mntLiquidity = ethers.parseEther('500'); // 500 MNT (reduced from 1000)
    const usdtLiquidity = ethers.parseUnits('2500', 6); // 2500 USDT (reduced from 5000)
    
    console.log(`\n💧 Adding liquidity: ${ethers.formatEther(mntLiquidity)} MNT + ${ethers.formatUnits(usdtLiquidity, 6)} USDT`);
    
    // Approve USDT
    console.log('📝 Approving USDT...');
    const approveTx = await usdt.approve(DEX_ADDRESS, usdtLiquidity);
    await approveTx.wait();
    console.log('✅ USDT approved');
    
    // Add liquidity
    console.log('📝 Adding liquidity...');
    const addLiqTx = await dex.addLiquidity(usdtLiquidity, { value: mntLiquidity });
    const receipt1 = await addLiqTx.wait();
    console.log('✅ Liquidity added!');
    console.log('📤 TX:', receipt1.hash);

    // Check DEX state
    const mntReserve = await dex.mntReserve();
    const usdtReserve = await dex.usdtReserve();
    const totalLiquidity = await dex.totalLiquidity();
    const userLiquidity = await dex.liquidityBalance(wallet.address);
    const [mntPerUsdt, usdtPerMnt] = await dex.getPrice();

    console.log('\n📊 DEX State:');
    console.log('   MNT Reserve:', ethers.formatEther(mntReserve));
    console.log('   USDT Reserve:', ethers.formatUnits(usdtReserve, 6));
    console.log('   Total Liquidity:', ethers.formatEther(totalLiquidity));
    console.log('   Your Liquidity:', ethers.formatEther(userLiquidity));
    console.log('   Price: 1 MNT =', ethers.formatUnits(usdtPerMnt, 6), 'USDT');
    console.log('   Price: 1 USDT =', ethers.formatEther(mntPerUsdt), 'MNT');

    await new Promise(resolve => setTimeout(resolve, 3000));

    // ============ TEST 2: Deposit to Vault ============
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 TEST 2: Deposit to Vault');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const depositMnt = ethers.parseEther('10'); // 10 MNT
    const depositUsdt = ethers.parseUnits('50', 6); // 50 USDT
    
    // Deposit MNT
    console.log(`\n💰 Depositing ${ethers.formatEther(depositMnt)} MNT to Vault...`);
    const depositMntTx = await vault.depositMnt({ value: depositMnt });
    await depositMntTx.wait();
    console.log('✅ MNT deposited!');
    
    // Deposit USDT
    console.log(`💰 Depositing ${ethers.formatUnits(depositUsdt, 6)} USDT to Vault...`);
    const approveVaultTx = await usdt.approve(VAULT_ADDRESS, depositUsdt);
    await approveVaultTx.wait();
    const depositUsdtTx = await vault.depositUsdt(depositUsdt);
    await depositUsdtTx.wait();
    console.log('✅ USDT deposited!');

    let [vaultMnt, vaultUsdt] = await vault.getUserBalances(wallet.address);
    console.log('\n📊 Your Vault Balances:');
    console.log('   MNT:', ethers.formatEther(vaultMnt));
    console.log('   USDT:', ethers.formatUnits(vaultUsdt, 6));

    await new Promise(resolve => setTimeout(resolve, 3000));

    // ============ TEST 3: Swap MNT -> USDT in Vault ============
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 TEST 3: Swap MNT → USDT (trong Vault)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const swapMnt = ethers.parseEther('5'); // Swap 5 MNT
    
    // Estimate output
    const estimatedUsdt = await vault.estimateSwap(true, swapMnt);
    console.log(`\n💱 Swapping ${ethers.formatEther(swapMnt)} MNT`);
    console.log('   Expected USDT out:', ethers.formatUnits(estimatedUsdt, 6));
    
    const minUsdt = estimatedUsdt * 95n / 100n; // 5% slippage
    
    console.log('📝 Executing swap...');
    const swapTx1 = await vault.swapMntToUsdt(swapMnt, minUsdt);
    const receipt2 = await swapTx1.wait();
    console.log('✅ Swap completed!');
    console.log('📤 TX:', receipt2.hash);

    [vaultMnt, vaultUsdt] = await vault.getUserBalances(wallet.address);
    console.log('\n📊 Vault Balances After Swap:');
    console.log('   MNT:', ethers.formatEther(vaultMnt));
    console.log('   USDT:', ethers.formatUnits(vaultUsdt, 6));

    await new Promise(resolve => setTimeout(resolve, 3000));

    // ============ TEST 4: Swap USDT -> MNT in Vault ============
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 TEST 4: Swap USDT → MNT (trong Vault)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const swapUsdt = ethers.parseUnits('20', 6); // Swap 20 USDT
    
    // Estimate output
    const estimatedMnt = await vault.estimateSwap(false, swapUsdt);
    console.log(`\n💱 Swapping ${ethers.formatUnits(swapUsdt, 6)} USDT`);
    console.log('   Expected MNT out:', ethers.formatEther(estimatedMnt));
    
    const minMnt = estimatedMnt * 95n / 100n; // 5% slippage
    
    console.log('📝 Executing swap...');
    const swapTx2 = await vault.swapUsdtToMnt(swapUsdt, minMnt);
    const receipt3 = await swapTx2.wait();
    console.log('✅ Swap completed!');
    console.log('📤 TX:', receipt3.hash);

    [vaultMnt, vaultUsdt] = await vault.getUserBalances(wallet.address);
    console.log('\n📊 Vault Balances After Swap:');
    console.log('   MNT:', ethers.formatEther(vaultMnt));
    console.log('   USDT:', ethers.formatUnits(vaultUsdt, 6));

    await new Promise(resolve => setTimeout(resolve, 3000));

    // ============ TEST 5: Withdraw from Vault ============
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 TEST 5: Withdraw from Vault');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const withdrawMnt = ethers.parseEther('2'); // Withdraw 2 MNT
    const withdrawUsdt = ethers.parseUnits('10', 6); // Withdraw 10 USDT
    
    console.log(`\n💸 Withdrawing ${ethers.formatEther(withdrawMnt)} MNT...`);
    const withdrawMntTx = await vault.withdrawMnt(withdrawMnt);
    await withdrawMntTx.wait();
    console.log('✅ MNT withdrawn!');
    
    console.log(`💸 Withdrawing ${ethers.formatUnits(withdrawUsdt, 6)} USDT...`);
    const withdrawUsdtTx = await vault.withdrawUsdt(withdrawUsdt);
    await withdrawUsdtTx.wait();
    console.log('✅ USDT withdrawn!');

    [vaultMnt, vaultUsdt] = await vault.getUserBalances(wallet.address);
    console.log('\n📊 Final Vault Balances:');
    console.log('   MNT:', ethers.formatEther(vaultMnt));
    console.log('   USDT:', ethers.formatUnits(vaultUsdt, 6));

    // Final stats
    const [totalMnt, totalUsdt] = await vault.getTotalDeposits();
    console.log('\n📊 Vault Total Deposits:');
    console.log('   Total MNT:', ethers.formatEther(totalMnt));
    console.log('   Total USDT:', ethers.formatUnits(totalUsdt, 6));

    const finalMntReserve = await dex.mntReserve();
    const finalUsdtReserve = await dex.usdtReserve();
    console.log('\n📊 Final DEX State:');
    console.log('   MNT Reserve:', ethers.formatEther(finalMntReserve));
    console.log('   USDT Reserve:', ethers.formatUnits(finalUsdtReserve, 6));

    console.log('\n============================================');
    console.log('✅ ALL V2 TESTS PASSED!');
    console.log('============================================\n');

  } catch (error) {
    console.error('\n❌ Error during testing:', error.message);
    if (error.data) {
      console.error('Error data:', error.data);
    }
    throw error;
  }
}

main().catch(console.error);
