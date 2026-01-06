import React, { useEffect, useState } from 'react';
import { Loader2, Terminal, Wallet, ArrowRightLeft, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface Props {
    message?: string;
}

const ProgressBar = () => (
    <div className="h-4 w-full border-2 border-black dark:border-white relative overflow-hidden bg-white dark:bg-black">
        <div className="h-full bg-neo-accent bg-stripes animate-progress-stripes w-[85%] absolute top-0 left-0"></div>
    </div>
);

export const LoadingOverlay: React.FC<Props> = ({ message = 'Processing...' }) => {
    const [logLines, setLogLines] = useState<string[]>([]);

    useEffect(() => {
        setLogLines([]);

        // Dynamic logs based on the active action (inferred from message or generic)
        const logs = [
            "Initializing secure connection...",
            "Validating transaction parameters...",
            "Estimating gas fees (Mantle Network)...",
            "Preparing payload..."
        ];

        let i = 0;
        const interval = setInterval(() => {
            if (i < logs.length) {
                setLogLines(prev => {
                    // Keep only last 4 lines to prevent overflow
                    const newLogs = [...prev, logs[i]];
                    return newLogs.slice(-4);
                });
                i++;
            }
        }, 800);

        return () => clearInterval(interval);
    }, []);

    // Add the specific status message from parent as a new log line when it changes
    useEffect(() => {
        if (message) {
            setLogLines(prev => [...prev.slice(-3), message]);
        }
    }, [message]);

    return (
        <div className="absolute inset-0 bg-white/95 dark:bg-black/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-200">
            <div className="flex flex-col gap-2 w-full max-w-sm">

                {/* Header */}
                <div className="flex items-center justify-between p-2 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-neo-yellow">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center animate-bounce">
                            <Wallet className="w-5 h-5 text-black" strokeWidth={3} />
                        </div>
                        <span className="font-black uppercase tracking-wider text-sm text-black">
                            TRANSACTION_AGENT <span className="animate-blink">_</span>
                        </span>
                    </div>
                    <div className="px-2 py-0.5 bg-black text-white text-[10px] font-mono border border-white font-bold">
                        EXECUTING
                    </div>
                </div>

                {/* Terminal Output */}
                <div className="bg-black dark:bg-[#111] border-2 border-black dark:border-white p-4 font-mono text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-h-[160px] flex flex-col justify-between">
                    <div className="space-y-1 mb-3">
                        {logLines.map((line, idx) => (
                            <div key={idx} className="text-green-400 flex items-start gap-2">
                                <span className="text-gray-500 shrink-0">{'>'}</span>
                                <span>{line}</span>
                            </div>
                        ))}
                        <div className="text-green-400 animate-pulse">_</div>
                    </div>

                    <div>
                        <div className="flex justify-between text-[10px] text-gray-400 mb-1 font-bold uppercase">
                            <span>Network: Mantle Sepolia</span>
                            <span>Status: Active</span>
                        </div>
                        <ProgressBar />
                    </div>
                </div>
            </div>
        </div>
    );
};
