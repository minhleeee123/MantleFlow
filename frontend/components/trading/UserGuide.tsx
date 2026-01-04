import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Wallet, Zap, ShieldCheck, Mail } from 'lucide-react';

export const UserGuide: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white dark:bg-[#1e1f20] border-2 border-black dark:border-white shadow-neo mb-6 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-neo-accent hover:opacity-90 transition-opacity"
            >
                <div className="flex items-center gap-2 font-black text-black uppercase">
                    <HelpCircle className="w-5 h-5" />
                    How to Use Auto-Trading
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-black" /> : <ChevronDown className="w-5 h-5 text-black" />}
            </button>

            {isOpen && (
                <div className="p-6 space-y-6 text-sm text-black dark:text-gray-200">
                    {/* Step 1: Wallet Setup */}
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-black text-white flex items-center justify-center font-bold rounded-full">1</div>
                        <div className="space-y-2">
                            <h4 className="font-bold text-lg flex items-center gap-2">
                                <Wallet className="w-4 h-4" /> Setup Trading Account
                            </h4>
                            <p className="leading-relaxed">
                                First, click <strong>"ACTIVATE NOW"</strong> to deploy your personal Smart Wallet. This is a non-custodial smart contract that you own.
                                <br />
                                Once deployed, you must <strong>Deposit funds</strong> (USDC for trading, MNT for gas) into this Smart Wallet using the deposit controls in the wallet card.
                            </p>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gray-200 dark:bg-gray-700" />

                    {/* Step 2: Create Triggers */}
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-black text-white flex items-center justify-center font-bold rounded-full">2</div>
                        <div className="space-y-2">
                            <h4 className="font-bold text-lg flex items-center gap-2">
                                <Zap className="w-4 h-4" /> Create Auto-Triggers
                            </h4>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>
                                    <strong>Smart Trade AI:</strong> Describe your strategy in plain English (e.g., <em>"Buy ETH if price drops below 2000"</em>) and the AI will parse it into a trigger plan.
                                </li>
                                <li>
                                    <strong>Manual Trigger:</strong> Use the "Set Auto-Trigger" form to manually specify token, target price, and action (Buy/Sell).
                                </li>
                            </ul>
                            <p className="bg-yellow-100 dark:bg-yellow-900/30 p-2 border-l-4 border-yellow-500 text-xs text-yellow-800 dark:text-yellow-200 font-bold mt-2">
                                Note: Triggers require a one-time "Authorize Bot" transaction so our system can execute trades on your behalf.
                            </p>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gray-200 dark:bg-gray-700" />

                    {/* Step 3: Monitoring */}
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-black text-white flex items-center justify-center font-bold rounded-full">3</div>
                        <div className="space-y-2">
                            <h4 className="font-bold text-lg flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" /> Monitor & Manage
                            </h4>
                            <p className="leading-relaxed">
                                Your active triggers will appear in the "Live Bot Operations" section.
                                If the market condition is met, our bot executes the trade via your Smart Wallet.
                                You can cancel any pending trigger at any time.
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                <Mail className="w-3 h-3" />
                                Add your email in the "Alert Settings" card to receive instant notifications when a trade executes.
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
