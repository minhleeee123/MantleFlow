import React from 'react';
import { MessageSquare, Cpu, CheckCircle } from 'lucide-react';

const HowItWorks: React.FC = () => {
    const steps = [
        {
            id: 1,
            icon: MessageSquare,
            title: "Define Strategy",
            desc: "Set natural language triggers like 'Buy ETH if RSI < 30'. No coding required.",
            color: "bg-neo-accent"
        },
        {
            id: 2,
            icon: Cpu,
            title: "AI Monitoring",
            desc: "Our AI agents monitor market conditions 24/7 across multiple data sources in real-time.",
            color: "bg-neo-primary"
        },
        {
            id: 3,
            icon: CheckCircle,
            title: "Auto-Execution",
            desc: "Smart Wallet executes trades instantly when conditions are met. Non-custodial and secure.",
            color: "bg-neo-secondary"
        }
    ];

    return (
        <div className="py-24 shrink-0">
            <div className="container mx-auto px-6">
                <div className="mb-16 flex flex-col md:flex-row items-center justify-center gap-6">
                    {/* 3D Mascot - Workflow */}
                    <div className="hidden lg:block animate-[float_5s_ease-in-out_infinite_1s] shrink-0">
                        <img
                            src="/picture/mascot_workflow-removebg-preview.png"
                            alt="MantleFlow Bot Working"
                            className="w-48 h-48 object-contain transform -rotate-12"
                        />
                    </div>

                    <div className="text-center md:text-left">
                        <span className="bg-black text-white px-3 py-1 text-sm font-black uppercase">Workflow</span>
                        <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white uppercase mt-4 mb-4">
                            From Strategy to Profit
                        </h2>
                        <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-400 font-medium relative z-10">
                            Automate your trading workflow with intelligent agents.
                        </p>
                    </div>
                </div>

                {/* Workflow 1: Auto-Trading */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-24">
                    {steps.map((step, idx) => (
                        <div
                            key={idx}
                            className="relative group h-full animate-in fade-in zoom-in-95 duration-700 fill-mode-backwards"
                            style={{ animationDelay: `${idx * 300}ms` }}
                        >
                            {/* Connecting Line (Desktop) */}
                            {idx !== steps.length - 1 && (
                                <div className="hidden md:block absolute top-12 -right-4 w-8 h-1 bg-black dark:bg-white z-0 animate-in fade-in slide-in-from-left-4 duration-500 delay-500"></div>
                            )}

                            <div className="bg-white dark:bg-[#1a1a1a] border-2 border-black dark:border-white p-8 relative z-10 shadow-neo group-hover:-translate-y-2 group-hover:shadow-neo-lg transition-all duration-300 h-full flex flex-col hover:border-l-4 hover:border-b-4">
                                <div className={`w-16 h-16 ${step.color} border-2 border-black flex items-center justify-center mb-6 shadow-neo-sm transform group-hover:rotate-12 transition-transform shrink-0`}>
                                    <step.icon className="w-8 h-8 text-black" strokeWidth={2.5} />
                                </div>

                                <div className="absolute top-4 right-4 text-6xl font-black text-gray-100 dark:text-gray-800 pointer-events-none select-none transition-colors group-hover:text-gray-200 dark:group-hover:text-gray-700">
                                    0{step.id}
                                </div>

                                <h3 className="text-2xl font-black uppercase text-black dark:text-white mb-4 relative z-10">
                                    {step.title}
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed relative z-10 flex-1">
                                    {step.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Workflow 2: Chat Interface */}
                <div className="mb-16 text-center">
                    <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white uppercase mt-4 mb-4">
                        From Chat to Chain
                    </h2>
                    <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400 font-medium">
                        Prefer conversation? Use our AI assistant for deep analysis.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                    {[
                        {
                            id: 1,
                            icon: MessageSquare,
                            title: "Prompt",
                            desc: "Ask specifically: 'Analyze ETH support levels' or 'Swap 500 USDT to SOL'. Natural language is all you need.",
                            color: "bg-neo-accent"
                        },
                        {
                            id: 2,
                            icon: Cpu,
                            title: "Process",
                            desc: "MantleFlow aggregates live market data, reads chart images, and calculates risk metrics in milliseconds.",
                            color: "bg-neo-primary"
                        },
                        {
                            id: 3,
                            icon: CheckCircle,
                            title: "Execute",
                            desc: "Review the generated report or transaction preview. Confirm with one click to execute via Web3 wallet.",
                            color: "bg-neo-secondary"
                        }
                    ].map((step, idx) => (
                        <div
                            key={idx}
                            className="relative group h-full animate-in fade-in zoom-in-95 duration-700 fill-mode-backwards"
                            style={{ animationDelay: `${(idx + 3) * 300}ms` }}
                        >
                            {/* Connecting Line (Desktop) */}
                            {idx !== 2 && (
                                <div className="hidden md:block absolute top-12 -right-4 w-8 h-1 bg-black dark:bg-white z-0 animate-in fade-in slide-in-from-left-4 duration-500 delay-500"></div>
                            )}

                            <div className="bg-white dark:bg-[#1a1a1a] border-2 border-black dark:border-white p-8 relative z-10 shadow-neo group-hover:-translate-y-2 group-hover:shadow-neo-lg transition-all duration-300 h-full flex flex-col hover:border-l-4 hover:border-b-4">
                                <div className={`w-16 h-16 ${step.color} border-2 border-black flex items-center justify-center mb-6 shadow-neo-sm transform group-hover:rotate-12 transition-transform shrink-0`}>
                                    <step.icon className="w-8 h-8 text-black" strokeWidth={2.5} />
                                </div>

                                <div className="absolute top-4 right-4 text-6xl font-black text-gray-100 dark:text-gray-800 pointer-events-none select-none transition-colors group-hover:text-gray-200 dark:group-hover:text-gray-700">
                                    0{step.id}
                                </div>

                                <h3 className="text-2xl font-black uppercase text-black dark:text-white mb-4 relative z-10">
                                    {step.title}
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed relative z-10 flex-1">
                                    {step.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HowItWorks;