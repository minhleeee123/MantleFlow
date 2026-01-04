import React from 'react';
import { Eye, TrendingUp, Shield, Bot, ArrowUpRight, Zap, Globe, Lock } from 'lucide-react';

const FEATURES = [
    {
        title: "Market Intelligence",
        subtitle: "Multi-Source Data Aggregation",
        desc: "We aggregate real-time OHLCV data from CoinGecko, Fear/Greed Index, and on-chain metrics. The AI synthesizes this into actionable reports, not just charts.",
        icon: TrendingUp,
        color: "bg-neo-yellow",
        borderColor: "border-black"
    },
    {
        title: "Vision Analysis",
        subtitle: "Visual Pattern Recognition",
        desc: "Our agent sees what you see. It captures chart images via screen stream, identifying key support/resistance levels and candlestick patterns instantly.",
        icon: Eye,
        color: "bg-neo-primary",
        borderColor: "border-black"
    },
    {
        title: "Smart Portfolio",
        subtitle: "Real-time Risk Assessment",
        desc: "Connect MetaMask via Ethers.js. The AI audits your ERC-20 holdings, calculates real-time PnL, scores diversification, and suggests rebalancing strategies.",
        icon: Shield,
        color: "bg-neo-accent",
        borderColor: "border-black"
    },
    {
        title: "Auto-Trading",
        subtitle: "Non-Custodial Execution",
        desc: "Execute strategies with confidence. Set natural language triggers (e.g., 'Sell ETH if price drops below $3k') and let the Smart Wallet handle the execution securely.",
        icon: Bot,
        color: "bg-neo-secondary",
        borderColor: "border-black"
    }
];

const FeatureGrid: React.FC = () => {
    return (
        <div className="py-24 px-6 shrink-0">
            <div className="max-w-7xl mx-auto">
                <div className="mb-16 text-center relative">
                    <h2 className="text-5xl md:text-6xl font-black text-black dark:text-white uppercase mb-4 tracking-tight relative z-10">Core Features</h2>
                    <div className="flex justify-center gap-2 mb-8 relative z-10">
                        <div className="w-4 h-4 bg-black dark:bg-white"></div>
                        <div className="w-4 h-4 bg-neo-primary"></div>
                        <div className="w-4 h-4 bg-neo-secondary"></div>
                    </div>

                    {/* 3D Mascot - Features */}
                    <div className="hidden xl:block absolute -right-20 -top-16 z-0 pointer-events-none animate-[float_7s_ease-in-out_infinite]">
                        <img
                            src="/picture/mascot_features-removebg-preview.png"
                            alt="MantleFlow Bot Strong"
                            className="w-128 h-128 object-contain transform rotate-6 opacity-80"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {FEATURES.map((feat, idx) => (
                        <div
                            key={idx}
                            className="group perspective-1000 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards"
                            style={{ animationDelay: `${idx * 150}ms` }}
                        >
                            <div className="bg-white dark:bg-[#1a1a1a] border-2 border-black dark:border-white shadow-neo p-8 relative overflow-hidden h-full transition-all duration-300 transform group-hover:rotate-x-2 group-hover:scale-[1.02] group-hover:shadow-neo-lg z-10">

                                {/* Hover Background Reveal */}
                                <div className={`absolute inset-0 ${feat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`w-16 h-16 ${feat.color} border-2 ${feat.borderColor} dark:border-white flex items-center justify-center shadow-neo-sm transform transition-transform duration-300 group-hover:rotate-12`}>
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

                                    <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
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