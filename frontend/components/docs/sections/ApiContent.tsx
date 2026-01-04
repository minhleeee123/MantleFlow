import React from 'react';
import { Endpoint } from '../DocHelpers';

export const ApiContent = () => (
    <div className="space-y-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 font-bold text-sm">
            Note: All API endpoints are prefixed with <span className="font-mono bg-yellow-200 px-1">/api</span> and require <span className="font-mono bg-yellow-200 px-1">Authorization: Bearer {'<token>'}</span> header (except auth routes)
        </div>

        {/* Authentication Endpoints */}
        <div>
            <h3 className="text-xl font-black uppercase mb-4 border-b-2 border-black dark:border-white pb-2">Authentication</h3>
            <div className="space-y-2">
                <Endpoint method="POST" path="/auth/login" desc="Login with wallet signature" />
                <div className="ml-8 text-sm bg-gray-50 dark:bg-gray-900 p-3 border-l-2 border-blue-500">
                    <strong>Body:</strong> <code>{`{walletAddress, signature, message}`}</code><br />
                    <strong>Returns:</strong> <code>{`{token, user: {id, walletAddress, createdAt}}`}</code>
                </div>

                <Endpoint method="POST" path="/auth/verify" desc="Verify JWT token validity" />
                <div className="ml-8 text-sm bg-gray-50 dark:bg-gray-900 p-3 border-l-2 border-blue-500">
                    <strong>Returns:</strong> <code>{`{valid: boolean, user}`}</code>
                </div>
            </div>
        </div>

        {/* Trigger Endpoints */}
        <div>
            <h3 className="text-xl font-black uppercase mb-4 border-b-2 border-black dark:border-white pb-2">Triggers Management</h3>
            <div className="space-y-2">
                <Endpoint method="GET" path="/triggers" desc="Get all user triggers (with executions)" />
                <Endpoint method="GET" path="/triggers/:id" desc="Get single trigger details" />
                <Endpoint method="POST" path="/triggers" desc="Create new trade trigger" />
                <div className="ml-8 text-sm bg-gray-50 dark:bg-gray-900 p-3 border-l-2 border-green-500">
                    <strong>Body:</strong> <code>{`{symbol, targetPrice, condition, amount, type, smartConditions?}`}</code><br />
                    <strong>Validation:</strong> condition ∈ {'<ABOVE, BELOW>'}, type ∈ {'<BUY, SELL>'}, amount {'> 0'}
                </div>

                <Endpoint method="PATCH" path="/triggers/:id" desc="Update trigger (price, condition, status)" />
                <Endpoint method="DELETE" path="/triggers/:id" desc="Cancel trigger (sets status=CANCELLED)" />
            </div>
        </div>

        {/* Execution Endpoints */}
        <div>
            <h3 className="text-xl font-black uppercase mb-4 border-b-2 border-black dark:border-white pb-2">Execution</h3>
            <div className="space-y-2">
                <Endpoint method="POST" path="/execute/check/:triggerId" desc="Check if trigger conditions are met" />
                <div className="ml-8 text-sm bg-gray-50 dark:bg-gray-900 p-3 border-l-2 border-purple-500">
                    <strong>Returns:</strong> <code>{`{canExecute, currentPrice, targetPrice, condition}`}</code>
                </div>

                <Endpoint method="POST" path="/execute/:triggerId" desc="Manually execute trigger (if conditions met)" />
                <div className="ml-8 text-sm bg-gray-50 dark:bg-gray-900 p-3 border-l-2 border-purple-500">
                    <strong>Process:</strong> Validates conditions → Creates PENDING execution → Calls blockchain.executeSwap() → Updates to SUCCESS/FAILED
                </div>

                <Endpoint method="GET" path="/execute/history" desc="Get execution history (last 50, includes trigger metadata)" />
            </div>
        </div>

        {/* Market Data Endpoints */}
        <div>
            <h3 className="text-xl font-black uppercase mb-4 border-b-2 border-black dark:border-white pb-2">Market Data</h3>
            <div className="space-y-2">
                <Endpoint method="GET" path="/market/price/:symbol" desc="Get current price for symbol (BTC, ETH, SOL, etc.)" />
                <div className="ml-8 text-sm bg-gray-50 dark:bg-gray-900 p-3 border-l-2 border-orange-500">
                    <strong>Returns:</strong> <code>{`{symbol, price, timestamp}`}</code>
                </div>

                <Endpoint method="GET" path="/market/prices?symbols=BTC,ETH" desc="Batch price lookup (comma-separated)" />
                <Endpoint method="GET" path="/market/metrics?symbol=ETH&metrics=PRICE,RSI,VOLUME" desc="Advanced metrics for smart triggers" />
                <div className="ml-8 text-sm bg-gray-50 dark:bg-gray-900 p-3 border-l-2 border-orange-500">
                    <strong>Metrics:</strong> PRICE, RSI (14-period), VOLUME (24h USD), MA (50-period), SENTIMENT (F&G Index), GAS (Etherscan)
                </div>
            </div>
        </div>

        {/* Wallet Endpoints */}
        <div>
            <h3 className="text-xl font-black uppercase mb-4 border-b-2 border-black dark:border-white pb-2">Wallet Operations</h3>
            <div className="space-y-2">
                <Endpoint method="GET" path="/wallet/config" desc="Get contract addresses & RPC URL (public)" />
                <div className="ml-8 text-sm bg-gray-50 dark:bg-gray-900 p-3 border-l-2 border-cyan-500">
                    <strong>Returns:</strong> <code>{`{factoryAddress, routerAddress, rpcUrl, chainId, operatorAddress}`}</code>
                </div>

                <Endpoint method="GET" path="/wallet/address" desc="Get user's smart wallet address (null if not deployed)" />
                <Endpoint method="GET" path="/wallet/balance" desc="Get on-chain balances (USDC, MNT)" />
                <div className="ml-8 text-sm bg-gray-50 dark:bg-gray-900 p-3 border-l-2 border-cyan-500">
                    <strong>Returns:</strong> <code>{`{address, balances: {USDC: number, MNT: number}}`}</code><br />
                    <strong>Note:</strong> MNT balance includes Native MNT + Wrapped MNT
                </div>

                <Endpoint method="GET" path="/wallet/transactions" desc="Get deposit/withdraw history" />
                <Endpoint method="POST" path="/wallet/transactions" desc="Record transaction (from frontend after on-chain tx)" />
                <div className="ml-8 text-sm bg-gray-50 dark:bg-gray-900 p-3 border-l-2 border-cyan-500">
                    <strong>Body:</strong> <code>{`{type, token, amount, txHash}`}</code>, type ∈ {'<DEPOSIT, WITHDRAW, DEPLOY>'}
                </div>
            </div>
        </div>

        {/* Error Responses */}
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4">
            <h4 className="font-bold mb-2">Common Error Responses</h4>
            <div className="text-sm space-y-1 font-mono">
                <div><strong>400:</strong> Missing required fields / Invalid input</div>
                <div><strong>401:</strong> Invalid signature / No token / Token expired</div>
                <div><strong>404:</strong> Trigger not found / Resource not found</div>
                <div><strong>500:</strong> Server error / Blockchain error / API timeout</div>
            </div>
        </div>
    </div>
);
