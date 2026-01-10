# MantleFlow

**AI-Powered Decentralized Trading Platform**

MantleFlow is an intelligent cryptocurrency trading platform that combines the power of Gemini AI with blockchain technology on the Mantle Network. It enables users to analyze markets, manage portfolios, and automate trading strategies using natural language.

[![Mantle Network](https://img.shields.io/badge/Network-Mantle%20Sepolia-blue)](https://mantle.xyz)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)

---

## Overview

MantleFlow is a comprehensive trading ecosystem consisting of three main components:

- **AI Chat Interface** - Conversational AI powered by Google's Gemini 2.5 Flash for market analysis and portfolio management
- **Auto-Trading System** - Automated execution of trading strategies based on user-defined conditions
- **Smart Contract Vault** - Secure on-chain asset management with bot-authorized swaps

The platform allows users to deposit funds into a smart contract vault, define trading triggers using natural language (e.g., "Buy ETH if RSI < 30 and price below $3000"), and let the system automatically execute trades when conditions are met.

---

## Key Features

### Intelligent AI Agents

- **Market Analysis Agent** - Real-time cryptocurrency analysis with data from CoinGecko, sentiment metrics, and technical indicators
- **Portfolio Agent** - Risk assessment, diversification scoring, and rebalancing recommendations
- **Transaction Agent** - Web3 transaction parsing and preview generation
- **Smart Trade Agent** - Convert natural language into executable trading strategies

### Auto-Trading Capabilities

- **Simple Triggers** - Price-based automation (e.g., buy if price drops below X)
- **Smart Triggers** - Multi-condition strategies combining price, RSI, volume, moving averages, sentiment, and gas fees
- **Background Executor** - Automated worker that checks trigger conditions every 30 seconds and executes trades

### Secure Smart Contract Vault

- **Multi-Token Support** - Deposit and withdraw MNT (native) and USDT
- **Bot Authorization** - Delegate swap execution to authorized backend services
- **On-Chain Swaps** - Integrated with SimpleDEXV2 for automated token swaps
- **Slippage Protection** - Minimum output guarantees for all trades

### Web3 Integration

- **MetaMask Connection** - Seamless wallet integration with signature-based authentication
- **Multi-Chain Support** - Compatible with Ethereum, Polygon, BSC, and Mantle networks
- **Auto Network Switching** - Automatic chain switching when needed

---

## Architecture

MantleFlow follows a three-tier architecture:

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React 19 + Vite]
        B[Gemini AI SDK]
        C[ethers.js]
        D[Recharts Visualizations]
    end
    
    subgraph "Backend Layer"
        E[Express API Server]
        F[Prisma ORM]
        G[PostgreSQL Database]
        H[Auto-Executor Worker]
    end
    
    subgraph "Blockchain Layer"
        I[VaultWithSwap Contract]
        J[SimpleDEXV2]
        K[Mantle Sepolia Network]
    end
    
    A --> E
    B --> A
    C --> A
    C --> I
    E --> F
    F --> G
    E --> I
    H --> E
    H --> I
    I --> J
    I --> K
    J --> K
```

### Component Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant AI
    participant Contract
    
    User->>Frontend: "Buy ETH if RSI < 30"
    Frontend->>AI: Parse Strategy
    AI->>Frontend: Structured Conditions
    Frontend->>Backend: Create Trigger
    Backend->>Backend: Store in Database
    
    loop Every 30 seconds
        Backend->>Backend: Fetch Active Triggers
        Backend->>Backend: Check Conditions (APIs)
        alt Conditions Met
            Backend->>Contract: executeSwap()
            Contract->>Contract: Update Balances
            Contract->>Backend: Emit Event
            Backend->>Backend: Update Trigger Status
        end
    end
```

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.2.0 | UI Framework |
| Vite | 6.2.0 | Build Tool & Dev Server |
| TypeScript | 5.8.2 | Type Safety |
| @google/genai | 1.30.0 | Gemini AI Integration |
| ethers.js | 6.13.2 | Web3 Library |
| Recharts | 3.4.1 | Data Visualization |
| Framer Motion | 12.24.8 | Animations |
| Tailwind CSS | CDN | Styling (Neo-brutalist design) |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 20+ | Runtime Environment |
| Express | 4.21.2 | API Framework |
| Prisma | 5.22.0 | Database ORM |
| PostgreSQL | - | Primary Database |
| ethers.js | 6.13.4 | Smart Contract Interaction |
| jsonwebtoken | 9.0.2 | Authentication |
| Axios | 1.7.9 | HTTP Client |

### Smart Contracts

| Technology | Version | Purpose |
|-----------|---------|---------|
| Solidity | 0.8.20 | Smart Contract Language |
| Hardhat | - | Development Environment |
| OpenZeppelin | 5.0.0 | Security Libraries |
| Mantle Sepolia | - | Testnet Deployment |

### External APIs

| Service | Purpose |
|---------|---------|
| CoinGecko | Price data, historical charts, market metrics |
| Alternative.me | Fear & Greed Index (sentiment analysis) |
| Binance Futures | Long/Short ratio data |
| Etherscan/Mantle Explorer | Gas price tracking |

---

## Getting Started

### Prerequisites

- Node.js 20 or higher
- PostgreSQL database
- MetaMask wallet
- MNT testnet tokens from [Mantle Faucet](https://faucet.sepolia.mantle.xyz)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/mantleflow.git
cd mantleflow
```

2. **Install frontend dependencies**

```bash
cd frontend
npm install
```

3. **Install backend dependencies**

```bash
cd ../backendV3
npm install
```

### Environment Configuration

#### Frontend (.env)

Create `frontend/.env`:

```env
# Gemini AI API Key
API_KEY=your_gemini_api_key

# Backend API URL
VITE_API_URL=http://localhost:3001/api
```

#### Backend (.env)

Create `backendV3/.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mantleflow

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key

# Backend Wallet (for automated swaps)
ADMIN_PRIVATE_KEY=0xyour_private_key_here

# Smart Contract Addresses
CONTRACT_ADDRESS=0xaD893d3b35FA8cc23A24a0fdF0B79cc22a1a5E44
USDT_ADDRESS=0x4806b944db5c5F7db4c29bb17Eaf5aE98B54cc56
DEX_ADDRESS=0x3F8b8A4c8f4C8C1c6C8C8C8C8C8C8C8C8C8C8C8C

# Mantle Network
MANTLE_RPC_URL=https://rpc.sepolia.mantle.xyz
CHAIN_ID=5003

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Database Setup

Initialize the database with Prisma:

```bash
cd backendV3
npx prisma generate
npx prisma db push
```

### Running the Project

#### Development Mode

1. **Start the backend**

```bash
cd backendV3
npm run dev
```

Backend will run on [http://localhost:3001](http://localhost:3001)

2. **Start the frontend** (in a new terminal)

```bash
cd frontend
npm run dev
```

Frontend will run on [http://localhost:3000](http://localhost:3000)

#### Production Build

**Frontend:**

```bash
cd frontend
npm run build
npm run preview
```

**Backend:**

```bash
cd backendV3
npm run build
npm start
```

---

## Project Structure

### Frontend

```
frontend/
├── components/
│   ├── chat/              # AI chat interface components
│   ├── landing/           # Landing page sections
│   ├── layout/            # Header, Sidebar, Footer
│   ├── profile/           # Portfolio management
│   ├── trading/           # Auto-trading dashboard
│   │   ├── AutoTradingView.tsx
│   │   ├── ContractWallet.tsx
│   │   ├── SmartTriggerSection.tsx
│   │   └── TriggerForm.tsx
│   └── ui/                # Reusable UI components
├── services/
│   ├── agents/            # AI agent implementations
│   │   ├── chatAgent.ts
│   │   ├── marketAgent.ts
│   │   ├── portfolioAgent.ts
│   │   ├── transactionAgent.ts
│   │   └── smartTradeAgent.ts
│   ├── data/
│   │   └── marketData.ts  # External API integrations
│   ├── web3Service.ts     # Web3 wallet connection
│   ├── backendApi.ts      # Backend API client
│   └── client.ts          # Gemini AI client
├── hooks/
│   └── useBackendTrading.ts
├── App.tsx                # Main application component
├── types.ts               # TypeScript type definitions
└── index.html
```

### Backend

```
backendV3/
├── src/
│   ├── routes/
│   │   ├── auth.ts        # Authentication endpoints
│   │   ├── triggers.ts    # Trigger CRUD operations
│   │   ├── execute.ts     # Trade execution
│   │   ├── market.ts      # Market data fetching
│   │   └── wallet.ts      # Contract balance queries
│   ├── middleware/
│   │   └── auth.ts        # JWT verification
│   ├── services/
│   │   ├── blockchain.ts  # Smart contract interaction
│   │   ├── market.ts      # CoinGecko integration
│   │   └── technicalAnalysis.ts  # RSI, MA calculations
│   ├── workers/
│   │   └── autoExecutor.ts # Background trigger checker
│   ├── types/
│   │   └── index.ts       # TypeScript types
│   └── index.ts           # Express server setup
├── prisma/
│   └── schema.prisma      # Database schema
└── package.json
```

### Smart Contracts

```
vscode/testnet/contractsV2/
├── VaultWithSwap.sol      # Main vault contract
└── SimpleDEXV2.sol        # Internal AMM for swaps
```

---

## API Documentation

### Authentication

#### POST `/api/auth/login`
Authenticate user with wallet signature.

**Request Body:**
```json
{
  "walletAddress": "0x...",
  "signature": "0x...",
  "message": "Sign this message..."
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "walletAddress": "0x...",
    "email": null
  }
}
```

### Triggers

#### GET `/api/triggers`
Retrieve all triggers for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "symbol": "BTC",
    "targetPrice": 60000,
    "condition": "BELOW",
    "amount": 0.1,
    "type": "BUY",
    "status": "ACTIVE",
    "smartConditions": null,
    "createdAt": "2026-01-10T00:00:00.000Z"
  }
]
```

#### POST `/api/triggers`
Create a new trading trigger.

**Request Body:**
```json
{
  "symbol": "ETH",
  "targetPrice": 3000,
  "condition": "BELOW",
  "amount": 1.0,
  "type": "BUY",
  "smartConditions": [
    { "indicator": "RSI", "operator": "LT", "value": 30 }
  ],
  "slippage": 5
}
```

#### DELETE `/api/triggers/:id`
Cancel an active trigger.

### Execution

#### POST `/api/execute/:triggerId`
Manually execute a trigger.

#### GET `/api/execute/history`
Retrieve execution history for the user.

### Market Data

#### GET `/api/market/price/:symbol`
Get current price for a cryptocurrency.

**Response:**
```json
{
  "symbol": "BTC",
  "price": 64200,
  "change24h": 2.5
}
```

---

## Smart Contract

### Deployment Information

**Network:** Mantle Sepolia Testnet  
**Chain ID:** 5003  
**Contract Address:** `0xaD893d3b35FA8cc23A24a0fdF0B79cc22a1a5E44`

Verify on [Mantle Explorer](https://explorer.sepolia.mantle.xyz/address/0xaD893d3b35FA8cc23A24a0fdF0B79cc22a1a5E44)

### Core Functions

#### User Functions

```solidity
// Deposit MNT (native token)
function depositMnt() external payable

// Deposit USDT
function depositUsdt(uint256 amount) external

// Withdraw MNT
function withdrawMnt(uint256 amount) external

// Withdraw USDT
function withdrawUsdt(uint256 amount) external

// Authorize bot to swap on your behalf
function authorizeBot(address bot, bool status) external

// Manual swap MNT to USDT
function swapMntToUsdt(uint256 mntAmount, uint256 minUsdtOut) external

// Manual swap USDT to MNT
function swapUsdtToMnt(uint256 usdtAmount, uint256 minMntOut) external
```

#### Bot Functions (Authorized Only)

```solidity
// Execute swap MNT->USDT for a user
function executeSwapMntToUsdtForUser(
    address user,
    uint256 mntAmount,
    uint256 minUsdtOut
) external

// Execute swap USDT->MNT for a user
function executeSwapUsdtToMntForUser(
    address user,
    uint256 usdtAmount,
    uint256 minMntOut
) external
```

#### View Functions

```solidity
// Get user's balances
function getUserBalances(address user) 
    external view returns (uint256 mnt, uint256 usdt)

// Estimate swap output
function estimateSwap(bool mntToUsdt, uint256 amountIn) 
    external view returns (uint256 amountOut)

// Check bot authorization
function isBotAuthorized(address user, address bot) 
    external view returns (bool)
```

### Events

```solidity
event MntDeposited(address indexed user, uint256 amount);
event UsdtDeposited(address indexed user, uint256 amount);
event MntWithdrawn(address indexed user, uint256 amount);
event UsdtWithdrawn(address indexed user, uint256 amount);
event Swapped(address indexed user, bool mntToUsdt, uint256 amountIn, uint256 amountOut);
event BotAuthorized(address indexed user, address indexed bot, bool status);
event SwappedByBot(address indexed user, address indexed bot, bool mntToUsdt, uint256 amountIn, uint256 amountOut);
```

---

## Security

### Authentication & Authorization

- **Wallet Signature Authentication** - Users authenticate by signing messages with their private key
- **JWT Tokens** - Secure session management with 7-day expiration
- **Auth Middleware** - Protected routes require valid JWT tokens
- **Bot Authorization** - Users explicitly authorize backend bots via smart contract

### Smart Contract Security

- **OpenZeppelin Libraries** - Built on audited, industry-standard contracts
- **ReentrancyGuard** - Protection against reentrancy attacks
- **SafeERC20** - Safe token transfer operations
- **Balance Checks** - Pre-execution balance verification
- **Slippage Protection** - Minimum output guarantees on swaps
- **Emergency Withdraw** - Owner can withdraw funds in case of emergency

### Backend Security

- **Input Validation** - Request validation using Zod schemas
- **CORS Configuration** - Restricted to allowed origins
- **Environment Variables** - Secrets stored securely
- **Error Handling** - No sensitive information in error responses

---

## Contributing

We welcome contributions to MantleFlow! Please follow these guidelines:

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- Follow TypeScript best practices
- Use ESLint and Prettier configurations
- Write descriptive commit messages
- Add tests for new features
- Update documentation as needed

### Bug Reports

When filing an issue, please include:

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, Node version, browser)

---

## Roadmap

### Phase 1: Foundation (Current)

- [x] AI-powered chat interface
- [x] Basic auto-trading triggers
- [x] Smart contract vault
- [x] MetaMask integration
- [x] Mantle Sepolia deployment

### Phase 2: Enhanced Features (Q1 2026)

- [ ] Mobile-responsive design improvements
- [ ] Advanced charting tools
- [ ] Multi-DEX aggregation
- [ ] Email notifications for trigger execution
- [ ] Stop-loss and take-profit orders

### Phase 3: Scaling (Q2 2026)

- [ ] Mainnet deployment on Mantle Network
- [ ] Multi-chain support (Ethereum, Polygon, BSC)
- [ ] Copy trading features
- [ ] Community-shared strategies
- [ ] Performance analytics dashboard

### Phase 4: Advanced AI (Q3 2026)

- [ ] Predictive market models
- [ ] Sentiment analysis from social media
- [ ] Automated strategy optimization
- [ ] Risk scoring and alerts
- [ ] Portfolio rebalancing automation

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **Google Gemini** - For providing the AI capabilities
- **Mantle Network** - For the Layer 2 infrastructure
- **OpenZeppelin** - For secure smart contract libraries
- **CoinGecko** - For comprehensive market data
- **Binance** - For futures market data

---

## Support

- **Documentation**: [Coming Soon]
- **Discord**: [Join our community](#)
- **Twitter**: [@MantleFlow](#)
- **Email**: support@mantleflow.ai

---

## Disclaimer

This software is provided for educational and research purposes. Cryptocurrency trading involves substantial risk of loss. Users should do their own research and consult with financial advisors before making investment decisions. The developers are not responsible for any financial losses incurred through the use of this platform.

---

Built with ❤️ for the Mantle ecosystem
