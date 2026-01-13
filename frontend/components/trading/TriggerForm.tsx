import React, { useState } from 'react';
import { Plus, Target, Settings, Activity } from 'lucide-react';
import { TradeTrigger, TradeCondition, TradeType } from '../../types';

interface Props {
    onAddTrigger: (trigger: Omit<TradeTrigger, 'id' | 'createdAt' | 'status'>) => void;
}

const TriggerForm: React.FC<Props> = ({ onAddTrigger }) => {
    const [symbol, setSymbol] = useState('');
    const [targetPrice, setTargetPrice] = useState('');
    const [amount, setAmount] = useState('');
    const [condition, setCondition] = useState<TradeCondition>('ABOVE');
    const [type, setType] = useState<TradeType>('BUY');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!symbol || !targetPrice || !amount) return;

        onAddTrigger({
            symbol: symbol.toUpperCase(),
            targetPrice: parseFloat(targetPrice),
            condition,
            amount: parseFloat(amount),
            type
        });

        // Reset form slightly
        setSymbol('');
        setTargetPrice('');
        setAmount('');
    };

    return (
        <div className="bg-white dark:bg-[#1e1f20] border-2 border-black dark:border-white shadow-neo p-6 rounded-xl">
            <div className="flex items-center gap-2 mb-6 border-b-2 border-black dark:border-white pb-2">
                <Target className="w-5 h-5 text-neo-primary" strokeWidth={3} />
                <h3 className="font-black text-lg uppercase text-black dark:text-white">Set Auto-Trigger</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

                {/* Symbol Input */}
                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-gray-500">Token Pair</label>
                    <div className="flex items-center bg-gray-50 dark:bg-black border-2 border-black dark:border-white p-1 rounded-xl">
                        <input
                            type="text"
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value)}
                            placeholder="e.g. bitcoin, ethereum"
                            className="w-full bg-transparent p-2 outline-none font-bold uppercase text-black dark:text-white"
                        />
                        <span className="px-3 font-mono font-bold text-gray-400">/USDT</span>
                    </div>
                </div>

                {/* Logic Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-gray-500">Action</label>
                        <div className="flex border-2 border-black dark:border-white rounded-xl overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setType('BUY')}
                                className={`flex-1 py-2 font-black text-xs uppercase ${type === 'BUY' ? 'bg-neo-secondary text-black' : 'bg-transparent text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                            >
                                Buy
                            </button>
                            <div className="w-0.5 bg-black dark:bg-white"></div>
                            <button
                                type="button"
                                onClick={() => setType('SELL')}
                                className={`flex-1 py-2 font-black text-xs uppercase ${type === 'SELL' ? 'bg-neo-accent text-black' : 'bg-transparent text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                            >
                                Sell
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-gray-500">Condition</label>
                        <select
                            value={condition}
                            onChange={(e) => setCondition(e.target.value as TradeCondition)}
                            className="w-full bg-white dark:bg-black border-2 border-black dark:border-white p-2.5 font-bold outline-none text-sm text-black dark:text-white rounded-xl"
                        >
                            <option value="ABOVE">Price ≥ Target</option>
                            <option value="BELOW">Price ≤ Target</option>
                        </select>
                    </div>
                </div>

                {/* Price & Amount Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-gray-500">Target Price ($)</label>
                        <input
                            type="number"
                            step="any"
                            value={targetPrice}
                            onChange={(e) => setTargetPrice(e.target.value)}
                            placeholder="0.00"
                            className="neo-input w-full p-2 font-mono font-bold bg-white dark:bg-black text-black dark:text-white"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-gray-500">
                            {type === 'BUY' ? 'Amount (USDT)' : `Amount (${symbol || 'Token'})`}
                        </label>
                        <input
                            type="number"
                            step="any"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="neo-input w-full p-2 font-mono font-bold bg-white dark:bg-black text-black dark:text-white"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full mt-4 bg-black text-white dark:bg-white dark:text-black py-3 font-black uppercase border-2 border-transparent hover:border-black dark:hover:border-white hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-all shadow-neo-sm flex items-center justify-center gap-2 rounded-xl"
                >
                    <Plus className="w-5 h-5" /> Create Trigger
                </button>

            </form>
        </div>
    );
};

export default TriggerForm;