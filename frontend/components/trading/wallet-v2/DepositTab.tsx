import React from 'react';
import { ArrowDownCircle } from 'lucide-react';
import { InputField } from './InputField';

interface Props {
    mntAmount: string;
    setMntAmount: (v: string) => void;
    walletMnt: string;
    handleDeposit: (token: 'MNT' | 'USDT', amount: string, setAmount: (v: string) => void) => void;

    usdtAmount: string;
    setUsdtAmount: (v: string) => void;
    walletUsdt: string;
}

export const DepositTab: React.FC<Props> = ({
    mntAmount, setMntAmount, walletMnt, handleDeposit,
    usdtAmount, setUsdtAmount, walletUsdt
}) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2">
        <div className="space-y-4">
            <div className="p-6 bg-green-100 dark:bg-green-900/20 border-2 border-black dark:border-green-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]">
                <h4 className="font-black text-black dark:text-green-400 uppercase text-lg mb-6 flex items-center gap-2 border-b-2 border-black dark:border-green-500 pb-2 w-fit">
                    <ArrowDownCircle className="w-6 h-6" /> Deposit MNT
                </h4>
                <InputField
                    label="Amount to Deposit"
                    value={mntAmount}
                    onChange={setMntAmount}
                    balance={walletMnt}
                    symbol="MNT"
                    onMax={() => setMntAmount(walletMnt)}
                    error={parseFloat(mntAmount) > parseFloat(walletMnt) ? 'Insufficient MNT' : undefined}
                    balanceLabel="WALLET BALANCE"
                />
                <button
                    onClick={() => handleDeposit('MNT', mntAmount, setMntAmount)}
                    className="w-full mt-6 bg-green-500 text-black border-2 border-black font-black py-4 text-xl hover:bg-green-400 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 disabled:cursor-not-allowed"
                    disabled={!mntAmount || parseFloat(mntAmount) <= 0 || parseFloat(mntAmount) > parseFloat(walletMnt)}
                >
                    CONFIRM DEPOSIT
                </button>
            </div>
        </div>
        <div className="space-y-4">
            <div className="p-6 bg-green-100 dark:bg-green-900/20 border-2 border-black dark:border-green-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]">
                <h4 className="font-black text-black dark:text-green-400 uppercase text-lg mb-6 flex items-center gap-2 border-b-2 border-black dark:border-green-500 pb-2 w-fit">
                    <ArrowDownCircle className="w-6 h-6" /> Deposit USDT
                </h4>
                <InputField
                    label="Amount to Deposit"
                    value={usdtAmount}
                    onChange={setUsdtAmount}
                    balance={walletUsdt}
                    symbol="USDT"
                    onMax={() => setUsdtAmount(walletUsdt)}
                    error={parseFloat(usdtAmount) > parseFloat(walletUsdt) ? 'Insufficient USDT' : undefined}
                    balanceLabel="WALLET BALANCE"
                />
                <button
                    onClick={() => handleDeposit('USDT', usdtAmount, setUsdtAmount)}
                    className="w-full mt-6 bg-green-500 text-black border-2 border-black font-black py-4 text-xl hover:bg-green-400 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 disabled:cursor-not-allowed"
                    disabled={!usdtAmount || parseFloat(usdtAmount) <= 0 || parseFloat(usdtAmount) > parseFloat(walletUsdt)}
                >
                    CONFIRM DEPOSIT
                </button>
            </div>
        </div>
    </div>
);
