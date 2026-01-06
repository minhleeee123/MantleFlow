import React from 'react';
import { ArrowUpCircle } from 'lucide-react';
import { InputField } from './InputField';

interface Props {
    mntAmount: string;
    setMntAmount: (v: string) => void;
    vaultMnt: string;
    handleWithdraw: (token: 'MNT' | 'USDT', amount: string, setAmount: (v: string) => void) => void;

    usdtAmount: string;
    setUsdtAmount: (v: string) => void;
    vaultUsdt: string;
}

export const WithdrawTab: React.FC<Props> = ({
    mntAmount, setMntAmount, vaultMnt, handleWithdraw,
    usdtAmount, setUsdtAmount, vaultUsdt
}) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2">
        <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                <h4 className="font-bold text-red-800 dark:text-red-300 uppercase text-xs mb-4 flex items-center gap-2">
                    <ArrowUpCircle className="w-4 h-4" /> Withdraw MNT
                </h4>
                <InputField
                    label="Amount"
                    value={mntAmount}
                    onChange={setMntAmount}
                    balance={vaultMnt}
                    symbol="MNT"
                    onMax={() => setMntAmount(vaultMnt)}
                />
                <button
                    onClick={() => handleWithdraw('MNT', mntAmount, setMntAmount)}
                    className="w-full mt-4 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-200 dark:shadow-none"
                    disabled={!mntAmount || parseFloat(mntAmount) <= 0}
                >
                    WITHDRAW MNT
                </button>
            </div>
        </div>
        <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                <h4 className="font-bold text-red-800 dark:text-red-300 uppercase text-xs mb-4 flex items-center gap-2">
                    <ArrowUpCircle className="w-4 h-4" /> Withdraw USDT
                </h4>
                <InputField
                    label="Amount"
                    value={usdtAmount}
                    onChange={setUsdtAmount}
                    balance={vaultUsdt}
                    symbol="USDT"
                    onMax={() => setUsdtAmount(vaultUsdt)}
                />
                <button
                    onClick={() => handleWithdraw('USDT', usdtAmount, setUsdtAmount)}
                    className="w-full mt-4 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-200 dark:shadow-none"
                    disabled={!usdtAmount || parseFloat(usdtAmount) <= 0}
                >
                    WITHDRAW USDT
                </button>
            </div>
        </div>
    </div>
);
