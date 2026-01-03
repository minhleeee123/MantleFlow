import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Wallet, ArrowDownCircle, ArrowUpCircle, RefreshCw, History, ExternalLink } from 'lucide-react';
import { transactionsApi } from '../../services/backendApi';

const CONTRACT_ADDRESS = '0xaD893d3b35FA8cc23A24a0fdF0B79cc22a1a5E44';

const CONTRACT_ABI = [
    'function deposit(address token, uint256 amount) external payable',
    'function withdraw(address token, uint256 amount) external',
    'function getBalance(address user, address token) external view returns (uint256)'
];

const ERC20_ABI = [
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function allowance(address owner, address spender) external view returns (uint256)',
    'function balanceOf(address account) external view returns (uint256)'
];

const USDC_ADDRESS = '0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080';

interface Props {
    userAddress: string;
}

interface Transaction {
    id: string;
    type: 'DEPOSIT' | 'WITHDRAW';
    token: string;
    amount: number;
    txHash?: string;
    createdAt: string;
}

export const ContractWallet: React.FC<Props> = ({ userAddress }) => {
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

    const fetchData = async () => {
        if (!window.ethereum) return;
        setError('');

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
            const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);

            // 1. Contract Balances
            const botUsdc = await contract.getBalance(userAddress, USDC_ADDRESS);
            setUsdcBalance(ethers.formatUnits(botUsdc, 6));

            const botMnt = await contract.getBalance(userAddress, ethers.ZeroAddress);
            setMntBalance(ethers.formatEther(botMnt));

            // 2. Wallet Balances
            const signer = await provider.getSigner();
            const signerAddress = await signer.getAddress();

            const walletMntBal = await provider.getBalance(signerAddress);
            setWalletMnt(ethers.formatEther(walletMntBal));

            const walletUsdcBal = await usdcContract.balanceOf(signerAddress);
            setWalletUsdc(ethers.formatUnits(walletUsdcBal, 6));

            // 3. Transactions
            try {
                const history = await transactionsApi.list();
                setTransactions(history);
            } catch (err) {
                console.warn('Failed to load history', err);
            }

        } catch (error: any) {
            console.error('Error fetching data:', error);
            setError('Failed to fetch data. Ensure you are on Mantle Sepolia.');
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [userAddress]);

    const recordTransaction = async (type: 'DEPOSIT' | 'WITHDRAW', token: string, amount: number, txHash: string) => {
        try {
            await transactionsApi.create({ type, token, amount, txHash });
            fetchData(); // Refresh list
        } catch (error) {
            console.error('Failed to record transaction', error);
        }
    };

    const depositUSDC = async () => {
        if (!window.ethereum || !usdcDepositAmount) return;
        const amount = parseFloat(usdcDepositAmount);
        if (isNaN(amount) || amount <= 0) {
            setError('Invalid amount');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);
            const balance = await usdcContract.balanceOf(signer.getAddress());
            const amountWei = ethers.parseUnits(amount.toString(), 6);

            if (balance < amountWei) {
                throw new Error('Insufficient USDC in wallet');
            }

            // Approve USDC
            console.log('Approving USDC...');
            const approveTx = await usdcContract.approve(CONTRACT_ADDRESS, amountWei);
            await approveTx.wait();

            // Deposit
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            console.log('Depositing USDC...');
            const depositTx = await contract.deposit(USDC_ADDRESS, amountWei);
            await depositTx.wait();

            await recordTransaction('DEPOSIT', 'USDC', amount, depositTx.hash);
            alert(`Deposited ${amount} USDC successfully!`);
            setUsdcDepositAmount('');
        } catch (error: any) {
            console.error('Deposit error:', error);
            setError(error.reason || error.message);
        } finally {
            setLoading(false);
        }
    };

    const depositMNT = async () => {
        if (!window.ethereum || !mntDepositAmount) return;
        const amount = parseFloat(mntDepositAmount);
        if (isNaN(amount) || amount <= 0) {
            setError('Invalid amount');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const balance = await provider.getBalance(signer.getAddress());
            const amountWei = ethers.parseEther(amount.toString());

            if (balance < amountWei) {
                throw new Error('Insufficient MNT in wallet');
            }

            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            const tx = await contract.deposit(ethers.ZeroAddress, amountWei, {
                value: amountWei
            });
            await tx.wait();

            await recordTransaction('DEPOSIT', 'MNT', amount, tx.hash);
            alert(`Deposited ${amount} MNT successfully!`);
            setMntDepositAmount('');
        } catch (error: any) {
            console.error('Deposit error:', error);
            setError(error.reason || error.message);
        } finally {
            setLoading(false);
        }
    };

    const withdrawMNT = async () => {
        if (!window.ethereum || !mntWithdrawAmount) return;
        const amount = parseFloat(mntWithdrawAmount);
        if (isNaN(amount) || amount <= 0) {
            setError('Invalid amount');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            const amountWei = ethers.parseEther(amount.toString());

            // Check Contract Balance
            const currentBal = await contract.getBalance(userAddress, ethers.ZeroAddress);
            if (currentBal < amountWei) {
                throw new Error('Insufficient MNT balance in contract');
            }

            const tx = await contract.withdraw(ethers.ZeroAddress, amountWei);
            await tx.wait();

            await recordTransaction('WITHDRAW', 'MNT', amount, tx.hash);
            alert(`Withdrew ${amount} MNT successfully!`);
            setMntWithdrawAmount('');
        } catch (error: any) {
            console.error('Withdraw error:', error);
            setError(error.reason || error.message);
        } finally {
            setLoading(false);
        }
    };

    const withdrawUSDC = async () => {
        if (!window.ethereum || !usdcWithdrawAmount) return;
        const amount = parseFloat(usdcWithdrawAmount);
        if (isNaN(amount) || amount <= 0) {
            setError('Invalid amount');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            const amountWei = ethers.parseUnits(amount.toString(), 6);

            const currentBal = await contract.getBalance(userAddress, USDC_ADDRESS);
            if (currentBal < amountWei) {
                throw new Error('Insufficient USDC balance in contract');
            }

            const tx = await contract.withdraw(USDC_ADDRESS, amountWei);
            await tx.wait();

            await recordTransaction('WITHDRAW', 'USDC', amount, tx.hash);
            alert(`Withdrew ${amount} USDC successfully!`);
            setUsdcWithdrawAmount('');
        } catch (error: any) {
            console.error('Withdraw error:', error);
            setError(error.reason || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-neo-secondary dark:bg-gray-800 border-2 border-black dark:border-white shadow-neo dark:shadow-none p-6 mb-6 transition-colors">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-black dark:text-white">
                    <Wallet className="w-6 h-6" />
                    <h3 className="font-black text-xl uppercase">Smart Contract Wallet (Testnet)</h3>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* USDC Section */}
                <div className="bg-white dark:bg-gray-900 border-2 border-black dark:border-gray-500 p-4 relative group">
                    <div className="absolute top-2 right-2 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded border border-gray-300 dark:border-gray-600">
                        Wallet: {parseFloat(walletUsdc).toFixed(2)} USDC
                    </div>
                    <div className="text-sm font-bold mb-2 text-indigo-600 dark:text-indigo-400">USDC (Stablecoin)</div>
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
                        Wallet: {parseFloat(walletMnt).toFixed(3)} MNT
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
                                        <td className={`px-4 py-2 font-bold ${['DEPOSIT', 'BUY'].includes(tx.type) ? 'text-green-600' : 'text-red-500'}`}>
                                            {tx.type}
                                        </td>
                                        <td className="px-4 py-2 text-black dark:text-white">
                                            {tx.amount} {tx.token}
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

            <div className="mt-4 text-xs font-mono text-gray-500 dark:text-gray-400 text-center break-all">
                Contract: {CONTRACT_ADDRESS}
            </div>
        </div>
    );
};
