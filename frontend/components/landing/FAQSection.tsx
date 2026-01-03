import React, { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const FAQS = [
    {
        question: "How does the 'Vision Analysis' actually work?",
        answer: "Unlike traditional indicators that just read numbers, our Vision Agent uses the Gemini 2.5 multimodal capabilities. It captures a snapshot of your current chart (including your manual drawings), analyzes visual patterns (like wedges, flags, or candles), and correlates them with numerical data to provide a 'human-like' technical analysis."
    },
    {
        question: "Is my private key safe when using Portfolio Guard?",
        answer: "Absolutely. We are a non-custodial platform. We use Ethers.js to connect to your browser wallet (like MetaMask). We strictly read public on-chain data to analyze your portfolio. We never ask for, store, or have access to your private keys or seed phrases. All transaction signing happens within your wallet."
    },
    {
        question: "Can the Auto-Trading bot execute real transactions?",
        answer: "Currently, the Auto-Trading Arena is a 'Paper Trading' simulation environment designed for backtesting and strategy validation without financial risk. However, you can execute real, single transactions (Send/Swap) manually through the chat interface using the Natural Language Executor."
    },
    {
        question: "Which blockchains do you currently support?",
        answer: "For wallet connection and portfolio analysis, we support major EVM-compatible chains including Ethereum Mainnet, Binance Smart Chain (BSC), Polygon, and Avalanche C-Chain. Solana support is currently in beta for price tracking, with full wallet integration coming in v3.0."
    },
    {
        question: "Does the AI provide financial advice?",
        answer: "No. CryptoInsight AI is an analytics and data aggregation tool. The 'Verdicts' and 'Scores' are generated based on mathematical models and historical data patterns. They are for informational purposes only. You should always Do Your Own Research (DYOR) before making any investment decisions."
    },
    {
        question: "What is the difference between Gemini 2.5 Flash and older models?",
        answer: "Gemini 2.5 Flash offers significantly lower latency and a massive context window compared to previous iterations. This allows us to feed it entire weeks of OHLCV minute-data, live sentiment feeds, and complex whitepapers simultaneously, resulting in a much deeper and more nuanced market analysis."
    },
    {
        question: "Do I need to pay to use the advanced features?",
        answer: "For this Hackathon build (v2.5 Flash), all features including Vision Analysis, Portfolio Guard, and the Auto-Trading Simulator are completely free to use. We may introduce premium tiers for high-frequency API usage in the future, but the core analysis tools will remain accessible."
    }
];

const FAQSection: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="py-24 px-6 shrink-0">
            <div className="max-w-4xl mx-auto">
                <div className="mb-12 text-center">
                    <div className="inline-flex items-center gap-2 bg-neo-accent border-2 border-black px-3 py-1 mb-4 shadow-neo-sm transform -rotate-2">
                        <HelpCircle className="w-5 h-5 text-black" strokeWidth={2.5} />
                        <span className="text-sm font-black uppercase text-black">Support Center</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white uppercase tracking-tight">
                        Frequently Asked Questions
                    </h2>
                </div>

                <div className="space-y-4">
                    {FAQS.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div 
                                key={index} 
                                className={`border-2 border-black dark:border-white transition-all duration-300 ${isOpen ? 'bg-neo-yellow shadow-neo' : 'bg-white dark:bg-[#1a1a1a] hover:shadow-neo-sm'}`}
                            >
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                                >
                                    <span className={`text-lg md:text-xl font-black uppercase ${isOpen ? 'text-black' : 'text-black dark:text-white'}`}>
                                        {faq.question}
                                    </span>
                                    <div className={`p-1 border-2 border-black shrink-0 ml-4 transition-transform duration-300 ${isOpen ? 'bg-black text-white rotate-180' : 'bg-white text-black'}`}>
                                        {isOpen ? <Minus className="w-5 h-5" strokeWidth={3} /> : <Plus className="w-5 h-5" strokeWidth={3} />}
                                    </div>
                                </button>
                                
                                <div 
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                                >
                                    <div className="p-6 pt-0 text-base md:text-lg font-medium leading-relaxed border-t-2 border-black text-black">
                                        {faq.answer}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default FAQSection;