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
    'function depositMnt() external payable',
    'function withdrawMnt(uint256 amount) external',
    'function getUserBalances(address user) external view returns (uint256 mnt, uint256 usdt)',
    'function getTotalDeposits() external view returns (uint256 mnt, uint256 usdt)',
    'function authorizeBot(address bot, bool status) external',
    'function isBotAuthorized(address user, address bot) external view returns (bool)',
    'event MntDeposited(address indexed user, uint256 amount)',
    'event MntWithdrawn(address indexed user, uint256 amount)',
    'event BotAuthorized(address indexed user, address indexed bot, bool status)'
];

async function main() {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║        🧪 VAULTWITHSWAP V3 - BASIC TESTS              ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    const provider = new ethers.JsonRpcProvider(MANTLE_TESTNET_RPC);
    const userPrivateKey = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
    const userWallet = new ethers.Wallet(userPrivateKey, provider);

    console.log('📍 Contract:', addresses.vaultWithSwap);
    console.log('👤 User:', userWallet.address);
    console.log('🔗 Explorer:', `https://explorer.sepolia.mantle.xyz/address/${addresses.vaultWithSwap}\n`);

    const vault = new ethers.Contract(addresses.vaultWithSwap, VAULT_ABI, userWallet);

    let passed = 0;
    let failed = 0;

    try {
        // TEST 1: View Functions
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 TEST 1: View Functions');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const [userMnt, userUsdt] = await vault.getUserBalances(userWallet.address);
        console.log(`User balances:`);
        console.log(`  MNT: ${ethers.formatEther(userMnt)}`);
        console.log(`  USDT: ${ethers.formatUnits(userUsdt, 6)}`);

        const [totalMnt, totalUsdt] = await vault.getTotalDeposits();
        console.log(`Total deposits:`);
        console.log(`  MNT: ${ethers.formatEther(totalMnt)}`);
        console.log(`  USDT: ${ethers.formatUnits(totalUsdt, 6)}`);
        console.log('✅ TEST 1 PASSED\n');
        passed++;

        // TEST 2: Deposit
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📥 TEST 2: Deposit MNT');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const depositAmount = ethers.parseEther('0.1');
        console.log(`💸 Depositing ${ethers.formatEther(depositAmount)} MNT...`);
        const depositTx = await vault.depositMnt({ value: depositAmount });
        console.log(`TX: ${depositTx.hash}`);

        const depositReceipt = await depositTx.wait();
        console.log(`✅ Confirmed in block ${depositReceipt.blockNumber}`);

        const [newMnt] = await vault.getUserBalances(userWallet.address);
        console.log(`New balance: ${ethers.formatEther(newMnt)} MNT`);

        if (newMnt >= userMnt + depositAmount) {
            console.log('✅ TEST 2 PASSED\n');
            passed++;
        } else {
            console.log('❌ TEST 2 FAILED\n');
            failed++;
        }

        // TEST 3: Withdraw
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📤 TEST 3: Withdraw MNT');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const withdrawAmount = ethers.parseEther('0.05');
        console.log(`💰 Withdrawing ${ethers.formatEther(withdrawAmount)} MNT...`);
        const withdrawTx = await vault.withdrawMnt(withdrawAmount);
        console.log(`TX: ${withdrawTx.hash}`);

        const withdrawReceipt = await withdrawTx.wait();
        console.log(`✅ Confirmed in block ${withdrawReceipt.blockNumber}`);

        const [finalMnt] = await vault.getUserBalances(userWallet.address);
        console.log(`New balance: ${ethers.formatEther(finalMnt)} MNT`);

        if (finalMnt < newMnt) {
            console.log('✅ TEST 3 PASSED\n');
            passed++;
        } else {
            console.log('❌ TEST 3 FAILED\n');
            failed++;
        }

        // TEST 4: Bot Authorization
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🤖 TEST 4: Bot Authorization (NEW FEATURE)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const testBot = ethers.Wallet.createRandom();
        console.log(`Test Bot: ${testBot.address}`);

        let isAuth = await vault.isBotAuthorized(userWallet.address, testBot.address);
        console.log(`Initial status: ${isAuth ? 'Authorized' : 'Not Authorized'}`);

        console.log(`\n🔓 Authorizing bot...`);
        const authTx = await vault.authorizeBot(testBot.address, true);
        console.log(`TX: ${authTx.hash}`);

        const authReceipt = await authTx.wait();
        console.log(`✅ Confirmed in block ${authReceipt.blockNumber}`);

        // Check event
        const authEvent = authReceipt.logs.find(log => {
            try {
                return vault.interface.parseLog(log)?.name === 'BotAuthorized';
            } catch { return false; }
        });

        if (authEvent) {
            const parsed = vault.interface.parseLog(authEvent);
            console.log(`\n📊 Event BotAuthorized:`);
            console.log(`  User: ${parsed.args.user}`);
            console.log(`  Bot: ${parsed.args.bot}`);
            console.log(`  Status: ${parsed.args.status}`);
        }

        isAuth = await vault.isBotAuthorized(userWallet.address, testBot.address);
        console.log(`\nFinal status: ${isAuth ? '✅ Authorized' : '❌ Not Authorized'}`);

        if (isAuth) {
            console.log('✅ TEST 4 PASSED\n');
            passed++;
        } else {
            console.log('❌ TEST 4 FAILED\n');
            failed++;
        }

        // TEST 5: Revoke Authorization
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔒 TEST 5: Revoke Bot Authorization');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        console.log(`🔐 Revoking bot access...`);
        const revokeTx = await vault.authorizeBot(testBot.address, false);
        console.log(`TX: ${revokeTx.hash}`);

        await revokeTx.wait();

        isAuth = await vault.isBotAuthorized(userWallet.address, testBot.address);
        console.log(`Status: ${isAuth ? '❌ Still Authorized' : '✅ Revoked'}`);

        if (!isAuth) {
            console.log('✅ TEST 5 PASSED\n');
            passed++;
        } else {
            console.log('❌ TEST 5 FAILED\n');
            failed++;
        }

        // SUMMARY
        console.log('╔════════════════════════════════════════════════════════╗');
        console.log('║                    TEST SUMMARY                        ║');
        console.log('╚════════════════════════════════════════════════════════╝');
        console.log(`\n✅ Passed: ${passed}/${passed + failed}`);
        console.log(`❌ Failed: ${failed}/${passed + failed}`);

        if (failed === 0) {
            console.log('\n🎉 ALL TESTS PASSED!');
            console.log('\n✨ Verified Features:');
            console.log('  ✅ View user balances');
            console.log('  ✅ View total deposits');
            console.log('  ✅ Deposit MNT');
            console.log('  ✅ Withdraw MNT');
            console.log('  ✅ Authorize bot (NEW)');
            console.log('  ✅ Revoke bot authorization (NEW)');
            console.log('\n📝 Note: Swap functions require DEX liquidity.');
            console.log('     Bot delegated swap requires authorized bot.');
            console.log('     These can be tested in Backend V3 integration tests.');
        }

        console.log('\n╚════════════════════════════════════════════════════════╝\n');

    } catch (error) {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch(console.error);
