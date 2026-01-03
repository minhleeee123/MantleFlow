import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Wallet, ArrowDownCircle, ArrowUpCircle, RefreshCw } from 'lucide-react';

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

export const ContractWallet: React.FC<Props> = ({ userAddress }) => {
    const [usdcBalance, setUsdcBalance] = useState('0');
    const [mntBalance, setMntBalance] = useState('0');
    const [walletMnt, setWalletMnt] = useState('0');
    const [walletUsdc, setWalletUsdc] = useState('0');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Input States
    const [usdcDepositAmount, setUsdcDepositAmount] = useState('');
    const [usdcWithdrawAmount, setUsdcWithdrawAmount] = useState('');
    const [mntDepositAmount, setMntDepositAmount] = useState('');
    const [mntWithdrawAmount, setMntWithdrawAmount] = useState('');

    const fetchBalances = async () => {
        if (!window.ethereum) return;
        setError('');

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
            const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);

            // 1. Contract Balances (Funds managed by Bot)
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

        } catch (error: any) {
            console.error('Error fetching balances:', error);
            setError('Failed to fetch balances. Ensure you are on Mantle Sepolia.');
        }
    };

    useEffect(() => {
        fetchBalances();
        const interval = setInterval(fetchBalances, 10000);
        return () => clearInterval(interval);
    }, [userAddress]);

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

            alert(`Deposited ${amount} USDC successfully!`);
            setUsdcDepositAmount('');
            fetchBalances();
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

            alert(`Deposited ${amount} MNT successfully!`);
            setMntDepositAmount('');
            fetchBalances();
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

            alert(`Withdrew ${amount} MNT successfully!`);
            setMntWithdrawAmount('');
            fetchBalances();
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

            alert(`Withdrew ${amount} USDC successfully!`);
            setUsdcWithdrawAmount('');
            fetchBalances();
        } catch (error: any) {
            console.error('Withdraw error:', error);
            setError(error.reason || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-neo-secondary border-2 border-black shadow-neo p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <Wallet className="w-6 h-6" />
                    <h3 className="font-black text-xl uppercase">Smart Contract Wallet (Testnet)</h3>
                </div>
                <button
                    onClick={fetchBalances}
                    className="p-2 hover:bg-black/5 rounded-full transition-colors"
                    title="Refresh Balances"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border-2 border-red-500 text-red-700 p-3 mb-4 font-bold text-sm">
                    ⚠️ {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* USDC Section */}
                <div className="bg-white border-2 border-black p-4 relative group">
                    <div className="absolute top-2 right-2 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-300">
                        Wallet: {parseFloat(walletUsdc).toFixed(2)} USDC
                    </div>
                    <div className="text-sm font-bold mb-2 text-indigo-600">USDC (Stablecoin)</div>
                    <div className="text-3xl font-black mb-4">{parseFloat(usdcBalance).toFixed(2)}</div>

                    <div className="space-y-2">
                        {/* Deposit Input */}
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={usdcDepositAmount}
                                onChange={(e) => setUsdcDepositAmount(e.target.value)}
                                placeholder="Amount"
                                className="w-24 px-2 py-1 border-2 border-black font-mono text-sm"
                            />
                            <button
                                onClick={depositUSDC}
                                disabled={loading || !usdcDepositAmount}
                                className="flex-1 bg-green-500 text-white px-3 py-2 font-bold border-2 border-black hover:bg-green-600 disabled:opacity-50 text-sm flex items-center justify-center gap-1"
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
                                className="w-24 px-2 py-1 border-2 border-black font-mono text-sm"
                            />
                            <button
                                onClick={withdrawUSDC}
                                disabled={loading || !usdcWithdrawAmount}
                                className="flex-1 bg-red-500 text-white px-3 py-2 font-bold border-2 border-black hover:bg-red-600 disabled:opacity-50 text-sm flex items-center justify-center gap-1"
                            >
                                <ArrowUpCircle className="w-4 h-4" />
                                Withdraw
                            </button>
                        </div>
                    </div>
                </div>

                {/* MNT Section */}
                <div className="bg-white border-2 border-black p-4 relative group">
                    <div className="absolute top-2 right-2 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-300">
                        Wallet: {parseFloat(walletMnt).toFixed(3)} MNT
                    </div>
                    <div className="text-sm font-bold mb-2 text-indigo-600">MNT (Native)</div>
                    <div className="text-3xl font-black mb-4">{parseFloat(mntBalance).toFixed(4)}</div>

                    <div className="space-y-2 mt-4">
                        {/* Deposit MNT */}
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={mntDepositAmount}
                                onChange={(e) => setMntDepositAmount(e.target.value)}
                                placeholder="Amount"
                                className="w-24 px-2 py-1 border-2 border-black font-mono text-sm"
                            />
                            <button
                                onClick={depositMNT}
                                disabled={loading || !mntDepositAmount}
                                className="flex-1 bg-green-500 text-white px-3 py-2 font-bold border-2 border-black hover:bg-green-600 disabled:opacity-50 text-sm flex items-center justify-center gap-1"
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
                                className="w-24 px-2 py-1 border-2 border-black font-mono text-sm"
                            />
                            <button
                                onClick={withdrawMNT}
                                disabled={loading || !mntWithdrawAmount}
                                className="flex-1 bg-red-500 text-white px-3 py-2 font-bold border-2 border-black hover:bg-red-600 disabled:opacity-50 text-sm flex items-center justify-center gap-1"
                            >
                                <ArrowUpCircle className="w-4 h-4" />
                                Withdraw
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 text-xs font-mono text-gray-500 text-center break-all">
                Contract: {CONTRACT_ADDRESS}
            </div>
        </div>
    );
};
