import { ethers } from 'ethers';

const MANTLE_RPC = process.env.MANTLE_RPC_URL || 'https://rpc.sepolia.mantle.xyz';
// const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!; // Deprecated V1
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS!;
const FUSIONX_ROUTER = process.env.FUSIONX_ROUTER!;
const WMNT_ADDRESS = process.env.WMNT_ADDRESS!;
const USDC_ADDRESS = process.env.USDC_ADDRESS!;

// Admin/Bot Key to sign "executeCall"
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY!;

const TOKEN_ADDRESSES: Record<string, string> = {
    'USDC': USDC_ADDRESS,
    'MNT': ethers.ZeroAddress,
    'WMNT': WMNT_ADDRESS,
    'ETH': ethers.ZeroAddress,
    'BTC': USDC_ADDRESS // Mapping for demo
};

// ----------------------------------------------------------------------
// ABIS
// ----------------------------------------------------------------------

const FACTORY_ABI = [
    "function userWallets(address user) view returns (address)"
];

const WALLET_ABI = [
    "function executeCall(address target, uint256 value, bytes calldata data) external returns (bytes)",
    "function owner() view returns (address)",
    "function operator() view returns (address)"
];

const WMNT_ABI = [
    "function deposit() payable",
    "function balanceOf(address) view returns (uint256)"
];

const ERC20_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address account) view returns (uint256)"
];

const ROUTER_ABI = [
    "function exactInputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96) params) external payable returns (uint256 amountOut)"
];

// ----------------------------------------------------------------------
// SERVICE METHODS
// ----------------------------------------------------------------------

export async function getSmartWalletAddress(userAddress: string): Promise<string> {
    const provider = new ethers.JsonRpcProvider(MANTLE_RPC);
    const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);
    const wallet = await factory.userWallets(userAddress);

    if (wallet === ethers.ZeroAddress) {
        throw new Error("User has no Smart Wallet deployed.");
    }
    return wallet;
}

export async function executeSwap(
    userAddress: string,
    symbol: string,
    amount: number, // Amount in Token Unit (e.g. 100 USDT)
    type: 'BUY' | 'SELL'
): Promise<string> {
    console.log(`🔗 [SMART WALLET] Init swap for ${userAddress} | ${type} ${amount} ${symbol}`);

    try {
        const provider = new ethers.JsonRpcProvider(MANTLE_RPC);
        const botWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);

        // 1. Get User's Smart Wallet Address
        const smartWalletAddr = await getSmartWalletAddress(userAddress);
        console.log(`   📍 Wallet: ${smartWalletAddr}`);

        const smartWallet = new ethers.Contract(smartWalletAddr, WALLET_ABI, botWallet);

        // 2. Resolve Tokens
        // BASE: USDC (We trade USDC <-> Token)
        // If type = BUY: USDC -> Token
        // If type = SELL: Token -> USDC

        // Note: For hackathon demo, if Symbol=ETH or MNT, we treat it as WMNT for swapping
        let targetTokenAddr = TOKEN_ADDRESSES[symbol];
        if (symbol === 'MNT' || symbol === 'ETH') targetTokenAddr = WMNT_ADDRESS;
        if (!targetTokenAddr) targetTokenAddr = WMNT_ADDRESS; // Default

        let tokenIn, tokenOut;
        let amountInWei, amountOutWei; // amountOut is minAmount

        if (type === 'BUY') {
            // USDC -> Target
            tokenIn = USDC_ADDRESS;
            tokenOut = targetTokenAddr;
            // Amount is in USDC (e.g. Buy with 100 USDC)
            amountInWei = ethers.parseUnits(amount.toString(), 6);
        } else {
            // Target -> USDC
            tokenIn = targetTokenAddr;
            tokenOut = USDC_ADDRESS;
            // Amount is in Target Token (e.g. Sell 1 ETH)
            // Assuming 18 decimals for most targets except USDC/USDT
            amountInWei = ethers.parseEther(amount.toString());
        }

        console.log(`   🔄 Swap Path: ${tokenIn} -> ${tokenOut} | Amt: ${amountInWei}`);

        // ------------------------------------------------------------------
        // EXECUTION SEQUENCE (Generic Execution)
        // 1. (Optional) Wrap MNT if needed (skipped here, assuming funds are in USDC or WMNT)
        //    *Actually, if User deposited MNT, we might need to wrap it first if selling MNT*
        // ------------------------------------------------------------------

        // Special case: If Selling MNT, check if we need to wrap MNT -> WMNT first?
        // User sends MNT to wallet. Wallet has MNT.
        // We need to wrap MNT -> WMNT before swapping on V3.
        if (type === 'SELL' && (symbol === 'MNT' || symbol === 'ETH')) {
            console.log("   🎁 Wrapping MNT before swap...");
            // Check MNT Balance? Trusted for now.
            const wmntInt = new ethers.Interface(WMNT_ABI);
            const dataWrap = wmntInt.encodeFunctionData("deposit", []);

            // Execute Wrap: executeCall(WMNT, amountInWei, depositData)
            // We send value = amountInWei to wrap that amount
            const txWrap = await smartWallet.executeCall(WMNT_ADDRESS, amountInWei, dataWrap);
            await txWrap.wait();
            console.log("   ✅ Wrapped MNT");
        }

        // 2. Approve Router
        console.log("   🔓 Approving Router...");
        const erc20Int = new ethers.Interface(ERC20_ABI);
        const dataApprove = erc20Int.encodeFunctionData("approve", [FUSIONX_ROUTER, amountInWei]);

        const txApprove = await smartWallet.executeCall(tokenIn, 0, dataApprove);
        await txApprove.wait();
        console.log("   ✅ Approved");

        // 3. Execute Swap
        console.log("   💱 Executing Swap via FusionX...");
        const routerInt = new ethers.Interface(ROUTER_ABI);

        const params = {
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            fee: 3000,
            recipient: smartWalletAddr, // Fund stays in wallet
            deadline: Math.floor(Date.now() / 1000) + 300,
            amountIn: amountInWei,
            amountOutMinimum: 0, // Slippage 100% for demo
            sqrtPriceLimitX96: 0
        };

        const dataSwap = routerInt.encodeFunctionData("exactInputSingle", [params]);

        const txSwap = await smartWallet.executeCall(FUSIONX_ROUTER, 0, dataSwap);
        console.log(`   ⏳ Tx Sent: ${txSwap.hash}`);
        await txSwap.wait();
        console.log("   ✅ Swap Success");

        return txSwap.hash;

    } catch (error: any) {
        console.error("❌ Smart Wallet Execution Failed:", error);
        throw new Error(error.message || 'Swap execution failed');
    }
}

export async function getUserBalance(
    userAddress: string,
    tokenSymbol: string
): Promise<number> {
    try {
        const provider = new ethers.JsonRpcProvider(MANTLE_RPC);

        // Get Wallet (or return 0 if not exists)
        let walletAddr;
        try {
            walletAddr = await getSmartWalletAddress(userAddress);
        } catch {
            return 0; // No wallet = 0 balance
        }

        const tokenAddress = TOKEN_ADDRESSES[tokenSymbol] || TOKEN_ADDRESSES['USDC'];

        // If 'MNT', get native balance
        if (tokenSymbol === 'MNT' || tokenSymbol === 'ETH') {
            const bal = await provider.getBalance(walletAddr);
            return parseFloat(ethers.formatEther(bal));
        }

        // ERC20 Balance
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const balWei = await contract.balanceOf(walletAddr);
        const decimals = (tokenSymbol === 'USDC' || tokenSymbol === 'USDT') ? 6 : 18;
        return parseFloat(ethers.formatUnits(balWei, decimals));

    } catch (error) {
        console.error('Error fetching balance:', error);
        return 0;
    }
}
