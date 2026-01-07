import React from 'react';
import { History, ExternalLink, Clock } from 'lucide-react';
import { TradeRecord } from '../../types';

interface Props {
    trades: TradeRecord[];
}

const TradeHistory: React.FC<Props> = ({ trades }) => {
    // Filter only Auto-Triggers (AUTO_SWAP)
    const autoTrades = trades.filter(t => t.type.includes('AUTO_SWAP') || t.type.includes('TRIGGER'));

    return (
        <div className="bg-white dark:bg-[#1e1f20] border-2 border-black dark:border-white shadow-neo p-6 mt-6 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4 border-b-2 border-black dark:border-white pb-2">
                <History className="w-5 h-5 text-gray-600 dark:text-gray-400" strokeWidth={3} />
                <h3 className="font-black text-lg uppercase text-black dark:text-white">Execution Log ({autoTrades.length})</h3>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 max-h-[400px]">
                {autoTrades.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 font-bold uppercase text-sm">
                        No auto-executions yet.
                    </div>
                ) : (
                    autoTrades.map(trade => (
                        <div key={trade.id} className="relative group bg-gray-50 dark:bg-black border-2 border-black dark:border-gray-700 p-3 transition-all hover:bg-white dark:hover:bg-[#111] hover:shadow-neo-sm">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-black px-1.5 py-0.5 uppercase border border-black ${trade.type.includes('BUY') || trade.type.includes('USDT_MNT') ? 'bg-neo-secondary text-black' : 'bg-neo-accent text-black'}`}>
                                        {trade.type.includes('BUY') || trade.type.includes('USDT_MNT') ? 'BUY EXEC' : 'SELL EXEC'}
                                    </span>
                                    <span className="font-black uppercase text-lg">{trade.symbol}</span>
                                </div>
                                {trade.txHash && (
                                    <a
                                        href={`https://sepolia.mantlescan.xyz/tx/${trade.txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-bold text-blue-600 hover:underline"
                                    >
                                        View Tx ↗
                                    </a>
                                )}
                            </div>

                            <div className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                                <span>Executed:</span>
                                <span className="font-mono bg-green-100 dark:bg-green-900 px-1 text-green-800 dark:text-green-300">
                                    {trade.amount.toLocaleString()} {trade.symbol.split('/')[0]}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(trade.timestamp).toLocaleTimeString()}</span>
                                <span className="mx-1">•</span>
                                <span className={trade.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}>
                                    {trade.status}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TradeHistory;
