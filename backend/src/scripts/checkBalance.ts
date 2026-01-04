import { ethers } from 'ethers';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MANTLE_RPC = process.env.MANTLE_RPC || 'https://rpc.sepolia.mantle.xyz';
const WMNT_ADDRESS = '0x514528de7275e6e0e8f4083499474aa96eb84306'; // lowercase to avoid checksum error

const prisma = new PrismaClient();

async function checkBalance() {
    try {
        // Get user info
        const user = await prisma.user.findFirst();

        if (!user) {
            console.log('❌ No user found in database');
            return;
        }

        console.log('👤 User Info:');
        console.log('   ID:', user.id);
        console.log('   Wallet:', user.walletAddress);
        console.log('   Email:', user.email || 'Not configured');
        console.log('   Created:', user.createdAt);
        console.log('');

        // Stats
        const triggerCount = await prisma.trigger.count({ where: { userId: user.id } });
        const activeTriggersCount = await prisma.trigger.count({ where: { userId: user.id, status: 'ACTIVE' } });
        const txCount = await prisma.transaction.count({ where: { userId: user.id } });

        console.log('📊 Account Stats:');
        console.log('   Total Triggers:', triggerCount);
        console.log('   Active Triggers:', activeTriggersCount);
        console.log('   Total Transactions:', txCount);
        console.log('');

        // Check blockchain balance
        const provider = new ethers.JsonRpcProvider(MANTLE_RPC);
        const walletAddr = ethers.getAddress(user.walletAddress); // Ensure proper checksum
        const nativeBal = await provider.getBalance(walletAddr);

        console.log('💰 Smart Contract Wallet Balance:');
        console.log('   Address:', walletAddr);
        console.log('   Native MNT:', ethers.formatEther(nativeBal));

        // Try to get WMNT balance
        try {
            const wmntAddr = ethers.getAddress(WMNT_ADDRESS);
            const wmntContract = new ethers.Contract(
                wmntAddr,
                ['function balanceOf(address) view returns (uint256)'],
                provider
            );
            const wrappedBal = await wmntContract.balanceOf(walletAddr);
            console.log('   Wrapped MNT (WMNT):', ethers.formatEther(wrappedBal));

            const totalMnt = nativeBal + wrappedBal;
            console.log('   ───────────────────');
            console.log('   Total:', ethers.formatEther(totalMnt), 'MNT');
        } catch (error: any) {
            console.log('   Wrapped MNT (WMNT): Unable to query');
            console.log('   ───────────────────');
            console.log('   Total (Native only):', ethers.formatEther(nativeBal), 'MNT');
        }
        console.log('');

        // Recent transactions
        const recentTxs = await prisma.transaction.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 3
        });

        if (recentTxs.length > 0) {
            console.log('📜 Recent Transactions:');
            recentTxs.forEach((tx, idx) => {
                console.log(`   ${idx + 1}. ${tx.type} ${tx.amount} ${tx.token} - ${tx.status}`);
                console.log(`      TX: ${tx.txHash?.slice(0, 20)}...`);
                console.log(`      Time: ${tx.createdAt}`);
            });
        }

        await prisma.$disconnect();
    } catch (error) {
        console.error('❌ Error:', error);
        await prisma.$disconnect();
    }
}

checkBalance();
