import React, { useState } from 'react';
import { parseSmartTrade } from '../../services/agents/smartTradeAgent';
import { SmartTradePlan, TradeTrigger } from '../../types';
import { BrainCircuit, Play, Bot, Loader2 } from 'lucide-react';

interface Props {
    onAddTrigger: (trigger: Omit<TradeTrigger, 'id' | 'createdAt' | 'status'>) => Promise<void> | void;
    onSuccess?: () => void;
}

const SmartTriggerSection: React.FC<Props> = ({ onAddTrigger, onSuccess }) => {
    const [input, setInput] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false); // New state
    const [plan, setPlan] = useState<SmartTradePlan | null>(null);

    const handleAnalyze = async () => {
        if (!input.trim()) return;
        setIsParsing(true);
        setPlan(null);
        try {
            const result = await parseSmartTrade(input);
            setPlan(result);
        } catch (error) {
            console.error(error);
        } finally {
            setIsParsing(false);
        }
    };

    const handleDeploy = async () => {
        if (!plan) return;

        setIsDeploying(true);
        try {
            // Find PRICE condition to map to legacy fields
            const priceCondition = plan.conditions.find(c => c.metric === 'PRICE');
            let targetPrice = 0;
            let condition: 'ABOVE' | 'BELOW' = 'ABOVE';

            if (priceCondition) {
                targetPrice = priceCondition.value;
                condition = priceCondition.operator === 'GT' ? 'ABOVE' : 'BELOW';
            } else {
                // Fallback for non-price strategies (e.g. RSI only)
                // We set a non-zero price to pass validation, but logic usually needs price
                targetPrice = 0.000001;
            }

            await onAddTrigger({
                symbol: plan.symbol,
                targetPrice: targetPrice,
                condition: condition,
                amount: plan.amount,
                type: plan.action,
                smartConditions: plan.conditions
            });

            // Reset only on success
            setPlan(null);
            setInput('');
            if (onSuccess) onSuccess(); // Call onSuccess
        } catch (error) {
            console.error("Deploy failed", error);
        } finally {
            setIsDeploying(false);
        }
    };

    return (
        <div className="bg-white dark:bg-[#1e1f20] border-2 border-black dark:border-white shadow-neo p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4 border-b-2 border-black dark:border-white pb-2">
                <BrainCircuit className="w-6 h-6 text-neo-primary" />
                <h3 className="font-black text-xl uppercase text-black dark:text-white">Smart Trade AI</h3>
            </div>

            {/* Input Section */}
            <div className="mb-6">
                <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Describe your strategy</label>
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="e.g. Buy BTC if price is below 62000 and RSI is under 30..."
                        className="w-full h-24 p-3 border-2 border-black dark:border-white bg-gray-50 dark:bg-black text-black dark:text-white font-medium text-sm outline-none resize-none"
                    />
                    <button
                        onClick={handleAnalyze}
                        disabled={isParsing || !input.trim()}
                        className="absolute bottom-2 right-2 bg-neo-primary text-white px-3 py-1 text-xs font-black uppercase border-2 border-black shadow-neo-sm hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all disabled:opacity-50 flex items-center gap-1"
                    >
                        {isParsing && <Loader2 className="w-3 h-3 animate-spin" />}
                        {isParsing ? 'Processing...' : 'Analyze Strategy'}
                    </button>
                </div>
            </div>

            {/* Plan Visualization & Deploy */}
            {plan && (
                <div className="animate-in fade-in slide-in-from-top-2">
                    <div className="bg-neo-yellow/20 border-2 border-black dark:border-white p-4">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <span className="block text-xs font-black uppercase text-gray-500">Strategy Detected</span>
                                <div className="font-black text-lg text-black dark:text-white uppercase flex items-center gap-2">
                                    <span className={plan.action === 'BUY' ? 'text-green-600' : 'text-red-600'}>{plan.action}</span>
                                    <span>{plan.symbol}</span>
                                    <span className="text-sm bg-black text-white px-2 py-0.5">${plan.amount}</span>
                                </div>
                            </div>
                            <button
                                onClick={handleDeploy}
                                disabled={isDeploying}
                                className="flex items-center gap-2 bg-black text-white px-4 py-2 font-black uppercase text-sm border-2 border-transparent hover:bg-green-600 transition-colors shadow-neo-sm disabled:opacity-70 disabled:cursor-wait"
                            >
                                {isDeploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                                {isDeploying ? 'Deploying...' : 'Deploy Agent'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            {plan.conditions.map((cond, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-white dark:bg-black border border-black dark:border-gray-700 p-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-neo-accent rounded-full"></div>
                                        <span className="font-bold text-gray-700 dark:text-gray-300 uppercase text-xs">{cond.metric}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-gray-500">{cond.operator === 'GT' ? '>' : '<'}</span>
                                        <span className="font-mono font-bold bg-gray-100 dark:bg-white/10 px-2">{cond.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SmartTriggerSection;