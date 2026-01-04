import React from 'react';
import { Endpoint } from '../DocHelpers';

export const ApiContent = () => (
    <div className="space-y-6">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 font-bold text-sm">
            Note: All API endpoints are prefixed with <span className="font-mono bg-yellow-200 px-1">/api</span>
        </div>

        <Endpoint method="POST" path="/auth/login" desc="Login with wallet signature" />
        <Endpoint method="GET" path="/triggers" desc="Get all user triggers" />
        <Endpoint method="POST" path="/triggers" desc="Create new trade trigger" />
        <Endpoint method="GET" path="/market/price/:symbol" desc="Get real-time price" />
        <Endpoint method="GET" path="/wallet/balance" desc="Get smart wallet balance" />
    </div>
);
