import { Request } from 'express';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        walletAddress: string;
    };
}

export interface LoginRequest {
    walletAddress: string;
    signature: string;
    message: string;
}

export interface CreateTriggerRequest {
    symbol: string;
    targetPrice: number;
    condition: 'ABOVE' | 'BELOW';
    amount: number;
    type: 'BUY' | 'SELL';
}

export interface JWTPayload {
    userId: string;
    walletAddress: string;
}
