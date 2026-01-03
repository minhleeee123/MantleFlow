import React, { useState, useEffect } from 'react';
import { TradeTrigger, MonitorLog } from '../../types';
import { Activity, Cpu, Server, Loader2, Terminal } from 'lucide-react';
import { marketApi } from '../../services/backendApi';

interface Props {
    trigger: TradeTrigger;
    currentPrice?: number;
    onExecute?: (id: string, price: number) => void;
}

const LiveStrategyCard: React.FC<Props> = ({ trigger, currentPrice, onExecute }) => {
    const [logs, setLogs] = useState<MonitorLog[]>([]);
    const [status, setStatus] = useState<'SCANNING' | 'ANALYZING' | 'EXECUTING' | 'IDLE'>('SCANNING');
    const [progress, setProgress] = useState(0);

    // NOTE: Auto-scroll useEffect removed to improve UX. 
    // Users can now scroll up to read history without being forced to the bottom.

    useEffect(() => {
        let interval: any;

        // --- SMART TRIGGER LOGIC ---
        if (trigger.smartConditions && trigger.smartConditions.length > 0) {

            const runSmartCheck = async () => {
                setStatus('ANALYZING');
                const newLogs: MonitorLog[] = [];
                let allConditionsMet = true;
                let fetchedPrice = currentPrice || 0; // fallback

                // Check all conditions using Real APIs via Backend
                // Extract unique metrics to fetch in batch
                const metricsToFetch = Array.from(new Set(trigger.smartConditions!.map(c => c.metric)));

                let fetchedMetrics: Record<string, number> = {};

                try {
                    fetchedMetrics = await marketApi.getMetrics(trigger.symbol, metricsToFetch);
                } catch (error) {
                    console.error('Failed to fetch real metrics:', error);
                    // If failed, we might use fallback or show error in log
                }

                for (const cond of trigger.smartConditions!) {
                    let realValue = fetchedMetrics[cond.metric] ?? 0; // Default to 0 if failed

                    // Special case for Price: Use prop if available and fresher
                    if (cond.metric === 'PRICE' && currentPrice) {
                        realValue = currentPrice;
                    }

                    // Check logic
                    const isMet = cond.operator === 'GT' ? realValue > cond.value : realValue < cond.value;
                    if (!isMet) allConditionsMet = false;

                    const operatorSym = cond.operator === 'GT' ? '>' : '<';

                    newLogs.push({
                        timestamp: new Date().toLocaleTimeString(),
                        metric: cond.metric,
                        realValue: cond.metric === 'PRICE' || cond.metric === 'MA' ?
                            `$${realValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}` :
                            realValue.toLocaleString(undefined, { maximumFractionDigits: 2 }),
                        targetValue: `${operatorSym} ${cond.value}`,
                        status: isMet ? 'PASS' : 'FAIL',
                        message: `${cond.metric} check.`
                    });
                }

                // Update Logs & Progress
                setLogs(prev => [...prev.slice(-15), ...newLogs]); // Keep last ~15 logs
                setProgress(allConditionsMet ? 100 : Math.random() * 80);

                // Execution Logic
                if (allConditionsMet) {
                    setStatus('EXECUTING');
                    if (onExecute) {
                        onExecute(trigger.id, fetchedPrice);
                    }
                } else {
                    setStatus('SCANNING');
                }
            };

            interval = setInterval(runSmartCheck, 3000); // Run every 3s
        }
        // --- LEGACY SIMPLE TRIGGER SIMULATION ---
        else {
            interval = setInterval(() => {
                const timestamp = new Date().toLocaleTimeString();
                const price = currentPrice ? `$${currentPrice.toLocaleString()}` : 'FETCHING...';

                const random = Math.random();
                if (random > 0.7) {
                    setStatus('ANALYZING');
                    setLogs(prev => [{
                        timestamp, metric: 'SYSTEM', realValue: 'CALC', targetValue: '-', status: 'PASS', message: `Calculating delta for ${trigger.symbol}...`
                    }, ...prev.slice(0, 4)]);
                    setProgress(Math.random() * 100);
                } else if (random > 0.4) {
                    setStatus('SCANNING');
                    setLogs(prev => [{
                        timestamp, metric: 'PRICE', realValue: price, targetValue: '-', status: 'PASS', message: `Feed active`
                    }, ...prev.slice(0, 4)]);
                } else {
                    setStatus('IDLE');
                    setLogs(prev => [{
                        timestamp, metric: 'GAP', realValue: '0.00%', targetValue: `${trigger.condition} ${trigger.targetPrice}`, status: 'FAIL', message: `Condition wait`
                    }, ...prev.slice(0, 4)]);
                }

            }, 2000);
        }

        return () => clearInterval(interval);
    }, [trigger, currentPrice, onExecute]);

    // Calculate progress bar color
    const isBuy = trigger.type === 'BUY';
    const isSmart = !!(trigger.smartConditions && trigger.smartConditions.length > 0);

    return (
        <div className="bg-white dark:bg-[#1a1a1a] border-2 border-black dark:border-white shadow-neo p-0 overflow-hidden flex flex-col md:flex-row h-auto md:h-64 animate-in fade-in slide-in-from-bottom-4">

            {/* Left: Info Panel */}
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

            {/* Middle: Visualization (Only for Simple Triggers) or Summary */}
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

            {/* Right: Live Data Stream (The requested feature) */}
            <div className="w-full md:w-1/3 bg-black text-green-500 font-mono text-xs overflow-hidden flex flex-col border-t-2 md:border-t-0 md:border-l-2 border-black dark:border-white">
                <div className="border-b border-green-500/30 pb-2 mb-2 p-3 flex items-center gap-2 bg-[#050505]">
                    <Terminal className="w-3 h-3" />
                    <span className="font-bold uppercase">Data Stream</span>
                    {status === 'ANALYZING' && <Loader2 className="w-3 h-3 animate-spin ml-auto" />}
                </div>

                {/* Scrollable Log Container */}
                <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar p-3 pt-0">
                    {logs.length === 0 ? (
                        <div className="opacity-50 text-center mt-4">Initializing stream...</div>
                    ) : (
                        isSmart ? (
                            // Table format for Smart Logs
                            logs.map((log, i) => (
                                <div key={i} className="grid grid-cols-6 gap-1 border-b border-white/10 pb-1 mb-1 last:border-0 hover:bg-white/5">
                                    <span className="col-span-2 text-gray-500 font-bold">{log.metric}</span>
                                    <span className="col-span-2 text-right">{log.realValue}</span>
                                    <span className="col-span-2 text-right">
                                        {log.status === 'PASS' ? (
                                            <span className="bg-green-500 text-black px-1 font-bold">PASS</span>
                                        ) : (
                                            <span className="text-red-500 font-bold">WAIT</span>
                                        )}
                                    </span>
                                </div>
                            ))
                        ) : (
                            // Legacy Logs
                            logs.map((log, i) => (
                                <div key={i} className={`truncate ${i === 0 ? 'text-white font-bold' : 'opacity-70'}`}>
                                    <span className="mr-1 opacity-50">{log.timestamp}</span>
                                    {log.message}
                                </div>
                            ))
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiveStrategyCard;