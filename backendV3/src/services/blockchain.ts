import { ethers } from 'ethers';

const MANTLE_RPC = process.env.MANTLE_RPC_URL!;
const VAULT_ADDRESS = process.env.VAULT_ADDRESS!;
const BOT_PRIVATE_KEY = process.env.BOT_PRIVATE_KEY!;

// Vault V3 ABI with bot functions
const VAULT_ABI = [
    // User swap functions
    'function swapMntToUsdt(uint256 mntAmount, uint256 minUsdtOut) external',
    'function swapUsdtToMnt(uint256 usdtAmount, uint256 minMntOut) external',

    // Bot swap functions (NEW in V3)
    'function executeSwapMntToUsdtForUser(address user, uint256 mntAmount, uint256 minUsdtOut) external',
    'function executeSwapUsdtToMntForUser(address user, uint256 usdtAmount, uint256 minMntOut) external',

    // View functions
    'function getUserBalances(address user) external view returns (uint256 mnt, uint256 usdt)',
    'function estimateSwap(bool mntToUsdt, uint256 amountIn) external view returns (uint256)',
    'function isBotAuthorized(address user, address bot) external view returns (bool)',
];

export interface SwapResult {
    txHash: string;
    amountIn: number;
    amountOut: number;
    tokenIn: string;
    tokenOut: string;
}

class BlockchainService {
    private provider: ethers.JsonRpcProvider;
    private botWallet: ethers.Wallet;
    private vaultContract: ethers.Contract;
    private botAddress: string;

    constructor() {
        this.provider = new ethers.JsonRpcProvider(MANTLE_RPC);
        this.botWallet = new ethers.Wallet(BOT_PRIVATE_KEY, this.provider);
        this.vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, this.botWallet);
        this.botAddress = this.botWallet.address;

        console.log(`🤖 Bot wallet initialized: ${this.botAddress}`);
    }

    /**
     * Execute bot swap for user (delegated swap)
     * Bot pays gas, swaps user's balance in vault
     */
    async executeBotSwap(params: {
        userAddress: string;
        fromToken: 'MNT' | 'USDT';
        amount: number;
        slippagePercent?: number;
    }): Promise<SwapResult> {
        console.log(`🤖 [Bot Swap] ${params.fromToken} ${params.amount} for ${params.userAddress}`);

        // Check if bot is authorized
        const isAuthorized = await this.vaultContract.isBotAuthorized(
            params.userAddress,
            this.botAddress
        );

        if (!isAuthorized) {
            throw new Error('Bot not authorized by user. User must call authorizeBot() first.');
        }

        const isMntToUsdt = params.fromToken === 'MNT';
        const amountIn = isMntToUsdt
            ? ethers.parseEther(params.amount.toString())
            : ethers.parseUnits(params.amount.toString(), 6);

        // Estimate output
        const estimatedOut = await this.vaultContract.estimateSwap(isMntToUsdt, amountIn);
        const slippage = params.slippagePercent || 5;
        const minOut = (estimatedOut * BigInt(100 - slippage)) / 100n;

        console.log(`   Estimated: ${ethers.formatUnits(estimatedOut, isMntToUsdt ? 6 : 18)}`);
        console.log(`   Min Out (${slippage}% slippage): ${ethers.formatUnits(minOut, isMntToUsdt ? 6 : 18)}`);

        // Execute delegated swap
        let tx;
        if (isMntToUsdt) {
            tx = await this.vaultContract.executeSwapMntToUsdtForUser(
                params.userAddress,
                amountIn,
                minOut
            );
        } else {
            tx = await this.vaultContract.executeSwapUsdtToMntForUser(
                params.userAddress,
                amountIn,
                minOut
            );
        }

        console.log(`   Tx sent: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`   ✅ Bot swap successful`);

        return {
            txHash: receipt.hash,
            amountIn: params.amount,
            amountOut: parseFloat(ethers.formatUnits(estimatedOut, isMntToUsdt ? 6 : 18)),
            tokenIn: params.fromToken,
            tokenOut: params.fromToken === 'MNT' ? 'USDT' : 'MNT'
        };
    }

    /**
     * Check if user has authorized bot
     */
    async isUserAuthorizedBot(userAddress: string): Promise<boolean> {
        return await this.vaultContract.isBotAuthorized(userAddress, this.botAddress);
    }

    /**
     * Check user balance in vault
     */
    async checkVaultBalance(
        userAddress: string,
        token: 'MNT' | 'USDT',
        requiredAmount: number
    ): Promise<boolean> {
        try {
            const [mnt, usdt] = await this.vaultContract.getUserBalances(userAddress);

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
     * Estimate swap output
     */
    async estimateSwapOutput(
        fromToken: 'MNT' | 'USDT',
        amountIn: number
    ): Promise<number> {
        const isMntToUsdt = fromToken === 'MNT';
        const amountInWei = isMntToUsdt
            ? ethers.parseEther(amountIn.toString())
            : ethers.parseUnits(amountIn.toString(), 6);

        const amountOut = await this.vaultContract.estimateSwap(isMntToUsdt, amountInWei);

        return parseFloat(ethers.formatUnits(amountOut, isMntToUsdt ? 6 : 18));
    }

    /**
     * Get user balances from vault
     */
    async getUserVaultBalances(userAddress: string): Promise<{ mnt: number; usdt: number }> {
        const [mnt, usdt] = await this.vaultContract.getUserBalances(userAddress);

        return {
            mnt: parseFloat(ethers.formatEther(mnt)),
            usdt: parseFloat(ethers.formatUnits(usdt, 6))
        };
    }

    /**
     * Get bot address
     */
    getBotAddress(): string {
        return this.botAddress;
    }
}

// Singleton instance
export const blockchainService = new BlockchainService();
