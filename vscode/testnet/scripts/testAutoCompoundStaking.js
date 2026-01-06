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
const addressesPath = join(__dirname, '..', 'addresses.json');
const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
const STAKING_ADDRESS = addresses.autoCompoundStaking;

const USDT_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];

const STAKING_ABI = [
  "function stake(uint256 amount, bool enableAutoCompound) external",
  "function unstake(uint256 amount) external",
  "function compound() external",
  "function toggleAutoCompound() external",
  "function claimRewards() external",
  "function depositRewards(uint256 amount) external",
  "function stakes(address user) external view returns (uint256 amount, uint256 startTime, uint256 lastCompoundTime, uint256 totalCompounded, uint256 manualRewardsClaimed, bool autoCompound)",
  "function calculateRewards(address user) external view returns (uint256)",
  "function calculateRewardsWithBonus(address user) external view returns (uint256)",
  "function getProjectedValue(address user, uint256 daysAhead) external view returns (uint256)",
  "function getUserInfo(address user) external view returns (uint256 stakedAmount, uint256 pendingRewards, uint256 totalCompounded, uint256 manualClaimed, bool autoCompoundEnabled, uint256 stakingDuration)",
  "function getPoolStats() external view returns (uint256 _totalStaked, uint256 _totalCompounded, uint256 _apr, uint256 _compoundBonus, uint256 availableRewards)"
];

async function main() {
  console.log('\n============================================');
  console.log('🧪 TESTING AutoCompoundStaking');
  console.log('============================================\n');

  const provider = new ethers.JsonRpcProvider(MANTLE_TESTNET_RPC);
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
  const wallet = new ethers.Wallet(privateKey, provider);
  
  const usdt = new ethers.Contract(USDT_ADDRESS, USDT_ABI, wallet);
  const staking = new ethers.Contract(STAKING_ADDRESS, STAKING_ABI, wallet);

  console.log('📍 Staking Contract:', STAKING_ADDRESS);
  console.log('📍 User:', wallet.address);

  // Check balances
  const mntBalance = await provider.getBalance(wallet.address);
  const usdtBalance = await usdt.balanceOf(wallet.address);
  
  console.log('\n💰 Initial Balances:');
  console.log('   MNT:', ethers.formatEther(mntBalance));
  console.log('   USDT:', ethers.formatUnits(usdtBalance, 6));

  // Check pool stats
  const poolStats = await staking.getPoolStats();
  console.log('\n📊 Pool Statistics:');
  console.log('   Total Staked:', ethers.formatUnits(poolStats._totalStaked, 6), 'USDT');
  console.log('   Total Compounded:', ethers.formatUnits(poolStats._totalCompounded, 6), 'USDT');
  console.log('   APR:', poolStats._apr.toString() + '%');
  console.log('   Compound Bonus:', poolStats._compoundBonus.toString() + '%');
  console.log('   Available Rewards:', ethers.formatUnits(poolStats.availableRewards, 6), 'USDT');

  try {
    // First, deposit rewards into the pool if needed
    const currentBalance = await usdt.balanceOf(wallet.address);
    const rewardAmount = ethers.parseUnits('5', 6); // Reduced to 5 USDT
    
    if (poolStats.availableRewards < ethers.parseUnits('5', 6) && currentBalance >= rewardAmount) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📝 SETUP: Depositing Rewards to Pool');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      console.log(`\n💰 Depositing ${ethers.formatUnits(rewardAmount, 6)} USDT as rewards...`);
      
      const approveRewardsTx = await usdt.approve(STAKING_ADDRESS, rewardAmount);
      await approveRewardsTx.wait();
      console.log('✅ USDT approved');
      
      const depositRewardsTx = await staking.depositRewards(rewardAmount);
      await depositRewardsTx.wait();
      console.log('✅ Rewards deposited!');
      
      await new Promise(resolve => setTimeout(resolve, 3000));
    } else if (currentBalance < rewardAmount) {
      console.log('\n⚠️  Insufficient USDT to deposit rewards. Skipping reward setup.');
      console.log('   Available:', ethers.formatUnits(currentBalance, 6), 'USDT');
      console.log('   Needed:', ethers.formatUnits(rewardAmount, 6), 'USDT\n');
    }

    // Test 1: Stake with Auto-Compound
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 TEST 1: Stake with Auto-Compound Enabled');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Check available balance for staking
    const availableBalance = await usdt.balanceOf(wallet.address);
    console.log(`\n💰 Available USDT: ${ethers.formatUnits(availableBalance, 6)}`);
    
    if (availableBalance < ethers.parseUnits('1', 6)) {
      console.log('⚠️  Insufficient USDT balance for testing. Need at least 1 USDT.');
      console.log('\n============================================');
      console.log('⚠️  AutoCompoundStaking TESTS SKIPPED (Insufficient Balance)');
      console.log('============================================\n');
      return;
    }
    
    const stakeAmount = availableBalance / 2n; // Stake half of available balance
    
    console.log(`\n💎 Staking ${ethers.formatUnits(stakeAmount, 6)} USDT with auto-compound enabled...`);
    
    // Approve USDT
    console.log('📝 Approving USDT...');
    const approveTx = await usdt.approve(STAKING_ADDRESS, stakeAmount);
    await approveTx.wait();
    console.log('✅ USDT approved');
    
    // Stake with auto-compound enabled
    console.log('📝 Staking...');
    const stakeTx = await staking.stake(stakeAmount, true);
    const receipt1 = await stakeTx.wait();
    console.log('✅ Staked with auto-compound!');
    console.log('📤 TX:', receipt1.hash);

    let userInfo = await staking.getUserInfo(wallet.address);
    console.log('\n📊 Your Staking Position:');
    console.log('   Staked Amount:', ethers.formatUnits(userInfo.stakedAmount, 6), 'USDT');
    console.log('   Pending Rewards:', ethers.formatUnits(userInfo.pendingRewards, 6), 'USDT');
    console.log('   Total Compounded:', ethers.formatUnits(userInfo.totalCompounded, 6), 'USDT');
    console.log('   Auto-Compound:', userInfo.autoCompoundEnabled ? '✅ Enabled' : '❌ Disabled');

    // Wait a bit for rewards to accrue
    console.log('\n⏳ Waiting 5 seconds for rewards to accrue...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Test 2: Check Projected Value
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 TEST 2: Check Projected Value');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const projections = [30, 90, 365]; // 1 month, 3 months, 1 year
    
    console.log('\n📈 Projected Value with Auto-Compound:');
    for (const days of projections) {
      const projected = await staking.getProjectedValue(wallet.address, days);
      console.log(`   After ${days} days: ${ethers.formatUnits(projected, 6)} USDT`);
    }

    // Test 3: Manual Compound
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 TEST 3: Manual Compound');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const rewardsBefore = await staking.calculateRewardsWithBonus(wallet.address);
    console.log(`\n💰 Rewards with bonus: ${ethers.formatUnits(rewardsBefore, 6)} USDT`);
    
    console.log('📝 Compounding rewards...');
    const compoundTx = await staking.compound();
    const receipt2 = await compoundTx.wait();
    console.log('✅ Rewards compounded!');
    console.log('📤 TX:', receipt2.hash);

    userInfo = await staking.getUserInfo(wallet.address);
    console.log('\n📊 After Compound:');
    console.log('   Staked Amount:', ethers.formatUnits(userInfo.stakedAmount, 6), 'USDT');
    console.log('   Pending Rewards:', ethers.formatUnits(userInfo.pendingRewards, 6), 'USDT');
    console.log('   Total Compounded:', ethers.formatUnits(userInfo.totalCompounded, 6), 'USDT');

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test 4: Toggle Auto-Compound
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 TEST 4: Toggle Auto-Compound OFF');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n📝 Turning OFF auto-compound...');
    const toggleTx = await staking.toggleAutoCompound();
    const receipt3 = await toggleTx.wait();
    console.log('✅ Auto-compound toggled!');
    console.log('📤 TX:', receipt3.hash);

    userInfo = await staking.getUserInfo(wallet.address);
    console.log('   Auto-Compound:', userInfo.autoCompoundEnabled ? '✅ Enabled' : '❌ Disabled');

    // Test 5: Claim Manual Rewards
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 TEST 5: Claim Manual Rewards');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Wait a bit more for new rewards
    console.log('\n⏳ Waiting 5 seconds for rewards to accrue...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const pendingRewards = await staking.calculateRewards(wallet.address);
    console.log(`\n💰 Pending rewards: ${ethers.formatUnits(pendingRewards, 6)} USDT`);
    
    if (pendingRewards > 0n) {
      console.log('📝 Claiming rewards...');
      const claimTx = await staking.claimRewards();
      const receipt4 = await claimTx.wait();
      console.log('✅ Rewards claimed!');
      console.log('📤 TX:', receipt4.hash);

      const usdtBalanceAfterClaim = await usdt.balanceOf(wallet.address);
      console.log('💰 USDT Balance After Claim:', ethers.formatUnits(usdtBalanceAfterClaim, 6));
    } else {
      console.log('⚠️  No rewards to claim yet');
    }

    // Final stats
    userInfo = await staking.getUserInfo(wallet.address);
    console.log('\n📊 Final Staking Position:');
    console.log('   Staked Amount:', ethers.formatUnits(userInfo.stakedAmount, 6), 'USDT');
    console.log('   Pending Rewards:', ethers.formatUnits(userInfo.pendingRewards, 6), 'USDT');
    console.log('   Total Compounded:', ethers.formatUnits(userInfo.totalCompounded, 6), 'USDT');
    console.log('   Manual Claimed:', ethers.formatUnits(userInfo.manualClaimed, 6), 'USDT');
    console.log('   Staking Duration:', userInfo.stakingDuration.toString(), 'seconds');

    const finalPoolStats = await staking.getPoolStats();
    console.log('\n📊 Final Pool Statistics:');
    console.log('   Total Staked:', ethers.formatUnits(finalPoolStats._totalStaked, 6), 'USDT');
    console.log('   Total Compounded:', ethers.formatUnits(finalPoolStats._totalCompounded, 6), 'USDT');

    console.log('\n============================================');
    console.log('✅ ALL AutoCompoundStaking TESTS PASSED!');
    console.log('============================================\n');

  } catch (error) {
    console.error('\n❌ Error during testing:', error.message);
    if (error.data) {
      console.error('Error data:', error.data);
    }
  }
}

main().catch(console.error);
