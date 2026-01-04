import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Wallet, ArrowDownCircle, ArrowUpCircle, RefreshCw, History, ExternalLink, Power, ShieldAlert, ShieldCheck } from 'lucide-react';
import { transactionsApi, walletApi } from '../../services/backendApi';
import { deploySmartWallet, withdrawFromSmartWallet, getSmartWalletOperator, setSmartWalletOperator } from '../../services/web3Service';

const USDC_ADDRESS = '0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080';
const ERC20_ABI = [
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function balanceOf(address account) external view returns (uint256)',
    'function transfer(address recipient, uint256 amount) external returns (bool)'
];

interface Props {
    userAddress: string;
}

interface Transaction {
    id: string;
    type: 'DEPOSIT' | 'WITHDRAW' | 'DEPLOY';
    token: string;
    amount: number;
    txHash?: string;
    createdAt: string;
}

export const ContractWallet: React.FC<Props> = ({ userAddress }) => {
    const [smartWalletAddress, setSmartWalletAddress] = useState<string | null>(null);
    const [factoryAddress, setFactoryAddress] = useState<string | null>(null);
    const [operatorAddress, setOperatorAddress] = useState<string | null>(null);
    const [currentOperator, setCurrentOperator] = useState<string | null>(null);

    const [usdcBalance, setUsdcBalance] = useState('0');
    const [mntBalance, setMntBalance] = useState('0');
    const [walletMnt, setWalletMnt] = useState('0');
    const [walletUsdc, setWalletUsdc] = useState('0');
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Input States
    const [usdcDepositAmount, setUsdcDepositAmount] = useState('');
    const [usdcWithdrawAmount, setUsdcWithdrawAmount] = useState('');
    const [mntDepositAmount, setMntDepositAmount] = useState('');
    const [mntWithdrawAmount, setMntWithdrawAmount] = useState('');

    useEffect(() => {
        fetchConfig();
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [userAddress, smartWalletAddress]);

    const fetchConfig = async () => {
        try {
            const config = await walletApi.getConfig();
            setFactoryAddress(config.factoryAddress);
            setOperatorAddress(config.operatorAddress);
        } catch (e) {
            console.error("Failed to load config", e);
        }
    };

    const fetchData = async () => {
        if (!window.ethereum) return;

        try {
            // 1. Get Smart Wallet Address from Backend (Source of Truth)
            const addr = await walletApi.getAddress();
            setSmartWalletAddress(addr);

            // 2. Wallet Balances (MetaMask)
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const signerAddress = await signer.getAddress();

            const walletMntBal = await provider.getBalance(signerAddress);
            setWalletMnt(ethers.formatEther(walletMntBal));

            const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
            const walletUsdcBal = await usdcContract.balanceOf(signerAddress);
            setWalletUsdc(ethers.formatUnits(walletUsdcBal, 6));

            // 3. Smart Wallet Balances (if exists)
            if (addr) {
                const balances = await walletApi.getBalance();
                if (balances && balances.balances) {
                    setUsdcBalance(balances.balances.USDC.toString());
                    setMntBalance(balances.balances.MNT.toString());
                }

                // Check Operator Permissions
                if (window.ethereum) {
                    try {
                        const op = await getSmartWalletOperator(addr);
                        setCurrentOperator(op);
                    } catch (e) {
                        console.warn('Failed to fetch operator', e);
                    }
                }
            }

            // 4. Transactions
            try {
                const history = await transactionsApi.list();
                setTransactions(history);
            } catch (err) {
                console.warn('Failed to load history', err);
            }

        } catch (error: any) {
            console.error('Error fetching data:', error);
        }
    };

    const handleDeploy = async () => {
        if (!factoryAddress || !userAddress || !operatorAddress) return;
        setLoading(true);
        setError('');
        try {
            // NOTE: We now pass operatorAddress to deploySmartWallet, NOT userAddress
            const hash = await deploySmartWallet(factoryAddress, operatorAddress);
            await transactionsApi.create({ type: 'DEPLOY', token: 'ETH', amount: 0, txHash: hash });
            alert("Wallet Activation Tx Sent! Waiting for confirmation...");

            setTimeout(fetchData, 5000);
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Deployment failed");
        } finally {
            setLoading(false);
        }
    };

    const handleAuthorize = async () => {
        if (!smartWalletAddress || !operatorAddress) return;
        setLoading(true);
        try {
            const hash = await setSmartWalletOperator(smartWalletAddress, operatorAddress);
            alert("Authorization Tx Sent! Bot will be able to trade soon.");
            setTimeout(fetchData, 5000);
        } catch (e: any) {
            setError(e.message || "Authorization failed");
        } finally {
            setLoading(false);
        }
    };

    const depositUSDC = async () => {
        if (!window.ethereum || !usdcDepositAmount || !smartWalletAddress) return;
        const amount = parseFloat(usdcDepositAmount);
        if (isNaN(amount) || amount <= 0) return;

        try {
            setLoading(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);

            const amountWei = ethers.parseUnits(amount.toString(), 6);

            console.log('Transferring USDC to Smart Wallet...');
            const tx = await usdcContract.transfer(smartWalletAddress, amountWei);
            await tx.wait();

            await transactionsApi.create({ type: 'DEPOSIT', token: 'USDC', amount, txHash: tx.hash });
            alert(`Deposited ${amount} USDC successfully!`);
            setUsdcDepositAmount('');
            fetchData();
        } catch (error: any) {
            console.error('Deposit error:', error);
            setError(error.reason || error.message);
        } finally {
            setLoading(false);
        }
    };

    const depositMNT = async () => {
        if (!window.ethereum || !mntDepositAmount || !smartWalletAddress) return;
        const amount = parseFloat(mntDepositAmount);
        if (isNaN(amount) || amount <= 0) return;

        try {
            setLoading(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const amountWei = ethers.parseEther(amount.toString());

            console.log('Sending MNT to Smart Wallet...');
            const tx = await signer.sendTransaction({
                to: smartWalletAddress,
                value: amountWei
            });
            await tx.wait();

            await transactionsApi.create({ type: 'DEPOSIT', token: 'MNT', amount, txHash: tx.hash });
            alert(`Deposited ${amount} MNT successfully!`);
            setMntDepositAmount('');
            fetchData();
        } catch (error: any) {
            console.error('Deposit error:', error);
            setError(error.reason || error.message);
        } finally {
            setLoading(false);
        }
    };

    const withdrawMNT = async () => {
        if (!mntWithdrawAmount || !smartWalletAddress) return;
        const amount = parseFloat(mntWithdrawAmount);
        if (isNaN(amount) || amount <= 0) return;

        try {
            setLoading(true);
            const hash = await withdrawFromSmartWallet(smartWalletAddress, 'MNT', amount.toString(), 18);
            await transactionsApi.create({ type: 'WITHDRAW', token: 'MNT', amount, txHash: hash });
            alert(`Withdrew ${amount} MNT successfully!`);
            setMntWithdrawAmount('');
            fetchData();
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const withdrawUSDC = async () => {
        if (!usdcWithdrawAmount || !smartWalletAddress) return;
        const amount = parseFloat(usdcWithdrawAmount);
        if (isNaN(amount) || amount <= 0) return;

        try {
            setLoading(true);
            const hash = await withdrawFromSmartWallet(smartWalletAddress, USDC_ADDRESS, amount.toString(), 6);
            await transactionsApi.create({ type: 'WITHDRAW', token: 'USDC', amount, txHash: hash });
            alert(`Withdrew ${amount} USDC successfully!`);
            setUsdcWithdrawAmount('');
            fetchData();
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!smartWalletAddress) {
        return (
            <div className="bg-neo-secondary dark:bg-gray-800 border-2 border-black dark:border-white shadow-neo p-6 mb-6 text-center transition-colors">
                <div className="flex flex-col items-center gap-4">
                    <Wallet className="w-12 h-12 text-black dark:text-white" />
                    <h3 className="font-black text-2xl uppercase text-black dark:text-white">Activate Trading Account</h3>
                    <p className="text-gray-600 dark:text-gray-300 max-w-md">
                        To use the Auto-Trading Bot, you need to deploy your personal Smart Wallet on Mantle Sepolia.
                        This wallet allows the bot to execute trades securely while you retain full ownership.
                    </p>
                    {error && <div className="text-red-500 font-bold">{error}</div>}
                    <button
                        onClick={handleDeploy}
                        disabled={loading}
                        className="bg-green-500 text-white px-8 py-3 font-black uppercase text-lg border-2 border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-2"
                    >
                        <Power className="w-5 h-5" />
                        {loading ? 'Activating...' : 'Activate Now'}
                    </button>
                    <div className="text-xs text-gray-400 mt-2">Factory: {shortAddr(factoryAddress || '...')}</div>
                </div>
            </div>
        );
    }

    const needsAuth = operatorAddress && currentOperator && operatorAddress.toLowerCase() !== currentOperator.toLowerCase();

    return (
        <div className="bg-neo-secondary dark:bg-gray-800 border-2 border-black dark:border-white shadow-neo dark:shadow-none p-6 mb-6 transition-colors">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-black dark:text-white">
                    <Wallet className="w-6 h-6" />
                    <h3 className="font-black text-xl uppercase">Smart Trading Wallet</h3>
                    <span className="text-xs font-mono bg-black text-white px-2 py-0.5 rounded" title={smartWalletAddress}>{shortAddr(smartWalletAddress)}</span>
                </div>
                <button
                    onClick={fetchData}
                    className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-black dark:text-white"
                    title="Refresh Balances"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {error && (
                <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-500 text-red-700 dark:text-red-300 p-3 mb-4 font-bold text-sm">
                    ⚠️ {error}
                </div>
            )}

            {needsAuth && (
                <div className="bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-500 text-orange-700 dark:text-orange-300 p-4 mb-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5" />
                        <span className="font-bold text-sm">Bot Authorization Missing</span>
                    </div>
                    <button
                        onClick={handleAuthorize}
                        disabled={loading}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 font-bold border-2 border-black text-xs uppercase"
                    >
                        {loading ? 'Authorizing...' : 'Authorize Bot'}
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* USDC Section */}
                <div className="bg-white dark:bg-gray-900 border-2 border-black dark:border-gray-500 p-4 relative group">
                    <div className="absolute top-2 right-2 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded border border-gray-300 dark:border-gray-600">
                        MetaMask: {parseFloat(walletUsdc).toFixed(2)} USDC
                    </div>
                    <div className="text-sm font-bold mb-2 text-indigo-600 dark:text-indigo-400">USDC (Trading)</div>
                    <div className="text-3xl font-black mb-4 text-black dark:text-white">{parseFloat(usdcBalance).toFixed(2)}</div>

                    <div className="space-y-2">
                        {/* Deposit Input */}
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={usdcDepositAmount}
                                onChange={(e) => setUsdcDepositAmount(e.target.value)}
                                placeholder="Amount"
                                className="w-24 px-2 py-1 border-2 border-black dark:border-gray-500 bg-white dark:bg-gray-800 text-black dark:text-white font-mono text-sm placeholder-gray-400"
                            />
                            <button
                                onClick={depositUSDC}
                                disabled={loading || !usdcDepositAmount}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 font-bold border-2 border-black dark:border-gray-500 disabled:opacity-50 text-sm flex items-center justify-center gap-1"
                            >
                                <ArrowDownCircle className="w-4 h-4" />
                                Deposit
                            </button>
                        </div>

                        {/* Withdraw Input */}
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={usdcWithdrawAmount}
                                onChange={(e) => setUsdcWithdrawAmount(e.target.value)}
                                placeholder="Amount"
                                className="w-24 px-2 py-1 border-2 border-black dark:border-gray-500 bg-white dark:bg-gray-800 text-black dark:text-white font-mono text-sm placeholder-gray-400"
                            />
                            <button
                                onClick={withdrawUSDC}
                                disabled={loading || !usdcWithdrawAmount}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 font-bold border-2 border-black dark:border-gray-500 disabled:opacity-50 text-sm flex items-center justify-center gap-1"
                            >
                                <ArrowUpCircle className="w-4 h-4" />
                                Withdraw
                            </button>
                        </div>
                    </div>
                </div>

                {/* MNT Section */}
                <div className="bg-white dark:bg-gray-900 border-2 border-black dark:border-gray-500 p-4 relative group">
                    <div className="absolute top-2 right-2 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded border border-gray-300 dark:border-gray-600">
                        MetaMask: {parseFloat(walletMnt).toFixed(3)} MNT
                    </div>
                    <div className="text-sm font-bold mb-2 text-indigo-600 dark:text-indigo-400">MNT (Native)</div>
                    <div className="text-3xl font-black mb-4 text-black dark:text-white">{parseFloat(mntBalance).toFixed(4)}</div>

                    <div className="space-y-2 mt-4">
                        {/* Deposit MNT */}
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={mntDepositAmount}
                                onChange={(e) => setMntDepositAmount(e.target.value)}
                                placeholder="Amount"
                                className="w-24 px-2 py-1 border-2 border-black dark:border-gray-500 bg-white dark:bg-gray-800 text-black dark:text-white font-mono text-sm placeholder-gray-400"
                            />
                            <button
                                onClick={depositMNT}
                                disabled={loading || !mntDepositAmount}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 font-bold border-2 border-black dark:border-gray-500 disabled:opacity-50 text-sm flex items-center justify-center gap-1"
                            >
                                <ArrowDownCircle className="w-4 h-4" />
                                Deposit
                            </button>
                        </div>

                        {/* Withdraw MNT */}
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={mntWithdrawAmount}
                                onChange={(e) => setMntWithdrawAmount(e.target.value)}
                                placeholder="Amount"
                                className="w-24 px-2 py-1 border-2 border-black dark:border-gray-500 bg-white dark:bg-gray-800 text-black dark:text-white font-mono text-sm placeholder-gray-400"
                            />
                            <button
                                onClick={withdrawMNT}
                                disabled={loading || !mntWithdrawAmount}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 font-bold border-2 border-black dark:border-gray-500 disabled:opacity-50 text-sm flex items-center justify-center gap-1"
                            >
                                <ArrowUpCircle className="w-4 h-4" />
                                Withdraw
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction History Section */}
            <div className="mt-6 border-t-2 border-black dark:border-white pt-4">
                <div className="flex items-center gap-2 mb-3 text-black dark:text-white">
                    <History className="w-5 h-5" />
                    <h4 className="font-bold uppercase">Recent Transactions</h4>
                </div>
                <div className="bg-white dark:bg-gray-900 border-2 border-black dark:border-gray-500 max-h-60 overflow-y-auto">
                    {transactions.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 font-mono text-sm">No transactions yet.</div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 dark:bg-gray-800 text-xs uppercase font-bold text-gray-700 dark:text-gray-300 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 border-b">Time</th>
                                    <th className="px-4 py-2 border-b">Type</th>
                                    <th className="px-4 py-2 border-b">Amount</th>
                                    <th className="px-4 py-2 border-b">Tx</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx) => (
                                    <tr key={tx.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 font-mono">
                                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                                            {new Date(tx.createdAt).toLocaleTimeString()}
                                        </td>
                                        <td className={`px-4 py-2 font-bold ${['DEPOSIT', 'BUY', 'DEPLOY'].includes(tx.type) ? 'text-green-600' : 'text-red-500'}`}>
                                            {tx.type}
                                        </td>
                                        <td className="px-4 py-2 text-black dark:text-white">
                                            {tx.amount} {tx.token}
                                        </td>
                                        <td className="px-4 py-2">
                                            {tx.txHash && (
                                                <a href={`https://sepolia.mantlescan.xyz/tx/${tx.txHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
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

            <div className="mt-4 text-xs font-mono text-gray-500 dark:text-gray-400 text-center break-all">
                Contract: {smartWalletAddress}
                {operatorAddress && ` | Operator: ${shortAddr(operatorAddress)}`}
            </div>
        </div>
    );
};

function shortAddr(addr: string) {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
