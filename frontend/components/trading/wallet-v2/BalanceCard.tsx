import React from 'react';
import { Coins } from 'lucide-react';

interface BalanceCardProps {
    title: string;
    balance: string;
    symbol: string;
    usdValue: number;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ title, balance, symbol, usdValue }) => (
    <div className="bg-white dark:bg-[#1a1a1a] border-2 border-black dark:border-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.4)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-400 dark:bg-yellow-600 border-2 border-black">
                    <Coins className="w-6 h-6 text-black" />
                </div>
                <span className="font-black text-black dark:text-white text-lg uppercase tracking-wide">{title}</span>
            </div>
            <div className="px-3 py-1 bg-black text-white dark:bg-white dark:text-black text-xs font-bold uppercase tracking-wider">
                Vault
            </div>
        </div>
        <div className="space-y-2">
            <div className="text-4xl font-black text-black dark:text-white tracking-tighter">
                {parseFloat(balance).toFixed(4)}
                <span className="ml-3 text-lg font-bold text-gray-500">{symbol}</span>
            </div>
            <div className="inline-block bg-gray-100 dark:bg-gray-800 px-2 py-1 border border-black dark:border-gray-500">
                <div className="text-sm font-mono font-bold text-gray-700 dark:text-gray-300">
                    ≈ ${usdValue.toFixed(2)} USD
                </div>
            </div>
        </div>
    </div>
);
