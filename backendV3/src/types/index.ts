import { Request } from 'express';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        walletAddress: string;
    };
}

export interface CreateTriggerRequest {
    symbol: string;
    targetPrice: number;
    condition: 'ABOVE' | 'BELOW';
    amount: number;
    type: 'BUY' | 'SELL';
    smartConditions?: any;
    slippage?: number;
}

export interface BotSwapRequest {
    fromToken: 'MNT' | 'USDT';
    amount: number;
    slippagePercent?: number;
}
