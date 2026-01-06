import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Wallet, ArrowDownCircle, ArrowUpCircle, RefreshCw, History, ExternalLink, TrendingUp } from 'lucide-react';
import { transactionsApi } from '../../services/backendApi';

// V2 Contract Addresses (Mantle Sepolia)
const VAULT_ADDRESS = '0x2D85E5E8E9C8A90609f147513B9cCc01F8deAB16';
const DEX_ADDRESS = '0x991E5DAB401B44cD5E6C6e5A47F547B17b5bBa5d';
const USDT_ADDRESS = '0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080'; // Update with actual

// ABIs
const VAULT_ABI = [
    'function depositMnt() external payable',
    'function depositUsdt(uint256 amount) external',
    'function withdrawMnt(uint256 amount) external',
    'function withdrawUsdt(uint256 amount) external',
    'function swapMntToUsdt(uint256 mntAmount, uint256 minUsdtOut) external',
    'function swapUsdtToMnt(uint256 usdtAmount, uint256 minMntOut) external',
    'function getUserBalances(address user) external view returns (uint256 mnt, uint256 usdt)',
    'function estimateSwap(bool mntToUsdt, uint256 amountIn) external view returns (uint256)',
];

const ERC20_ABI = [
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function balanceOf(address account) external view returns (uint256)',
    'function allowance(address owner, address spender) external view returns (uint256)',
];

const DEX_ABI = [
    'function getPrice() external view returns (uint256 mntPerUsdt, uint256 usdtPerMnt)',
];

interface Props {
    userAddress: string;
}

interface Transaction {
    id: string;
    type: 'DEPOSIT' | 'WITHDRAW' | 'SWAP_MNT_USDT' | 'SWAP_USDT_MNT';
    tokenIn: string;  // Backend returns tokenIn
    amountIn: number; // Backend returns amountIn
    txHash?: string;
    createdAt: string;
}

export const ContractWalletV2: React.FC<Props> = ({ userAddress }) => {
    // Vault Balances
    const [vaultMntBalance, setVaultMntBalance] = useState('0');
    const [vaultUsdtBalance, setVaultUsdtBalance] = useState('0');

    // Wallet Balances (MetaMask)
    const [walletMnt, setWalletMnt] = useState('0');
    const [walletUsdt, setWalletUsdt] = useState('0');

    // DEX Price
    const [mntPrice, setMntPrice] = useState('0');

    // Transactions
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // UI State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'swap'>('deposit');

    // Input States
    const [depositMntAmount, setDepositMntAmount] = useState('');
    const [depositUsdtAmount, setDepositUsdtAmount] = useState('');
    const [withdrawMntAmount, setWithdrawMntAmount] = useState('');
    const [withdrawUsdtAmount, setWithdrawUsdtAmount] = useState('');
    const [swapFromAmount, setSwapFromAmount] = useState('');
    const [swapFromToken, setSwapFromToken] = useState<'MNT' | 'USDT'>('MNT');
    const [estimatedOutput, setEstimatedOutput] = useState('0');

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [userAddress]);

    // Estimate swap output when input changes
    useEffect(() => {
        if (swapFromAmount && parseFloat(swapFromAmount) > 0) {
            estimateSwapOutput();
        } else {
            setEstimatedOutput('0');
        }
    }, [swapFromAmount, swapFromToken]);

    const fetchData = async () => {
        if (!window.ethereum) return;

        try {
            setLoading(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const signerAddress = await signer.getAddress();

            // 1. Vault Balances
            const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, provider);
            const [vaultMnt, vaultUsdt] = await vault.getUserBalances(signerAddress);
            setVaultMntBalance(ethers.formatEther(vaultMnt));
            setVaultUsdtBalance(ethers.formatUnits(vaultUsdt, 6));

            // 2. Wallet Balances
            const walletMntBal = await provider.getBalance(signerAddress);
            setWalletMnt(ethers.formatEther(walletMntBal));

            const usdtContract = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, provider);
            const walletUsdtBal = await usdtContract.balanceOf(signerAddress);
            setWalletUsdt(ethers.formatUnits(walletUsdtBal, 6));

            // 3. DEX Price
            const dex = new ethers.Contract(DEX_ADDRESS, DEX_ABI, provider);
            const [_, usdtPerMnt] = await dex.getPrice();
            setMntPrice(ethers.formatEther(usdtPerMnt));

            // 4. Transaction History
            try {
                const history = await transactionsApi.list();
                setTransactions(history);
            } catch (err) {
                console.warn('Failed to load history', err);
            }

            setError('');
        } catch (error: any) {
            console.error('Error fetching data:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const estimateSwapOutput = async () => {
        if (!window.ethereum || !swapFromAmount) return;

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, provider);

            const isMntToUsdt = swapFromToken === 'MNT';
            const amountIn = isMntToUsdt
                ? ethers.parseEther(swapFromAmount)
                : ethers.parseUnits(swapFromAmount, 6);

            const amountOut = await vault.estimateSwap(isMntToUsdt, amountIn);

            const formatted = isMntToUsdt
                ? ethers.formatUnits(amountOut, 6)
                : ethers.formatEther(amountOut);

            setEstimatedOutput(formatted);
        } catch (error) {
            console.warn('Estimate failed:', error);
            setEstimatedOutput('0');
        }
    };

    const handleDepositMnt = async () => {
        if (!depositMntAmount || !window.ethereum) return;
        const amount = parseFloat(depositMntAmount);
        if (isNaN(amount) || amount <= 0) return;

        try {
            setLoading(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);

            const tx = await vault.depositMnt({ value: ethers.parseEther(amount.toString()) });
            await tx.wait();

            await transactionsApi.create({ type: 'DEPOSIT', token: 'MNT', amount, txHash: tx.hash });
            alert(`✅ Deposited ${amount} MNT to Vault!`);
            setDepositMntAmount('');
            fetchData();
        } catch (error: any) {
            console.error('Deposit error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDepositUsdt = async () => {
        if (!depositUsdtAmount || !window.ethereum) return;
        const amount = parseFloat(depositUsdtAmount);
        if (isNaN(amount) || amount <= 0) return;

        try {
            setLoading(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const usdt = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, signer);
            const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);

            const amountWei = ethers.parseUnits(amount.toString(), 6);

            // Check allowance
            const allowance = await usdt.allowance(await signer.getAddress(), VAULT_ADDRESS);
            if (allowance < amountWei) {
                console.log('Approving USDT...');
                const approveTx = await usdt.approve(VAULT_ADDRESS, amountWei);
                await approveTx.wait();
            }

            const tx = await vault.depositUsdt(amountWei);
            await tx.wait();

            await transactionsApi.create({ type: 'DEPOSIT', token: 'USDT', amount, txHash: tx.hash });
            alert(`✅ Deposited ${amount} USDT to Vault!`);
            setDepositUsdtAmount('');
            fetchData();
        } catch (error: any) {
            console.error('Deposit error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdrawMnt = async () => {
        if (!withdrawMntAmount || !window.ethereum) return;
        const amount = parseFloat(withdrawMntAmount);
        if (isNaN(amount) || amount <= 0) return;

        try {
            setLoading(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);

            const tx = await vault.withdrawMnt(ethers.parseEther(amount.toString()));
            await tx.wait();

            await transactionsApi.create({ type: 'WITHDRAW', token: 'MNT', amount, txHash: tx.hash });
            alert(`✅ Withdrew ${amount} MNT from Vault!`);
            setWithdrawMntAmount('');
            fetchData();
        } catch (error: any) {
            console.error('Withdraw error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdrawUsdt = async () => {
        if (!withdrawUsdtAmount || !window.ethereum) return;
        const amount = parseFloat(withdrawUsdtAmount);
        if (isNaN(amount) || amount <= 0) return;

        try {
            setLoading(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);

            const tx = await vault.withdrawUsdt(ethers.parseUnits(amount.toString(), 6));
            await tx.wait();

            await transactionsApi.create({ type: 'WITHDRAW', token: 'USDT', amount, txHash: tx.hash });
            alert(`✅ Withdrew ${amount} USDT from Vault!`);
            setWithdrawUsdtAmount('');
            fetchData();
        } catch (error: any) {
            console.error('Withdraw error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSwap = async () => {
        if (!swapFromAmount || !window.ethereum) return;
        const amount = parseFloat(swapFromAmount);
        if (isNaN(amount) || amount <= 0) return;

        try {
            setLoading(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);

            // Calculate minOut with 5% slippage
            const estimatedOut = parseFloat(estimatedOutput);
            const minOut = estimatedOut * 0.95;

            let tx;
            if (swapFromToken === 'MNT') {
                const amountIn = ethers.parseEther(amount.toString());
                const minOutWei = ethers.parseUnits(minOut.toFixed(6), 6);
                tx = await vault.swapMntToUsdt(amountIn, minOutWei);
            } else {
                const amountIn = ethers.parseUnits(amount.toString(), 6);
                const minOutWei = ethers.parseEther(minOut.toFixed(18));
                tx = await vault.swapUsdtToMnt(amountIn, minOutWei);
            }

            await tx.wait();

            const swapType = swapFromToken === 'MNT' ? 'SWAP_MNT_USDT' : 'SWAP_USDT_MNT';
            await transactionsApi.create({
                type: swapType as any, // V2 specific swap types
                token: swapFromToken,
                amount,
                txHash: tx.hash
            });

            alert(`✅ Swapped ${amount} ${swapFromToken} successfully!`);
            setSwapFromAmount('');
            fetchData();
        } catch (error: any) {
            console.error('Swap error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-neo-secondary dark:bg-gray-800 border-2 border-black dark:border-white shadow-neo dark:shadow-none p-6 mb-6 transition-colors">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-black dark:text-white">
                    <Wallet className="w-6 h-6" />
                    <h3 className="font-black text-xl uppercase">Vault Wallet V2</h3>
                    <span className="text-xs font-mono bg-green-500 text-white px-2 py-0.5 rounded">
                        UPGRADED
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-xs font-mono text-gray-500 dark:text-gray-400">
                        MNT Price: ${parseFloat(mntPrice).toFixed(2)}
                    </div>
                    <button
                        onClick={fetchData}
                        className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-black dark:text-white"
                        title="Refresh Balances"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-500 text-red-700 dark:text-red-300 p-3 mb-4 font-bold text-sm">
                    ⚠️ {error}
                </div>
            )}

            {/* Balance Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-900 border-2 border-black dark:border-gray-500 p-4">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">MNT in Vault</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Wallet: {parseFloat(walletMnt).toFixed(4)}
                        </div>
                    </div>
                    <div className="text-3xl font-black text-black dark:text-white">
                        {parseFloat(vaultMntBalance).toFixed(4)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        ≈ ${(parseFloat(vaultMntBalance) * parseFloat(mntPrice)).toFixed(2)}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 border-2 border-black dark:border-gray-500 p-4">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">USDT in Vault</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Wallet: {parseFloat(walletUsdt).toFixed(2)}
                        </div>
                    </div>
                    <div className="text-3xl font-black text-black dark:text-white">
                        {parseFloat(vaultUsdtBalance).toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-4 border-b-2 border-black dark:border-white">
                {(['deposit', 'withdraw', 'swap'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-bold uppercase text-sm transition-colors ${activeTab === tab
                            ? 'bg-black text-white dark:bg-white dark:text-black'
                            : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-gray-900 border-2 border-black dark:border-gray-500 p-4">
                {activeTab === 'deposit' && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                                Deposit MNT
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={depositMntAmount}
                                    onChange={(e) => setDepositMntAmount(e.target.value)}
                                    placeholder="Amount"
                                    className="flex-1 px-3 py-2 border-2 border-black dark:border-gray-500 bg-white dark:bg-gray-800 text-black dark:text-white font-mono"
                                />
                                <button
                                    onClick={handleDepositMnt}
                                    disabled={loading || !depositMntAmount}
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 font-bold border-2 border-black dark:border-gray-500 disabled:opacity-50 flex items-center gap-2"
                                >
                                    <ArrowDownCircle className="w-4 h-4" />
                                    Deposit
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                                Deposit USDT
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={depositUsdtAmount}
                                    onChange={(e) => setDepositUsdtAmount(e.target.value)}
                                    placeholder="Amount"
                                    className="flex-1 px-3 py-2 border-2 border-black dark:border-gray-500 bg-white dark:bg-gray-800 text-black dark:text-white font-mono"
                                />
                                <button
                                    onClick={handleDepositUsdt}
                                    disabled={loading || !depositUsdtAmount}
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 font-bold border-2 border-black dark:border-gray-500 disabled:opacity-50 flex items-center gap-2"
                                >
                                    <ArrowDownCircle className="w-4 h-4" />
                                    Deposit
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'withdraw' && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                                Withdraw MNT
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={withdrawMntAmount}
                                    onChange={(e) => setWithdrawMntAmount(e.target.value)}
                                    placeholder="Amount"
                                    className="flex-1 px-3 py-2 border-2 border-black dark:border-gray-500 bg-white dark:bg-gray-800 text-black dark:text-white font-mono"
                                />
                                <button
                                    onClick={handleWithdrawMnt}
                                    disabled={loading || !withdrawMntAmount}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 font-bold border-2 border-black dark:border-gray-500 disabled:opacity-50 flex items-center gap-2"
                                >
                                    <ArrowUpCircle className="w-4 h-4" />
                                    Withdraw
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                                Withdraw USDT
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={withdrawUsdtAmount}
                                    onChange={(e) => setWithdrawUsdtAmount(e.target.value)}
                                    placeholder="Amount"
                                    className="flex-1 px-3 py-2 border-2 border-black dark:border-gray-500 bg-white dark:bg-gray-800 text-black dark:text-white font-mono"
                                />
                                <button
                                    onClick={handleWithdrawUsdt}
                                    disabled={loading || !withdrawUsdtAmount}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 font-bold border-2 border-black dark:border-gray-500 disabled:opacity-50 flex items-center gap-2"
                                >
                                    <ArrowUpCircle className="w-4 h-4" />
                                    Withdraw
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'swap' && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                                From
                            </label>
                            <div className="flex gap-2">
                                <select
                                    value={swapFromToken}
                                    onChange={(e) => setSwapFromToken(e.target.value as 'MNT' | 'USDT')}
                                    className="px-3 py-2 border-2 border-black dark:border-gray-500 bg-white dark:bg-gray-800 text-black dark:text-white font-bold"
                                >
                                    <option value="MNT">MNT</option>
                                    <option value="USDT">USDT</option>
                                </select>
                                <input
                                    type="number"
                                    value={swapFromAmount}
                                    onChange={(e) => setSwapFromAmount(e.target.value)}
                                    placeholder="Amount"
                                    className="flex-1 px-3 py-2 border-2 border-black dark:border-gray-500 bg-white dark:bg-gray-800 text-black dark:text-white font-mono"
                                />
                            </div>
                        </div>

                        {estimatedOutput !== '0' && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 p-3">
                                <div className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">
                                    Estimated Output
                                </div>
                                <div className="text-2xl font-black text-blue-900 dark:text-blue-100">
                                    {parseFloat(estimatedOutput).toFixed(swapFromToken === 'MNT' ? 2 : 4)} {swapFromToken === 'MNT' ? 'USDT' : 'MNT'}
                                </div>
                                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                    Min. received (5% slippage): {(parseFloat(estimatedOutput) * 0.95).toFixed(swapFromToken === 'MNT' ? 2 : 4)}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleSwap}
                            disabled={loading || !swapFromAmount || estimatedOutput === '0'}
                            className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 font-bold border-2 border-black dark:border-gray-500 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <TrendingUp className="w-5 h-5" />
                            Swap {swapFromToken} → {swapFromToken === 'MNT' ? 'USDT' : 'MNT'}
                        </button>
                    </div>
                )}
            </div>

            {/* Transaction History */}
            <div className="mt-6 border-t-2 border-black dark:border-white pt-4">
                <div className="flex items-center gap-2 mb-3 text-black dark:text-white">
                    <History className="w-5 h-5" />
                    <h4 className="font-bold uppercase">Recent Transactions</h4>
                </div>
                <div className="bg-white dark:bg-gray-900 border-2 border-black dark:border-gray-500 max-h-60 overflow-y-auto">
                    {transactions.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 font-mono text-sm">No transactions yet.</div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 dark:bg-gray-800 text-xs uppercase font-bold sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left">Time</th>
                                    <th className="px-4 py-2 text-left">Type</th>
                                    <th className="px-4 py-2 text-left">Amount</th>
                                    <th className="px-4 py-2 text-left">Tx</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.slice(0, 10).map((tx) => (
                                    <tr key={tx.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                                            {new Date(tx.createdAt).toLocaleTimeString()}
                                        </td>
                                        <td className={`px-4 py-2 font-bold ${tx.type.includes('DEPOSIT') ? 'text-green-600' :
                                            tx.type.includes('WITHDRAW') ? 'text-red-500' :
                                                'text-purple-600'
                                            }`}>
                                            {tx.type.replace('_', ' ')}
                                        </td>
                                        <td className="px-4 py-2 font-mono text-black dark:text-white">
                                            {tx.amountIn} {tx.tokenIn}
                                        </td>
                                        <td className="px-4 py-2">
                                            {tx.txHash && (
                                                <a
                                                    href={`https://sepolia.mantlescan.xyz/tx/${tx.txHash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 hover:underline flex items-center gap-1"
                                                >
                                                    View <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <div className="mt-4 text-xs font-mono text-gray-500 dark:text-gray-400 text-center">
                Vault: {VAULT_ADDRESS.slice(0, 6)}...{VAULT_ADDRESS.slice(-4)}
            </div>
        </div>
    );
};
