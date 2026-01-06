# Bot Wallet Setup - Option A

## ✅ Bot Wallet Generated

**Bot Address:** `0xB693B5eb62d5E37480F9D9390135E16405F211D5`  
**Bot Private Key:** `0x09c94f8445545a774674b12dd8221d4da8c81d170ff803dbc318b35e85be8c756`

---

## 🔧 Setup Steps

### 1. Update .env File

Open `backendV2/.env` and update:

```env
BOT_PRIVATE_KEY="0x09c94f8445545a774674b12dd8221d4da8c81d170ff803dbc318b35e85be8c756"
```

### 2. Fund Bot Wallet

**Manual funding (testnet faucet):**
```
1. Visit: https://faucet.sepolia.mantle.xyz/
2. Paste bot address: 0xB693B5eb62d5E37480F9D9390135E16405F211D5
3. Request 5-10 MNT
4. Wait for confirmation (~30 seconds)
```

**Alternative (if you have testnet MNT):**
```typescript
// From your MetaMask
Send 5 MNT to: 0xB693B5eb62d5E37480F9D9390135E16405F211D5
```

### 3. Verify Balance

```bash
# Check bot wallet balance
curl https://rpc.sepolia.mantle.xyz \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "method":"eth_getBalance",
    "params":["0xB693B5eb62d5E37480F9D9390135E16405F211D5","latest"],
    "id":1
  }'
```

### 4. Restart Backend

```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## ⚠️ Security Notes

**IMPORTANT:**
- ✅ This wallet is for TESTNET only
- ✅ Private key is saved in .env (not committed to git)
- ⚠️ For mainnet, use hardware wallet or secure key management
- ⚠️ Never share private key publicly

**Backup:**
- Save private key securely offline
- Can import to MetaMask for manual management
- Mnemonic not needed (we have private key directly)

---

## 📊 Estimated Capacity

With 5 MNT ($4.25):
- ~2500 swap executions
- ~50-100 users for 1-3 months
- Cheap and efficient!

---

*Generated: 2026-01-06*
