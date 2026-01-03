import { useState, useEffect, useRef } from 'react';
import { PaperWallet, TradeTrigger, TradeRecord } from '../types';

export const usePaperTrading = (notificationEmail?: string | null) => {
    // Initial Balance: $1,000 USDT
    const [wallet, setWallet] = useState<PaperWallet>({
        usdtBalance: 1000,
        holdings: {}
    });

    // Keep a ref to the email to ensure the interval/async functions always use the latest value
    const emailRef = useRef(notificationEmail);
    useEffect(() => {
        emailRef.current = notificationEmail;
    }, [notificationEmail]);

    const [triggers, setTriggers] = useState<TradeTrigger[]>([]);
    const [trades, setTrades] = useState<TradeRecord[]>([]);
    const [marketPrices, setMarketPrices] = useState<Record<string, number>>({});

    // Function to deposit/withdraw (simulate)
    const updateBalance = (amount: number, type: 'DEPOSIT' | 'WITHDRAW') => {
        setWallet(prev => ({
            ...prev,
            usdtBalance: type === 'DEPOSIT' ? prev.usdtBalance + amount : Math.max(0, prev.usdtBalance - amount)
        }));
    };

    // Add a new trigger
    const addTrigger = (trigger: Omit<TradeTrigger, 'id' | 'createdAt' | 'status'>) => {
        const newTrigger: TradeTrigger = {
            ...trigger,
            id: Date.now().toString(),
            createdAt: Date.now(),
            status: 'ACTIVE'
        };
        setTriggers(prev => [...prev, newTrigger]);
    };

    // Cancel a trigger
    const cancelTrigger = (id: string) => {
        setTriggers(prev => prev.filter(t => t.id !== id));
    };

    // Execute a trade (called internally when logic matches)
    const executeTrade = (trigger: TradeTrigger, currentPrice: number) => {
        const totalValue = trigger.type === 'BUY' ? trigger.amount : trigger.amount * currentPrice;

        setWallet(prev => {
            const newHoldings = { ...prev.holdings };
            let newUsdt = prev.usdtBalance;

            if (trigger.type === 'BUY') {
                if (prev.usdtBalance < trigger.amount) return prev; // Insufficient funds
                newUsdt -= trigger.amount;
                const tokenAmount = trigger.amount / currentPrice;
                newHoldings[trigger.symbol] = (newHoldings[trigger.symbol] || 0) + tokenAmount;
            } else {
                if ((newHoldings[trigger.symbol] || 0) < trigger.amount) return prev; // Insufficient holdings
                const sellValue = trigger.amount * currentPrice;
                newUsdt += sellValue;
                newHoldings[trigger.symbol] -= trigger.amount;
                if (newHoldings[trigger.symbol] <= 0) delete newHoldings[trigger.symbol];
            }

            return { usdtBalance: newUsdt, holdings: newHoldings };
        });

        // Record trade
        const trade: TradeRecord = {
            id: Date.now().toString(),
            symbol: trigger.symbol,
            price: currentPrice,
            amount: trigger.type === 'BUY' ? trigger.amount / currentPrice : trigger.amount,
            totalUsd: trigger.type === 'BUY' ? trigger.amount : trigger.amount * currentPrice,
            type: trigger.type,
            timestamp: Date.now()
        };
        setTrades(prev => [trade, ...prev]);

        // Remove trigger
        setTriggers(prev => prev.filter(t => t.id !== trigger.id));
        
        // Notification Logic
        console.log(`[AUTO-TRADE] Executed ${trigger.type} ${trigger.symbol} at $${currentPrice}`);
        if (emailRef.current) {
            console.log(`[EMAIL-ALERT] Sending success notification to: ${emailRef.current}`);
            console.log(`[EMAIL-CONTENT] Subject: Trade Executed! | Body: Successfully ${trigger.type} ${trigger.symbol} for $${totalValue.toFixed(2)}.`);
        }
    };

    // Public function to allow UI components (like LiveStrategyCard) to trigger execution
    const executeTrigger = (id: string, currentPrice: number) => {
        const trigger = triggers.find(t => t.id === id);
        if (trigger) {
            executeTrade(trigger, currentPrice);
        }
    };

    // --- Price Tracking Logic ---
    useEffect(() => {
        const checkTriggers = async () => {
            if (triggers.length === 0) return;

            // Get unique symbols to check
            const symbols = Array.from(new Set(triggers.map(t => t.symbol)));
            const symbolsParam = symbols.join(',').toLowerCase(); 

            try {
                // Fetch Prices
                const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbolsParam}&vs_currencies=usd`);
                const data = await response.json();

                const newPrices: Record<string, number> = {};

                // Check each trigger
                triggers.forEach(trigger => {
                    const priceData = data[trigger.symbol.toLowerCase()] || data[trigger.symbol]; // Try lowercase id first
                    const currentPrice = priceData?.usd;

                    if (currentPrice) {
                        newPrices[trigger.symbol] = currentPrice;
                        
                        // Only auto-execute simple triggers (no smartConditions)
                        // Smart triggers are handled by their UI component or separate logic
                        if (!trigger.smartConditions) {
                            let shouldExecute = false;
                            if (trigger.condition === 'ABOVE' && currentPrice >= trigger.targetPrice) {
                                shouldExecute = true;
                            } else if (trigger.condition === 'BELOW' && currentPrice <= trigger.targetPrice) {
                                shouldExecute = true;
                            }

                            if (shouldExecute) {
                                executeTrade(trigger, currentPrice);
                            }
                        }
                    }
                });

                setMarketPrices(prev => ({...prev, ...newPrices}));

            } catch (error) {
                console.error("[AutoTrade] Price check failed", error);
            }
        };

        const interval = setInterval(checkTriggers, 10000); // Check every 10 seconds
        return () => clearInterval(interval);
    }, [triggers]); // Re-run effect setup when triggers list changes

    return {
        wallet,
        triggers,
        trades,
        marketPrices,
        updateBalance,
        addTrigger,
        cancelTrigger,
        executeTrigger
    };
};