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
  "function balanceOf(address account) external view returns (uint256)"
];

const DEX_ABI = [
  "function mntReserve() external view returns (uint256)",
  "function usdtReserve() external view returns (uint256)",
  "function totalLiquidity() external view returns (uint256)",
  "function liquidityBalance(address) external view returns (uint256)"
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
  console.log('🧪 TESTING VaultWithSwap');
  console.log('============================================\n');

  const provider = new ethers.JsonRpcProvider(MANTLE_TESTNET_RPC);
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
  const wallet = new ethers.Wallet(privateKey, provider);
  
  const usdt = new ethers.Contract(USDT_ADDRESS, USDT_ABI, wallet);
  const dex = new ethers.Contract(DEX_ADDRESS, DEX_ABI, wallet);
  const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, wallet);

  console.log('📍 DEX:', DEX_ADDRESS);
  console.log('📍 Vault:', VAULT_ADDRESS);
  console.log('📍 User:', wallet.address);

  // Check balances
  const mntBalance = await provider.getBalance(wallet.address);
  const usdtBalance = await usdt.balanceOf(wallet.address);
  
  console.log('\n💰 Wallet Balances:');
  console.log('   MNT:', ethers.formatEther(mntBalance));
  console.log('   USDT:', ethers.formatUnits(usdtBalance, 6));

  // Check DEX state
  const mntReserve = await dex.mntReserve();
  const usdtReserve = await dex.usdtReserve();
  console.log('\n📊 DEX Reserves:');
  console.log('   MNT:', ethers.formatEther(mntReserve));
  console.log('   USDT:', ethers.formatUnits(usdtReserve, 6));

  try {
    // TEST 1: Deposit to Vault
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 TEST 1: Deposit to Vault');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const depositMnt = ethers.parseEther('10');
    const depositUsdt = ethers.parseUnits('50', 6);
    
    console.log(`\n💰 Depositing ${ethers.formatEther(depositMnt)} MNT...`);
    const depositMntTx = await vault.depositMnt({ value: depositMnt });
    await depositMntTx.wait();
    console.log('✅ MNT deposited!');
    
    console.log(`💰 Depositing ${ethers.formatUnits(depositUsdt, 6)} USDT...`);
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

    // TEST 2: Swap MNT -> USDT
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 TEST 2: Swap MNT → USDT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const swapMnt = ethers.parseEther('5');
    const estimatedUsdt = await vault.estimateSwap(true, swapMnt);
    
    console.log(`\n💱 Swapping ${ethers.formatEther(swapMnt)} MNT`);
    console.log('   Expected USDT:', ethers.formatUnits(estimatedUsdt, 6));
    
    const minUsdt = estimatedUsdt * 95n / 100n;
    const swapTx1 = await vault.swapMntToUsdt(swapMnt, minUsdt);
    await swapTx1.wait();
    console.log('✅ Swap completed!');

    [vaultMnt, vaultUsdt] = await vault.getUserBalances(wallet.address);
    console.log('\n📊 Vault Balances After Swap:');
    console.log('   MNT:', ethers.formatEther(vaultMnt));
    console.log('   USDT:', ethers.formatUnits(vaultUsdt, 6));

    await new Promise(resolve => setTimeout(resolve, 3000));

    // TEST 3: Swap USDT -> MNT
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 TEST 3: Swap USDT → MNT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const swapUsdt = ethers.parseUnits('20', 6);
    const estimatedMnt = await vault.estimateSwap(false, swapUsdt);
    
    console.log(`\n💱 Swapping ${ethers.formatUnits(swapUsdt, 6)} USDT`);
    console.log('   Expected MNT:', ethers.formatEther(estimatedMnt));
    
    const minMnt = estimatedMnt * 95n / 100n;
    const swapTx2 = await vault.swapUsdtToMnt(swapUsdt, minMnt);
    await swapTx2.wait();
    console.log('✅ Swap completed!');

    [vaultMnt, vaultUsdt] = await vault.getUserBalances(wallet.address);
    console.log('\n📊 Vault Balances After Swap:');
    console.log('   MNT:', ethers.formatEther(vaultMnt));
    console.log('   USDT:', ethers.formatUnits(vaultUsdt, 6));

    await new Promise(resolve => setTimeout(resolve, 3000));

    // TEST 4: Withdraw
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 TEST 4: Withdraw from Vault');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const withdrawMnt = ethers.parseEther('2');
    const withdrawUsdt = ethers.parseUnits('10', 6);
    
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

    const [totalMnt, totalUsdt] = await vault.getTotalDeposits();
    console.log('\n📊 Vault Total Deposits:');
    console.log('   Total MNT:', ethers.formatEther(totalMnt));
    console.log('   Total USDT:', ethers.formatUnits(totalUsdt, 6));

    console.log('\n============================================');
    console.log('✅ ALL VAULT TESTS PASSED!');
    console.log('============================================\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  }
}

main().catch(console.error);
