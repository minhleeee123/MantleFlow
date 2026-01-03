import React from 'react';
import { Eye, TrendingUp, Shield, Bot, ArrowUpRight, Zap, Globe, Lock } from 'lucide-react';

const FEATURES = [
    {
        title: "Market Intelligence",
        subtitle: "Powered by Gemini 1.5 Flash",
        desc: "We aggregate real-time OHLCV data from CoinGecko, Fear/Greed Index from Alternative.me, and on-chain metrics. The AI synthesizes this into actionable reports, not just charts.",
        icon: TrendingUp,
        color: "bg-neo-yellow",
        borderColor: "border-black"
    },
    {
        title: "Vision Analysis",
        subtitle: "Multimodal Chart Reading",
        desc: "Don't just read data, see it. Our agent captures your TradingView charts via screen stream, identifying support/resistance levels and candlestick patterns like a pro trader.",
        icon: Eye,
        color: "bg-neo-primary",
        borderColor: "border-black"
    },
    {
        title: "Portfolio Guard",
        subtitle: "Risk Management Agent",
        desc: "Connect MetaMask via Ethers.js. The AI audits your ERC-20 holdings, calculates real-time PnL, scores diversification, and suggests rebalancing strategies.",
        icon: Shield,
        color: "bg-neo-accent",
        borderColor: "border-black"
    },
    {
        title: "Auto-Trading Arena",
        subtitle: "Paper Trading Simulator",
        desc: "Test strategies risk-free. Set natural language triggers (e.g., 'Sell ETH if price drops below $3k') and watch the bot execute in a simulated environment.",
        icon: Bot,
        color: "bg-neo-secondary",
        borderColor: "border-black"
    }
];

const FeatureGrid: React.FC = () => {
  return (
    <div className="py-24 px-6 shrink-0">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
            <h2 className="text-5xl md:text-6xl font-black text-black dark:text-white uppercase mb-4 tracking-tight">Core Capabilities</h2>
            <div className="flex justify-center gap-2 mb-8">
                <div className="w-4 h-4 bg-black dark:bg-white"></div>
                <div className="w-4 h-4 bg-neo-primary"></div>
                <div className="w-4 h-4 bg-neo-secondary"></div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {FEATURES.map((feat, idx) => (
                <div key={idx} className="group perspective-1000">
                    <div className="bg-white dark:bg-[#1a1a1a] border-2 border-black dark:border-white shadow-neo p-8 relative overflow-hidden h-full transition-all duration-300 transform group-hover:rotate-x-2 group-hover:shadow-neo-lg">
                        
                        {/* Hover Background Reveal */}
                        <div className={`absolute inset-0 ${feat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                        
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-16 h-16 ${feat.color} border-2 ${feat.borderColor} dark:border-white flex items-center justify-center shadow-neo-sm`}>
                                    <feat.icon className="w-8 h-8 text-black" strokeWidth={2.5} />
                                </div>
                                <ArrowUpRight className="w-8 h-8 text-black dark:text-white opacity-20 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                            </div>
                            
                            <h3 className="text-3xl font-black text-black dark:text-white uppercase mb-1">
                                {feat.title}
                            </h3>
                            <div className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4 border-b-2 border-gray-100 dark:border-gray-800 pb-2 w-fit">
                                {feat.subtitle}
                            </div>
                            
                            <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed text-lg mb-6 flex-1">
                                {feat.desc}
                            </p>

                            <div className="flex gap-2">
                                <span className="bg-gray-100 dark:bg-white/10 px-2 py-1 text-xs font-bold uppercase border border-gray-300 dark:border-gray-600">
                                    Secure
                                </span>
                                <span className="bg-gray-100 dark:bg-white/10 px-2 py-1 text-xs font-bold uppercase border border-gray-300 dark:border-gray-600">
                                    Fast
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureGrid;