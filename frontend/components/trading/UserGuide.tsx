import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Wallet, Zap, ShieldCheck, Mail, Bot } from 'lucide-react';

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

                    {/* Step 2: Add USDT Token */}
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-black text-white flex items-center justify-center font-bold rounded-full">2</div>
                        <div className="space-y-2 flex-1">
                            <h4 className="font-bold text-lg flex items-center gap-2">
                                <Wallet className="w-4 h-4" /> Add USDT Token to MetaMask
                            </h4>
                            <p className="leading-relaxed text-gray-600 dark:text-gray-400">
                                <strong>Before connecting your wallet</strong>, you must add the USDT token to MetaMask for the app to read your balance.
                            </p>
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                                <p className="text-sm font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                                    ⚠️ Critical Step: Without adding USDT token, the app cannot scan your wallet!
                                </p>
                                <div className="bg-gray-100 dark:bg-black/50 p-3 border border-dashed border-gray-400 font-mono text-xs space-y-1 rounded-lg">
                                    <div><strong>Token Symbol:</strong> USDT</div>
                                    <div><strong>Token Address:</strong> 0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080</div>

                                </div>
                            </div>
                            <div className="mt-2 space-y-2">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <strong>How to add:</strong>
                                </p>
                                <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                    <li>Open MetaMask → Switch to Mantle Sepolia Testnet</li>
                                    <li>Click "Import tokens" at the bottom</li>
                                    <li>Paste the USDT address above</li>
                                    <li>Click "Add Custom Token" → "Import"</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gray-200 dark:bg-gray-700" />

                    {/* Step 3: Connect & Deposit */}
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-black text-white flex items-center justify-center font-bold rounded-full">3</div>
                        <div className="space-y-2">
                            <h4 className="font-bold text-lg flex items-center gap-2">
                                <Wallet className="w-4 h-4" /> Connect Wallet & Deposit Funds
                            </h4>
                            <p className="leading-relaxed">
                                Connect your MetaMask wallet to the app. Then deposit funds into the <strong>Vault Contract</strong> to start trading.
                            </p>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 border border-blue-300 dark:border-blue-700 rounded-lg space-y-2">
                                <p className="text-sm">
                                    <strong>Vault Contract:</strong> A shared smart contract where all users deposit funds. Your balance is tracked on-chain separately.
                                </p>
                                <p className="text-sm">
                                    Use the <strong>"Deposit"</strong> tab to move:
                                </p>
                                <ul className="list-disc pl-5 text-sm space-y-1">
                                    <li><strong>MNT</strong> - For gas fees and trading</li>
                                    <li><strong>USDT</strong> - For trading pairs</li>
                                </ul>
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-800 p-2 border-l-4 border-gray-500 text-xs text-gray-700 dark:text-gray-300 mt-2 rounded-r-lg">
                                💡 Your funds remain under YOUR control. You can withdraw anytime via the "Withdraw" tab.
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gray-200 dark:bg-gray-700" />

                    {/* Step 4: Authorize Trading Bot */}
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-black text-white flex items-center justify-center font-bold rounded-full">4</div>
                        <div className="space-y-2">
                            <h4 className="font-bold text-lg flex items-center gap-2 text-purple-600">
                                <Bot className="w-4 h-4" /> Authorize Trading Bot
                            </h4>
                            <p className="leading-relaxed">
                                To enable <strong>Auto-Trading</strong>, you must authorize the MantleFlow trading bot to execute swaps on your behalf.
                            </p>
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 border border-purple-300 dark:border-purple-700 rounded-lg space-y-2">
                                <p className="text-sm">
                                    <strong>Why authorize?</strong> The bot monitors market 24/7 and executes your triggers automatically without requiring you to sign each transaction.
                                </p>
                                <p className="text-sm">
                                    <strong>Security:</strong> Bot can ONLY swap your funds (MNT ↔ USDT) within the vault. It CANNOT withdraw your funds. You retain full custody and can revoke authorization anytime.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                                <div className="bg-yellow-400 text-black px-3 py-1.5 font-bold uppercase text-xs border border-black rounded-lg inline-block">
                                    Authorize Bot
                                </div>
                                <span className="text-xs text-gray-500">← Click this button in the Swap section</span>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 p-2 border-l-4 border-red-500 text-xs text-red-800 dark:text-red-200 font-bold mt-2 rounded-r-lg">
                                ⚠️ Without bot authorization, auto-trading will NOT work. Your triggers will remain active but won't execute.
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gray-200 dark:bg-gray-700" />

                    {/* Step 5: Create Triggers */}
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-black text-white flex items-center justify-center font-bold rounded-full">5</div>
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
                            <div className="bg-green-100 dark:bg-green-900/30 p-2 border-l-4 border-green-500 text-xs text-green-800 dark:text-green-200 font-bold mt-2 rounded-r-lg">
                                ✓ Your active strategies will appear in "Live Bot Operations". Our backend monitors the market every 30 seconds and executes automatically when conditions are met.
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};
