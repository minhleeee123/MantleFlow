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
│  ├─ Triggers    │  │  │ WalletFactory   │──►│  TradingWallet[]    │  │
│  ├─ Executions  │  │  │  (EIP-1167)     │   │  (Clones)           │  │
│  └─ Transactions│  │  └─────────────────┘   └──────┬──────────────┘  │
│                 │  │                                │                  │
└─────────────────┘  │                                │ executeCall()    │
                     │                                ▼                  │
                     │  ┌──────────────────────────────────────────────┐│
                     │  │  FusionX Router (Uniswap V3 Fork)            ││
                     │  │  - WMNT/USDC Pool (0.3% fee)                 ││
                     │  │  - exactInputSingle() for swaps              ││
                     │  └──────────────────────────────────────────────┘│
                     └──────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      BACKGROUND WORKER LAYER                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Auto-Executor (setInterval 10s)                                         │
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
                    <h4 className="font-bold">WalletFactory.sol</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Factory pattern using EIP-1167 minimal proxy clones for gas-efficient wallet deployment.</p>
                    <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-xs">
                        <pre>{`function deployWallet(address operator) external returns (address) {
    require(userWallets[msg.sender] == address(0), "Wallet exists");
    address clone = Clones.clone(implementation);
    TradingWallet(payable(clone)).initialize(msg.sender, operator);
    userWallets[msg.sender] = clone;
    return clone;
}`}</pre>
                    </div>
                </div>

                <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-bold">TradingWallet.sol</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Individual user wallet with dual-role access control (Owner + Operator).</p>
                    <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-xs">
                        <pre>{`// Generic execution for swaps (called by Operator)
function executeCall(address target, uint256 value, bytes calldata data) 
    external onlyOperatorOrOwner returns (bytes memory)

// Owner-only fund withdrawal
function withdraw(address token, uint256 amount) external onlyOwner

// Owner can change operator
function setOperator(address _operator) external onlyOwner`}</pre>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 border border-gray-300">
                        <strong>Gas Optimization:</strong> EIP-1167 clones cost ~45% less gas than full contract deployments. Typical wallet deploy: ~150k gas (~$0.05 on Mantle Sepolia).
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 border border-gray-300">
                        <strong>Upgradeability:</strong> Factory can update implementation address for future wallets. Existing wallets remain on old implementation (immutable).
                    </div>
                </div>
            </div>
        </div>
    </div>
);
