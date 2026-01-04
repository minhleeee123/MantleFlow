import { ethers } from 'ethers';

const SMART_WALLET = '0x2ECA994e6f8fb0663039C14df63AB88CBb3C0750';
const RPC = 'https://rpc.sepolia.mantle.xyz';

const WMNT_ENV = '0x67A1f4A939b477A6b7c5BF94D97E45dE87E6608eF';
const WMNT_OFFICIAL = '0x514528de7275e6e0e8f4083499474aa96eb84306';

const ABI = ['function balanceOf(address) view returns (uint256)'];

async function check() {
    const provider = new ethers.JsonRpcProvider(RPC);

    console.log('--- CHECKING TOKEN BALANCES for Smart Wallet ---');
    console.log('Wallet:', SMART_WALLET);

    // Check ENV WMNT
    try {
        const c1 = new ethers.Contract(WMNT_ENV, ABI, provider);
        const b1 = await c1.balanceOf(SMART_WALLET);
        console.log(`\nENV Token (${WMNT_ENV}):`);
        console.log('Balance:', ethers.formatEther(b1));
    } catch (e) { console.log('ENV Token Error:', e.message); }

    // Check OFFICIAL WMNT
    try {
        const c2 = new ethers.Contract(WMNT_OFFICIAL, ABI, provider);
        const b2 = await c2.balanceOf(SMART_WALLET);
        console.log(`\nOFFICIAL WMNT (${WMNT_OFFICIAL}):`);
        console.log('Balance:', ethers.formatEther(b2));
    } catch (e) { console.log('OFFICIAL Token Error:', e.message); }
}

check();
