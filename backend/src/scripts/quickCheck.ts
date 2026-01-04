import { ethers } from 'ethers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function quickCheck() {
    const user = await prisma.user.findFirst();
    const provider = new ethers.JsonRpcProvider('https://rpc.sepolia.mantle.xyz');
    const balance = await provider.getBalance(user!.walletAddress);

    console.log('='.repeat(60));
    console.log('💰 SMART CONTRACT WALLET STATUS');
    console.log('='.repeat(60));
    console.log('📍 Address:', user!.walletAddress);
    console.log('💵 Native MNT Balance:', ethers.formatEther(balance), 'MNT');
    console.log('');

    const txCount = await prisma.transaction.count({ where: { userId: user!.id } });
    const triggerCount = await prisma.trigger.count({ where: { userId: user!.id } });

    console.log('📊 Account Activity:');
    console.log('   Total Triggers:', triggerCount);
    console.log('   Total Transactions:', txCount);
    console.log('');

    const recentTxs = await prisma.transaction.findMany({
        where: { userId: user!.id },
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    if (recentTxs.length > 0) {
        console.log('📜 Last 5 Transactions:');
        recentTxs.forEach((tx, i) => {
            console.log(`   ${i + 1}. ${tx.type.padEnd(4)} ${String(tx.amount).padEnd(6)} ${tx.token.padEnd(6)} | ${tx.status}`);
            console.log(`      TX: ${tx.txHash?.substring(0, 16)}...`);
        });
    }
    console.log('='.repeat(60));

    await prisma.$disconnect();
}

quickCheck();
