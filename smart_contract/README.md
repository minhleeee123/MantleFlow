# 🤖 Auto-Trading Smart Contract

Smart contract for auto-trading platform on Mantle Testnet.

## 📦 Features

- ✅ **Deposit** - Users deposit USDT/tokens
- ✅ **Withdraw** - Users withdraw funds
- ✅ **Execute Swap** - Backend-authorized trading
- ✅ **Balance Tracking** - Per-user balance management
- ✅ **Access Control** - Only authorized backend can execute swaps

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
```

Edit `.env` with your private keys.

### 3. Get Testnet MNT

Faucet: https://faucet.testnet.mantle.xyz

### 4. Compile

```bash
npm run compile
```

### 5. Deploy

```bash
npm run deploy
```

### 6. Update Backend

Copy contract address to `backend/.env`:
```env
CONTRACT_ADDRESS=0x...
```

## 📚 Documentation

See `smart_contract_deployment.md` for complete deployment guide.

## 🔗 Mantle Testnet

- **RPC:** https://rpc.testnet.mantle.xyz
- **Chain ID:** 5001
- **Explorer:** https://explorer.testnet.mantle.xyz
- **Faucet:** https://faucet.testnet.mantle.xyz

## 📝 Contract Functions

### User Functions
- `deposit(token, amount)` - Deposit tokens
- `withdraw(token, amount)` - Withdraw tokens
- `getBalance(user, token)` - Check balance

### Admin Functions (Backend Only)
- `executeSwap(...)` - Execute trade
- `setExecutorAuthorization(executor, status)` - Authorize executor

## 🧪 Testing

```bash
npm test
```

## 🔍 Verify Contract

```bash
npm run verify
```

## 📞 Support

- Mantle Docs: https://docs.mantle.xyz
- Contract: TradingBot.sol
