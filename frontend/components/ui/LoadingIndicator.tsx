import React, { useEffect, useState } from 'react';
import { Sparkles, Activity, PieChart, Wallet, Terminal, Cpu, Search } from 'lucide-react';

interface LoadingIndicatorProps {
  status: string; // 'fetching-data' | 'analyzing' | 'thinking' | 'analyzing-portfolio' | 'creating-transaction' | ''
}

const ProgressBar = ({ colorClass }: { colorClass: string }) => (
    <div className="h-4 w-full border-2 border-black dark:border-white relative overflow-hidden bg-white dark:bg-black">
        <div className={`h-full ${colorClass} bg-stripes animate-progress-stripes w-[85%] absolute top-0 left-0`}></div>
    </div>
);

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ status }) => {
  const [logLines, setLogLines] = useState<string[]>([]);
  
  useEffect(() => {
    setLogLines([]);
    let logs: string[] = [];
    let interval: any;

    if (status === 'fetching-data') {
        logs = ["Connecting to CoinGecko API...", "Fetching OHLCV data...", "Aggregating sentiment scores...", "Verifying tokenomics..."];
    } else if (status === 'analyzing' || status === 'thinking') {
        logs = ["Loading context window...", "Pattern recognition: ACTIVE", "Synthesizing market report...", "Formatting output..."];
    } else if (status === 'analyzing-portfolio') {
        logs = ["Scanning wallet addresses...", "Calculating PnL delta...", "Assessing risk exposure...", "Generating rebalancing logic..."];
    } else if (status === 'creating-transaction') {
        logs = ["Identifying chain ID...", "Estimating gas limits...", "Encoding calldata...", "Preparing unsigned txn..."];
    }

    let i = 0;
    interval = setInterval(() => {
        if (i < logs.length) {
            setLogLines(prev => [...prev, logs[i]]);
            i++;
        } else {
            clearInterval(interval);
        }
    }, 600);

    return () => clearInterval(interval);
  }, [status]);

  if (!status) return null;

  const renderAgentContent = () => {
      switch(status) {
          case 'fetching-data':
              return {
                  title: 'MARKET_DATA_AGENT',
                  icon: <Search className="w-5 h-5 text-black" strokeWidth={3} />,
                  bg: 'bg-neo-yellow',
                  barColor: 'bg-neo-yellow'
              };
          case 'analyzing':
          case 'thinking':
              return {
                  title: 'INSIGHT_CORE_V2',
                  icon: <Cpu className="w-5 h-5 text-white" strokeWidth={3} />,
                  bg: 'bg-neo-primary',
                  barColor: 'bg-neo-primary'
              };
          case 'analyzing-portfolio':
              return {
                  title: 'PORTFOLIO_GUARD',
                  icon: <PieChart className="w-5 h-5 text-black" strokeWidth={3} />,
                  bg: 'bg-neo-secondary',
                  barColor: 'bg-neo-secondary'
              };
          case 'creating-transaction':
              return {
                  title: 'WEB3_EXECUTIONER',
                  icon: <Wallet className="w-5 h-5 text-black" strokeWidth={3} />,
                  bg: 'bg-neo-accent',
                  barColor: 'bg-neo-accent'
              };
          default:
              return {
                  title: 'SYSTEM_PROCESSING',
                  icon: <Activity className="w-5 h-5 text-black" strokeWidth={3} />,
                  bg: 'bg-gray-200',
                  barColor: 'bg-black'
              };
      }
  };

  const agent = renderAgentContent();

  return (
    <div className="flex flex-col gap-2 w-full max-w-lg py-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
       
       {/* Agent Header */}
       <div className={`flex items-center justify-between p-2 border-2 border-black dark:border-white shadow-neo-sm ${agent.bg}`}>
           <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center animate-bounce">
                   {agent.icon}
               </div>
               <span className={`font-black uppercase tracking-wider text-sm ${agent.bg === 'bg-neo-primary' ? 'text-white' : 'text-black'}`}>
                   {agent.title} <span className="animate-blink">_</span>
               </span>
           </div>
           <div className="px-2 py-0.5 bg-black text-white text-[10px] font-mono border border-white font-bold">
               RUNNING
           </div>
       </div>

       {/* Terminal Output */}
       <div className="bg-black dark:bg-[#111] border-2 border-black dark:border-white p-4 font-mono text-xs shadow-neo-sm min-h-[100px] flex flex-col justify-between">
           <div className="space-y-1 mb-3">
               {logLines.map((line, idx) => (
                   <div key={idx} className="text-green-400 flex items-center gap-2">
                       <span className="text-gray-500">{'>'}</span> {line}
                   </div>
               ))}
               <div className="text-green-400 animate-pulse">_</div>
           </div>
           
           <div>
               <div className="flex justify-between text-[10px] text-gray-400 mb-1 font-bold uppercase">
                   <span>Memory Usage: 42MB</span>
                   <span>Threads: 4</span>
               </div>
               <ProgressBar colorClass={agent.barColor} />
           </div>
       </div>
    </div>
  );
};

export default LoadingIndicator;