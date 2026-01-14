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

// Load deployed addresses
const addressesPath = join(__dirname, '..', 'addressesV3.json');
const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));

const VAULT_ABI = [
    // Deposit/Withdraw
    'function depositMnt() external payable',
    'function depositUsdt(uint256 amount) external',
    'function withdrawMnt(uint256 amount) external',
    'function withdrawUsdt(uint256 amount) external',

    // User Swap
    'function swapMntToUsdt(uint256 mntAmount, uint256 minUsdtOut) external',
    'function swapUsdtToMnt(uint256 usdtAmount, uint256 minMntOut) external',

    // View functions
    'function getUserBalances(address user) external view returns (uint256 mnt, uint256 usdt)',
    'function estimateSwap(bool mntToUsdt, uint256 amountIn) external view returns (uint256)',
    'function getTotalDeposits() external view returns (uint256 mnt, uint256 usdt)',

    // Bot authorization (NEW)
    'function authorizeBot(address bot, bool status) external',
    'function isBotAuthorized(address user, address bot) external view returns (bool)',

    // Bot swap (NEW)
    'function executeSwapMntToUsdtForUser(address user, uint256 mntAmount, uint256 minUsdtOut) external',
    'function executeSwapUsdtToMntForUser(address user, uint256 usdtAmount, uint256 minMntOut) external',

    // Events
    'event MntDeposited(address indexed user, uint256 amount)',
    'event MntWithdrawn(address indexed user, uint256 amount)',
    'event Swapped(address indexed user, bool mntToUsdt, uint256 amountIn, uint256 amountOut)',
    'event BotAuthorized(address indexed user, address indexed bot, bool status)',
    'event SwappedByBot(address indexed user, address indexed bot, bool mntToUsdt, uint256 amountIn, uint256 amountOut)'
];

async function main() {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║     🧪 COMPREHENSIVE TEST - VAULTWITHSWAP V3          ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    const provider = new ethers.JsonRpcProvider(MANTLE_TESTNET_RPC);

    // User wallet
    const userPrivateKey = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
    const userWallet = new ethers.Wallet(userPrivateKey, provider);

    console.log('📍 Contract Address:', addresses.vaultWithSwap);
    console.log('👤 User Address:', userWallet.address);

    const userBalance = await provider.getBalance(userWallet.address);
    console.log('💰 User MNT Balance:', ethers.formatEther(userBalance), 'MNT\n');

    const vault = new ethers.Contract(addresses.vaultWithSwap, VAULT_ABI, userWallet);

    let testsPassed = 0;
    let testsFailed = 0;

    try {
        // ============ TEST 1: Deposit MNT ============
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📥 TEST 1: Deposit MNT');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        let [mntBal, usdtBal] = await vault.getUserBalances(userWallet.address);
        console.log('Before deposit:');
        console.log(`  MNT in vault: ${ethers.formatEther(mntBal)}`);
        console.log(`  USDT in vault: ${ethers.formatUnits(usdtBal, 6)}`);

        const depositAmount = ethers.parseEther('1.0');
        console.log(`\n💸 Depositing ${ethers.formatEther(depositAmount)} MNT...`);
        const depositTx = await vault.depositMnt({ value: depositAmount });
        await depositTx.wait();

        [mntBal, usdtBal] = await vault.getUserBalances(userWallet.address);
        console.log('After deposit:');
        console.log(`  MNT in vault: ${ethers.formatEther(mntBal)}`);

        if (mntBal >= depositAmount) {
            console.log('✅ TEST 1 PASSED');
            testsPassed++;
        } else {
            console.log('❌ TEST 1 FAILED');
            testsFailed++;
        }
        console.log();

        // ============ TEST 2: Estimate Swap ============
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔍 TEST 2: Estimate Swap');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const swapAmount = ethers.parseEther('0.5');
        console.log(`Estimating: ${ethers.formatEther(swapAmount)} MNT → USDT`);
        const estimatedOut = await vault.estimateSwap(true, swapAmount);
        console.log(`Estimated output: ${ethers.formatUnits(estimatedOut, 6)} USDT`);

        if (estimatedOut > 0) {
            console.log('✅ TEST 2 PASSED');
            testsPassed++;
        } else {
            console.log('❌ TEST 2 FAILED');
            testsFailed++;
        }
        console.log();

        // ============ TEST 3: User Swap MNT → USDT ============
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔄 TEST 3: User Swap MNT → USDT');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        [mntBal, usdtBal] = await vault.getUserBalances(userWallet.address);
        console.log('Before swap:');
        console.log(`  MNT: ${ethers.formatEther(mntBal)}`);
        console.log(`  USDT: ${ethers.formatUnits(usdtBal, 6)}`);

        const minOut = (estimatedOut * 95n) / 100n; // 5% slippage
        console.log(`\n💱 Swapping ${ethers.formatEther(swapAmount)} MNT...`);
        const swapTx = await vault.swapMntToUsdt(swapAmount, minOut);
        const swapReceipt = await swapTx.wait();

        [mntBal, usdtBal] = await vault.getUserBalances(userWallet.address);
        console.log('After swap:');
        console.log(`  MNT: ${ethers.formatEther(mntBal)}`);
        console.log(`  USDT: ${ethers.formatUnits(usdtBal, 6)}`);

        // Check event
        const swapEvent = swapReceipt.logs.find(log => {
            try {
                return vault.interface.parseLog(log)?.name === 'Swapped';
            } catch { return false; }
        });

        if (swapEvent && usdtBal > 0) {
            const parsed = vault.interface.parseLog(swapEvent);
            console.log('\n📊 Swap Event:');
            console.log(`  Amount In: ${ethers.formatEther(parsed.args.amountIn)} MNT`);
            console.log(`  Amount Out: ${ethers.formatUnits(parsed.args.amountOut, 6)} USDT`);
            console.log('✅ TEST 3 PASSED');
            testsPassed++;
        } else {
            console.log('❌ TEST 3 FAILED');
            testsFailed++;
        }
        console.log();

        // ============ TEST 4: Get Total Deposits ============
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 TEST 4: Get Total Deposits');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const [totalMnt, totalUsdt] = await vault.getTotalDeposits();
        console.log(`Total MNT deposited: ${ethers.formatEther(totalMnt)}`);
        console.log(`Total USDT deposited: ${ethers.formatUnits(totalUsdt, 6)}`);

        if (totalMnt > 0 || totalUsdt > 0) {
            console.log('✅ TEST 4 PASSED');
            testsPassed++;
        } else {
            console.log('❌ TEST 4 FAILED');
            testsFailed++;
        }
        console.log();

        // ============ TEST 5: Bot Authorization ============
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🤖 TEST 5: Bot Authorization');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Generate test bot wallet
        const testBot = ethers.Wallet.createRandom();
        console.log('Test Bot Address:', testBot.address);

        // Check initial state
        let isAuthorized = await vault.isBotAuthorized(userWallet.address, testBot.address);
        console.log(`Bot authorized (before): ${isAuthorized}`);

        // Authorize bot
        console.log('\n🔓 Authorizing bot...');
        const authTx = await vault.authorizeBot(testBot.address, true);
        const authReceipt = await authTx.wait();

        // Check event
        const authEvent = authReceipt.logs.find(log => {
            try {
                return vault.interface.parseLog(log)?.name === 'BotAuthorized';
            } catch { return false; }
        });

        if (authEvent) {
            const parsed = vault.interface.parseLog(authEvent);
            console.log('\n📊 BotAuthorized Event:');
            console.log(`  User: ${parsed.args.user}`);
            console.log(`  Bot: ${parsed.args.bot}`);
            console.log(`  Status: ${parsed.args.status}`);
        }

        isAuthorized = await vault.isBotAuthorized(userWallet.address, testBot.address);
        console.log(`Bot authorized (after): ${isAuthorized}`);

        if (isAuthorized) {
            console.log('✅ TEST 5 PASSED');
            testsPassed++;
        } else {
            console.log('❌ TEST 5 FAILED');
            testsFailed++;
        }
        console.log();

        // ============ TEST 6: Bot Swap for User ============
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🤖 TEST 6: Bot Swap for User (Delegated Swap)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Fund bot with MNT for gas
        console.log('💸 Funding bot with gas (0.01 MNT)...');
        const fundTx = await userWallet.sendTransaction({
            to: testBot.address,
            value: ethers.parseEther('0.01')
        });
        await fundTx.wait();
        console.log('✅ Bot funded');

        // Connect bot to vault
        const botVault = vault.connect(testBot.connect(provider));

        [mntBal, usdtBal] = await vault.getUserBalances(userWallet.address);
        console.log('\nUser balance before bot swap:');
        console.log(`  MNT: ${ethers.formatEther(mntBal)}`);
        console.log(`  USDT: ${ethers.formatUnits(usdtBal, 6)}`);

        // Bot swaps USDT back to MNT for user
        const usdtSwapAmount = usdtBal / 2n; // Swap half of USDT
        console.log(`\n🤖 Bot swapping ${ethers.formatUnits(usdtSwapAmount, 6)} USDT → MNT for user...`);

        const botSwapTx = await botVault.executeSwapUsdtToMntForUser(
            userWallet.address,
            usdtSwapAmount,
            0 // No slippage check for test
        );
        const botSwapReceipt = await botSwapTx.wait();

        // Check event
        const botSwapEvent = botSwapReceipt.logs.find(log => {
            try {
                return vault.interface.parseLog(log)?.name === 'SwappedByBot';
            } catch { return false; }
        });

        if (botSwapEvent) {
            const parsed = vault.interface.parseLog(botSwapEvent);
            console.log('\n📊 SwappedByBot Event:');
            console.log(`  User: ${parsed.args.user}`);
            console.log(`  Bot: ${parsed.args.bot}`);
            console.log(`  USDT → MNT: ${!parsed.args.mntToUsdt}`);
            console.log(`  Amount In: ${ethers.formatUnits(parsed.args.amountIn, 6)} USDT`);
            console.log(`  Amount Out: ${ethers.formatEther(parsed.args.amountOut)} MNT`);
        }

        [mntBal, usdtBal] = await vault.getUserBalances(userWallet.address);
        console.log('\nUser balance after bot swap:');
        console.log(`  MNT: ${ethers.formatEther(mntBal)}`);
        console.log(`  USDT: ${ethers.formatUnits(usdtBal, 6)}`);

        if (botSwapEvent) {
            console.log('✅ TEST 6 PASSED');
            testsPassed++;
        } else {
            console.log('❌ TEST 6 FAILED');
            testsFailed++;
        }
        console.log();

        // ============ TEST 7: Revoke Bot Authorization ============
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔒 TEST 7: Revoke Bot Authorization');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        console.log('🔐 Revoking bot authorization...');
        const revokeTx = await vault.authorizeBot(testBot.address, false);
        await revokeTx.wait();

        isAuthorized = await vault.isBotAuthorized(userWallet.address, testBot.address);
        console.log(`Bot authorized (after revoke): ${isAuthorized}`);

        if (!isAuthorized) {
            console.log('✅ TEST 7 PASSED');
            testsPassed++;
        } else {
            console.log('❌ TEST 7 FAILED');
            testsFailed++;
        }
        console.log();

        // ============ SUMMARY ============
        console.log('\n╔════════════════════════════════════════════════════════╗');
        console.log('║                    TEST SUMMARY                        ║');
        console.log('╚════════════════════════════════════════════════════════╝');
        console.log(`\n✅ Tests Passed: ${testsPassed}/${testsPassed + testsFailed}`);
        console.log(`❌ Tests Failed: ${testsFailed}/${testsPassed + testsFailed}`);

        if (testsFailed === 0) {
            console.log('\n🎉 ALL TESTS PASSED! Contract is working perfectly!');
            console.log('\n✨ Verified Features:');
            console.log('  ✅ Deposit MNT');
            console.log('  ✅ Estimate swap output');
            console.log('  ✅ User swap MNT → USDT');
            console.log('  ✅ Get total deposits');
            console.log('  ✅ Bot authorization');
            console.log('  ✅ Bot delegated swap');
            console.log('  ✅ Revoke bot authorization');
        } else {
            console.log('\n⚠️ Some tests failed. Please review.');
        }

        console.log('\n🔗 Contract Explorer:');
        console.log(`https://explorer.sepolia.mantle.xyz/address/${addresses.vaultWithSwap}`);
        console.log('╚════════════════════════════════════════════════════════╝\n');

    } catch (error) {
        console.error('\n❌ Test suite failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
