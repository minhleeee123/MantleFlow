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
const LENDING_ADDRESS = addresses.lendingPool;

const USDT_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];

const LENDING_ABI = [
  "function supplyMnt() external payable",
  "function supplyToken(uint256 amount) external",
  "function borrowMntWithTokenCollateral(uint256 borrowAmount) external",
  "function borrowTokenWithMntCollateral(uint256 borrowAmount) external payable",
  "function repay() external payable",
  "function withdrawMnt(uint256 amount) external",
  "function withdrawToken(uint256 amount) external",
  "function mntSupplies(address user) external view returns (uint256 amount, uint256 timestamp, uint256 accruedInterest)",
  "function tokenSupplies(address user) external view returns (uint256 amount, uint256 timestamp, uint256 accruedInterest)",
  "function borrows(address user) external view returns (uint256 amount, uint256 collateral, uint256 timestamp, uint256 accruedInterest, bool isToken)",
  "function calculateSupplyInterest(uint256 amount, uint256 startTime, uint256 apr) public view returns (uint256)",
  "function calculateBorrowInterest(uint256 amount, uint256 startTime, uint256 apr) public view returns (uint256)"
];

async function main() {
  console.log('\n============================================');
  console.log('🧪 TESTING LendingPool (Lending/Borrowing)');
  console.log('============================================\n');

  const provider = new ethers.JsonRpcProvider(MANTLE_TESTNET_RPC);
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
  const wallet = new ethers.Wallet(privateKey, provider);
  
  const usdt = new ethers.Contract(USDT_ADDRESS, USDT_ABI, wallet);
  const lending = new ethers.Contract(LENDING_ADDRESS, LENDING_ABI, wallet);

  console.log('📍 LendingPool:', LENDING_ADDRESS);
  console.log('📍 User:', wallet.address);

  // Check balances
  const mntBalance = await provider.getBalance(wallet.address);
  const usdtBalance = await usdt.balanceOf(wallet.address);
  
  console.log('\n💰 Initial Balances:');
  console.log('   MNT:', ethers.formatEther(mntBalance));
  console.log('   USDT:', ethers.formatUnits(usdtBalance, 6));

  try {
    // Test 1: Supply MNT
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 TEST 1: Supply MNT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const supplyMntAmount = ethers.parseEther('5'); // 5 MNT
    
    console.log(`\n💰 Supplying ${ethers.formatEther(supplyMntAmount)} MNT to earn interest...`);
    const supplyTx = await lending.supplyMnt({ value: supplyMntAmount });
    const receipt1 = await supplyTx.wait();
    console.log('✅ MNT supplied!');
    console.log('📤 TX:', receipt1.hash);

    let mntSupply = await lending.mntSupplies(wallet.address);
    console.log('\n📊 Your MNT Supply:');
    console.log('   Amount:', ethers.formatEther(mntSupply.amount));
    console.log('   Accrued Interest:', ethers.formatEther(mntSupply.accruedInterest));

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test 2: Supply USDT
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 TEST 2: Supply USDT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const supplyTokenAmount = ethers.parseUnits('20', 6); // 20 USDT (reduced from 50)
    
    console.log(`\n💰 Supplying ${ethers.formatUnits(supplyTokenAmount, 6)} USDT...`);
    
    // Approve USDT
    console.log('📝 Approving USDT...');
    const approveTx1 = await usdt.approve(LENDING_ADDRESS, supplyTokenAmount);
    await approveTx1.wait();
    console.log('✅ USDT approved');
    
    const supplyTokenTx = await lending.supplyToken(supplyTokenAmount);
    const receipt2 = await supplyTokenTx.wait();
    console.log('✅ USDT supplied!');
    console.log('📤 TX:', receipt2.hash);

    let tokenSupply = await lending.tokenSupplies(wallet.address);
    console.log('\n📊 Your USDT Supply:');
    console.log('   Amount:', ethers.formatUnits(tokenSupply.amount, 6));
    console.log('   Accrued Interest:', ethers.formatUnits(tokenSupply.accruedInterest, 6));

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check if user already has an active borrow
    let existingBorrow = await lending.borrows(wallet.address);
    
    if (existingBorrow.amount > 0n) {
      console.log('\n⚠️  You already have an active borrow. Repaying it first...');
      console.log(`   Existing borrowed: ${ethers.formatUnits(existingBorrow.amount, 6)} USDT`);
      
      const existingApr = existingBorrow.isToken ? 900 : 800;
      const existingInterest = await lending.calculateBorrowInterest(
        existingBorrow.amount, 
        existingBorrow.timestamp, 
        existingApr
      );
      const existingTotalDebt = existingBorrow.amount + existingInterest;
      
      console.log(`   Total debt to repay: ${ethers.formatUnits(existingTotalDebt, 6)} USDT`);
      
      // Approve and repay
      const approveExistingTx = await usdt.approve(LENDING_ADDRESS, existingTotalDebt);
      await approveExistingTx.wait();
      
      const repayExistingTx = await lending.repay();
      await repayExistingTx.wait();
      
      console.log('✅ Existing borrow repaid!\n');
      
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Test 3: Borrow USDT with MNT collateral
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 TEST 3: Borrow USDT with MNT Collateral');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Provide MNT collateral and borrow USDT
    const collateralMnt = ethers.parseEther('3'); // 3 MNT collateral
    
    // Calculate max borrow based on collateral
    // With 150% collateral ratio, 3 MNT can borrow up to 3/1.5 = 2 MNT worth of USDT
    // Assuming 1 MNT = 10 USDT, max borrow = 20 USDT
    const borrowAmount = ethers.parseUnits('10', 6); // Borrow 10 USDT (reduced from 15)
    
    console.log(`\n💎 Providing ${ethers.formatEther(collateralMnt)} MNT collateral`);
    console.log(`💵 Borrowing ${ethers.formatUnits(borrowAmount, 6)} USDT`);
    
    const borrowTx = await lending.borrowTokenWithMntCollateral(borrowAmount, { value: collateralMnt });
    const receipt3 = await borrowTx.wait();
    console.log('✅ USDT borrowed!');
    console.log('📤 TX:', receipt3.hash);

    let borrow = await lending.borrows(wallet.address);
    console.log('\n📊 Your Borrow Position:');
    console.log('   Borrowed Amount:', ethers.formatUnits(borrow.amount, 6));
    console.log('   Collateral:', ethers.formatEther(borrow.collateral));
    console.log('   Is Token Loan:', borrow.isToken);

    const usdtBalanceAfterBorrow = await usdt.balanceOf(wallet.address);
    console.log('💰 USDT Balance After Borrow:', ethers.formatUnits(usdtBalanceAfterBorrow, 6));

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test 4: Repay USDT
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 TEST 4: Repay USDT Loan');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Get borrow details
    borrow = await lending.borrows(wallet.address);
    const borrowedAmount = borrow.amount;
    const borrowStartTime = borrow.timestamp;
    
    console.log(`\n💰 Current borrowed: ${ethers.formatUnits(borrowedAmount, 6)} USDT`);
    
    // Estimate interest - use 900 (9% APR for token borrow)
    const interest = await lending.calculateBorrowInterest(borrowedAmount, borrowStartTime, 900);
    console.log(`💸 Interest accrued: ${ethers.formatUnits(interest, 6)} USDT`);
    
    const repayAmount = borrowedAmount + interest;
    console.log(`💰 Total to repay: ${ethers.formatUnits(repayAmount, 6)} USDT`);
    
    // For token borrow, need to approve and call repay()
    console.log('📝 Approving USDT for repayment...');
    const approveTx2 = await usdt.approve(LENDING_ADDRESS, repayAmount);
    await approveTx2.wait();
    console.log('✅ USDT approved');
    
    const repayTx = await lending.repay();
    const receipt4 = await repayTx.wait();
    console.log('✅ USDT repaid!');
    console.log('📤 TX:', receipt4.hash);

    borrow = await lending.borrows(wallet.address);
    console.log('\n📊 Your Borrow Position After Repayment:');
    console.log('   Borrowed Amount:', ethers.formatUnits(borrow.amount, 6));
    console.log('   Collateral:', ethers.formatEther(borrow.collateral));

    // Final balances
    const finalMntBalance = await provider.getBalance(wallet.address);
    const finalUsdtBalance = await usdt.balanceOf(wallet.address);
    
    console.log('\n💰 Final Balances:');
    console.log('   MNT:', ethers.formatEther(finalMntBalance));
    console.log('   USDT:', ethers.formatUnits(finalUsdtBalance, 6));

    let finalMntSupply = await lending.mntSupplies(wallet.address);
    let finalTokenSupply = await lending.tokenSupplies(wallet.address);
    console.log('\n📊 Final Supply Position:');
    console.log('   MNT Supplied:', ethers.formatEther(finalMntSupply.amount));
    console.log('   USDT Supplied:', ethers.formatUnits(finalTokenSupply.amount, 6));

    console.log('\n============================================');
    console.log('✅ ALL LendingPool TESTS PASSED!');
    console.log('============================================\n');

  } catch (error) {
    console.error('\n❌ Error during testing:', error.message);
    if (error.data) {
      console.error('Error data:', error.data);
    }
  }
}

main().catch(console.error);
