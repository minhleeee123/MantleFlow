# 🚀 KẾ HOẠCH XÂY DỰNG LẠI BACKEND AUTO-TRADING HOÀN CHỈNH

## 📋 MỤC TIÊU

Xây dựng backend tự động trading với các tính năng:
- ✅ Auto-executor tự động check và execute triggers
- ✅ Market data real-time với 6 metrics (PRICE, RSI, VOLUME, MA, SENTIMENT, GAS)
- ✅ Smart triggers với multiple conditions
- ✅ Persistent cache để tránh rate limit
- ✅ Reliable execution với error handling
- ✅ Background jobs và scheduling

---

## 🏗️ KIẾN TRÚC TỔNG QUAN

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│         (React + Gemini AI Agent for Smart Triggers)        │
└─────────────────────────┬───────────────────────────────────┘
                          │ REST API
┌─────────────────────────▼───────────────────────────────────┐
│                    BACKEND SERVER                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API Routes Layer                                     │   │
│  │  • /auth    • /triggers   • /market   • /execute    │   │
│  └────────────────────┬─────────────────────────────────┘   │
│  ┌────────────────────▼─────────────────────────────────┐   │
│  │  Business Logic Layer                                 │   │
│  │  • Auth Service     • Market Service                 │   │
│  │  • Trigger Service  • Execution Service              │   │
│  └────────────────────┬─────────────────────────────────┘   │
│  ┌────────────────────▼─────────────────────────────────┐   │
│  │  Background Services                                  │   │
│  │  • Auto-Executor (30s interval)                      │   │
│  │  • Cache Manager (cleanup expired)                   │   │
│  │  • Health Monitor                                    │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────┬────────────────┬──────────────────────────────┘
               │                │
    ┌──────────▼─────┐   ┌─────▼──────────┐
    │   DATABASE     │   │  BLOCKCHAIN     │
    │  (MySQL+Cache) │   │ (Mantle Sepolia)│
    └────────────────┘   └─────────────────┘
```

---

## 📊 DATABASE SCHEMA (Prisma)

### **1. Core Models**

```prisma
// User Management
model User {
  id            String    @id @default(uuid())
  walletAddress String    @unique
  email         String?
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  lastLoginAt   DateTime?
  
  triggers      Trigger[]
  executions    Execution[]
  transactions  Transaction[]
}

// Trigger Management
model Trigger {
  id              String        @id @default(uuid())
  userId          String
  user            User          @relation(fields: [userId], references: [id])
  
  symbol          String        // BTC, ETH, etc
  targetPrice     Float         // For simple triggers
  condition       TriggerCondition // ABOVE, BELOW
  type            TriggerType   // BUY, SELL
  amount          Float
  slippage        Float         @default(5)
  
  // Smart Triggers
  smartConditions Json?         // Array of conditions
  isSmartTrigger  Boolean       @default(false)
  
  // Status & Metadata
  status          TriggerStatus @default(ACTIVE)
  priority        Int           @default(0) // Higher = execute first
  retryCount      Int           @default(0)
  lastCheckedAt   DateTime?
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  executedAt      DateTime?
  
  executions      Execution[]
  
  @@index([userId, status])
  @@index([status, priority, lastCheckedAt])
}

// Execution History
model Execution {
  id              String        @id @default(uuid())
  triggerId       String
  trigger         Trigger       @relation(fields: [triggerId], references: [id])
  userId          String
  user            User          @relation(fields: [userId], references: [id])
  
  symbol          String
  type            TriggerType
  amount          Float
  
  // Execution Details
  txHash          String?
  gasUsed         Float?
  executionPrice  Float?
  conditionsMet   Json          // Store which conditions were met
  
  // Status
  status          ExecutionStatus @default(PENDING)
  error           String?        @db.Text
  
  executedAt      DateTime      @default(now())
  confirmedAt     DateTime?
  
  @@index([userId, executedAt])
  @@index([status, executedAt])
}

// Blockchain Transactions
model Transaction {
  id          String            @id @default(uuid())
  userId      String
  user        User              @relation(fields: [userId], references: [id])
  
  type        TransactionType   // DEPOSIT, WITHDRAW, SWAP
  tokenIn     String
  tokenOut    String?
  amountIn    Float
  amountOut   Float?
  
  txHash      String            @unique
  blockNumber Int?
  gasPrice    Float?
  gasUsed     Float?
  
  status      TransactionStatus @default(PENDING)
  error       String?           @db.Text
  
  createdAt   DateTime          @default(now())
  confirmedAt DateTime?
  
  @@index([userId, createdAt])
  @@index([type, status])
}
```

### **2. Cache & Performance Models**

```prisma
// Persistent Market Data Cache
model MarketCache {
  id          String   @id @default(uuid())
  cacheKey    String   @unique  // "price:BTC", "rsi:ETH:14"
  metric      String              // PRICE, RSI, VOLUME, MA, SENTIMENT, GAS
  symbol      String?             // BTC, ETH (null for SENTIMENT, GAS)
  
  value       Float
  metadata    Json?               // Extra data (period, description, etc)
  
  expiresAt   DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([cacheKey, expiresAt])
  @@index([metric, symbol, expiresAt])
}

// API Rate Limit Tracking
model RateLimitTracker {
  id          String   @id @default(uuid())
  apiName     String              // "coingecko", "alternative.me"
  endpoint    String              // "/simple/price", "/fng"
  
  requestCount Int     @default(0)
  windowStart  DateTime
  windowEnd    DateTime
  
  isBlocked    Boolean  @default(false)
  blockedUntil DateTime?
  
  @@unique([apiName, endpoint, windowStart])
  @@index([apiName, isBlocked])
}
```

### **3. System & Monitoring Models**

```prisma
// Auto-Executor Logs
model ExecutorLog {
  id              String   @id @default(uuid())
  checkCycle      Int               // Cycle number
  
  triggersChecked Int
  triggersExecuted Int
  triggersFailed  Int
  
  duration        Int               // Milliseconds
  errors          Json?             // Array of errors
  
  createdAt       DateTime @default(now())
  
  @@index([createdAt])
}

// System Health
model SystemHealth {
  id              String   @id @default(uuid())
  metric          String              // "executor_status", "api_health", etc
  
  status          HealthStatus        // OK, WARNING, ERROR
  value           Json                // Current value
  message         String?   @db.Text
  
  updatedAt       DateTime @updatedAt
  
  @@unique([metric])
}
```

### **4. Enums**

```prisma
enum TriggerCondition {
  ABOVE
  BELOW
}

enum TriggerType {
  BUY
  SELL
}

enum TriggerStatus {
  ACTIVE
  EXECUTED
  CANCELLED
  FAILED
  PAUSED
}

enum ExecutionStatus {
  PENDING
  PROCESSING
  SUCCESS
  FAILED
  REVERTED
}

enum TransactionType {
  DEPOSIT
  WITHDRAW
  SWAP
}

enum TransactionStatus {
  PENDING
  SUCCESS
  FAILED
}

enum HealthStatus {
  OK
  WARNING
  ERROR
}
```

---

## 🔧 SERVICES ARCHITECTURE

### **1. Market Data Service** (`services/market.ts`)

**Chức năng:**
- Fetch 6 metrics từ external APIs
- Cache thông minh với TTL phù hợp
- Rate limit protection
- Fallback mechanisms

**Implementation:**

```typescript
class MarketDataService {
  // Core Methods
  getCurrentPrice(symbol: string): Promise<number>
  getRSI(symbol: string, period?: number): Promise<number>
  get24hVolume(symbol: string): Promise<number>
  getMovingAverage(symbol: string, days?: number): Promise<number>
  getSentimentScore(): Promise<number>
  getGasPrice(): Promise<number>
  
  // Batch Methods
  getAllMetrics(symbol: string): Promise<MarketMetrics>
  getMultipleSymbols(symbols: string[]): Promise<Map<string, MarketMetrics>>
  
  // Cache Methods
  private async getFromCache(key: string): Promise<any>
  private async setCache(key: string, value: any, ttl: number): Promise<void>
  private async warmupCache(): Promise<void>
  
  // Rate Limit
  private async checkRateLimit(api: string): Promise<boolean>
  private async recordApiCall(api: string): Promise<void>
}
```

**Cache Strategy:**
- PRICE: 1 phút (thay đổi nhanh)
- RSI/MA: 5 phút (tính toán từ historical)
- VOLUME: 1 phút
- SENTIMENT: 8 giờ (Fear & Greed Index update 1x/day)
- GAS: 30 giây (Mantle network)

**Rate Limit Protection:**
- Track requests per minute
- Exponential backoff on 429 errors
- Queue requests when near limit
- Fallback to cached stale data if API fails

---

### **2. Auto-Executor Service** (`services/autoExecutor.ts`)

**Chức năng:**
- Background service check triggers mỗi 30s
- Priority-based execution queue
- Parallel processing với concurrency limit
- Error handling và retry logic
- Logging và monitoring

**Implementation:**

```typescript
class AutoExecutorService {
  private isRunning: boolean = false
  private checkInterval: number = 30000 // 30s
  private concurrencyLimit: number = 3
  
  // Main Loop
  start(): void
  stop(): void
  private async executorLoop(): Promise<void>
  
  // Trigger Processing
  private async fetchActiveTriggers(): Promise<Trigger[]>
  private async processTriggersBatch(triggers: Trigger[]): Promise<void>
  private async checkAndExecuteTrigger(trigger: Trigger): Promise<void>
  
  // Condition Checking
  private async checkSimpleTrigger(trigger: Trigger): Promise<boolean>
  private async checkSmartTrigger(trigger: Trigger): Promise<{met: boolean, details: string[]}>
  private evaluateCondition(current: number, operator: string, target: number): boolean
  
  // Execution
  private async executeTrigger(trigger: Trigger): Promise<Execution>
  private async executeSwap(trigger: Trigger): Promise<SwapResult>
  
  // Error Handling
  private async handleExecutionError(trigger: Trigger, error: Error): Promise<void>
  private async retryTrigger(trigger: Trigger): Promise<void>
  
  // Logging
  private async logCycle(stats: ExecutorStats): Promise<void>
  private async updateHealthStatus(status: string): Promise<void>
}
```

**Execution Flow:**
```
1. Fetch ACTIVE triggers (priority DESC, lastCheckedAt ASC)
2. Group by symbol (để batch fetch market data)
3. Fetch market data once per symbol (cache reuse)
4. Check conditions parallel (max 3 concurrent)
5. Execute met triggers sequentially (avoid nonce conflicts)
6. Update trigger status + create execution record
7. Log cycle stats
```

**Priority System:**
- High priority (100+): Smart triggers with complex conditions
- Normal priority (50): Price-based triggers
- Low priority (0): Test/demo triggers

**Retry Logic:**
- Max 3 retries per trigger
- Exponential backoff: 1min, 5min, 15min
- After 3 fails → mark as FAILED
- User can manually reset

---

### **3. Blockchain Service** (`services/blockchain.ts`)

**Chức năng:**
- Execute swaps on VaultWithSwap contract
- Nonce management
- Gas estimation
- Transaction monitoring

**Implementation:**

```typescript
class BlockchainService {
  private provider: ethers.JsonRpcProvider
  private botWallet: ethers.Wallet
  private vault: ethers.Contract
  
  // Swap Execution
  async executeSwap(params: SwapParams): Promise<SwapResult>
  
  // Gas Management
  private async estimateGas(tx: TransactionRequest): Promise<bigint>
  private async getCurrentGasPrice(): Promise<bigint>
  private async getOptimalGasSettings(): Promise<GasSettings>
  
  // Nonce Management
  private async getNextNonce(address: string): Promise<number>
  private async waitForNonce(address: string, nonce: number): Promise<void>
  
  // Transaction Monitoring
  async waitForConfirmation(txHash: string, confirmations?: number): Promise<TransactionReceipt>
  async checkTransactionStatus(txHash: string): Promise<TransactionStatus>
  
  // Balance Checks
  async getUserBalances(address: string): Promise<{mnt: bigint, usdt: bigint}>
  async hasSufficientBalance(address: string, token: string, amount: bigint): Promise<boolean>
}
```

---

### **4. Cache Manager Service** (`services/cacheManager.ts`)

**Chức năng:**
- Manage persistent cache in database
- Auto cleanup expired entries
- Pre-warm popular data
- Cache statistics

**Implementation:**

```typescript
class CacheManagerService {
  // Get/Set
  async get(key: string): Promise<CacheEntry | null>
  async set(key: string, value: any, ttl: number): Promise<void>
  async delete(key: string): Promise<void>
  
  // Batch Operations
  async getMany(keys: string[]): Promise<Map<string, CacheEntry>>
  async setMany(entries: CacheEntry[]): Promise<void>
  
  // Maintenance
  async cleanupExpired(): Promise<number>
  async prewarmCache(symbols: string[]): Promise<void>
  
  // Statistics
  async getCacheStats(): Promise<CacheStats>
  async getHitRate(): Promise<number>
}
```

**Cleanup Strategy:**
- Run every 1 hour
- Delete entries where `expiresAt < NOW()`
- Keep last 1000 entries even if expired (for analytics)

---

## 🛣️ API ROUTES

### **Authentication**
```
POST   /api/auth/login          - Login với wallet signature
POST   /api/auth/verify         - Verify JWT token
```

### **Triggers**
```
GET    /api/triggers            - List user's triggers
GET    /api/triggers/:id        - Get single trigger
POST   /api/triggers            - Create trigger (simple or smart)
PATCH  /api/triggers/:id        - Update trigger
DELETE /api/triggers/:id        - Cancel trigger
POST   /api/triggers/:id/pause  - Pause trigger
POST   /api/triggers/:id/resume - Resume trigger
```

### **Market Data**
```
GET    /api/market/price/:symbol           - Get current price
GET    /api/market/prices?symbols=BTC,ETH  - Batch prices
GET    /api/market/rsi/:symbol?period=14   - Get RSI
GET    /api/market/volume/:symbol          - Get 24h volume
GET    /api/market/ma/:symbol?days=7       - Get moving average
GET    /api/market/sentiment                - Get Fear & Greed
GET    /api/market/gas                      - Get gas price
GET    /api/market/metrics/:symbol         - Get all metrics
```

### **Executions**
```
GET    /api/execute/history              - User's execution history
GET    /api/execute/:id                  - Single execution details
POST   /api/execute/:triggerId/retry     - Retry failed execution
```

### **Transactions**
```
GET    /api/transactions                 - User's transactions
GET    /api/transactions/:id             - Single transaction
```

### **Admin/Monitoring**
```
GET    /api/admin/health                 - System health
GET    /api/admin/executor/status        - Auto-executor status
POST   /api/admin/executor/start         - Start executor
POST   /api/admin/executor/stop          - Stop executor
GET    /api/admin/cache/stats            - Cache statistics
POST   /api/admin/cache/clear            - Clear cache
GET    /api/admin/logs?limit=100         - Executor logs
```

---

## 🔐 SECURITY & BEST PRACTICES

### **1. Authentication**
- JWT tokens với expiration (24h)
- Wallet signature verification
- Rate limiting per user (100 req/min)

### **2. Private Key Management**
- BOT_PRIVATE_KEY only in .env (never commit)
- Separate hot wallet for bot execution
- Multi-sig for admin operations

### **3. Error Handling**
```typescript
try {
  // Execute trigger
} catch (error) {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    // Notify user, pause trigger
  } else if (error.code === 'NONCE_TOO_LOW') {
    // Retry with fresh nonce
  } else {
    // Log, mark as failed
  }
}
```

### **4. Monitoring & Alerts**
- Log all executor cycles
- Alert on >50% execution failure rate
- Alert on API rate limit blocks
- Daily report: triggers executed, success rate, avg gas used

---

## 📦 DEPLOYMENT CHECKLIST

### **Phase 1: Database Setup**
- [ ] Create MySQL database `trading_v2`
- [ ] Run `prisma migrate dev`
- [ ] Seed initial data (test users, cache warmup)

### **Phase 2: Environment Setup**
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in `BOT_PRIVATE_KEY` (hot wallet with MNT for gas)
- [ ] Fill in `DATABASE_URL`
- [ ] Configure `MANTLE_RPC_URL`, contract addresses

### **Phase 3: Build & Test**
- [ ] `npm install`
- [ ] `npm run build`
- [ ] Run API tests: `node test-apis/test-backend-apis.js`
- [ ] Run executor test: `node test-apis/test-auto-executor.js`

### **Phase 4: Start Services**
- [ ] Start backend: `npm start`
- [ ] Verify auto-executor starts
- [ ] Check logs: triggers detected, cache working
- [ ] Create test trigger, verify execution

### **Phase 5: Monitoring**
- [ ] Setup PM2 for process management
- [ ] Configure log rotation
- [ ] Setup health check endpoint monitoring
- [ ] Alert on critical errors

---

## 🚨 KNOWN ISSUES & SOLUTIONS

### **Issue 1: CoinGecko Rate Limit 429**
**Solution:**
- Increase cache TTL (1-5 min)
- Use database cache for persistence
- Implement request queue with backoff
- Consider paid API tier for production

### **Issue 2: Nonce Conflicts**
**Solution:**
- Execute swaps sequentially (not parallel)
- Track pending nonces in memory
- Retry with fresh nonce on error

### **Issue 3: Stale Cache Data**
**Solution:**
- Add `staleWhileRevalidate` pattern
- Return stale data + refresh in background
- Mark cache entries with confidence score

### **Issue 4: Trigger Execution Delays**
**Solution:**
- Priority queue for urgent triggers
- Reduce check interval for high-priority
- Parallel condition checking (not execution)

---

## 📈 PERFORMANCE TARGETS

| Metric | Target | Current |
|--------|--------|---------|
| Executor cycle time | < 5s | ~8s |
| API response time | < 200ms | ~150ms |
| Cache hit rate | > 80% | ~60% |
| Trigger check accuracy | 100% | 100% |
| Execution success rate | > 95% | ~90% |
| Max concurrent executions | 3 | 1 |

---

## 🎯 FUTURE ENHANCEMENTS

1. **Multi-chain Support**
   - Support Ethereum, Polygon, BSC
   - Cross-chain bridge integration

2. **Advanced Triggers**
   - Time-based triggers (execute at specific time)
   - Composite triggers (A AND B OR C)
   - Trailing stop loss

3. **AI-Powered Features**
   - Auto-suggest optimal trigger conditions
   - Predict execution success probability
   - Risk scoring per trigger

4. **WebSocket Real-time Updates**
   - Push execution notifications to frontend
   - Real-time market data stream
   - Live executor status

5. **Analytics Dashboard**
   - PnL tracking
   - Best/worst performing triggers
   - Market condition correlation

---

## 📚 DOCUMENTATION REFERENCES

- Prisma: https://www.prisma.io/docs
- ethers.js v6: https://docs.ethers.org/v6/
- CoinGecko API: https://www.coingecko.com/api/documentation
- Mantle Network: https://docs.mantle.xyz

---

## 🤝 TEAM RESPONSIBILITIES

| Role | Responsibilities |
|------|------------------|
| **Backend Dev** | API routes, services, database schema |
| **Blockchain Dev** | Smart contracts, swap execution, gas optimization |
| **DevOps** | Deployment, monitoring, CI/CD |
| **QA** | Testing executor logic, edge cases, load testing |

---

## ✅ READY TO BUILD!

Sau khi review kế hoạch này:
1. Approve schema design
2. Create branch `feature/backend-rebuild`
3. Start with Phase 1 (Database)
4. Deploy step-by-step với testing sau mỗi phase

**Estimated Timeline:** 3-5 days
- Day 1-2: Database + Core Services
- Day 3: Auto-Executor + Testing
- Day 4: Optimization + Monitoring
- Day 5: Documentation + Handoff
