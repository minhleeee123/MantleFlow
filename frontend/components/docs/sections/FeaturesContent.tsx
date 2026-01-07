import React from 'react';
import { FeatureBlock } from '../DocHelpers';
import { Brain, BarChart2, Bot, Wallet, Link, Globe } from 'lucide-react';

export const FeaturesContent = () => (
    <div className="space-y-6">
        <FeatureBlock title={<div className="flex items-center gap-2"><Brain className="w-5 h-5" /> AI Chat Agent</div>}>
            <ul className="list-disc ml-5 space-y-2">
                <li><strong>Intent Classification:</strong> Automatically classifies user intent into 4 categories: ANALYZE (coin analysis), PORTFOLIO_ANALYSIS (portfolio review), TRANSACTION (Web3 txn preview), and CHAT (general conversation).</li>
                <li><strong>Market Analysis Agent:</strong> Fetches real-time data from CoinGecko API including price history, market cap, volume. Generates comprehensive reports with charts (Recharts), Fear & Greed Index (Alternative.me), Long/Short ratios (Binance API), and AI-generated tokenomics visualizations.</li>
                <li><strong>Portfolio Agent:</strong> Analyzes holdings, calculates weighted risk scores based on volatility and allocation. Provides rebalancing recommendations using modern portfolio theory principles.</li>
                <li><strong>Transaction Agent:</strong> Parses natural language commands like "Send 100 USDT to 0x..." into structured Web3 transaction previews with estimated gas costs and formatted calldata.</li>
                <li><strong>Smart Trade Agent:</strong> Converts complex trading instructions into JSON strategies. Example: "Buy ETH if RSI &lt; 30 and price below $3000" → <code>{`{symbol: "ETH", action: "BUY", conditions: [{metric: "RSI", operator: "LT", value: 30}, {metric: "PRICE", operator: "LT", value: 3000}]}`}</code>.</li>
            </ul>
        </FeatureBlock>

        <FeatureBlock title={<div className="flex items-center gap-2"><BarChart2 className="w-5 h-5" /> Market Analysis Dashboard</div>}>
            <ul className="list-disc ml-5 space-y-2">
                <li><strong>Price Charts:</strong> 7-day historical data from CoinGecko API (<code>/coins/{'{id}'}/market_chart</code>), rendered as responsive line charts using Recharts with gradients and tooltips.</li>
                <li><strong>Fear & Greed Index:</strong> Real-time sentiment score (0-100) from Alternative.me API, displayed as radial gauge with color coding (Fear = Red, Greed = Green).</li>
                <li><strong>Long/Short Ratio:</strong> Fetched from Binance Futures API to show institutional trader positioning and market bias indicators.</li>
                <li><strong>Project Score Radar:</strong> AI-generated multi-dimensional evaluation covering 4 axes: Security (smart contract audits), Decentralization (token distribution), Scalability (TPS metrics), and Ecosystem (partnerships, dApps).</li>
                <li><strong>Tokenomics Visualization:</strong> AI-generated or CoinGecko-sourced token distribution (Team, Public Sale, Staking, Treasury) displayed as interactive pie charts.</li>
            </ul>
        </FeatureBlock>

        <FeatureBlock title={<div className="flex items-center gap-2"><Bot className="w-5 h-5" /> Auto-Trading System</div>}>
            <ul className="list-disc ml-5 space-y-2">
                <li><strong>Simple Triggers:</strong> Price-based execution with 2 conditions: ABOVE (execute when price ≥ target) or BELOW (execute when price ≤ target). Stored in MySQL <code>Trigger</code> table with <code>status</code> field tracking lifecycle.</li>
                <li><strong>Smart Triggers (AI-Powered):</strong> Multi-condition strategies supporting 6 metrics: PRICE (CoinGecko), RSI (calculated from 14-period historical data), VOLUME (24h USD volume), MA (50-period moving average), SENTIMENT (Fear & Greed Index), and GAS (Etherscan Gas Oracle). All conditions must pass for execution (AND logic).</li>
                <li><strong>Auto-Executor Worker:</strong> Node.js background worker running every <strong>30 seconds</strong>. Fetches all ACTIVE triggers, evaluates conditions via external APIs/calculations, and calls <code>blockchainService.executeBotSwap()</code> for qualifying triggers. Updates trigger status to EXECUTED and creates <code>Execution</code> records.</li>
                <li><strong>Execution Tracking:</strong> Every execution attempt is logged in database with status (PENDING → SUCCESS/FAILED), transaction hash, execution timestamp, and error messages for debugging.</li>
                <li><strong>Swap Mechanism:</strong> Uses internal SimpleDEXV2 AMM on Mantle Network. Bot executes <code>executeSwapMntToUsdtForUser()</code> or <code>executeSwapUsdtToMntForUser()</code> directly on VaultWithSwap contract with user authorization.</li>
            </ul>
        </FeatureBlock>

        <FeatureBlock title={<div className="flex items-center gap-2"><Wallet className="w-5 h-5" /> VaultWithSwap (Shared Vault Model)</div>}>
            <ul className="list-disc ml-5 space-y-2">
                <li><strong>Deposit Functions:</strong> Users deposit funds directly into shared VaultWithSwap contract via <code>depositMnt()</code> (payable) and <code>depositUsdt(uint256 amount)</code>. Contract tracks individual balances in <code>mntBalances[user]</code> and <code>usdtBalances[user]</code> mappings.</li>
                <li><strong>Withdraw Functions:</strong> Only users can withdraw their funds via <code>withdrawMnt(uint256 amount)</code> and <code>withdrawUsdt(uint256 amount)</code>. Contract checks balance before transfer, ensuring non-custodial security.</li>
                <li><strong>Bot Authorization:</strong> Users authorize backend bot to swap on their behalf via <code>authorizeBot(address bot, bool status)</code>. Authorization can be revoked anytime, giving users full control.</li>
                <li><strong>Bot Swap Functions:</strong> Authorized bots execute swaps via <code>executeSwapMntToUsdtForUser(address user, uint256 mntAmount, uint256 minUsdtOut)</code> and <code>executeSwapUsdtToMntForUser()</code>. Bot pays gas but swaps user's vault balance.</li>
                <li><strong>SimpleDEXV2 Integration:</strong> VaultWithSwap interacts with SimpleDEXV2 for swaps. DEX uses constant product AMM formula (x * y = k) with 0.3% trading fee. Liquidity providers can add/remove liquidity to earn fees.</li>
                <li><strong>Security Features:</strong> OpenZeppelin's SafeERC20 for token transfers, ReentrancyGuard for all state-changing functions, bot authorization checks on every delegated swap, slippage protection via minOut parameters.</li>
            </ul>
        </FeatureBlock>

        <FeatureBlock title={<div className="flex items-center gap-2"><Link className="w-5 h-5" /> Web3 Integration & Authentication</div>}>
            <ul className="list-disc ml-5 space-y-2">
                <li><strong>MetaMask Connection:</strong> Frontend calls <code>window.ethereum.request({'{method: "eth_requestAccounts"}'}</code> to prompt wallet connection. Retrieves address and balances (native + ERC20) via ethers.js providers.</li>
                <li><strong>Signature-Based Auth:</strong> User signs message: <code>"Sign this message to login to Auto-Trading Platform.\nTimestamp: {'{Date.now()}'}"</code> using <code>personal_sign</code>. Backend verifies with <code>ethers.verifyMessage()</code>, comparing recovered address to claimed address.</li>
                <li><strong>JWT Token Management:</strong> Upon successful verification, backend issues JWT token (7-day expiry) with payload <code>{'{userId, walletAddress}'}</code>. Frontend stores in <code>localStorage</code> as <code>auth_token</code> and includes in <code>Authorization: Bearer {'{token}'}</code> header for all protected routes.</li>
                <li><strong>Database User Model:</strong> <code>User</code> table stores <code>id</code> (UUID), <code>walletAddress</code> (unique, lowercase), <code>createdAt</code>. Relationships: <code>triggers[]</code>, <code>transactions[]</code>. Auto-created on first login via <code>findUnique</code> → <code>create</code> pattern.</li>
                <li><strong>Network Switching:</strong> Frontend detects chain ID mismatch and prompts MetaMask to switch to Mantle Sepolia (chainId: 5003, hex: 0x138B) via <code>wallet_switchEthereumChain</code> or <code>wallet_addEthereumChain</code> if network not configured.</li>
            </ul>
        </FeatureBlock>

        <FeatureBlock title={<div className="flex items-center gap-2"><Globe className="w-5 h-5" /> Backend APIs & Data Flow</div>}>
            <ul className="list-disc ml-5 space-y-2">
                <li><strong>Authentication Routes:</strong> <code>POST /api/auth/login</code> (signature verification, JWT issuance), <code>POST /api/auth/verify</code> (token validation). All protected routes pass through <code>authMiddleware</code> which decodes JWT and attaches <code>req.user</code>.</li>
                <li><strong>Trigger Management:</strong> <code>GET/POST/PATCH/DELETE /api/triggers</code> for CRUD operations. Validates input (symbol, targetPrice, condition, amount, type). Stores <code>smartConditions</code> as JSON for AI-generated strategies.</li>
                <li><strong>Execution APIs:</strong> <code>POST /api/execute/check/:triggerId</code> (evaluate conditions without executing), <code>POST /api/execute/:triggerId</code> (manual execution), <code>GET /api/execute/history</code> (paginated execution logs, last 50 records).</li>
                <li><strong>Market Data:</strong> <code>GET /api/market/price/:symbol</code> (single price lookup), <code>GET /api/market/prices?symbols=BTC,ETH</code> (batch pricing), <code>GET /api/market/metrics?symbol=ETH&metrics=PRICE,RSI,VOLUME</code> (advanced metrics).</li>
                <li><strong>Wallet APIs:</strong> <code>GET /api/wallet/config</code> (public contract addresses, RPC URLs), <code>GET /api/wallet/address</code> (user's smart wallet address), <code>GET /api/wallet/balance</code> (on-chain USDC and MNT balances), <code>GET/POST /api/wallet/transactions</code> (deposit/withdraw history).</li>
            </ul>
        </FeatureBlock>
    </div>
);
