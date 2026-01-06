import { ethers } from 'ethers';

const MANTLE_RPC = process.env.MANTLE_RPC_URL!;
const VAULT_ADDRESS = process.env.VAULT_ADDRESS!;
const DEX_ADDRESS = process.env.DEX_ADDRESS!;
const USDT_ADDRESS = process.env.USDT_ADDRESS!;
const BOT_PRIVATE_KEY = process.env.BOT_PRIVATE_KEY!;

// ABIs
const VAULT_ABI = [
    'function swapMntToUsdt(uint256 mntAmount, uint256 minUsdtOut) external',
    'function swapUsdtToMnt(uint256 usdtAmount, uint256 minMntOut) external',
    'function getUserBalances(address user) external view returns (uint256 mnt, uint256 usdt)',
    'function estimateSwap(bool mntToUsdt, uint256 amountIn) external view returns (uint256)',
];

const ERC20_ABI = [
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function balanceOf(address account) external view returns (uint256)',
];

const DEX_ABI = [
    'function getPrice() external view returns (uint256 mntPerUsdt, uint256 usdtPerMnt)',
    'function mntReserve() external view returns (uint256)',
    'function usdtReserve() external view returns (uint256)',
];

export interface SwapResult {
    txHash: string;
    amountIn: number;
    amountOut: number;
    tokenIn: string;
    tokenOut: string;
}

/**
 * Execute swap on Vault contract on behalf of user
 */
export async function executeVaultSwap(
    userAddress: string,
    fromToken: 'MNT' | 'USDT',
    amount: number,
    slippagePercent: number = 5
): Promise<SwapResult> {
    console.log(`🔗 [Vault Swap] ${fromToken} ${amount} for ${userAddress}`);

    const provider = new ethers.JsonRpcProvider(MANTLE_RPC);
    const botWallet = new ethers.Wallet(BOT_PRIVATE_KEY, provider);
    const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, botWallet);

    try {
        // 1. Estimate output
        const isMntToUsdt = fromToken === 'MNT';
        const amountIn = isMntToUsdt
            ? ethers.parseEther(amount.toString())
            : ethers.parseUnits(amount.toString(), 6);

        const estimatedOut = await vault.estimateSwap(isMntToUsdt, amountIn);

        // 2. Calculate minimum output with slippage
        const minOut = (estimatedOut * BigInt(100 - slippagePercent)) / 100n;

        console.log(`   Estimated: ${ethers.formatUnits(estimatedOut, isMntToUsdt ? 6 : 18)}`);
        console.log(`   Min Out (${slippagePercent}% slippage): ${ethers.formatUnits(minOut, isMntToUsdt ? 6 : 18)}`);

        // 3. Execute swap
        // IMPORTANT: Bot calls vault.swap*() which operates on user's balance in vault
        let tx;
        if (isMntToUsdt) {
            tx = await vault.swapMntToUsdt(amountIn, minOut);
        } else {
            tx = await vault.swapUsdtToMnt(amountIn, minOut);
        }

        console.log(`   Tx sent: ${tx.hash}`);
        await tx.wait();
        console.log(`   ✅ Swap successful`);

        // 4. Get actual output from balance change
        const [mntAfter, usdtAfter] = await vault.getUserBalances(userAddress);

        return {
            txHash: tx.hash,
            amountIn: amount,
            amountOut: parseFloat(ethers.formatUnits(estimatedOut, isMntToUsdt ? 6 : 18)),
            tokenIn: fromToken,
            tokenOut: fromToken === 'MNT' ? 'USDT' : 'MNT'
        };

    } catch (error: any) {
        console.error(`❌ Swap failed:`, error.message);
        throw new Error(`Swap execution failed: ${error.message}`);
    }
}

/**
 * Check if user has sufficient balance in Vault
 */
export async function checkVaultBalance(
    userAddress: string,
    token: 'MNT' | 'USDT',
    requiredAmount: number
): Promise<boolean> {
    try {
        const provider = new ethers.JsonRpcProvider(MANTLE_RPC);
        const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, provider);

        const [mnt, usdt] = await vault.getUserBalances(userAddress);

        const balance = token === 'MNT'
            ? parseFloat(ethers.formatEther(mnt))
            : parseFloat(ethers.formatUnits(usdt, 6));

        console.log(`[Balance Check] ${userAddress} ${token}: ${balance} (required: ${requiredAmount})`);

        return balance >= requiredAmount;
    } catch (error) {
        console.error(`Failed to check balance:`, error);
        return false;
    }
}

/**
 * Estimate swap output amount
 */
export async function estimateSwapOutput(
    fromToken: 'MNT' | 'USDT',
    amountIn: number
): Promise<number> {
    const provider = new ethers.JsonRpcProvider(MANTLE_RPC);
    const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, provider);

    const isMntToUsdt = fromToken === 'MNT';
    const amountInWei = isMntToUsdt
        ? ethers.parseEther(amountIn.toString())
        : ethers.parseUnits(amountIn.toString(), 6);

    const amountOut = await vault.estimateSwap(isMntToUsdt, amountInWei);

    return parseFloat(ethers.formatUnits(amountOut, isMntToUsdt ? 6 : 18));
}

/**
 * Get current DEX price
 */
export async function getDexPrice(): Promise<{ mntPrice: number; usdtPrice: number }> {
    const provider = new ethers.JsonRpcProvider(MANTLE_RPC);
    const dex = new ethers.Contract(DEX_ADDRESS, DEX_ABI, provider);

    const [mntPerUsdt, usdtPerMnt] = await dex.getPrice();

    return {
        mntPrice: parseFloat(ethers.formatEther(usdtPerMnt)),  // 1 MNT = X USDT
        usdtPrice: parseFloat(ethers.formatUnits(mntPerUsdt, 6))  // 1 USDT = X MNT
    };
}

/**
 * Get user balances from Vault (optional - frontend can do this)
 */
export async function getUserVaultBalances(userAddress: string): Promise<{ mnt: number; usdt: number }> {
    const provider = new ethers.JsonRpcProvider(MANTLE_RPC);
    const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, provider);

    const [mnt, usdt] = await vault.getUserBalances(userAddress);

    return {
        mnt: parseFloat(ethers.formatEther(mnt)),
        usdt: parseFloat(ethers.formatUnits(usdt, 6))
    };
}
