import React, { useState, useEffect } from 'react';
import { TransactionData } from '../types';
import { sendTransaction } from '../services/web3Service';
import { ArrowRight, Check, AlertCircle, Loader2, Wallet, Settings } from 'lucide-react';

interface Props {
  data: TransactionData;
}

const NETWORKS = [
    "Ethereum Mainnet", 
    "Sepolia Testnet", 
    "Binance Smart Chain", 
    "Polygon", 
    "Avalanche C-Chain"
];

const TransactionCard: React.FC<Props> = ({ data }) => {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [type, setType] = useState<'SEND' | 'SWAP'>(data.type);
  const [amount, setAmount] = useState<string>(data.amount ? data.amount.toString() : '');
  const [token, setToken] = useState<string>(data.token || 'ETH');
  const [targetToken, setTargetToken] = useState<string>(data.targetToken || '');
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [toAddress, setToAddress] = useState<string>(data.toAddress || '');
  
  const [network, setNetwork] = useState<string>(data.network || 'Ethereum Mainnet');
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (type === 'SWAP' && amount && token && targetToken) {
        setIsCalculating(true);
        const timer = setTimeout(() => {
            let rate = 1;
            const pair = `${token.toUpperCase()}-${targetToken.toUpperCase()}`;
            if (pair === 'ETH-USDT') rate = 3200;
            else if (pair === 'USDT-ETH') rate = 1 / 3200;
            else if (pair === 'BTC-USDT') rate = 65000;
            else if (pair === 'USDT-BTC') rate = 1 / 65000;
            else if (pair === 'SOL-USDT') rate = 145;
            else if (pair === 'USDT-SOL') rate = 1 / 145;
            else rate = Math.random() * 2 + 0.5;

            const val = parseFloat(amount) * rate;
            setTargetAmount(val < 1 ? val.toFixed(6) : val.toFixed(2));
            setIsCalculating(false);
        }, 800);
        return () => clearTimeout(timer);
    } else {
        setTargetAmount('');
    }
  }, [amount, token, targetToken, type]);

  const isValid = () => {
    const isAmountValid = parseFloat(amount) > 0;
    if (type === 'SEND') {
        return isAmountValid && !!network && !!toAddress && !!token;
    } else {
        return isAmountValid && !!token && !!targetToken && !!network;
    }
  };

  const handleConfirm = async () => {
    setStatus('sending');
    setErrorMessage('');
    try {
        let destination = toAddress;
        if (type === 'SWAP') {
             destination = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; 
        }
        if (!destination) throw new Error("Destination address required");
        const result = await sendTransaction(destination, amount, network);
        if (result && result.hash) {
            setTxHash(result.hash);
            setStatus('success');
        } else {
            setStatus('error');
            setErrorMessage("Transaction rejected or failed.");
        }
    } catch (error: any) {
        console.error("Tx Error", error);
        setStatus('error');
        setErrorMessage(error.reason || error.message || "User rejected transaction");
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-[#1e1f20] border-2 border-black dark:border-white shadow-neo mt-4">
      {/* Header */}
      <div className="bg-neo-primary p-4 border-b-2 border-black dark:border-white flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black flex items-center justify-center border-2 border-white">
                <Wallet className="w-4 h-4 text-white" />
            </div>
            <div>
                <h3 className="font-black text-white text-base uppercase tracking-wide">Review Tx</h3>
            </div>
        </div>
        <div className="px-2 py-1 bg-white border-2 border-black text-xs font-black uppercase shadow-neo-sm transform -rotate-3">
            {type}
        </div>
      </div>

      <div className="p-5 space-y-5">
        
        {/* Network Selection */}
        <div className="space-y-1">
            <label className="text-xs font-bold uppercase ml-1 text-black dark:text-white">Network</label>
            <div className="relative">
                <select 
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className="w-full bg-white dark:bg-[#262626] text-black dark:text-white text-sm p-3 border-2 border-black dark:border-white outline-none appearance-none cursor-pointer hover:bg-gray-100 font-bold shadow-neo-sm"
                >
                    {NETWORKS.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <Settings className="w-4 h-4 text-black dark:text-white absolute right-3 top-3.5 pointer-events-none" />
            </div>
        </div>

        {/* Amount & Token Input Row */}
        <div className="flex gap-3">
            <div className="flex-1 space-y-1">
                <label className="text-xs font-bold uppercase ml-1 text-black dark:text-white">Pay</label>
                <input 
                    type="number" 
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`neo-input w-full p-3 text-lg font-bold outline-none text-black dark:text-white ${!amount ? 'bg-yellow-50 dark:bg-black' : 'bg-white dark:bg-black'}`}
                />
            </div>
            <div className="w-1/3 space-y-1">
                <label className="text-xs font-bold uppercase ml-1 text-black dark:text-white">Asset</label>
                <input 
                    type="text" 
                    value={token}
                    onChange={(e) => setToken(e.target.value.toUpperCase())}
                    placeholder="ETH"
                    className="neo-input w-full p-3 text-lg font-bold outline-none uppercase text-center bg-white dark:bg-black text-black dark:text-white"
                />
            </div>
        </div>

        {/* Destination / Swap Target */}
        {type === 'SEND' ? (
             <div className="space-y-1">
                <label className="text-xs font-bold uppercase ml-1 text-black dark:text-white">To Address</label>
                <input 
                    type="text" 
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                    placeholder="0x..."
                    className={`neo-input w-full p-3 text-sm font-mono text-blue-700 dark:text-blue-300 outline-none ${!toAddress ? 'bg-yellow-50 dark:bg-black' : 'bg-white dark:bg-black'}`}
                />
             </div>
        ) : (
            <>
                <div className="flex justify-center -my-2">
                    <div className="bg-neo-yellow p-1.5 border-2 border-black z-10">
                        <ArrowRight className="w-4 h-4 text-black rotate-90" strokeWidth={3} />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase ml-1 text-black dark:text-white">Receive (Est.)</label>
                    <div className="flex gap-3">
                         <div className="flex-1 neo-input p-3 flex items-center justify-between bg-gray-50 dark:bg-black">
                            {isCalculating ? (
                                <span className="flex items-center gap-2 text-gray-500 text-sm font-bold">
                                    <Loader2 className="w-4 h-4 animate-spin" /> ...
                                </span>
                            ) : (
                                <span className="text-lg font-bold text-black dark:text-white">
                                    {targetAmount || "0.00"}
                                </span>
                            )}
                         </div>
                         <input 
                            type="text" 
                            value={targetToken}
                            onChange={(e) => setTargetToken(e.target.value.toUpperCase())}
                            placeholder="USDT"
                            className={`neo-input w-1/3 p-3 text-lg font-bold outline-none uppercase text-center text-black dark:text-white ${!targetToken ? 'bg-yellow-50 dark:bg-black' : 'bg-white dark:bg-black'}`}
                         />
                    </div>
                </div>
            </>
        )}

        {/* Status Messages */}
        {status === 'success' && (
            <div className="bg-neo-secondary border-2 border-black p-3 flex items-start gap-2 text-black text-xs font-bold shadow-neo-sm">
                <Check className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={3} />
                <div>
                    <span className="block uppercase">Success</span>
                    Hash: {txHash.slice(0,10)}...
                </div>
            </div>
        )}

        {status === 'error' && (
            <div className="bg-neo-accent border-2 border-black p-3 flex items-start gap-2 text-black text-xs font-bold shadow-neo-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={3} />
                <div>
                    <span className="block uppercase">Failed</span>
                    {errorMessage}
                </div>
            </div>
        )}

        {/* Action Button */}
        <button
            onClick={handleConfirm}
            disabled={!isValid() || status === 'sending' || status === 'success'}
            className={`neo-btn w-full py-4 flex items-center justify-center gap-2 text-base
                ${isValid() 
                    ? 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400 shadow-none'
                }
            `}
        >
            {status === 'sending' ? (
                <>
                   <Loader2 className="w-5 h-5 animate-spin" /> SIGNING...
                </>
            ) : status === 'success' ? (
                <>
                   <Check className="w-5 h-5" /> SUBMITTED
                </>
            ) : (
                "EXECUTE TRANSACTION"
            )}
        </button>
      </div>
    </div>
  );
};

export default TransactionCard;