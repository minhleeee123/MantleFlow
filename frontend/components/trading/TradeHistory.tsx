import React from 'react';
import { History, CheckCircle } from 'lucide-react';
import { TradeRecord } from '../../types';

interface Props {
    trades: TradeRecord[];
}

const TradeHistory: React.FC<Props> = ({ trades }) => {
    return (
        <div className="bg-white dark:bg-[#1e1f20] border-2 border-black dark:border-white shadow-neo p-6 mt-6">
            <div className="flex items-center gap-2 mb-4 border-b-2 border-black dark:border-white pb-2">
                <History className="w-5 h-5 text-gray-600 dark:text-gray-400" strokeWidth={3} />
                <h3 className="font-black text-lg uppercase text-black dark:text-white">Execution Log</h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-xs uppercase text-gray-500 border-b border-gray-200 dark:border-gray-700">
                            <th className="pb-2">Time</th>
                            <th className="pb-2">Type</th>
                            <th className="pb-2">Pair</th>
                            <th className="pb-2 text-right">Price</th>
                            <th className="pb-2 text-right">Total (USDT)</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {trades.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-4 text-center text-gray-400 font-bold uppercase text-xs">No trades executed yet.</td>
                            </tr>
                        ) : (
                            trades.map(trade => (
                                <tr key={trade.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5">
                                    <td className="py-3 font-mono text-xs">{new Date(trade.timestamp).toLocaleTimeString()}</td>
                                    <td className="py-3">
                                        <div className="flex flex-col gap-1">
                                            <span className={`text-[10px] font-black px-1.5 py-0.5 uppercase w-fit ${trade.type === 'BUY' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                                                {trade.type}
                                            </span>
                                            {trade.status === 'FAILED' && (
                                                <span className="text-[10px] font-black px-1.5 py-0.5 uppercase bg-red-500 text-white w-fit">
                                                    FAILED
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 font-bold uppercase">{trade.symbol}</td>
                                    <td className="py-3 text-right font-mono">
                                        {trade.status === 'FAILED' ? '-' : `$${trade.price.toLocaleString()}`}
                                    </td>
                                    <td className="py-3 text-right font-mono font-bold">
                                        {trade.status === 'FAILED' ? '$0' : `$${trade.totalUsd.toLocaleString()}`}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TradeHistory;
