import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { ethers } from 'ethers';

const MANTLE_RPC = process.env.MANTLE_RPC_URL || 'https://rpc.sepolia.mantle.xyz';
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS!;
const USER_ADDRESS = '0xe412d04da2a211f7adc80311cc0ff9f03440b64e';

const FACTORY_ABI = [
    "function userWallets(address user) view returns (address)"
];

async function getWallet() {
    const provider = new ethers.JsonRpcProvider(MANTLE_RPC);
    const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);

    console.log('Factory Address:', FACTORY_ADDRESS);
    console.log('User Address:', USER_ADDRESS);
    console.log('');

    const smartWallet = await factory.userWallets(USER_ADDRESS);

    console.log('Smart Contract Wallet:', smartWallet);
    console.log('Explorer Link:', `https://explorer.sepolia.mantle.xyz/address/${smartWallet}`);

    // Check balance
    const balance = await provider.getBalance(smartWallet);
    console.log('');
    console.log('Balance:', ethers.formatEther(balance), 'MNT');
}

getWallet().catch(console.error);
