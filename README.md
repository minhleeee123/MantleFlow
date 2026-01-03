# 🤖 CryptoInsight AI - Nền Tảng Giao Dịch Crypto Thông Minh

> **AI-Powered Decentralized Trading Platform** - Kết hợp sức mạnh của AI (Gemini 2.5 Flash), Smart Contract trên Mantle Network, và hệ thống Auto-Trading để tạo ra trải nghiệm giao dịch crypto hoàn toàn mới.

![Mantle Network](https://img.shields.io/badge/Network-Mantle%20Sepolia-blue)
![AI](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-orange)
![React](https://img.shields.io/badge/Frontend-React%2019-61dafb)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![Solidity](https://img.shields.io/badge/Smart%20Contract-Solidity%200.8.20-363636)

---

## 📑 Mục Lục

- [Tổng Quan Hệ Thống](#-tổng-quan-hệ-thống)
- [Core Features](#-core-features)
- [Kiến Trúc Hệ Thống](#-kiến-trúc-hệ-thống)
- [Tech Stack](#-tech-stack)
- [Luồng Hoạt Động](#-luồng-hoạt-động)
- [Bảo Mật](#-bảo-mật)
- [Cài Đặt & Chạy](#-cài-đặt--chạy)
- [API Endpoints](#-api-endpoints)
- [Smart Contract](#-smart-contract)
- [Demo & Screenshots](#-demo--screenshots)

---

## 🎯 Tổng Quan Hệ Thống

CryptoInsight AI là một nền tảng giao dịch crypto toàn diện với 3 thành phần chính:

```
┌─────────────────────────────────────────────────────────────────┐
│                     CryptoInsight AI Platform                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐    │
│  │   Frontend   │  │   Backend    │  │   Smart Contract    │    │
│  │  (React 19)  │◄─┤  (Node.js)   │◄─┤  (Solidity 0.8.20)  │    │
│  │   + Vite     │  │  + Express   │  │  + OpenZeppelin     │    │
│  │   + Gemini   │  │  + Prisma    │  │  + Mantle Sepolia   │    │
│  └──────────────┘  └──────────────┘  └─────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Core Features

### 1. 🧠 AI Chat Agent (Gemini 2.5 Flash)
- **Intent Classification**: Tự động phân loại user intent (ANALYZE, PORTFOLIO_ANALYSIS, TRANSACTION, CHAT)
- **Market Analysis Agent**: Phân tích coin với dữ liệu real-time từ CoinGecko
- **Portfolio Agent**: Đánh giá portfolio, risk analysis, rebalancing suggestions
- **Transaction Agent**: Parse và preview các giao dịch Web3 (Send, Swap)
- **Smart Trade Agent**: Chuyển ngôn ngữ tự nhiên thành trading strategy

### 2. 📊 Dashboard Phân Tích Thị Trường
- **Price History Chart**: Biểu đồ giá 7 ngày (dữ liệu CoinGecko)
- **Fear & Greed Index**: Sentiment score real-time (Alternative.me API)
- **Long/Short Ratio**: Tỷ lệ Long/Short từ Binance Futures API
- **Tokenomics Visualization**: Phân bố token (AI-generated)
- **Project Score Radar**: Đánh giá Security, Decentralization, Scalability, Ecosystem

### 3. 🤖 Auto-Trading System
- **Simple Triggers**: Đặt lệnh khi giá đạt mức target (ABOVE/BELOW)
- **Smart Triggers (AI-Powered)**: 
  - Kết hợp nhiều điều kiện: PRICE, RSI, VOLUME, MA, SENTIMENT, GAS
  - Ví dụ: "Buy BTC if price < 60000 AND RSI < 30 AND Sentiment < 25"
- **Auto-Executor Worker**: Backend tự động check triggers mỗi 30s và execute on-chain

### 4. 💼 Contract Wallet
- **Deposit/Withdraw**: Nạp/rút MNT (native) và USDC vào smart contract
- **On-chain Balance**: Số dư được quản lý hoàn toàn trên blockchain
- **Automated Swaps**: Backend thực hiện swap thay user khi conditions được thỏa mãn

### 5. 👛 Web3 Integration
- **MetaMask Connection**: Kết nối ví với signature-based authentication
- **Multi-chain Support**: Ethereum Mainnet, Sepolia, Polygon, BSC, Mantle
- **Auto Network Switch**: Tự động chuyển chain khi cần

---

## 🏗️ Kiến Trúc Hệ Thống

### Frontend (`/frontend`)
```
frontend/
├── App.tsx                    # Main App với routing logic
├── types.ts                   # TypeScript interfaces
├── components/
│   ├── chat/                  # Chat UI (MessageItem, InputArea)
│   ├── charts/                # Recharts visualizations
│   ├── landing/               # Landing page components
│   ├── profile/               # Portfolio management
│   ├── trading/               # Auto-trading UI
│   │   ├── AutoTradingView.tsx
│   │   ├── ContractWallet.tsx    # Deposit/Withdraw UI
│   │   ├── SmartTriggerSection.tsx # AI Strategy Parser
│   │   ├── TriggerForm.tsx       # Manual trigger form
│   │   └── ActiveTriggers.tsx    # Live trigger monitoring
│   └── ui/                    # Shared UI components
├── services/
│   ├── agents/                # AI Agents
│   │   ├── chatAgent.ts       # Intent detection + conversation
│   │   ├── marketAgent.ts     # Coin analysis + reports
│   │   ├── portfolioAgent.ts  # Portfolio analysis
│   │   ├── transactionAgent.ts # Tx preview generation
│   │   └── smartTradeAgent.ts # NLP → Trading strategy
│   ├── data/
│   │   └── marketData.ts      # CoinGecko, Alternative.me, Binance APIs
│   ├── web3Service.ts         # MetaMask + transactions
│   ├── backendApi.ts          # Backend API client
│   └── client.ts              # Gemini AI client
└── hooks/
    └── useBackendTrading.ts   # Backend trading state management
```

### Backend (`/backend`)
```
backend/
├── src/
│   ├── index.ts               # Express server setup
│   ├── routes/
│   │   ├── auth.ts            # Wallet signature authentication
│   │   ├── triggers.ts        # CRUD for trading triggers
│   │   ├── execute.ts         # Manual & auto execution
│   │   ├── market.ts          # Price fetching (CoinGecko)
│   │   └── wallet.ts          # Contract balance queries
│   ├── middleware/
│   │   └── auth.ts            # JWT verification middleware
│   ├── services/
│   │   ├── blockchain.ts      # Smart contract interaction (ethers.js)
│   │   ├── market.ts          # CoinGecko price service
│   │   └── technicalAnalysis.ts # RSI, MA calculations
│   ├── workers/
│   │   └── autoExecutor.ts    # Background trigger checker
│   └── types/
│       └── index.ts           # TypeScript types
└── prisma/
    └── schema.prisma          # Database schema (MySQL)
```

### Smart Contract (`/smart_contract`)
```
smart_contract/
├── contracts/
│   └── TradingBot.sol         # Main trading contract
├── scripts/
│   ├── deploy.js              # Deployment script
│   └── checkBalance.js        # Balance verification
├── test/
│   └── TradingBot.test.js     # Comprehensive tests
└── hardhat.config.js          # Hardhat configuration
```

---

## 💻 Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI Framework |
| Vite | 6.2.0 | Build Tool |
| TypeScript | 5.8.2 | Type Safety |
| @google/genai | 1.30.0 | Gemini AI SDK |
| ethers.js | 6.13.2 | Web3 Integration |
| Recharts | 3.4.1 | Data Visualization |
| Lucide React | 0.554.0 | Icons |
| Three.js | 0.181.2 | 3D Effects |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20+ | Runtime |
| Express | 4.18.2 | API Framework |
| Prisma | 5.7.0 | ORM (MySQL) |
| ethers.js | 6.13.2 | Blockchain Interaction |
| jsonwebtoken | 9.0.2 | JWT Authentication |
| Zod | 3.22.4 | Validation |
| Axios | 1.6.2 | HTTP Client |
| tsx | 4.7.0 | TypeScript Execution |

### Smart Contract
| Technology | Version | Purpose |
|------------|---------|---------|
| Solidity | 0.8.20 | Smart Contract Language |
| Hardhat | 2.19.0 | Development Framework |
| OpenZeppelin | 5.0.0 | Security Libraries |
| Network | Mantle Sepolia | Testnet Deployment |

### External APIs
| API | Purpose |
|-----|---------|
| CoinGecko | Price data, market charts, coin search |
| Alternative.me | Fear & Greed Index (Sentiment) |
| Binance Futures | Long/Short Ratio |
| Etherscan | Gas price tracking |

---

## 🔄 Luồng Hoạt Động

### 1. User Authentication Flow
```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ MetaMask │────►│ Frontend │────►│ Backend  │
└──────────┘     └──────────┘     └──────────┘
     │                │                 │
     │ 1. Connect     │                 │
     │◄───────────────│                 │
     │                │                 │
     │ 2. Sign Message│                 │
     │◄───────────────│                 │
     │                │                 │
     │ 3. Signature   │                 │
     │───────────────►│ 4. Verify +     │
     │                │    Create User  │
     │                │────────────────►│
     │                │                 │
     │                │ 5. JWT Token    │
     │                │◄────────────────│
     │                │                 │
```

### 2. Smart Trade AI Flow
```
User Input: "Buy ETH if RSI < 30 and price below 3000"
                    │
                    ▼
        ┌─────────────────────┐
        │  Smart Trade Agent  │
        │  (Gemini 2.5 Flash) │
        └─────────────────────┘
                    │
                    ▼
        ┌─────────────────────┐
        │   Parsed Strategy   │
        │  {                  │
        │   symbol: "ETH",    │
        │   action: "BUY",    │
        │   conditions: [     │
        │    {RSI, LT, 30},   │
        │    {PRICE, LT, 3000}│
        │   ]                 │
        │  }                  │
        └─────────────────────┘
                    │
                    ▼
        ┌─────────────────────┐
        │  Backend Trigger    │
        │  (Save to MySQL)    │
        └─────────────────────┘
                    │
                    ▼
        ┌─────────────────────┐
        │  Auto-Executor      │
        │  (Every 30 seconds) │
        │  - Check RSI API    │
        │  - Check Price API  │
        │  - If ALL conditions│
        │    met → Execute    │
        └─────────────────────┘
                    │
                    ▼
        ┌─────────────────────┐
        │  Smart Contract     │
        │  executeSwap()      │
        │  - Deduct tokenIn   │
        │  - Credit tokenOut  │
        └─────────────────────┘
```

### 3. Auto-Executor Worker Flow
```
┌──────────────────────────────────────────────────────────┐
│                   Auto-Executor Loop                      │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  setInterval(30000) {                                     │
│    1. Fetch all ACTIVE triggers from DB                   │
│                                                           │
│    for each trigger:                                      │
│      2. Get current price (CoinGecko)                     │
│                                                           │
│      if (trigger.smartConditions) {                       │
│        3a. Check each condition:                          │
│            - PRICE → CoinGecko API                        │
│            - RSI → Calculate from historical data         │
│            - VOLUME → CoinGecko 24h volume               │
│            - MA → Calculate Moving Average                │
│            - SENTIMENT → Alternative.me F&G Index         │
│            - GAS → Etherscan Gas Oracle                   │
│                                                           │
│        4a. ALL conditions must pass                       │
│      } else {                                             │
│        3b. Simple price check (ABOVE/BELOW)               │
│      }                                                    │
│                                                           │
│      if (shouldExecute) {                                 │
│        5. Call blockchain.executeSwap()                   │
│        6. Update trigger status → EXECUTED                │
│        7. Create Execution record                         │
│      }                                                    │
│  }                                                        │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## 🔒 Bảo Mật

### Authentication
- **Wallet Signature Authentication**: User ký message bằng private key, backend verify bằng `ethers.verifyMessage()`
- **JWT Tokens**: Token có hiệu lực 7 ngày, chứa `userId` và `walletAddress`
- **Auth Middleware**: Tất cả protected routes đều qua `authMiddleware`

### Smart Contract Security
- **OpenZeppelin Libraries**: Sử dụng `Ownable`, `ReentrancyGuard`, `SafeERC20`
- **Authorized Executors**: Chỉ backend wallet được phép gọi `executeSwap()`
- **Balance Checks**: Kiểm tra số dư trước mỗi swap
- **ReentrancyGuard**: Chống reentrancy attacks
- **Emergency Withdraw**: Owner có thể rút emergency trong trường hợp khẩn cấp

### Smart Contract Code Highlights
```solidity
// Chỉ authorized executors mới execute được
modifier onlyExecutor() {
    require(authorizedExecutors[msg.sender], "Not authorized");
    _;
}

// ReentrancyGuard cho tất cả functions có transfer
function deposit(...) external payable nonReentrant { ... }
function withdraw(...) external nonReentrant { ... }
function executeSwap(...) external nonReentrant returns (bool) { ... }

// SafeERC20 cho token transfers
using SafeERC20 for IERC20;
IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
```

### Backend Security
- **Input Validation**: Zod schema validation
- **CORS Configuration**: Chỉ cho phép frontend origin
- **Environment Variables**: Secrets không hardcode
- **Error Handling**: Không leak internal errors

---

## ⚙️ Cài Đặt & Chạy

### Prerequisites
- Node.js 20+
- MySQL Database
- MetaMask Wallet
- MNT Testnet tokens (từ [Mantle Faucet](https://faucet.sepolia.mantle.xyz))

### 1. Clone Repository
```bash
git clone https://github.com/your-username/hackathon15-1.git
cd hackathon15-1
```

### 2. Setup Backend
```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your values:
# - DATABASE_URL
# - JWT_SECRET
# - CONTRACT_ADDRESS
# - ADMIN_PRIVATE_KEY
# - MANTLE_RPC_URL

# Setup database
npx prisma generate
npx prisma migrate dev

# Run server
npm run dev  # http://localhost:8000
```

### 3. Setup Frontend
```bash
cd frontend
npm install

# Configure environment
cp .env.example .env
# Edit .env:
# - API_KEY (Gemini API Key)
# - VITE_API_URL=http://localhost:8000/api

# Run dev server
npm run dev  # http://localhost:5173
```

### 4. Setup Smart Contract (Optional - already deployed)
```bash
cd smart_contract
npm install

# Configure environment
cp .env.example .env
# Edit .env:
# - DEPLOYER_PRIVATE_KEY

# Compile & Test
npx hardhat compile
npx hardhat test

# Deploy (if needed)
npx hardhat run scripts/deploy.js --network mantleSepolia
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login với wallet signature |
| POST | `/api/auth/verify` | Verify JWT token |

### Triggers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/triggers` | Lấy tất cả triggers của user |
| GET | `/api/triggers/:id` | Lấy chi tiết trigger |
| POST | `/api/triggers` | Tạo trigger mới |
| PATCH | `/api/triggers/:id` | Cập nhật trigger |
| DELETE | `/api/triggers/:id` | Hủy trigger |

### Execution
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/execute/check/:triggerId` | Kiểm tra condition |
| POST | `/api/execute/:triggerId` | Execute trigger thủ công |
| GET | `/api/execute/history` | Lịch sử execution |

### Market
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/market/price/:symbol` | Giá hiện tại |
| GET | `/api/market/prices?symbols=BTC,ETH` | Nhiều giá |

### Wallet
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wallet/config` | Contract config |
| GET | `/api/wallet/balance` | User balance trong contract |

---

## 📜 Smart Contract

### Contract Address (Mantle Sepolia)
```
0xaD893d3b35FA8cc23A24a0fdF0B79cc22a1a5E44
```

### Main Functions
```solidity
// User deposits funds
function deposit(address token, uint256 amount) external payable

// User withdraws funds
function withdraw(address token, uint256 amount) external

// Backend executes swap (authorized only)
function executeSwap(
    address user,
    address tokenIn,
    address tokenOut,
    uint256 amountIn,
    uint256 amountOut,
    string calldata triggerId
) external returns (bool)

// View functions
function getBalance(address user, address token) external view returns (uint256)
function getBalances(address user, address[] tokens) external view returns (uint256[])
```

### Events
```solidity
event Deposit(address indexed user, address indexed token, uint256 amount);
event Withdraw(address indexed user, address indexed token, uint256 amount);
event SwapExecuted(
    address indexed user,
    address indexed tokenIn,
    address indexed tokenOut,
    uint256 amountIn,
    uint256 amountOut,
    string triggerId
);
event ExecutorAuthorized(address indexed executor, bool status);
```

---

## 🖼️ Demo & Screenshots

### Landing Page
- Modern neubrutalism design
- Hero section với CTA
- Feature grid với 6 core features
- How it works section
- FAQ accordion

### Chat Interface
- AI-powered conversations
- Multi-modal responses (text + charts)
- Coin analysis dashboard
- Portfolio analysis cards
- Transaction preview cards

### Auto-Trading Dashboard
- Contract wallet (deposit/withdraw)
- Smart trigger form (AI parsing)
- Manual trigger form
- Active triggers monitoring
- Trade history

---

## 📄 License

MIT License - See LICENSE file

---

## 👥 Team

Built with ❤️ for Hackathon 15-1

---

## 🔗 Links

- **Frontend Demo**: [Deployed URL]
- **Backend API**: [API URL]
- **Smart Contract**: [Mantle Explorer](https://explorer.sepolia.mantle.xyz/address/0xaD893d3b35FA8cc23A24a0fdF0B79cc22a1a5E44)
