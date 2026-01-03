import { useState, useEffect } from 'react';
import { triggersApi, executeApi, marketApi } from '../services/backendApi';
import { TradeTrigger, TradeRecord } from '../types';

export const useBackendTrading = (walletAddress: string | null) => {
    const [triggers, setTriggers] = useState<TradeTrigger[]>([]);
    const [trades, setTrades] = useState<TradeRecord[]>([]);
    const [marketPrices, setMarketPrices] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);

    // Fetch triggers from backend
    const fetchTriggers = async () => {
        // Only fetch if wallet is connected
        if (!walletAddress) {
            setTriggers([]);
            return;
        }

        try {
            const data = await triggersApi.getAll();
            // Transform backend data to frontend format
            // Filter out CANCELLED and EXECUTED triggers - only show ACTIVE
            const formattedTriggers = data
                .filter((t: any) => t.status === 'ACTIVE')
                .map((t: any) => ({
                    id: t.id,
                    symbol: t.symbol,
                    targetPrice: t.targetPrice,
                    condition: t.condition,
                    amount: t.amount,
                    type: t.type,
                    status: t.status,
                    createdAt: new Date(t.createdAt).getTime(),
                    smartConditions: t.smartConditions,
                }));
            setTriggers(formattedTriggers);
        } catch (error) {
            console.error('Error fetching triggers:', error);
            setTriggers([]);
        }
    };

    // Fetch execution history
    const fetchHistory = async () => {
        // Only fetch if wallet is connected
        if (!walletAddress) {
            setTrades([]);
            return;
        }

        try {
            const data = await executeApi.getHistory();
            // Transform backend data to frontend format
            const formattedTrades = data.map((e: any) => ({
                id: e.id,
                symbol: e.symbol,
                price: e.price,
                amount: e.amount,
                totalUsd: e.amount * e.price,
                type: e.type,
                timestamp: new Date(e.executedAt).getTime(),
            }));
            setTrades(formattedTrades);
        } catch (error) {
            console.error('Error fetching history:', error);
            setTrades([]);
        }
    };

    // Add trigger
    const addTrigger = async (trigger: Omit<TradeTrigger, 'id' | 'createdAt' | 'status'>) => {
        if (!walletAddress) {
            alert('Please connect your wallet first');
            return;
        }

        try {
            setLoading(true);
            await triggersApi.create(trigger);
            await fetchTriggers(); // Refresh list
        } catch (error) {
            console.error('Error creating trigger:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Cancel trigger
    const cancelTrigger = async (id: string) => {
        console.log('🗑️ Canceling trigger:', id);
        try {
            const response = await triggersApi.delete(id);
            console.log('✅ Delete response:', response);
            await fetchTriggers(); // Refresh list (will filter out CANCELLED)
            console.log('✅ Triggers refreshed');
        } catch (error) {
            console.error('❌ Error canceling trigger:', error);
            alert('Failed to cancel trigger. Check console for details.');
        }
    };

    // Execute trigger manually
    const executeTrigger = async (id: string, price: number) => {
        try {
            await executeApi.execute(id);
            await fetchTriggers(); // Refresh triggers
            await fetchHistory(); // Refresh history
        } catch (error) {
            console.error('Error executing trigger:', error);
            throw error;
        }
    };

    // Fetch market prices
    useEffect(() => {
        const fetchPrices = async () => {
            if (triggers.length === 0) return;

            const symbols = Array.from(new Set(triggers.map(t => t.symbol)));
            try {
                const prices = await marketApi.getPrices(symbols);
                setMarketPrices(prices);
            } catch (error) {
                console.error('Error fetching prices:', error);
            }
        };

        fetchPrices();
        const interval = setInterval(fetchPrices, 10000); // Every 10s
        return () => clearInterval(interval);
    }, [triggers]);

    // Load data when wallet connects/disconnects
    useEffect(() => {
        const token = localStorage.getItem('auth_token');

        if (walletAddress && token) {
            // Wallet connected and token exists - load data
            console.log('✅ Wallet connected, loading data...');
            fetchTriggers();
            fetchHistory();

            // Auto-refresh every 10 seconds to sync with backend auto-executor
            const refreshInterval = setInterval(() => {
                console.log('🔄 Auto-refreshing triggers and trades...');
                fetchTriggers();
                fetchHistory();
            }, 10000); // 10 seconds

            return () => clearInterval(refreshInterval);
        } else {
            // Wallet disconnected or no token - clear data
            console.log('❌ Wallet not connected, clearing data...');
            setTriggers([]);
            setTrades([]);
            setMarketPrices({});

            // Clear token if wallet disconnected
            if (!walletAddress && token) {
                localStorage.removeItem('auth_token');
            }
        }
    }, [walletAddress]);

    return {
        triggers,
        trades,
        marketPrices,
        loading,
        addTrigger,
        cancelTrigger,
        executeTrigger,
        refreshTriggers: fetchTriggers,
        refreshHistory: fetchHistory,
    };
};

