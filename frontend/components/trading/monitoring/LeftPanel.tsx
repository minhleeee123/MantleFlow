import React from 'react';
import { Cpu } from 'lucide-react';
import { TradeTrigger } from '../../../types';

interface Props {
    trigger: TradeTrigger;
    status: string;
}

export const LeftPanel: React.FC<Props> = ({ trigger, status }) => {
    const isBuy = trigger.type === 'BUY';
    const isSmart = !!(trigger.smartConditions && trigger.smartConditions.length > 0);

    return (
        <div className={`w-full md:w-1/3 p-6 border-b-2 md:border-b-0 md:border-r-2 border-black dark:border-white flex flex-col justify-between ${isBuy ? 'bg-neo-secondary' : 'bg-neo-accent'}`}>
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <div className="bg-black text-white p-2 border border-white">
                        <Cpu className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="font-black text-xl uppercase leading-none">Bot #{trigger.id.slice(-4)}</h3>
                        <span className="text-xs font-bold uppercase opacity-70">
                            {isSmart ? "AI Agent Strategy" : `Limit ${trigger.type}`}
                        </span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <span className="text-xs font-black uppercase opacity-60 block">Asset Pair</span>
                        <span className="text-2xl font-black uppercase">{trigger.symbol} / USDT</span>
                    </div>
                    <div>
                        <span className="text-xs font-black uppercase opacity-60 block">Target Trigger</span>
                        {isSmart ? (
                            <div className="flex flex-col gap-1 mt-1">
                                {trigger.smartConditions?.slice(0, 2).map((c, i) => (
                                    <span key={i} className="text-xs font-mono font-bold bg-white/50 px-1 border border-black w-fit">
                                        {c.metric} {c.operator === 'GT' ? '>' : '<'} {c.value}
                                    </span>
                                ))}
                                {trigger.smartConditions && trigger.smartConditions.length > 2 && (
                                    <span className="text-[10px] font-bold">+ {trigger.smartConditions.length - 2} more conditions</span>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold font-mono bg-white/50 px-2 border border-black">
                                    {trigger.condition === 'ABOVE' ? '≥' : '≤'} ${trigger.targetPrice.toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t-2 border-black">
                <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase">Status</span>
                    <span className="bg-black text-white px-2 py-0.5 text-xs font-bold uppercase animate-pulse">
                        {status}
                    </span>
                </div>
            </div>
        </div>
    );
};
