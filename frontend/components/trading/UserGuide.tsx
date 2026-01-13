import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Wallet, Zap, ShieldCheck, Mail } from 'lucide-react';

export const UserGuide: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white dark:bg-[#1e1f20] border-2 border-black dark:border-white shadow-neo mb-6 overflow-hidden rounded-xl">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-neo-accent hover:opacity-90 transition-opacity"
            >
                <div className="flex items-center gap-2 font-black text-black uppercase">
                    <HelpCircle className="w-5 h-5" />
                    USER GUIDE: GETTING STARTED WITH AUTO-TRADING
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-black" /> : <ChevronDown className="w-5 h-5 text-black" />}
            </button>

            {isOpen && (
                <div className="p-6 space-y-8 text-sm text-black dark:text-gray-200">

                    {/* Step 0: Network Setup */}
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-black text-white flex items-center justify-center font-bold rounded-full">1</div>
                        <div className="space-y-2 flex-1">
                            <h4 className="font-bold text-lg flex items-center gap-2 text-neo-primary">
                                <Zap className="w-4 h-4" /> Connect to Mantle Testnet
                            </h4>
                            <p className="leading-relaxed text-gray-600 dark:text-gray-400">
                                Before connecting your wallet, ensure you are on the <strong>Mantle Sepolia Testnet</strong>.
                            </p>
                            <div className="bg-gray-100 dark:bg-black/50 p-3 border border-dashed border-gray-400 font-mono text-xs space-y-1 rounded-lg">
                                <div><strong>Network Name:</strong> Mantle Sepolia Testnet</div>
                                <div><strong>RPC URL:</strong> https://rpc.sepolia.mantle.xyz</div>
                                <div><strong>Chain ID:</strong> 5003</div>
                                <div><strong>Currency:</strong> MNT</div>
                            </div>
                            <div className="mt-2">
                                <a
                                    href="https://faucet.testnet.mantle.xyz/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-black text-white px-3 py-1 text-xs font-bold uppercase inline-flex items-center gap-1 hover:bg-neo-primary hover:text-black transition-colors rounded-md"
                                >
                                    Get Testnet MNT (Faucet) <ChevronDown className="w-3 h-3 -rotate-90" />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gray-200 dark:bg-gray-700" />

                    {/* Step 1: Wallet Setup */}
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-black text-white flex items-center justify-center font-bold rounded-full">2</div>
                        <div className="space-y-2">
                            <h4 className="font-bold text-lg flex items-center gap-2">
                                <Wallet className="w-4 h-4" /> Activate Smart Account
                            </h4>
                            <p className="leading-relaxed">
                                Connect your MetaMask wallet. If this is your first time, click <strong>"ACTIVATE NOW"</strong> to deploy your Abstract Account (Smart Wallet).
                                <br />
                                <span className="text-xs text-gray-500 italic">* This is a non-custodial smart contract that only YOU control.</span>
                            </p>
                            <p className="mt-2">
                                <strong>Important:</strong> You must <strong>Deposit Funds</strong> into this Smart Wallet to trade.
                                Use the "Deposit" tab to move MNT (for gas & trading) and USDT from your personal wallet to your Smart Wallet.
                            </p>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gray-200 dark:bg-gray-700" />

                    {/* Step 2: Create Triggers */}
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-black text-white flex items-center justify-center font-bold rounded-full">3</div>
                        <div className="space-y-2">
                            <h4 className="font-bold text-lg flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" /> Create & Monitor Strategies
                            </h4>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>
                                    <strong>🤖 Smart AI Agent:</strong> Type your strategy in plain English. <br />
                                    <em>Example: "Buy 10 MNT when Price &lt; 1.2 and RSI &lt; 30"</em>
                                </li>
                                <li>
                                    <strong>⚙️ Manual Trigger:</strong> Use the form to set simple Price Limit orders (Buy/Sell).
                                </li>
                            </ul>
                            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 border-l-4 border-yellow-500 text-xs text-yellow-800 dark:text-yellow-200 font-bold mt-2 rounded-r-lg">
                                Your active strategies will appear in "Live Bot Operations". Our backend monitors the market 24/7 and executes automatically via your Smart Wallet.
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};
