# 📋 KẾ HOẠCH TRIỂN KHAI HỆ THỐNG AUTO-TRADING

## 🎯 TỔNG QUAN DỰ ÁN

### **Mục tiêu**
Xây dựng hệ thống Auto-Trading hoàn chỉnh với:
- Backend API (Python FastAPI)
- Smart Contract (Solidity - Mantle Testnet)
- Integration với Frontend hiện tại (React)
- Auto-execution dựa trên điều kiện thị trường

### **Phạm vi**
- **Phase 1**: Backend Core + Database
- **Phase 2**: Smart Contract Development
- **Phase 3**: Integration & Testing
- **Phase 4**: Deployment & Monitoring

---

## 🏗️ KIẾN TRÚC TỔNG QUAN

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React - Existing)                   │
│  - Dashboard UI                                                  │
│  - Trigger Management                                            │
│  - Portfolio View                                                │
│  - MetaMask Integration                                          │
└────────────────────────┬────────────────────────────────────────┘
                         │ REST API / WebSocket
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API (FastAPI)                         │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │ API Routes     │  │ Services       │  │ Workers        │   │
│  │ - Auth         │  │ - Market Data  │  │ - Price Monitor│   │
│  │ - Triggers     │  │ - AI Parsing   │  │ - Condition    │   │
│  │ - Executions   │  │ - Blockchain   │  │   Checker      │   │
│  │ - Notifications│  │ - Email        │  │ - Email Sender │   │
│  └────────────────┘  └────────────────┘  └────────────────┘   │
└────────────────┬──────────────────┬──────────────────┬─────────┘
                 │                  │                  │
                 ↓                  ↓                  ↓
    ┌────────────────────┐  ┌─────────────────┐  ┌──────────────┐
    │   PostgreSQL       │  │ External APIs   │  │ Smart        │
    │   - Users          │  │ - CoinGecko     │  │ Contract     │
    │   - Triggers       │  │ - Binance       │  │ (Mantle)     │
    │   - Executions     │  │ - Gemini AI     │  │              │
    │   - Notifications  │  └─────────────────┘  └──────────────┘
    └────────────────────┘
```

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG

### **Backend Stack**

| Component | Technology | Version | Lý do chọn |
|-----------|-----------|---------|------------|
| **Framework** | FastAPI | 0.109+ | Async, fast, type-safe, auto docs |
| **Language** | Python | 3.11+ | Dễ code, thư viện AI/Web3 tốt |
| **Database** | PostgreSQL | 15+ | ACID, reliable, JSON support |
| **ORM** | SQLAlchemy | 2.0+ | Async support, migration tools |
| **Migration** | Alembic | Latest | Database version control |
| **Validation** | Pydantic | 2.5+ | Type validation, auto serialization |
| **Authentication** | JWT | python-jose | Stateless, scalable |
| **Web3** | web3.py | 6.15+ | Ethereum/Mantle interaction |
| **HTTP Client** | aiohttp | 3.9+ | Async API calls |
| **Background Jobs** | APScheduler | 3.10+ | Cron-like scheduling |
| **Email** | SMTP (Gmail) | Built-in | Free, reliable |
| **AI** | Google Gemini | 0.3+ | Smart trade parsing |
| **ASGI Server** | Uvicorn | 0.27+ | High performance |

### **Smart Contract Stack**

| Component | Technology | Version | Lý do chọn |
|-----------|-----------|---------|------------|
| **Language** | Solidity | 0.8.20 | Latest stable, overflow protection |
| **Framework** | Hardhat | 2.19+ | Testing, deployment, debugging |
| **Libraries** | OpenZeppelin | 5.0+ | Audited, battle-tested contracts |
| **Network** | Mantle Testnet | - | Low gas, EVM-compatible |
| **DEX** | FusionX | - | Uniswap V2 fork on Mantle |

### **Infrastructure**

| Component | Technology | Lý do chọn |
|-----------|-----------|------------|
| **Containerization** | Docker | Portable, consistent environments |
| **Orchestration** | Docker Compose | Simple multi-container setup |
| **Hosting** | Railway / Render | Easy deploy, free tier available |
| **Blockchain RPC** | Mantle Public RPC | Free, reliable |
| **Monitoring** | Logging (Python) | Built-in, sufficient for MVP |

---

## 📊 CHI TIẾT THÀNH PHẦN BACKEND

### **1. API ROUTES MODULE**

#### **1.1 Auth Routes (`/api/v1/auth`)**
**Chức năng:**
- Xác thực người dùng qua ký wallet signature
- Tạo và quản lý JWT tokens
- Không cần mật khẩu (wallet-based authentication)

**Endpoints:**
- `POST /auth/login`: Verify signature → trả về JWT token
- `POST /auth/verify`: Kiểm tra JWT token còn valid không

**Flow:**
1. Frontend ký message bằng MetaMask
2. Backend verify signature với public key
3. Tạo JWT token (expire 7 ngày)
4. Frontend lưu token vào localStorage

---

#### **1.2 Users Routes (`/api/v1/users`)**
**Chức năng:**
- Quản lý thông tin user
- Cập nhật email cho notifications

**Endpoints:**
- `GET /users/me`: Lấy thông tin user hiện tại
- `PATCH /users/me/email`: Cập nhật email

**Business Logic:**
- Không lưu password (chỉ wallet address)
- Email optional (chỉ cho notifications)
- Auto-create user khi login lần đầu

---

#### **1.3 Triggers Routes (`/api/v1/triggers`)**
**Chức năng:**
- CRUD operations cho trade triggers
- Parse smart trade strategy (AI-powered)
- Activate/deactivate triggers

**Endpoints:**
- `GET /triggers`: List tất cả triggers của user
- `POST /triggers`: Tạo trigger mới (simple)
- `POST /triggers/smart`: Parse và tạo smart trigger (AI)
- `GET /triggers/:id`: Chi tiết 1 trigger
- `PATCH /triggers/:id`: Cập nhật trigger
- `DELETE /triggers/:id`: Xóa trigger

**Business Logic:**
- Validate điều kiện hợp lệ
- Check balance user trước khi create
- Lưu smart conditions dạng JSONB
- Không lưu vào smart contract (chỉ DB)

---

#### **1.4 Executions Routes (`/api/v1/executions`)**
**Chức năng:**
- Xem lịch sử giao dịch
- Chi tiết từng execution

**Endpoints:**
- `GET /executions`: List executions (filter by status, symbol)
- `GET /executions/:id`: Chi tiết execution

**Business Logic:**
- Read-only (không create manual)
- Show tx hash, gas used, timestamp
- Link đến block explorer

---

#### **1.5 Wallet Routes (`/api/v1/wallet`)**
**Chức năng:**
- Query balance từ smart contract
- Không cache (query realtime)

**Endpoints:**
- `GET /wallet/balance`: Get balance của user từ smart contract
- `POST /wallet/deposit`: Hướng dẫn user deposit (chỉ return instructions)
- `POST /wallet/withdraw`: Hướng dẫn user withdraw

**Business Logic:**
- Mỗi request query blockchain
- Cache 5 giây để tránh spam
- Return balance cho tất cả tokens (USDT, WETH, etc.)

---

#### **1.6 Market Routes (`/api/v1/market`)**
**Chức năng:**
- Proxy cho external APIs (CoinGecko, Binance)
- Cache prices để giảm rate limit

**Endpoints:**
- `GET /market/price/:symbol`: Current price
- `GET /market/prices`: Multiple prices
- `GET /market/search`: Search coin

**Business Logic:**
- Cache trong PostgreSQL (table `price_cache`)
- TTL: 10 giây cho prices
- Fallback khi API fail

---

#### **1.7 Notifications Routes (`/api/v1/notifications`)**
**Chức năng:**
- List notifications của user
- Mark as read

**Endpoints:**
- `GET /notifications`: List notifications
- `PATCH /notifications/:id/read`: Mark as read

**Business Logic:**
- Notification created khi:
  - Trigger executed
  - Deposit/withdraw thành công
  - Error xảy ra

---

### **2. SERVICES MODULE**

#### **2.1 Auth Service**
**Trách nhiệm:**
- Verify wallet signature từ MetaMask
- Tạo và validate JWT tokens
- Extract user info từ token

**Key Functions:**
- `verify_signature(message, signature, wallet_address)`: Verify EIP-191 signature
- `create_access_token(wallet_address)`: Tạo JWT
- `decode_token(token)`: Parse và validate JWT
- `get_current_user(token)`: Get user từ token (dependency injection)

---

#### **2.2 Trigger Service**
**Trách nhiệm:**
- CRUD operations cho triggers
- Validate conditions
- Convert human-readable → database format

**Key Functions:**
- `create_trigger(user_id, symbol, action, amount, conditions)`: Tạo trigger
- `get_user_triggers(user_id, status)`: List triggers
- `update_trigger(trigger_id, updates)`: Update trigger
- `delete_trigger(trigger_id)`: Soft delete
- `check_trigger_conditions(trigger, market_data)`: Logic check điều kiện

---

#### **2.3 Execution Service**
**Trách nhiệm:**
- Thực thi trade khi điều kiện đạt
- Gọi smart contract
- Lưu execution record
- Gửi notifications

**Key Functions:**
- `execute_trigger(trigger_id, current_price)`: Main execution logic
- `validate_execution(trigger, balance)`: Pre-execution checks
- `call_smart_contract(user, token_in, token_out, amount)`: Web3 call
- `record_execution(trigger_id, tx_hash, status)`: Save to DB
- `send_notifications(user, execution_details)`: Email + push

**Flow:**
1. Worker detect điều kiện đạt
2. Validate balance user trong smart contract
3. Call smart contract `executeSwap()`
4. Wait transaction confirmation
5. Save execution record
6. Send email notification
7. Emit WebSocket event (optional)

---

#### **2.4 Market Data Service**
**Trách nhiệm:**
- Fetch prices từ CoinGecko/Binance
- Cache để tránh rate limit
- Provide unified interface

**Key Functions:**
- `get_current_price(symbol)`: Get cached hoặc fetch mới
- `get_multiple_prices(symbols)`: Batch query
- `search_coin(query)`: Search coin by name/symbol
- `get_historical_data(symbol, days)`: Price history
- `update_price_cache(symbol, price)`: Manual cache update

**Data Sources:**
- Primary: CoinGecko (more coins)
- Secondary: Binance (real-time, futures data)
- Fallback: Hardcoded prices (emergency)

---

#### **2.5 Blockchain Service**
**Trách nhiệm:**
- Web3 provider setup
- Smart contract interactions
- Transaction signing and sending
- Gas estimation

**Key Functions:**
- `get_web3_provider()`: Initialize Web3 connection
- `get_contract(address, abi)`: Load smart contract
- `query_balance(user_address, token_address)`: Call contract view function
- `execute_swap(user, token_in, token_out, amount)`: Send transaction
- `wait_for_confirmation(tx_hash)`: Wait and return receipt
- `estimate_gas(function, params)`: Gas estimation

**Configuration:**
- RPC URL: Mantle Testnet public RPC
- Admin wallet: Backend hot wallet (private key in .env)
- Gas strategy: Fixed gas price (low on Mantle)
- Retry logic: 3 attempts with exponential backoff

---

#### **2.6 Email Service**
**Trách nhiệm:**
- Send email notifications via Gmail SMTP
- Template-based emails
- Track sent status

**Key Functions:**
- `send_trade_executed(user_email, trade_details)`: Success notification
- `send_error_notification(user_email, error_message)`: Error alert
- `send_welcome_email(user_email)`: Onboarding (optional)
- `render_template(template_name, data)`: HTML email generation

**Templates:**
- Trade executed: Show symbol, price, amount, tx link
- Error: Show error message, suggested actions
- Minimal design: Text + basic HTML

---

#### **2.7 AI Service (Gemini)**
**Trách nhiệm:**
- Parse natural language trading strategies
- Extract conditions và parameters
- Validate parsed output

**Key Functions:**
- `parse_smart_strategy(user_input)`: Parse "Buy BTC if price < 60k and RSI < 30"
- `extract_conditions(parsed_data)`: Convert to structured format
- `validate_strategy(strategy)`: Check if valid và executable

**Output Format:**
```json
{
  "symbol": "BTC",
  "action": "BUY",
  "amount": 100,
  "conditions": [
    {
      "metric": "PRICE",
      "operator": "LT",
      "value": 60000
    },
    {
      "metric": "RSI",
      "operator": "LT",
      "value": 30
    }
  ]
}
```

---

### **3. BACKGROUND WORKERS**

#### **3.1 Price Monitor Worker**
**Mục đích:**
- Cập nhật prices từ external APIs
- Update cache mỗi 10 giây
- Trigger condition checking

**Logic:**
1. Fetch prices cho tất cả symbols đang được monitor
2. Update `price_cache` table
3. Trigger `Condition Checker Worker`

**Schedule:** Mỗi 10 giây

---

#### **3.2 Condition Checker Worker**
**Mục đích:**
- Kiểm tra điều kiện của tất cả active triggers
- Execute trigger khi conditions met

**Logic:**
1. Get all ACTIVE triggers từ DB
2. For each trigger:
   - Get current price
   - Check simple condition (price ABOVE/BELOW target)
   - Check smart conditions (RSI, Volume, etc.)
3. If all conditions met:
   - Call `Execution Service.execute_trigger()`
4. Log results

**Schedule:** Mỗi 10 giây (chạy sau Price Monitor)

**Optimizations:**
- Batch queries
- Skip triggers đã check trong 5s gần nhất
- Use DB index để query nhanh

---

#### **3.3 Email Sender Worker**
**Mục đích:**
- Send pending email notifications
- Retry failed emails

**Logic:**
1. Query notifications với `sent = False`
2. For each notification:
   - Attempt to send email
   - Update `sent = True` nếu thành công
   - Log error nếu failed
3. Retry failed emails (max 3 attempts)

**Schedule:** Mỗi 30 giây

---

### **4. DATABASE MODELS**

#### **4.1 Users Table**
**Mục đích:** Lưu thông tin user cơ bản

**Columns:**
- `id`: Primary key
- `wallet_address`: Unique, indexed
- `email`: Optional (cho notifications)
- `created_at`: Timestamp
- `last_login`: Timestamp

**Relationships:**
- One-to-many với `trade_triggers`
- One-to-many với `trade_executions`
- One-to-many với `notifications`

---

#### **4.2 Trade Triggers Table**
**Mục đích:** Lưu trigger rules

**Columns:**
- `id`: Primary key
- `user_id`: Foreign key
- `symbol`: Token symbol (BTC, ETH)
- `action`: BUY hoặc SELL
- `amount`: Amount in USDT
- `target_price`: Target price (simple condition)
- `condition`: ABOVE hoặc BELOW
- `smart_conditions`: JSONB (complex conditions)
- `status`: ACTIVE, EXECUTED, CANCELLED
- `contract_address`: Smart contract address
- `trigger_contract_id`: ID trong smart contract (optional)
- `created_at`, `updated_at`: Timestamps

**Indexes:**
- `user_id + status` (query active triggers)
- `symbol` (filter by symbol)

---

#### **4.3 Trade Executions Table**
**Mục đích:** Lịch sử giao dịch

**Columns:**
- `id`: Primary key
- `trigger_id`: Foreign key
- `user_id`: Foreign key
- `symbol`, `action`, `executed_price`, `amount`: Trade details
- `total_value`: amount * price
- `tx_hash`: Blockchain transaction hash
- `block_number`: Block number
- `gas_used`: Gas used
- `status`: PENDING, SUCCESS, FAILED
- `error_message`: Error nếu failed
- `executed_at`: Timestamp

**Indexes:**
- `user_id` (query history)
- `trigger_id` (link to trigger)
- `tx_hash` (lookup by tx)

---

#### **4.4 Notifications Table**
**Mục đích:** Email notification queue

**Columns:**
- `id`: Primary key
- `user_id`: Foreign key
- `type`: TRADE_EXECUTED, ERROR, etc.
- `title`, `message`: Content
- `sent`: Boolean
- `sent_at`: Timestamp
- `error_message`: Send error (nếu có)
- `created_at`: Timestamp

**Indexes:**
- `user_id + sent` (query pending)

---

#### **4.5 Price Cache Table**
**Mục đích:** Cache prices để giảm API calls

**Columns:**
- `symbol`: Primary key
- `price`: Current price
- `source`: COINGECKO, BINANCE
- `last_updated`: Timestamp

**TTL:** 10 giây (app logic, không có DB trigger)

---

## 🔄 LUỒNG HOẠT ĐỘNG CHI TIẾT

### **Flow 1: User Registration (Wallet-based)**

```
1. Frontend:
   - User click "Connect Wallet"
   - MetaMask popup
   - User approve connection
   
2. Frontend:
   - Get wallet address: 0x1234...
   - Create message: "Sign this message to login: [timestamp]"
   - Request signature từ MetaMask
   - User sign message
   
3. Frontend → Backend:
   - POST /api/v1/auth/login
   - Body: { wallet_address, message, signature }
   
4. Backend (Auth Service):
   - Verify signature với public key
   - Extract signer address
   - Compare với wallet_address
   - If valid:
     - Check user exists trong DB
     - If not: Create new user
     - Generate JWT token
     - Return: { token, user }
   
5. Frontend:
   - Save token vào localStorage
   - Redirect to dashboard
```

---

### **Flow 2: Create Simple Trigger**

```
1. Frontend:
   - User fill form:
     * Symbol: BTC
     * Action: BUY
     * Amount: 100 USDT
     * Condition: BELOW
     * Target Price: 60000
   - Click "Create Trigger"
   
2. Frontend → Backend:
   - POST /api/v1/triggers
   - Headers: { Authorization: "Bearer <token>" }
   - Body: {
       symbol: "BTC",
       action: "BUY",
       amount: 100,
       target_price: 60000,
       condition: "BELOW"
     }
   
3. Backend (Trigger Service):
   - Validate JWT token → Get user
   - Validate input (amount > 0, valid symbol)
   - Query user balance từ smart contract
   - Check: balance >= amount
   - If OK:
     - Create trigger trong DB
     - Status: ACTIVE
     - Return: { trigger_id, status }
   
4. Frontend:
   - Show success message
   - Redirect to triggers list
```

---

### **Flow 3: Create Smart Trigger (AI-Powered)**

```
1. Frontend:
   - User nhập natural language:
     "Buy 100 USDT of BTC if price drops below 60000 and RSI is under 30"
   - Click "Analyze"
   
2. Frontend → Backend:
   - POST /api/v1/triggers/smart
   - Body: { strategy: "...", amount: 100 }
   
3. Backend (AI Service):
   - Call Gemini API
   - Prompt: "Parse this trading strategy: ..."
   - Gemini returns structured JSON:
     {
       symbol: "BTC",
       action: "BUY",
       conditions: [
         { metric: "PRICE", operator: "LT", value: 60000 },
         { metric: "RSI", operator: "LT", value: 30 }
       ]
     }
   
4. Backend (Trigger Service):
   - Validate parsed strategy
   - Check balance
   - Save to DB:
     - smart_conditions: { conditions: [...] }
   - Return: { trigger_id, parsed_strategy }
   
5. Frontend:
   - Show parsed result
   - User confirm
   - Trigger becomes ACTIVE
```

---

### **Flow 4: Background Monitoring & Execution**

```
Every 10 seconds:

1. Price Monitor Worker:
   - Fetch prices cho ["BTC", "ETH", "SOL", ...]
   - CoinGecko API: /simple/price?ids=bitcoin,ethereum
   - Update price_cache table
   
2. Condition Checker Worker:
   - Query: SELECT * FROM trade_triggers WHERE status = 'ACTIVE'
   - For each trigger:
   
     A. Simple Trigger:
        - Get current price từ cache
        - If condition = "BELOW" AND price <= target_price:
          → Call execute_trigger()
     
     B. Smart Trigger:
        - Check each condition:
          * PRICE: Get từ price_cache
          * RSI: Calculate từ historical data (hoặc fetch từ Binance)
          * VOLUME: Fetch từ Binance API
        - If ALL conditions met:
          → Call execute_trigger()
   
3. Execution Service (execute_trigger):
   
   Step 1: Validate
   - Get user's balance từ smart contract
   - Check: balance >= trigger.amount
   - If insufficient: Cancel trigger, send notification
   
   Step 2: Execute on Blockchain
   - Load smart contract (Web3)
   - Build transaction:
     contract.executeSwap(
       user_address,
       token_in=USDT,
       token_out=WBTC,
       amount=100,
       slippage=2%,
       deadline=now+600
     )
   - Sign transaction bằng backend admin wallet
   - Send transaction
   - Wait confirmation (2-5 seconds on Mantle)
   
   Step 3: Record Execution
   - Save to trade_executions table:
     * tx_hash
     * executed_price
     * gas_used
     * status: SUCCESS
   
   Step 4: Update Trigger
   - Update trigger.status = 'EXECUTED'
   
   Step 5: Notifications
   - Create notification record
   - Email Sender Worker sẽ send email
   - WebSocket emit event (if connected)
   
4. Email Sender Worker (every 30s):
   - Query: SELECT * FROM notifications WHERE sent = FALSE
   - For each notification:
     - Send email via Gmail SMTP
     - Update sent = TRUE
     - Log success/failure
```

---

### **Flow 5: User Deposit USDT**

```
1. Frontend:
   - User click "Deposit"
   - Show modal with instructions:
     * Contract address: 0xABC...
     * Token: USDT (0xDEF...)
     * Steps:
       1. Approve USDT cho contract
       2. Call depositToken()
   
2. User Actions (MetaMask):
   - Approve USDT:
     * Call: USDT.approve(contract_address, 100)
     * MetaMask popup: Approve spending
     * Confirm transaction
   
   - Deposit:
     * Call: TradingBot.depositToken(USDT_address, 100)
     * MetaMask popup: Send transaction
     * Confirm
   
3. Smart Contract:
   - Transfer 100 USDT từ user → contract
   - Update: userBalances[user][USDT] += 100
   - Emit: Deposited event
   
4. Frontend:
   - Listen for Deposited event (WebSocket or polling)
   - Update balance display
   - Show success message
```

---

### **Flow 6: Query Balance (Realtime)**

```
1. Frontend requests balance:
   - GET /api/v1/wallet/balance
   - Headers: { Authorization: "Bearer <token>" }
   
2. Backend (Wallet Service):
   - Decode token → Get user's wallet_address
   - Query smart contract:
     contract.getBalance(wallet_address, USDT_address)
   - Response: 100 USDT (in wei)
   
3. Backend returns:
   {
     "balances": [
       { "token": "USDT", "balance": 100.0 },
       { "token": "WETH", "balance": 0.5 }
     ],
     "timestamp": "2026-01-03T10:30:00Z"
   }
   
4. Frontend:
   - Display balance
   - Cache for 5 seconds (prevent spam)
```

---

### **Flow 7: User Withdraw USDT**

```
1. Frontend:
   - User click "Withdraw"
   - Input amount: 50 USDT
   - Click "Confirm"
   
2. Frontend → Smart Contract (direct):
   - MetaMask transaction:
     TradingBot.withdrawToken(USDT_address, 50)
   - User confirm
   
3. Smart Contract:
   - Check: userBalances[user][USDT] >= 50
   - Deduct: userBalances[user][USDT] -= 50
   - Transfer: 50 USDT từ contract → user wallet
   - Emit: Withdrawn event
   
4. Frontend:
   - Listen event
   - Update balance
   - Show success
   
Note: Withdraw KHÔNG qua backend (user tự gọi contract)
```

---

## 📦 DEPLOYMENT STRATEGY

### **Phase 1: Local Development (Week 1-2)**

**Tasks:**
1. Setup PostgreSQL database (Docker)
2. Setup Python environment
3. Implement core API routes (auth, users, triggers)
4. Write unit tests
5. Manual testing với Postman

**Deliverables:**
- Working backend locally
- Database schema created
- API documentation (FastAPI auto-docs)

---

### **Phase 2: Smart Contract Development (Week 2-3)**

**Tasks:**
1. Setup Hardhat project
2. Write TradingBot.sol contract
3. Write comprehensive tests
4. Deploy to Mantle Testnet
5. Verify contract on explorer

**Deliverables:**
- Deployed smart contract
- Contract ABI exported
- Deployment addresses documented

---

### **Phase 3: Integration (Week 3-4)**

**Tasks:**
1. Integrate backend với smart contract (Web3)
2. Implement background workers
3. Setup email service
4. Connect frontend to backend API
5. End-to-end testing

**Deliverables:**
- Full system working
- All flows tested
- Bug fixes completed

---

### **Phase 4: Production Deployment (Week 4)**

**Tasks:**
1. Setup production environment (Railway/Render)
2. Configure environment variables
3. Deploy backend API
4. Setup monitoring và logging
5. User acceptance testing

**Deliverables:**
- Live production system
- Monitoring dashboard
- User documentation

---

## 🔒 SECURITY CONSIDERATIONS

### **1. Authentication Security**
- JWT tokens với short expiry (7 days)
- Signature verification để prevent replay attacks
- Rate limiting trên auth endpoints (10 req/min per IP)

### **2. API Security**
- CORS configured (chỉ allow frontend domain)
- Request validation với Pydantic schemas
- SQL injection prevention (SQLAlchemy ORM)
- Input sanitization

### **3. Smart Contract Security**
- ReentrancyGuard cho tất cả state-changing functions
- Ownable pattern (chỉ backend có thể execute trades)
- Pausable mechanism (emergency stop)
- SafeERC20 cho token transfers
- No hardcoded secrets trong contract

### **4. Backend Security**
- Environment variables cho sensitive data
- Admin private key KHÔNG commit vào Git
- HTTPS only (production)
- Database credentials encrypted
- Email credentials là App Password (không phải real password)

### **5. Operational Security**
- Backend admin wallet có balance thấp (chỉ đủ gas)
- User funds trong smart contract (not controlled by backend)
- Multi-sig consideration cho contract ownership (future)
- Regular security audits

---

## 📊 MONITORING & LOGGING

### **1. Application Logs**
- Request/response logs (FastAPI middleware)
- Worker execution logs
- Error stack traces
- Performance metrics (response time)

**Log Levels:**
- DEBUG: Development only
- INFO: Normal operations (trigger created, executed)
- WARNING: Abnormal but handled (API timeout, retry)
- ERROR: Failures (execution failed, email not sent)
- CRITICAL: System-level issues (DB down, RPC down)

### **2. Blockchain Monitoring**
- Transaction success/failure rates
- Gas usage tracking
- Failed transaction analysis
- Contract event logs

### **3. Business Metrics**
- Number of active triggers
- Execution success rate
- Average execution time
- User growth
- Trading volume

### **4. Alerts**
- Email alert khi:
  - Worker stopped
  - Execution failure rate > 10%
  - RPC connection failed
  - Database connection lost

---

## 🧪 TESTING STRATEGY

### **1. Unit Tests**
**Coverage:** 80%+
- Service layer functions
- Utility functions
- Data validation logic

**Tools:** pytest, pytest-asyncio

### **2. Integration Tests**
- API endpoint tests (với mock DB)
- Smart contract interaction tests
- External API mocks (CoinGecko, Binance)

**Tools:** pytest, httpx (async client)

### **3. Smart Contract Tests**
- Unit tests cho mỗi function
- Integration tests với mock tokens
- Gas optimization tests
- Security tests (reentrancy, overflow)

**Tools:** Hardhat, Chai

### **4. End-to-End Tests**
- User registration flow
- Create trigger flow
- Execution flow
- Withdrawal flow

**Tools:** Manual testing + Postman collections

---

## 📈 PERFORMANCE TARGETS

### **API Performance**
- Response time: < 200ms (GET)
- Response time: < 500ms (POST with DB write)
- Throughput: 100 req/s per endpoint
- Database query: < 50ms

### **Worker Performance**
- Price monitor: Complete within 5s
- Condition checker: Check 100 triggers in < 10s
- Execution time: < 30s (including blockchain confirmation)

### **Smart Contract**
- Gas per deposit: ~50,000 gas
- Gas per swap: ~150,000 gas
- Gas per withdraw: ~40,000 gas
- Transaction confirmation: 2-5 seconds (Mantle)

---

## 💰 COST ESTIMATION

### **Development Costs**
- Backend development: 2-3 weeks
- Smart contract development: 1-2 weeks
- Testing & integration: 1 week
- **Total development time:** 4-6 weeks

### **Infrastructure Costs (Monthly)**
- Database (PostgreSQL): $0 (Railway free tier) → $5 (paid)
- Backend hosting: $0 (Render free tier) → $7 (paid)
- RPC calls: $0 (Mantle public RPC)
- Email: $0 (Gmail SMTP)
- Domain: $10/year
- **Total:** $0-12/month (MVP), scale to $50-100/month (production)

### **Gas Costs (Mantle Testnet)**
- Testnet: $0 (free test tokens)
- Mainnet: ~$0.01 per transaction (very cheap)

---

## ✅ SUCCESS CRITERIA

### **MVP Launch**
- [ ] User có thể login bằng wallet
- [ ] User có thể deposit USDT vào contract
- [ ] User có thể tạo simple trigger (price-based)
- [ ] Background worker tự động check và execute triggers
- [ ] User nhận email notification khi trade executed
- [ ] User có thể withdraw USDT về wallet

### **Full Launch**
- [ ] Smart trigger với AI parsing
- [ ] Multi-token support (USDT, WETH, WBTC)
- [ ] Trade history với filter và search
- [ ] WebSocket realtime updates (optional)
- [ ] Admin dashboard để monitor system
- [ ] 99% uptime

---

## 🚀 NEXT STEPS

### **Immediate Actions**
1. **Setup Development Environment**
   - Install PostgreSQL
   - Setup Python virtual environment
   - Install dependencies
   
2. **Create Project Structure**
   - Initialize FastAPI project
   - Setup Hardhat project
   - Create Docker Compose file
   
3. **Implement Core Features**
   - Database schema migration
   - Auth system
   - Basic CRUD APIs
   
4. **Smart Contract Development**
   - Write and test TradingBot.sol
   - Deploy to Mantle Testnet
   - Test deposit/withdraw/swap

### **Timeline Overview**
- **Week 1:** Backend foundation + Database
- **Week 2:** API routes + Services
- **Week 3:** Smart contracts + Workers
- **Week 4:** Integration + Testing
- **Week 5:** Deployment + Documentation

---

## 📚 DOCUMENTATION DELIVERABLES

1. **API Documentation**
   - FastAPI auto-generated docs (Swagger)
   - Postman collection

2. **Smart Contract Documentation**
   - Function descriptions
   - Events documentation
   - Deployment guide

3. **Deployment Guide**
   - Environment setup
   - Configuration instructions
   - Troubleshooting guide

4. **User Guide**
   - How to deposit
   - How to create triggers
   - How to withdraw

---

## 🎯 CONCLUSION

Kế hoạch này cung cấp roadmap chi tiết để triển khai hệ thống Auto-Trading hoàn chỉnh. Với thiết kế modular và công nghệ hiện đại (FastAPI, Solidity, Mantle), hệ thống sẽ:

✅ **Scalable**: Dễ thêm features mới
✅ **Maintainable**: Code clean, well-documented
✅ **Secure**: Best practices cho Web3 và backend
✅ **Cost-effective**: Mantle testnet + free hosting tiers
✅ **User-friendly**: Simple flows, realtime updates

**Estimated Timeline:** 4-6 tuần từ start đến production-ready
**Team Size:** 1-2 developers (có thể solo nếu có kinh nghiệm)

---

**Sẵn sàng bắt đầu implementation? 🚀**
