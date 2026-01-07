import React from 'react';
import { History, ExternalLink, ArrowDownCircle, ArrowUpCircle, ArrowRightLeft } from 'lucide-react';

interface Transaction {
    id: string;
    type: string;
    symbol: string;
    amount: number;
    txHash?: string;
    timestamp: number;
}

interface Props {
    transactions: Transaction[];
}

export const TransactionHistory: React.FC<Props> = ({ transactions }) => (
    <div className="mt-12">
        <div className="flex items-center gap-3 mb-6">
            <div className="bg-black text-white p-2">
                <History className="w-5 h-5" />
            </div>
            <h3 className="uppercase font-black text-xl tracking-widest text-black dark:text-white">Recent Activity</h3>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] border-2 border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.4)] overflow-hidden">
            {transactions.length === 0 ? (
                <div className="p-10 text-center text-gray-400 font-mono text-sm font-bold uppercase">
                    / NO TRANSACTIONS RECORDED /
                </div>
            ) : (
                <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-sm text-left border-collapse relative">
                        <thead className="bg-black text-white dark:bg-white dark:text-black sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-6 py-4 font-black uppercase text-xs tracking-wider border-r border-white dark:border-black bg-black text-white dark:bg-white dark:text-black">Type</th>
                                <th className="px-6 py-4 font-black uppercase text-xs tracking-wider border-r border-white dark:border-black bg-black text-white dark:bg-white dark:text-black">Amount</th>
                                <th className="px-6 py-4 font-black uppercase text-xs tracking-wider text-right border-r border-white dark:border-black bg-black text-white dark:bg-white dark:text-black">Time</th>
                                <th className="px-6 py-4 font-black uppercase text-xs tracking-wider text-center bg-black text-white dark:bg-white dark:text-black">Tx</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-black dark:divide-white">
                            {transactions.map(tx => (
                                <tr key={tx.id} className="hover:bg-yellow-50 dark:hover:bg-gray-800 transition-colors">
                                    <td className="px-6 py-4 border-r-2 border-black dark:border-white">
                                        <span className={`
                                            inline-flex items-center gap-2 px-3 py-1 text-xs font-black uppercase border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)]
                                            ${(tx.type === 'DEPOSIT' || tx.type.includes('BUY')) && 'bg-green-400 text-black'}
                                            ${(tx.type === 'WITHDRAW' || tx.type.includes('SELL')) && 'bg-red-400 text-black'}
                                            ${tx.type === 'SWAP' && 'bg-purple-400 text-black'}
                                        `}>
                                            {(tx.type.includes('SWAP') || tx.type.includes('BUY') || tx.type.includes('SELL')) ? <ArrowRightLeft className="w-3 h-3" /> : (tx.type === 'DEPOSIT' ? <ArrowDownCircle className="w-3 h-3" /> : <ArrowUpCircle className="w-3 h-3" />)}
                                            {tx.type.replace('SWAP_', '').replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 border-r-2 border-black dark:border-white font-mono font-bold text-lg">
                                        {tx.amount} <span className="text-gray-500 text-xs">{tx.symbol}</span>
                                    </td>
                                    <td className="px-6 py-4 border-r-2 border-black dark:border-white text-right font-mono font-bold">
                                        {new Date(tx.timestamp).toLocaleTimeString()}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {tx.txHash && (
                                            <a href={`https://sepolia.mantlescan.xyz/tx/${tx.txHash}`} target="_blank" rel="noreferrer"
                                                className="inline-flex items-center justify-center w-8 h-8 bg-white border-2 border-black hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    </div>
);
