# Auto-Trading Backend

Simple Node.js backend for auto-trading system with Express, Prisma, and Ethers.js.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=8000
JWT_SECRET=your-secret-key-here
DATABASE_URL="file:./dev.db"
CONTRACT_ADDRESS=0x... # Your deployed smart contract address
ADMIN_PRIVATE_KEY=0x... # Backend wallet private key
MANTLE_RPC_URL=https://rpc.testnet.mantle.xyz
```

### 3. Setup Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view database
npm run prisma:studio
```

### 4. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:8000`

## 📚 API Endpoints

### Authentication

- `POST /api/auth/login` - Login with wallet signature
- `POST /api/auth/verify` - Verify JWT token

### Triggers

- `GET /api/triggers` - Get all triggers
- `GET /api/triggers/:id` - Get single trigger
- `POST /api/triggers` - Create new trigger
- `PATCH /api/triggers/:id` - Update trigger
- `DELETE /api/triggers/:id` - Cancel trigger

### Execute

- `POST /api/execute/check/:triggerId` - Check if trigger can be executed
- `POST /api/execute/:triggerId` - Execute trigger manually
- `GET /api/execute/history` - Get execution history

### Market

- `GET /api/market/price/:symbol` - Get current price
- `GET /api/market/prices?symbols=BTC,ETH` - Get multiple prices

## 🗄️ Database Schema

- **User** - Wallet addresses and user info
- **Trigger** - Trading triggers with conditions
- **Execution** - Trade execution history

## 🔧 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## 📝 Example Usage

### Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x1234...",
    "signature": "0xabcd...",
    "message": "Sign this message to login"
  }'
```

### Create Trigger

```bash
curl -X POST http://localhost:8000/api/triggers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "symbol": "BTC",
    "targetPrice": 60000,
    "condition": "BELOW",
    "amount": 100,
    "type": "BUY"
  }'
```

### Check Trigger

```bash
curl -X POST http://localhost:8000/api/execute/check/TRIGGER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Execute Trigger

```bash
curl -X POST http://localhost:8000/api/execute/TRIGGER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔐 Security Notes

- Never commit `.env` file
- Keep `ADMIN_PRIVATE_KEY` secure
- Use strong `JWT_SECRET`
- Enable CORS only for trusted origins in production

## 📦 Deployment

### Railway

1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically

### Render

1. Connect GitHub repository
2. Set build command: `npm install && npm run build`
3. Set start command: `npm start`
4. Add environment variables
5. Deploy

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: SQLite + Prisma
- **Web3**: Ethers.js v6
- **Auth**: JWT
- **Language**: TypeScript
