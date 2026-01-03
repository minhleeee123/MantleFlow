import React, { useState } from 'react';
import { PaperWallet as IPaperWallet, TradeTrigger, TradeRecord } from '../../types';
import { ContractWallet } from './ContractWallet';
import TriggerForm from './TriggerForm';
import SmartTriggerSection from './SmartTriggerSection';
import ActiveTriggers from './ActiveTriggers';
import TradeHistory from './TradeHistory';
import LiveStrategyCard from './LiveStrategyCard';
import { Bot, Bell, Check, Mail } from 'lucide-react';

interface Props {
    wallet: IPaperWallet;
    triggers: TradeTrigger[];
    trades: TradeRecord[];
    marketPrices?: Record<string, number>; // Optional prop for price feed
    notificationEmail: string;
    onUpdateBalance: (amount: number, type: 'DEPOSIT' | 'WITHDRAW') => void;
    onAddTrigger: (trigger: Omit<TradeTrigger, 'id' | 'createdAt' | 'status'>) => void;
    onCancelTrigger: (id: string) => void;
    executeTrigger?: (id: string, price: number) => void; // Added prop type
    onUpdateEmail: (email: string) => void;
    userWalletAddress?: string; // Add prop for contract wallet
}

const AutoTradingView: React.FC<Props> = ({
    wallet,
    triggers,
    trades,
    marketPrices = {},
    notificationEmail,
    onUpdateBalance,
    onAddTrigger,
    onCancelTrigger,
    executeTrigger,
    onUpdateEmail,
    userWalletAddress
}) => {
    const [emailInput, setEmailInput] = useState(notificationEmail);
    const [isSaved, setIsSaved] = useState(false);

    const handleSaveEmail = () => {
        onUpdateEmail(emailInput);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 animate-page-enter bg-checkered">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Top Section: Contract Wallet */}
                {userWalletAddress ? (
                    <ContractWallet userAddress={userWalletAddress} />
                ) : (
                    <div className="bg-yellow-100 border-2 border-yellow-500 p-4 font-bold text-center">
                        PLEASE CONNECT WALLET TO ACCESS TRADING
                    </div>
                )}

                {/* Main Control Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column: Triggers */}
                    <div className="flex flex-col gap-6">
                        {/* New Smart AI Trigger */}
                        <SmartTriggerSection onAddTrigger={onAddTrigger} />

                        {/* Legacy Manual Trigger */}
                        <TriggerForm onAddTrigger={onAddTrigger} />
                    </div>

                    {/* Right Column: Active Monitoring & Notifications */}
                    <div className="flex flex-col gap-6">

                        {/* Notification Settings Card */}
                        <div className="bg-white dark:bg-[#1e1f20] border-2 border-black dark:border-white shadow-neo p-6">
                            <div className="flex items-center gap-2 mb-4 border-b-2 border-black dark:border-white pb-2">
                                <Bell className="w-5 h-5 text-neo-primary" strokeWidth={3} />
                                <h3 className="font-black text-lg uppercase text-black dark:text-white">Alert Settings</h3>
                            </div>
                            <div className="bg-gray-100 dark:bg-black/50 p-4 border border-black dark:border-white/20">
                                <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">
                                    Send Execution Reports To:
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="email"
                                            value={emailInput}
                                            onChange={(e) => setEmailInput(e.target.value)}
                                            placeholder="Enter email address"
                                            className="w-full pl-9 pr-3 py-2 border-2 border-black dark:border-white font-mono text-sm font-bold bg-white dark:bg-black outline-none"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSaveEmail}
                                        className={`px-4 py-2 border-2 border-black dark:border-white font-black uppercase text-xs shadow-neo-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center gap-1 ${isSaved ? 'bg-green-500 text-white' : 'bg-neo-accent text-black'}`}
                                    >
                                        {isSaved ? <Check className="w-4 h-4" /> : 'Save'}
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-2">
                                    * You will receive an instant email whenever a Smart Trade or Limit Order is executed.
                                </p>
                            </div>
                        </div>

                        <ActiveTriggers triggers={triggers} onCancel={onCancelTrigger} />
                    </div>
                </div>

                {/* Live Bot Operations Section */}
                {triggers.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b-2 border-black dark:border-white pb-2">
                            <div className="bg-black text-white p-1">
                                <Bot className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-black uppercase text-black dark:text-white">Live Bot Operations</h3>
                            <span className="ml-auto text-xs font-bold bg-green-500 text-white px-2 py-0.5 border border-black animate-pulse">SYSTEM ACTIVE</span>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {triggers.map(trigger => (
                                <LiveStrategyCard
                                    key={trigger.id}
                                    trigger={trigger}
                                    currentPrice={marketPrices[trigger.symbol]}
                                    onExecute={executeTrigger} // Pass execution handler
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* History Section */}
                <TradeHistory trades={trades} />
            </div>
        </div>
    );
};

export default AutoTradingView;