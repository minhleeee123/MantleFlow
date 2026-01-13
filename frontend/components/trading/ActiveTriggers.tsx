import React from 'react';
import { Trash2, Activity, ArrowRight, Clock } from 'lucide-react';
import { TradeTrigger } from '../../types';

interface Props {
    triggers: TradeTrigger[];
    onCancel: (id: string) => void;
}

const ActiveTriggers: React.FC<Props> = ({ triggers, onCancel }) => {
    return (
        <div className="bg-white dark:bg-[#1e1f20] border-2 border-black dark:border-white shadow-neo p-6 flex flex-col h-full rounded-xl">
            <div className="flex items-center gap-2 mb-4 border-b-2 border-black dark:border-white pb-2">
                <Activity className="w-5 h-5 text-neo-accent" strokeWidth={3} />
                <h3 className="font-black text-lg uppercase text-black dark:text-white">Active Triggers ({triggers.length})</h3>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                {triggers.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 font-bold uppercase text-sm">
                        No active triggers running.
                    </div>
                ) : (
                    triggers.map(trigger => (
                        <div key={trigger.id} className="relative group bg-gray-50 dark:bg-black border-2 border-black dark:border-gray-700 p-3 transition-all hover:bg-white dark:hover:bg-[#111] hover:shadow-neo-sm rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-black px-1.5 py-0.5 uppercase border border-black rounded-md ${trigger.type === 'BUY' ? 'bg-neo-secondary text-black' : 'bg-neo-accent text-black'}`}>
                                        {trigger.type}
                                    </span>
                                    <span className="font-black uppercase text-lg">{trigger.symbol}</span>
                                </div>
                                <button
                                    onClick={() => {
                                        if (confirm(`Cancel trigger for ${trigger.symbol}?`)) {
                                            onCancel(trigger.id);
                                        }
                                    }}
                                    className="p-1.5 hover:bg-red-500 hover:text-white border border-black dark:border-gray-600 transition-colors rounded-md"
                                    title="Cancel trigger"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                                <span>Target:</span>
                                {trigger.smartConditions && trigger.smartConditions.length > 0 ? (
                                    <div className="flex flex-col gap-1">
                                        {trigger.smartConditions.map((c, i) => (
                                            <span key={i} className="font-mono bg-blue-100 dark:bg-blue-900 px-1 text-xs rounded-sm">
                                                {c.metric} {c.operator === 'GT' ? '>' : '<'} {c.value}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="font-mono bg-yellow-100 dark:bg-yellow-900 px-1 rounded-sm">
                                        {trigger.condition === 'ABOVE' ? '≥' : '≤'} ${trigger.targetPrice}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(trigger.createdAt).toLocaleTimeString()}</span>
                                <span className="mx-1">•</span>
                                <span>Vol: {trigger.amount.toLocaleString()} {trigger.type === 'BUY' ? 'USDT' : ''}</span>
                            </div>

                            <div className="absolute top-1/2 -right-1 transform translate-x-full opacity-0 group-hover:opacity-100 transition-all">
                                <div className="flex items-center gap-1 bg-black text-white text-[10px] px-2 py-1 rounded-sm">
                                    Scanning <Activity className="w-3 h-3 animate-pulse" />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ActiveTriggers;
