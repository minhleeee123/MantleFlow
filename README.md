# Hackathon 15-1 - AI-Powered Crypto Trading Platform

A comprehensive cryptocurrency trading platform with AI-powered analysis, smart contract integration, and automated trading capabilities.

## 🏗️ Project Structure

This monorepo contains three main components:

```
hackathon15-1/
├── backend/              # Node.js/Express API server
├── final-hackathon-15-1/ # React frontend application
└── smart_contract/       # Solidity smart contracts
```

## 🚀 Features

- **AI-Powered Analysis**: Gemini AI integration for market insights and trading recommendations
- **Smart Contract Trading**: Automated trading execution via Ethereum smart contracts
- **Paper Trading**: Practice trading with virtual funds
- **Technical Analysis**: Real-time market data and chart analysis
- **Portfolio Management**: Track and manage your crypto portfolio
- **Automated Triggers**: Set up smart triggers for automated trading

## 📦 Components

### Backend (`/backend`)
Node.js/Express server with Prisma ORM for database management.

**Technologies**: TypeScript, Express.js, Prisma, PostgreSQL

**Setup**:
```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Frontend (`/final-hackathon-15-1`)
Modern React application with Vite build tool.

**Technologies**: React, TypeScript, Vite, TailwindCSS

**Setup**:
```bash
cd final-hackathon-15-1
npm install
cp .env.example .env  # Configure your API endpoints
npm run dev
```

### Smart Contract (`/smart_contract`)
Ethereum smart contracts for decentralized trading execution.

**Technologies**: Solidity, Hardhat, OpenZeppelin

**Setup**:
```bash
cd smart_contract
npm install
cp .env.example .env  # Configure your wallet and RPC
npx hardhat compile
npx hardhat test
```

## 🔧 Environment Variables

Each component requires specific environment variables. Create `.env` files in each directory:

### Backend `.env`
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
BINANCE_API_KEY="..."
BINANCE_API_SECRET="..."
GEMINI_API_KEY="..."
```

### Frontend `.env`
```env
VITE_API_URL="http://localhost:3000"
VITE_GEMINI_API_KEY="..."
```

### Smart Contract `.env`
```env
PRIVATE_KEY="your-wallet-private-key"
SEPOLIA_RPC_URL="..."
ETHERSCAN_API_KEY="..."
```

## 🌐 Deployment

### Backend
- Deploy to Railway, Render, or any Node.js hosting
- Ensure PostgreSQL database is configured
- Set all environment variables in hosting platform

### Frontend
- Deploy to Vercel, Netlify, or Cloudflare Pages
- Build command: `npm run build`
- Output directory: `dist`

### Smart Contract
- Already deployed to Sepolia testnet
- Contract address in `smart_contract/deployment.json`

## 📝 Development

**Install all dependencies**:
```bash
# Root level
npm install

# Or install each component separately
cd backend && npm install && cd ..
cd final-hackathon-15-1 && npm install && cd ..
cd smart_contract && npm install && cd ..
```

**Run development servers**:
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd final-hackathon-15-1 && npm run dev

# Terminal 3 - Smart Contract (optional)
cd smart_contract && npx hardhat node
```

## 📄 License

MIT

## 🤝 Contributing

This is a hackathon project. Feel free to fork and modify as needed.

## 📧 Contact

For questions or support, please open an issue in this repository.
