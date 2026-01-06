import React from 'react';
import { Activity, Server } from 'lucide-react';
import { TradeTrigger } from '../../../types';

interface Props {
    trigger: TradeTrigger;
    currentPrice?: number;
    progress: number;
}

export const MonitorPanel: React.FC<Props> = ({ trigger, currentPrice, progress }) => {
    const isSmart = !!(trigger.smartConditions && trigger.smartConditions.length > 0);

    return (
        <div className="hidden md:flex flex-col flex-1 p-6 bg-gray-50 dark:bg-[#111] relative">
            <div className="flex items-center justify-between mb-4 text-xs font-black uppercase text-gray-400">
                <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> Live Monitor</span>
                <span className="flex items-center gap-1"><Server className="w-3 h-3" /> Node: Alpha-1</span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="text-center">
                    <div className="text-xs text-gray-500 font-bold mb-1">Current Market</div>
                    <div className={`text-4xl font-mono font-black ${!currentPrice ? 'animate-pulse text-gray-400' : 'text-black dark:text-white'}`}>
                        ${currentPrice?.toLocaleString() || "---"}
                    </div>
                </div>

                {/* Only show visual delta for simple price triggers */}
                {!isSmart && currentPrice && (
                    <div className="w-full h-1 bg-gray-300 dark:bg-gray-700 relative mt-8 mb-4 max-w-xs">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-black dark:bg-white rounded-full"></div>
                        <div
                            className={`absolute top-1/2 transform -translate-y-1/2 w-4 h-4 border-2 border-black transition-all duration-500 ${trigger.type === 'BUY' ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{
                                left: `${Math.min(Math.max(((currentPrice - (trigger.targetPrice * 0.9)) / (trigger.targetPrice * 0.2)) * 100, 0), 100)}%`
                            }}
                        ></div>
                    </div>
                )}
            </div>

            <div className="mt-auto">
                <div className="flex justify-between text-[10px] font-bold uppercase mb-1 text-gray-500">
                    <span>Confidence Match</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-3 w-full border-2 border-black dark:border-white bg-white dark:bg-black relative overflow-hidden">
                    <div
                        className="h-full bg-stripes animate-progress-stripes transition-all duration-300 bg-gray-400"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};
