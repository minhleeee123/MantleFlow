# MantleFlow Auto-Trading Backend V2

Backend API for VaultWithSwap V2 architecture.

## 🎯 Features

- ✅ Wallet-based authentication (signature verification)
- ✅ AI & manual trigger management
- ✅ Vault swap execution
- ✅ Execution history tracking
- ✅ Email notifications
- ✅ Real-time price fetching (CoinGecko)

## 📦 Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** MySQL (via Prisma ORM)
- **Blockchain:** Ethers.js v6
- **Auth:** JWT

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

Make sure XAMPP MySQL is running, then:

```bash
# Copy environment file
copy .env.example .env

# Edit .env and update:
# - DATABASE_URL (check MySQL port, default: 3306)
# - BOT_PRIVATE_KEY (wallet with gas for executing swaps)
# - JWT_SECRET (random string)
# - Email settings (optional)

# Create database and tables
npx prisma db push

# (Optional) View database in Prisma Studio
npx prisma studio
```

### 3. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:8000`

## 📁 Project Structure

```
backendV2/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── routes/
│   │   ├── auth.ts            # Login, verify token
│   │   ├── triggers.ts        # CRUD for triggers
│   │   └── execute.ts         # Execute trades, history
│   ├── services/
│   │   ├── blockchain.ts      # Vault swap execution
│   │   ├── market.ts          # Price fetching (CoinGecko)
│   │   └── emailService.ts    # Email notifications
│   ├── middleware/
│   │   └── auth.ts            # JWT verification
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   └── index.ts               # Main server
├── package.json
├── tsconfig.json
└── .env
```

## 🔌 API Endpoints

### Auth
- `POST /api/auth/login` - Wallet signature login
- `POST /api/auth/verify` - Verify JWT token
- `POST /api/auth/email` - Update user email

### Triggers
- `GET /api/triggers` - List user triggers
- `GET /api/triggers/:id` - Get trigger details
- `POST /api/triggers` - Create trigger
- `PATCH /api/triggers/:id` - Update trigger
- `DELETE /api/triggers/:id` - Cancel trigger

### Execute
- `POST /api/execute/:triggerId` - Manual execute
- `GET /api/execute/history` - Execution history

## ⚙️ Environment Variables

```env
# Database
DATABASE_URL="mysql://root@localhost:3306/trading_v2"

# Blockchain
MANTLE_RPC_URL="https://rpc.sepolia.mantle.xyz"
VAULT_ADDRESS="0x2D85E5E8E9C8A90609f147513B9cCc01F8deAB16"
DEX_ADDRESS="0x991E5DAB401B44cD5E6C6e5A47F547B17b5bBa5d"
USDT_ADDRESS="0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080"

# Bot wallet (needs MNT for gas!)
BOT_PRIVATE_KEY="0x..."

# JWT
JWT_SECRET="your-secret-key"

# Email (optional)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Server
PORT="8000"
FRONTEND_URL="http://localhost:3000"
```

## 🔐 Security Notes

1. **BOT_PRIVATE_KEY**: This wallet executes swaps on behalf of users. It MUST have MNT for gas.
2. **JWT_SECRET**: Use a strong random string in production.
3. **Database**: Default MySQL has no password. Add password in production.

## 🧪 Testing

```bash
# Test health endpoint
curl http://localhost:8000/

# Test login (requires frontend or manual signature)
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x...","signature":"0x...","message":"..."}'
```

## 📝 Database Schema

**User:** Stores wallet address + email
**Trigger:** Active/executed/cancelled triggers
**Execution:** Trade execution logs with tx hash
**Transaction:** Deposit/withdraw/swap history (optional)

## 🔄 Differences from V1

| Feature | V1 | V2 |
|---------|----|----|
| **Smart Wallet** | Per-user deployment | Shared Vault |
| **Operator** | Bot wallet needs authorization | No operator needed |
| **Swap Execution** | Complex router calls | Direct Vault calls |
| **Balance Source** | Backend cache | Frontend → Blockchain |
| **Gas Management** | Fund bot button | Bot wallet auto-pays |

## 🐛 Troubleshooting

**Database connection error:**
- Check XAMPP MySQL is running
- Verify DATABASE_URL port (default: 3306)

**Prisma errors:**
```bash
npx prisma generate
npx prisma db push --force-reset
```

**Bot wallet gas:**
- Fund BOT_PRIVATE_KEY address with MNT on Mantle Sepolia

## 📚 Next Steps

1. Test all endpoints with Postman/curl
2. Integrate with frontendV2
3. Deploy to production server
4. Add monitoring & logging

---

**Version:** 2.0.0  
**Last Updated:** 2026-01-06
