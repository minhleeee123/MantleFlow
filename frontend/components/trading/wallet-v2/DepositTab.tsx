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
            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/30">
                <h4 className="font-bold text-green-800 dark:text-green-300 uppercase text-xs mb-4 flex items-center gap-2">
                    <ArrowDownCircle className="w-4 h-4" /> Deposit MNT
                </h4>
                <InputField
                    label="Amount"
                    value={mntAmount}
                    onChange={setMntAmount}
                    balance={walletMnt}
                    symbol="MNT"
                    onMax={() => setMntAmount(walletMnt)}
                />
                <button
                    onClick={() => handleDeposit('MNT', mntAmount, setMntAmount)}
                    className="w-full mt-4 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-200 dark:shadow-none"
                    disabled={!mntAmount || parseFloat(mntAmount) <= 0}
                >
                    DEPOSIT MNT
                </button>
            </div>
        </div>
        <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/30">
                <h4 className="font-bold text-green-800 dark:text-green-300 uppercase text-xs mb-4 flex items-center gap-2">
                    <ArrowDownCircle className="w-4 h-4" /> Deposit USDT
                </h4>
                <InputField
                    label="Amount"
                    value={usdtAmount}
                    onChange={setUsdtAmount}
                    balance={walletUsdt}
                    symbol="USDT"
                    onMax={() => setUsdtAmount(walletUsdt)}
                />
                <button
                    onClick={() => handleDeposit('USDT', usdtAmount, setUsdtAmount)}
                    className="w-full mt-4 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-200 dark:shadow-none"
                    disabled={!usdtAmount || parseFloat(usdtAmount) <= 0}
                >
                    DEPOSIT USDT
                </button>
            </div>
        </div>
    </div>
);
