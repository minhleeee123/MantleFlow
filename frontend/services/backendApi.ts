import api from './api';

// Auth API
export const authApi = {
    login: async (walletAddress: string, signature: string, message: string) => {
        const response = await api.post('/auth/login', {
            walletAddress,
            signature,
            message,
        });
        return response.data;
    },

    verify: async () => {
        const response = await api.post('/auth/verify');
        return response.data;
    },
};

// Triggers API
export const triggersApi = {
    getAll: async () => {
        const response = await api.get('/triggers');
        return response.data.triggers;
    },

    getOne: async (id: string) => {
        const response = await api.get(`/triggers/${id}`);
        return response.data.trigger;
    },

    create: async (trigger: any) => {
        const response = await api.post('/triggers', trigger);
        return response.data.trigger;
    },

    update: async (id: string, data: any) => {
        const response = await api.patch(`/triggers/${id}`, data);
        return response.data.trigger;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/triggers/${id}`);
        return response.data;
    },
};

// Execute API
export const executeApi = {
    check: async (triggerId: string) => {
        const response = await api.post(`/execute/check/${triggerId}`);
        return response.data;
    },

    execute: async (triggerId: string) => {
        const response = await api.post(`/execute/${triggerId}`);
        return response.data;
    },

    getHistory: async () => {
        const response = await api.get('/execute/history');
        return response.data.executions;
    },
};

// Market API
export const marketApi = {
    getPrice: async (symbol: string) => {
        const response = await api.get(`/market/price/${symbol}`);
        return response.data;
    },

    getPrices: async (symbols: string[]) => {
        const response = await api.get(`/market/prices?symbols=${symbols.join(',')}`);
        return response.data.prices;
    },

    getMetrics: async (symbol: string, metrics: string[]) => {
        const response = await api.get(`/market/metrics?symbol=${symbol}&metrics=${metrics.join(',')}`);
        return response.data;
    },
};

// Transactions API
export const transactionsApi = {
    create: async (data: { type: 'DEPOSIT' | 'WITHDRAW', token: string, amount: number, txHash?: string }) => {
        const response = await api.post('/wallet/transactions', data);
        return response.data;
    },

    list: async () => {
        const response = await api.get('/wallet/transactions');
        return response.data;
    }
};
