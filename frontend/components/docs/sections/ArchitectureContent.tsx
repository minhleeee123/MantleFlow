import React from 'react';
import { Box, Cpu, Database, GitBranch } from 'lucide-react';

export const ArchitectureContent = () => (
    <div className="space-y-8">
        {/* High-Level Architecture Diagram */}
        <div className="bg-white dark:bg-gray-800 p-6 border-2 border-black dark:border-white">
            <h3 className="text-xl font-black uppercase mb-4">System Architecture Overview</h3>
            <div className="bg-gray-100 dark:bg-black p-4 border border-black font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed">
                {`┌─────────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION LAYER                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  MetaMask Extension  ◄──► Browser (React App) ◄──► MantleFlow AI        │
│      (Web3 Provider)           (Port 5173)           (Generative AI)    │
│                                                                          │
└────────────┬────────────────────────────────────────────────────────────┘
             │ HTTP/WebSocket
             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND API LAYER                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Express Server (Port 3001)                                              │
│  ├── /api/auth          (JWT Authentication)                             │
│  ├── /api/triggers      (CRUD Operations)                                │
│  ├── /api/execute       (Trade Execution)                                │
│  ├── /api/market        (Price & Metrics)                                │
│  └── /api/wallet        (Balance & Transactions)                         │
│                                                                          │
└────┬────────────────────┬────────────────────────────────────────────────┘
     │                    │
     │ Prisma ORM         │ Ethers.js
     ▼                    ▼
┌─────────────────┐  ┌──────────────────────────────────────────────────┐
│   MySQL DB      │  │           BLOCKCHAIN LAYER                        │
│  (Port 3306)    │  │  (Mantle Sepolia - ChainID: 5003)                │
│                 │  │                                                   │
│  ├─ Users       │  │  ┌─────────────────┐   ┌─────────────────────┐  │
│  ├─ Triggers    │  │  │  VaultWithSwap  │──►│   SimpleDEXV2       │  │
│  ├─ Executions  │  │  │  (Shared Vault) │   │   (Internal AMM)    │  │
│  └─ Transactions│  │  └─────────────────┘   └─────────────────────┘  │
│                 │  │                                                   │
└─────────────────┘  │  Bot authorization: authorizeBot(bot, true)       │
                     │  Bot swap: executeSwapMntToUsdtForUser()          │
                     └──────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      BACKGROUND WORKER LAYER                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Auto-Executor (setInterval 30s)                                        │
│  ├── Fetch ACTIVE triggers from DB                                       │
│  ├── Evaluate conditions (CoinGecko, Binance, Alternative.me)            │
│  ├── Execute qualified trades via blockchain service                     │
│  └── Update trigger status & create execution records                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘`}
            </div>
        </div>

        {/* Frontend Architecture */}
        <div className="bg-white dark:bg-gray-800 p-6 border-2 border-black dark:border-white">
            <h3 className="font-black text-xl mb-4 flex items-center gap-2 border-b-2 border-black dark:border-white pb-2">
                <Box className="w-5 h-5" /> Frontend Architecture (React 19 + Vite)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-bold mb-2">/components</h4>
                    <ul className="font-mono text-sm space-y-1 text-gray-600 dark:text-gray-300">
                        <li>├─ chat/ <span className="text-xs text-gray-400">AI interface, message bubble, input</span></li>
                        <li>├─ trading/ <span className="text-xs text-gray-400">Trigger form, list, execution history</span></li>
                        <li>├─ portfolio/ <span className="text-xs text-gray-400">Asset table, charts, balance cards</span></li>
                        <li>├─ layout/ <span className="text-xs text-gray-400">Header, sidebar, theme toggle</span></li>
                        <li>└─ docs/ <span className="text-xs text-gray-400">Documentation sections (modular)</span></li>
                    </ul>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-bold mb-2">/services</h4>
                    <ul className="font-mono text-sm space-y-1 text-gray-600 dark:text-gray-300">
                        <li>├─ agents/ <span className="text-xs text-gray-400">AI logic (4 specialized agents)</span></li>
                        <li>├─ api.ts <span className="text-xs text-gray-400">Axios client with interceptors</span></li>
                        <li>├─ backendApi.ts <span className="text-xs text-gray-400">Type-safe API wrappers</span></li>
                        <li>├─ web3Service.ts <span className="text-xs text-gray-400">Ethers.js wallet & contract calls</span></li>
                        <li>└─ data/ <span className="text-xs text-gray-400">CoinGecko, market data fetchers</span></li>
                    </ul>
                </div>
            </div>
            <div className="mt-4 bg-gray-50 dark:bg-gray-900 p-4 border border-gray-300">
                <strong>State Management:</strong> React useState & useEffect hooks. localStorage for auth tokens and wallet cache. No Redux/Zustand needed for this scope.
            </div>
        </div>

        {/* Backend Architecture */}
        <div className="bg-white dark:bg-gray-800 p-6 border-2 border-black dark:border-white">
            <h3 className="font-black text-xl mb-4 flex items-center gap-2 border-b-2 border-black dark:border-white pb-2">
                <Cpu className="w-5 h-5" /> Backend Architecture (Node.js + Express)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-bold mb-2">/src/routes</h4>
                    <ul className="font-mono text-sm space-y-1 text-gray-600 dark:text-gray-300">
                        <li>├─ auth.ts <span className="text-xs text-gray-400">POST /login, /verify</span></li>
                        <li>├─ triggers.ts <span className="text-xs text-gray-400">CRUD for triggers (5 endpoints)</span></li>
                        <li>├─ execute.ts <span className="text-xs text-gray-400">Check & execute trades</span></li>
                        <li>├─ market.ts <span className="text-xs text-gray-400">Price & metrics aggregator</span></li>
                        <li>└─ wallet.ts <span className="text-xs text-gray-400">Balance, config, transactions</span></li>
                    </ul>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-bold mb-2">/src/services</h4>
                    <ul className="font-mono text-sm space-y-1 text-gray-600 dark:text-gray-300">
                        <li>├─ blockchain.ts <span className="text-xs text-gray-400">Swap execution, balance queries</span></li>
                        <li>├─ market.ts <span className="text-xs text-gray-400">CoinGecko API wrapper</span></li>
                        <li>├─ technicalAnalysis.ts <span className="text-xs text-gray-400">RSI, MA calculations</span></li>
                        <li>└─ metrics.ts <span className="text-xs text-gray-400">Multi-source metric aggregator</span></li>
                    </ul>
                </div>
            </div>
            <div className="mt-4 bg-gray-50 dark:bg-gray-900 p-4 border border-gray-300">
                <strong>Middleware Stack:</strong> authMiddleware (JWT verification) → Route Handler → Prisma DB queries → External API calls (CoinGecko, Binance) → Response with error handling
            </div>
        </div>

        {/* Database Schema */}
        <div className="bg-white dark:bg-gray-800 p-6 border-2 border-black dark:border-white">
            <h3 className="font-black text-xl mb-4 flex items-center gap-2 border-b-2 border-black dark:border-white pb-2">
                <Database className="w-5 h-5" /> Database Schema (MySQL + Prisma)
            </h3>
            <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-xs overflow-x-auto">
                <pre>{`┌─────────────────────┐
│ User                │
├─────────────────────┤
│ id: UUID (PK)       │
│ walletAddress: str  │ ← Unique, lowercase
│ createdAt: DateTime │
└──────┬──────────────┘
       │ 1:N
       ├──────────────────────────┐
       │                          │
       ▼                          ▼
┌─────────────────────┐    ┌──────────────────────┐
│ Trigger             │    │ Transaction          │
├─────────────────────┤    ├──────────────────────┤
│ id: UUID (PK)       │    │ id: UUID (PK)        │
│ userId: UUID (FK)   │    │ userId: UUID (FK)    │
│ symbol: String      │    │ type: DEPOSIT/WITHDRAW
│ targetPrice: Float  │    │ token: String        │
│ condition: ABOVE/   │    │ amount: Float        │
│   BELOW             │    │ txHash: String?      │
│ amount: Float       │    │ status: SUCCESS      │
│ type: BUY/SELL      │    │ createdAt: DateTime  │
│ smartConditions:    │    └──────────────────────┘
│   JSON?             │
│ status: ACTIVE/     │
│   EXECUTED/CANCELLED│
│ createdAt: DateTime │
└──────┬──────────────┘
       │ 1:N
       ▼
┌─────────────────────┐
│ Execution           │
├─────────────────────┤
│ id: UUID (PK)       │
│ triggerId: UUID(FK) │
│ symbol: String      │
│ price: Float        │
│ amount: Float       │
│ type: BUY/SELL      │
│ txHash: String?     │
│ status: PENDING/    │
│   SUCCESS/FAILED    │
│ errorMessage: String│
│ executedAt: DateTime│
└─────────────────────┘`}</pre>
            </div>
        </div>

        {/* Smart Contract Layer */}
        <div className="bg-white dark:bg-gray-800 p-6 border-2 border-black dark:border-white">
            <h3 className="font-black text-xl mb-4 flex items-center gap-2 border-b-2 border-black dark:border-white pb-2">
                <GitBranch className="w-5 h-5" /> Smart Contract Layer (Solidity 0.8.20)
            </h3>
            <div className="space-y-4">
                <div className="border-l-4 border-yellow-500 pl-4">
                    <h4 className="font-bold">VaultWithSwap.sol</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Shared vault managing user deposits and bot-authorized swaps via SimpleDEXV2.</p>
                    <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-xs">
                        <pre>{`// User deposit/withdraw functions
function depositMnt() external payable
function depositUsdt(uint256 amount) external
function withdrawMnt(uint256 amount) external
function withdrawUsdt(uint256 amount) external

// Bot authorization
function authorizeBot(address bot, bool status) external
function isBotAuthorized(address user, address bot) external view returns (bool)

// Bot swap functions (only authorized bots)
function executeSwapMntToUsdtForUser(address user, uint256 mntAmount, uint256 minUsdtOut) external
function executeSwapUsdtToMntForUser(address user, uint256 usdtAmount, uint256 minMntOut) external`}</pre>
                    </div>
                </div>

                <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-bold">SimpleDEXV2.sol</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Internal AMM using constant product formula (x * y = k) with 0.3% trading fee.</p>
                    <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-xs">
                        <pre>{`// Liquidity management
function addLiquidity(uint256 usdtAmount) external payable
function removeLiquidity(uint256 liquidity) external

// Swap functions
function swapMntForUsdt(uint256 minUsdtOut) external payable
function swapUsdtForMnt(uint256 usdtAmount, uint256 minMntOut) external

// AMM calculation (0.3% fee)
function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) 
    public pure returns (uint256)
    
// View reserves
function mntReserve() external view returns (uint256)
function usdtReserve() external view returns (uint256)`}</pre>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 border border-gray-300">
                        <strong>Gas Efficiency:</strong> Shared vault eliminates need for per-user wallet deployments. Users pay gas only for deposits/withdrawals. Bot pays gas for all automated swaps.
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 border border-gray-300">
                        <strong>Security Model:</strong> Users must explicitly authorize bot address. Bot can only swap user funds within vault, cannot withdraw. Users retain full custody and can revoke bot authorization anytime.
                    </div>
                </div>
            </div>
        </div>
    </div>
);
