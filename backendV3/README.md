# Backend V3 - Auto Trading Bot

## ✨ New Features (V3)

- 🤖 **Bot Delegated Swap** - Bot executes swaps on behalf of authorized users
- 🔐 **User Authorization** - Users control bot access via smart contract
- 🚀 **Auto-Trading** - Automated trigger execution without user interaction
- 📊 **Optimized API Calls** - Batch price fetching to avoid rate limits

## 🏗 Architecture

```
Frontend → API Routes → Services → Smart Contract V3
                ├─ blockchain.ts (bot swap)
                ├─ market.ts (price cache)
                └─ autoExecutor.ts (triggers)
```

## 🚀 Quick Start

### 1. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Update `.env` with your values:
- `DATABASE_URL` - MySQL connection string
- `BOT_PRIVATE_KEY` - Bot wallet private key (must have MNT for gas)
- `VAULT_ADDRESS` - Contract address: `0xa9910f0214173814d1571cC64D45F9681a8500B2`

### 2. Database Setup

```bash
npm run prisma:generate
npm run prisma:push
```

### 3. Start Server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Wallet authentication
- `POST /api/auth/verify` - Verify JWT token

### Bot Swap (NEW)
- `POST /api/swap/bot` - Execute swap via bot (no signature!)
- `GET /api/swap/bot-status` - Check if user authorized bot
- `GET /api/swap/estimate` - Estimate swap output
- `GET /api/swap/balances` - Get user vault balances

## 🔧 How It Works

### 1. User Flow (One-time Setup)

```typescript
// Frontend - User authorizes bot ONCE
const tx = await vaultContract.authorizeBot(BOT_ADDRESS, true);
await tx.wait();
// ✅ Done! User never needs to sign again for swaps
```

### 2. Quick Swap (No Signature)

```typescript
// Frontend calls backend API
const response = await fetch('/api/swap/bot', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fromToken: 'MNT',
    amount: 1.0,
    slippagePercent: 5
  })
});

// ✅ Swap executed without MetaMask popup!
```

### 3. Auto-Trading

```
1. User creates trigger (e.g., "Swap 10 MNT when price < $1")
2. Auto-Executor checks every 30s
3. When condition met → Bot executes swap automatically
4. User receives notification
```

## 🔐 Security

- ✅ Backend NEVER stores user private keys
- ✅ User authorizes bot via smart contract
- ✅ Bot only has permission to swap in vault
- ✅ User can revoke bot access anytime
- ✅ Bot cannot withdraw funds or access user's main wallet

## 🎯 Differences from V2

| Feature | V2 | V3 |
|---------|----|----|
| Swap execution | User signs every time | Bot signs (after authorization) |
| User experience | MetaMask popup | No popup needed |
| Auto-trading | ❌ Can't work | ✅ Fully automated |
| Setup | None | One-time authorization |
| API calls | Multiple | Batched (optimized) |

## 📊 Environment Variables

```env
NODE_ENV=development
PORT=8000
DATABASE_URL=mysql://user:pass@localhost:3306/dbname
JWT_SECRET=your-secret
MANTLE_RPC_URL=https://rpc.sepolia.mantle.xyz
VAULT_ADDRESS=0xa9910f0214173814d1571cC64D45F9681a8500B2
BOT_PRIVATE_KEY=0x...
```

## 🧪 Testing

```bash
# Check server health
curl http://localhost:8000/health

# Check bot status
curl http://localhost:8000/api/swap/bot-status \
  -H "Authorization: Bearer YOUR_TOKEN"

# Execute bot swap
curl -X POST http://localhost:8000/api/swap/bot \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fromToken": "MNT",
    "amount": 1,
    "slippagePercent": 5
  }'
```

## 📝 Notes

- Bot wallet must have MNT for gas fees (~0.01 MNT per swap)
- Users must authorize bot in frontend before using bot swap
- Auto-executor runs every 30 seconds
- Price data cached for 60 seconds to avoid rate limits

## 🔗 Related

- Smart Contract: `0xa9910f0214173814d1571cC64D45F9681a8500B2`
- Explorer: https://explorer.sepolia.mantle.xyz/address/0xa9910f0214173814d1571cC64D45F9681a8500B2
- Frontend: `/frontend`

---

**Version:** 3.0.0  
**Network:** Mantle Sepolia Testnet
