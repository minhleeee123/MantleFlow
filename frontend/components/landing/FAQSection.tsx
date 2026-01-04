import React, { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const FAQS = [
    {
        question: "How does the 'Vision Agent' analysis work?",
        answer: "Our Vision Agent utilizes the multimodal capabilities of Gemini 2.5. It doesn't just read price data—it actually 'sees' the chart patterns, wedges, and trends in your uploaded screenshots, effectively combining visual technical analysis with quantitative data."
    },
    {
        question: "Is my private key safe?",
        answer: "Absolutely. We are a non-custodial platform. We never ask for your private keys. Instead, you deploy a personal 'Smart Wallet' (Account Abstraction) on Mantle Sepolia. You authorize our AI Bot as a 'Session Key' operator, allowing it to execute trades within strict limits while you retain full ownership of your funds."
    },
    {
        question: "Does the Auto-Trading Bot execute real transactions?",
        answer: "Yes! Unlike paper trading simulators, our bot executes REAL on-chain transactions on the Mantle Sepolia Testnet. When your AI triggers a 'Buy', the bot actively interacts with the blockchain to swap tokens in your Smart Wallet."
    },
    {
        question: "Which blockchains do you support?",
        answer: "We are currently built exclusively on the Mantle Sepolia Testnet. This allows for high-speed, low-cost transaction execution, which is crucial for high-frequency AI trading strategies."
    },
    {
        question: "Does the AI provide financial advice?",
        answer: "No. MantleFlow is an advanced analytics tool. All 'Verdicts' and 'Scores' are generated based on mathematical models and historical data patterns. They are for informational purposes only. You should always Do Your Own Research (DYOR)."
    },
    {
        question: "What makes the 'Smart Trigger' different from limit orders?",
        answer: "Standard limit orders just check price (e.g., 'Buy at $2000'). Our Smart Triggers allow you to use natural language (e.g., 'Buy ETH if RSI is below 30 and volume is spiking'). The AI parses your intent into complex logic that traditional DEXs cannot handle."
    },
    {
        question: "Is the platform free to use?",
        answer: "Yes, for this Hackathon release, all features including the Vision Agent, Portfolio Guard, and Auto-Trading Bot are completely free to use on the Testnet."
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