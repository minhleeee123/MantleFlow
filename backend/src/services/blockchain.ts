import { ethers } from 'ethers';

const MANTLE_RPC = process.env.MANTLE_RPC_URL || 'https://rpc.sepolia.mantle.xyz';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY!;

const TOKEN_ADDRESSES: Record<string, string> = {
    'USDC': process.env.USDC_ADDRESS!,
    'MNT': process.env.MNT_ADDRESS!,
    // For demo purposes, mapping ETH/BTC to these same test tokens
    'ETH': process.env.MNT_ADDRESS!,
    'BTC': process.env.USDC_ADDRESS!
};

// Contract ABI - minimal needed
const CONTRACT_ABI = [
    'function executeSwap(address user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut, string triggerId) external returns (bool)',
    'function getBalance(address user, address token) external view returns (uint256)',
    'function getBalances(address user, address[] tokens) external view returns (uint256[])'
];

export async function executeSwap(
    userAddress: string,
    symbol: string,
    amount: number, // Amount in Token Unit (e.g. 100 USDT)
    type: 'BUY' | 'SELL'
): Promise<string> {
    console.log(`🔗 [BLOCKCHAIN] Init swap for ${userAddress} | ${type} ${amount} ${symbol}`);

    try {
        const provider = new ethers.JsonRpcProvider(MANTLE_RPC);
        const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

        // 1. Identify Tokens
        // Logic: 
        // IF Buying BTC (using USDT) -> TokenIn=USDT, TokenOut=BTC
        // IF Selling BTC (to USDT)   -> TokenIn=BTC,  TokenOut=USDT
        // For this Hackathon, Base currency is always USDC/MNT

        const USDC = TOKEN_ADDRESSES['USDC']; // Our stablecoin
        const TARGET_TOKEN = TOKEN_ADDRESSES[symbol] || TOKEN_ADDRESSES['MNT']; // Default to MNT if unknown

        let tokenIn, tokenOut;
        let amountInWei, amountOutWei;

        if (type === 'BUY') {
            tokenIn = USDC;
            tokenOut = TARGET_TOKEN;
            // Buying Target with USDC
            // amount argument is usually the 'investment amount' (e.g. Buy $100 worth of BTC)
            // So amountIn is USDC amount
            amountInWei = ethers.parseUnits(amount.toString(), 6); // USDC is 6 decimals

            // Mock Rate: 1 MNT = 50 USDC
            // If buying $100 USDC -> get 2 MNT
            // amountOut = amount / 50
            const rate = 50;
            const amountOutNum = amount / rate;
            amountOutWei = ethers.parseEther(amountOutNum.toString()); // MNT is 18 decimals
        } else {
            tokenIn = TARGET_TOKEN;
            tokenOut = USDC;
            // Selling Target for USDC
            // amount argument is usually the AMOUNT OF ASSET (e.g. Sell 1 BTC)
            // So amountIn is Target Token Quantity
            amountInWei = ethers.parseEther(amount.toString()); // Assuming 18 decimals for Target

            // Mock Rate: 1 MNT = 50 USDC
            // If selling 1 MNT -> get $50 USDC
            const rate = 50;
            const amountOutNum = amount * rate;
            amountOutWei = ethers.parseUnits(amountOutNum.toString(), 6);
        }

        const triggerId = `auto-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        console.log(`   🚀 Sending Tx: In=${amountInWei} Out=${amountOutWei}`);

        // 2. Execute Transaction
        const tx = await contract.executeSwap(
            userAddress,
            tokenIn,
            tokenOut,
            amountInWei,
            amountOutWei,
            triggerId
        );

        console.log(`   ⏳ Waiting for Tx: ${tx.hash}`);
        await tx.wait();
        console.log(`   ✅ Swap Confirmed: ${tx.hash}`);

        return tx.hash;

    } catch (error: any) {
        console.error("❌ Blockchain Execution Failed:", error);
        throw new Error(error.message || 'Swap execution failed on-chain');
    }
}

export async function getUserBalance(
    userAddress: string,
    tokenSymbol: string
): Promise<number> {
    try {
        const provider = new ethers.JsonRpcProvider(MANTLE_RPC);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

        const tokenAddress = TOKEN_ADDRESSES[tokenSymbol] || TOKEN_ADDRESSES['USDC'];

        const balanceWei = await contract.getBalance(userAddress, tokenAddress);

        // Format based on token decimals
        const decimals = (tokenSymbol === 'USDC' || tokenSymbol === 'USDT') ? 6 : 18;
        return parseFloat(ethers.formatUnits(balanceWei, decimals));
    } catch (error) {
        console.error('Error fetching balance:', error);
        return 0;
    }
}
