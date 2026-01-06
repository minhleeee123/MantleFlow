import React from 'react';
import { History, ExternalLink, ArrowDownCircle, ArrowUpCircle, ArrowRightLeft } from 'lucide-react';

interface Transaction {
    id: string;
    type: 'DEPOSIT' | 'WITHDRAW' | 'SWAP_MNT_USDT' | 'SWAP_USDT_MNT';
    tokenIn: string;
    amountIn: number;
    txHash?: string;
    createdAt: string;
}

interface Props {
    transactions: Transaction[];
}

export const TransactionHistory: React.FC<Props> = ({ transactions }) => (
    <div className="mt-10">
        <div className="flex items-center gap-3 mb-4 opacity-80">
            <History className="w-5 h-5" />
            <h3 className="uppercase font-bold text-sm tracking-widest text-gray-500">Recent Activity</h3>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            {transactions.length === 0 ? (
                <div className="p-10 text-center text-gray-400 font-mono text-sm">
                    NO TRANSACTIONS YET
                </div>
            ) : (
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                        <tr>
                            <th className="px-6 py-4 font-bold text-gray-500 uppercase text-xs">Type</th>
                            <th className="px-6 py-4 font-bold text-gray-500 uppercase text-xs">Amount</th>
                            <th className="px-6 py-4 font-bold text-gray-500 uppercase text-xs text-right">Time</th>
                            <th className="px-6 py-4 font-bold text-gray-500 uppercase text-xs text-center">Tx</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {transactions.slice(0, 10).map(tx => (
                            <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <td className="px-6 py-4">
                                    <span className={`
                                            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                            ${tx.type === 'DEPOSIT' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}
                                            ${tx.type === 'WITHDRAW' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}
                                            ${tx.type.includes('SWAP') && 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'}
                                        `}>
                                        {tx.type.includes('SWAP') ? <ArrowRightLeft className="w-3 h-3" /> : (tx.type === 'DEPOSIT' ? <ArrowDownCircle className="w-3 h-3" /> : <ArrowUpCircle className="w-3 h-3" />)}
                                        {tx.type.replace('SWAP_', '').replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-mono font-medium">
                                    {tx.amountIn} <span className="text-gray-400 text-xs">{tx.tokenIn}</span>
                                </td>
                                <td className="px-6 py-4 text-right text-gray-500 text-xs font-mono">
                                    {new Date(tx.createdAt).toLocaleTimeString()}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {tx.txHash && (
                                        <a href={`https://sepolia.mantlescan.xyz/tx/${tx.txHash}`} target="_blank" rel="noreferrer"
                                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                                            <ExternalLink className="w-4 h-4" />
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
);
