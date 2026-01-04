import { PrismaClient } from '@prisma/client';
import { getSmartWalletAddress, getUserBalance } from '../services/blockchain';
import { ethers } from 'ethers';

const prisma = new PrismaClient();

async function checkSmartWallet() {
    try {
        const user = await prisma.user.findFirst();

        if (!user) {
            console.log('❌ No user found');
            return;
        }

        console.log('='.repeat(70));
        console.log('🔍 LOCATING SMART CONTRACT WALLET');
        console.log('='.repeat(70));
        console.log('');
        console.log('👤 MetaMask Address (EOA):', user.walletAddress);
        console.log('');

        // Get Smart Wallet address from Factory
        const smartWalletAddr = await getSmartWalletAddress(user.walletAddress);
        console.log('🏦 Smart Contract Wallet:', smartWalletAddr);
        console.log('🔗 Explorer:', `https://explorer.sepolia.mantle.xyz/address/${smartWalletAddr}`);
        console.log('');

        // Get balance
        const provider = new ethers.JsonRpcProvider(process.env.MANTLE_RPC_URL || 'https://rpc.sepolia.mantle.xyz');
        const balance = await provider.getBalance(smartWalletAddr);

        console.log('💰 Balance Information:');
        console.log('   Native MNT:', ethers.formatEther(balance), 'MNT');
        console.log('');

        // Try to get MNT balance using our service
        try {
            const mntBal = await getUserBalance(user.walletAddress, 'MNT');
            console.log('   Total MNT (via service):', mntBal, 'MNT');
        } catch (e: any) {
            console.log('   Service check:', e.message);
        }

        console.log('='.repeat(70));

        await prisma.$disconnect();
    } catch (error: any) {
        console.error('❌ Error:', error.message);
        await prisma.$disconnect();
    }
}

checkSmartWallet();
