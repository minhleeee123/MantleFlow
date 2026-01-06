import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Wallet, RefreshCw, ArrowDownCircle, ArrowUpCircle, ArrowRightLeft } from 'lucide-react';
import { transactionsApi } from '../../services/backendApi';
import { LoadingOverlay } from './wallet-v2/LoadingOverlay';
import { BalanceCard } from './wallet-v2/BalanceCard';
import { DepositTab } from './wallet-v2/DepositTab';
import { WithdrawTab } from './wallet-v2/WithdrawTab';
import { SwapTab } from './wallet-v2/SwapTab';
import { TransactionHistory } from './wallet-v2/TransactionHistory';

// V2 Contract Addresses (Mantle Sepolia)
const VAULT_ADDRESS = '0x2D85E5E8E9C8A90609f147513B9cCc01F8deAB16';
const DEX_ADDRESS = '0x991E5DAB401B44cD5E6C6e5A47F547B17b5bBa5d';
const USDT_ADDRESS = '0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080';

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
    tokenIn: string;
    amountIn: number;
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
    const [processingStep, setProcessingStep] = useState<string>(''); // To show detailed loading status
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
        const interval = setInterval(fetchData, 10000); // 10s refresh
        return () => clearInterval(interval);
    }, [userAddress]);

    // Estimate swap output
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
        } catch (error) {
            console.error('Fetch data error:', error);
        }
    };

    const estimateSwapOutput = async () => {
        try {
            if (!window.ethereum) return;
            const provider = new ethers.BrowserProvider(window.ethereum);
            const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, provider);

            const isMntToUsdt = swapFromToken === 'MNT';
            const amountIn = isMntToUsdt
                ? ethers.parseEther(swapFromAmount)
                : ethers.parseUnits(swapFromAmount, 6);

            const amountOut = await vault.estimateSwap(isMntToUsdt, amountIn);
            setEstimatedOutput(isMntToUsdt
                ? ethers.formatUnits(amountOut, 6)
                : ethers.formatEther(amountOut)
            );
        } catch (error) {
            setEstimatedOutput('0');
        }
    };

    const executeTransaction = async (
        actionName: string,
        actionFn: () => Promise<string> // Returns tx hash
    ) => {
        setLoading(true);
        setProcessingStep('Please sign transaction in wallet...');
        setError('');

        try {
            const txHash = await actionFn();

            setProcessingStep('Waiting for confirmation...');
            // Wait a bit for indexing
            await new Promise(resolve => setTimeout(resolve, 2000));

            setProcessingStep('Updating data...');
            await fetchData();

            // Success!
            setProcessingStep('');

        } catch (error: any) {
            console.error(error);
            setError(error.reason || error.message || 'Transaction failed');
        } finally {
            setLoading(false);
            setProcessingStep('');
        }
    };

    const handleDeposit = async (token: 'MNT' | 'USDT', amountStr: string, setAmountStr: (v: string) => void) => {
        if (!amountStr || parseFloat(amountStr) <= 0) return;

        await executeTransaction(`Deposit ${token}`, async () => {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);

            let tx;
            if (token === 'MNT') {
                tx = await vault.depositMnt({ value: ethers.parseEther(amountStr) });
            } else {
                const usdt = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, signer);
                const amountWei = ethers.parseUnits(amountStr, 6);

                // Check allowance
                setProcessingStep('Checking allowance...');
                const allowance = await usdt.allowance(await signer.getAddress(), VAULT_ADDRESS);
                if (allowance < amountWei) {
                    setProcessingStep('Approving USDT (1/2)...');
                    const approveTx = await usdt.approve(VAULT_ADDRESS, amountWei);
                    await approveTx.wait();
                }

                setProcessingStep('Confirming Deposit (2/2)...');
                tx = await vault.depositUsdt(amountWei);
            }

            await tx.wait();

            // Log to backend
            await transactionsApi.create({
                type: 'DEPOSIT',
                token: token,
                amount: parseFloat(amountStr),
                txHash: tx.hash
            });

            setAmountStr('');
            return tx.hash;
        });
    };

    const handleWithdraw = async (token: 'MNT' | 'USDT', amountStr: string, setAmountStr: (v: string) => void) => {
        if (!amountStr || parseFloat(amountStr) <= 0) return;

        await executeTransaction(`Withdraw ${token}`, async () => {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);

            let tx;
            if (token === 'MNT') {
                tx = await vault.withdrawMnt(ethers.parseEther(amountStr));
            } else {
                tx = await vault.withdrawUsdt(ethers.parseUnits(amountStr, 6));
            }

            await tx.wait();

            await transactionsApi.create({
                type: 'WITHDRAW',
                token: token,
                amount: parseFloat(amountStr),
                txHash: tx.hash
            });

            setAmountStr('');
            return tx.hash;
        });
    };

    const handleSwap = async () => {
        if (!swapFromAmount || parseFloat(swapFromAmount) <= 0) return;

        await executeTransaction('Swap', async () => {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);

            const estimatedOut = parseFloat(estimatedOutput);
            const minOut = estimatedOut * 0.95; // 5% slippage

            let tx;
            if (swapFromToken === 'MNT') {
                const amountIn = ethers.parseEther(swapFromAmount);
                const minOutWei = ethers.parseUnits(minOut.toFixed(6), 6);
                tx = await vault.swapMntToUsdt(amountIn, minOutWei);
            } else {
                const amountIn = ethers.parseUnits(swapFromAmount, 6);
                const minOutWei = ethers.parseEther(minOut.toFixed(18));
                tx = await vault.swapUsdtToMnt(amountIn, minOutWei);
            }

            await tx.wait();

            const swapType = swapFromToken === 'MNT' ? 'SWAP_MNT_USDT' : 'SWAP_USDT_MNT';
            await transactionsApi.create({
                type: swapType as any,
                token: swapFromToken,
                amount: parseFloat(swapFromAmount),
                txHash: tx.hash
            });

            setSwapFromAmount('');
            return tx.hash;
        });
    };

    return (
        <div className="w-full mb-10">
            {/* Header Area */}
            <div className="flex justify-between items-end mb-8 border-b-2 border-black dark:border-white pb-4">
                <div>
                    <h2 className="text-4xl font-black uppercase text-black dark:text-white mb-2 flex items-center gap-3">
                        <Wallet className="w-10 h-10" />
                        Vault Wallet
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-mono font-bold">
                        <div className="w-3 h-3 bg-green-500 border border-black"></div>
                        CONNECTED: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs font-black uppercase text-black dark:text-white mb-1 bg-yellow-400 dark:bg-yellow-600 px-2 border border-black inline-block">MNT Price</div>
                    <div className="font-mono text-2xl font-black bg-white dark:bg-black text-black dark:text-white px-4 py-1 border-2 border-black dark:border-white shadow-neo">
                        ${parseFloat(mntPrice).toFixed(2)}
                    </div>
                </div>
            </div>

            {/* ERROR DISPLAY */}
            {error && (
                <div className="bg-red-500 border-2 border-black text-white p-4 mb-6 font-bold flex items-center justify-between shadow-neo animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl bg-white text-black w-8 h-8 flex items-center justify-center border-2 border-black">!</span>
                        <span className="uppercase tracking-wide">{error}</span>
                    </div>
                    <button onClick={() => setError('')} className="hover:bg-black hover:text-white p-1 border-2 border-transparent hover:border-white transition-colors">✕</button>
                </div>
            )}

            {/* BALANCE CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <BalanceCard
                    title="MNT Balance"
                    balance={vaultMntBalance}
                    symbol="MNT"
                    usdValue={parseFloat(vaultMntBalance) * parseFloat(mntPrice)}
                />
                <BalanceCard
                    title="USDT Balance"
                    balance={vaultUsdtBalance}
                    symbol="USDT"
                    usdValue={parseFloat(vaultUsdtBalance)} // Assumes 1 USDT = $1
                />
            </div>

            {/* MAIN ACTION AREA */}
            <div className="bg-white dark:bg-[#1a1a1a] border-2 border-black dark:border-white shadow-neo overflow-hidden relative min-h-[400px]">

                {/* GLOBAL LOADING OVERLAY */}
                {loading && <LoadingOverlay message={processingStep} />}

                {/* TABS */}
                <div className="flex border-b-2 border-black dark:border-white">
                    {[
                        { id: 'deposit', label: 'Deposit Funds', icon: ArrowDownCircle },
                        { id: 'withdraw', label: 'Withdraw', icon: ArrowUpCircle },
                        { id: 'swap', label: 'Instant Swap', icon: ArrowRightLeft },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 py-5 flex items-center justify-center gap-3 font-black uppercase text-lg tracking-wider transition-all
                                ${activeTab === tab.id
                                    ? 'bg-black text-white dark:bg-white dark:text-black'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 border-r-2 border-black last:border-r-0'
                                }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* CONTENT */}
                <div className="p-8">
                    {activeTab === 'deposit' && (
                        <DepositTab
                            mntAmount={depositMntAmount} setMntAmount={setDepositMntAmount} walletMnt={walletMnt}
                            usdtAmount={depositUsdtAmount} setUsdtAmount={setDepositUsdtAmount} walletUsdt={walletUsdt}
                            handleDeposit={handleDeposit}
                        />
                    )}

                    {activeTab === 'withdraw' && (
                        <WithdrawTab
                            mntAmount={withdrawMntAmount} setMntAmount={setWithdrawMntAmount} vaultMnt={vaultMntBalance}
                            usdtAmount={withdrawUsdtAmount} setUsdtAmount={setWithdrawUsdtAmount} vaultUsdt={vaultUsdtBalance}
                            handleWithdraw={handleWithdraw}
                        />
                    )}

                    {activeTab === 'swap' && (
                        <SwapTab
                            swapFromToken={swapFromToken} setSwapFromToken={setSwapFromToken}
                            swapFromAmount={swapFromAmount} setSwapFromAmount={setSwapFromAmount}
                            estimatedOutput={estimatedOutput} handleSwap={handleSwap}
                            vaultMnt={vaultMntBalance} vaultUsdt={vaultUsdtBalance}
                        />
                    )}
                </div>
            </div>

            {/* TRANSACTION HISTORY */}
            <TransactionHistory transactions={transactions} />
        </div>
    );
};
