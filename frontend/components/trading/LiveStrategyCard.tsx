import React, { useState, useEffect } from 'react';
import { TradeTrigger, MonitorLog } from '../../types';
import { marketApi } from '../../services/backendApi';
import { LeftPanel } from './monitoring/LeftPanel';
import { MonitorPanel } from './monitoring/MonitorPanel';
import { LogPanel } from './monitoring/LogPanel';

interface Props {
    trigger: TradeTrigger;
    currentPrice?: number;
    onExecute?: (id: string, price: number) => void;
}

const LiveStrategyCard: React.FC<Props> = ({ trigger, currentPrice, onExecute }) => {
    const [logs, setLogs] = useState<MonitorLog[]>([]);
    const [status, setStatus] = useState<'SCANNING' | 'ANALYZING' | 'EXECUTING' | 'IDLE'>('SCANNING');
    const [progress, setProgress] = useState(0);

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
                    // console.error('Failed to fetch real metrics:', error);
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

    return (
        <div className="bg-white dark:bg-[#1a1a1a] border-2 border-black dark:border-white shadow-neo p-0 overflow-hidden flex flex-col md:flex-row h-auto md:h-64 animate-in fade-in slide-in-from-bottom-4 rounded-xl">
            <LeftPanel trigger={trigger} status={status} />
            <MonitorPanel
                trigger={trigger}
                currentPrice={currentPrice}
                progress={progress}
            />
            <LogPanel
                logs={logs}
                status={status}
                isSmart={!!(trigger.smartConditions && trigger.smartConditions.length > 0)}
            />
        </div>
    );
};

export default LiveStrategyCard;