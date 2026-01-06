import React from 'react';
import { Coins } from 'lucide-react';

interface BalanceCardProps {
    title: string;
    balance: string;
    symbol: string;
    usdValue: number;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ title, balance, symbol, usdValue }) => (
    <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] rounded-xl transition-all hover:translate-y-[-2px]">
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Coins className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </div>
                <span className="font-bold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wide">{title}</span>
            </div>
            <div className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded text-[10px] font-bold uppercase tracking-wider">
                Vault
            </div>
        </div>
        <div className="space-y-1">
            <div className="text-3xl font-black text-black dark:text-white tracking-tight">
                {parseFloat(balance).toFixed(4)}
                <span className="ml-2 text-sm font-medium text-gray-400">{symbol}</span>
            </div>
            <div className="text-sm font-mono text-gray-500 dark:text-gray-400">
                ≈ ${usdValue.toFixed(2)} USD
            </div>
        </div>
    </div>
);
