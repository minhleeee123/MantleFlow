import React from 'react';
import { Terminal, Loader2 } from 'lucide-react';
import { MonitorLog } from '../../../types';

interface Props {
    logs: MonitorLog[];
    status: string;
    isSmart: boolean;
}

export const LogPanel: React.FC<Props> = ({ logs, status, isSmart }) => (
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
);
