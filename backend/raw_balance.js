
const { ethers } = require('ethers');
require('dotenv').config();

const MANTLE_RPC = process.env.MANTLE_RPC_URL || 'https://rpc.sepolia.mantle.xyz';
const WMNT_ADDRESS = process.env.WMNT_ADDRESS;
const SMART_WALLET = '0x2ECA994e6f8fb0663039C14df63AB88CBb3C0750'; // Hardcoded from prev output for speed
const ERC20_ABI = ["function balanceOf(address) view returns (uint256)"];

async function main() {
    const provider = new ethers.JsonRpcProvider(MANTLE_RPC);

    // Native
    const native = await provider.getBalance(SMART_WALLET);

    // Wrapped
    const contract = new ethers.Contract(WMNT_ADDRESS, ERC20_ABI, provider);
    const wrapped = await contract.balanceOf(SMART_WALLET);

    console.log(JSON.stringify({
        native: ethers.formatEther(native),
        wrapped: ethers.formatEther(wrapped),
        total: ethers.formatEther(native + wrapped)
    }));
}
main();
