# 🚀 CryptoInsight AI - Gemini-Powered Crypto Trading Platform

## 📋 Tổng Quan Hệ Thống

**CryptoInsight AI** là một nền tảng giao dịch và phân tích tiền điện tử thông minh được xây dựng với công nghệ **Google Gemini 2.5 Flash AI**, **React**, và **TypeScript**. Hệ thống cung cấp các tính năng phân tích thị trường theo thời gian thực, quản lý danh mục đầu tư, giao dịch tự động thông minh (Smart Trading), và tích hợp ví Web3.

---

## 🎯 Tính Năng Chính

### 1. **AI Chat Assistant**
- Trò chuyện với AI để phân tích thị trường tiền điện tử
- Hỗ trợ phân tích chi tiết các coin (Bitcoin, Ethereum, Solana, v.v.)
- Xác định ý định người dùng tự động (Intent Detection)
- Lưu trữ lịch sử chat với nhiều phiên làm việc

### 2. **Phân Tích Thị Trường Thời Gian Thực**
- **Dashboard Trực Quan** với biểu đồ Neo-Brutalist Design
- Dữ liệu thực từ **CoinGecko API**, **Binance Futures API**, **Fear & Greed Index**
- **6 Loại Biểu Đồ**:
  - 📈 **Price Chart**: Lịch sử giá 7 ngày với TradingView Widget
  - 🔥 **Sentiment Chart**: Chỉ số Fear & Greed (0-100)
  - 📊 **Long/Short Ratio**: Tỷ lệ Long/Short từ Binance Futures
  - 🎯 **Project Score**: Đánh giá dự án (Security, Decentralization, Scalability, Ecosystem, Tokenomics)
  - 🥧 **Tokenomics Chart**: Phân bổ token (Pie Chart)

### 3. **Quản Lý Danh Mục Đầu Tư (Portfolio)**
- Hiển thị danh mục đầu tư cá nhân với P&L (Profit/Loss) theo thời gian thực
- **Biểu đồ phân bổ tài sản** (Allocation Chart)
- **Biểu đồ giá trị nắm giữ** (Holdings Chart)
- **Bảng chi tiết Portfolio** với tính năng refresh giá tự động
- Phân tích rủi ro và gợi ý tái cân bằng danh mục

### 4. **Auto Trading (Paper Trading)**
- **Giao dịch giả lập** với ví USDT ảo ($1,000 khởi đầu)
- **Trigger-based Trading**:
  - Mua khi giá TRÊN/DƯỚI mức ngưỡng
  - Bán khi giá TRÊN/DƯỚI mức ngưỡng
- **Smart Trade AI**: Phân tích chiến lược giao dịch bằng ngôn ngữ tự nhiên
  - Hỗ trợ các chỉ số: PRICE, RSI, VOLUME, MA, SENTIMENT, GAS
  - Ví dụ: "Buy BTC if price is below 60000 and RSI is under 30"
- **Live Strategy Monitoring**: Theo dõi trigger đang hoạt động
- **Email Notifications**: Gửi thông báo khi thực thi giao dịch
- **Trade History**: Lịch sử giao dịch chi tiết

### 5. **Web3 Integration**
- Kết nối **MetaMask** để xem số dư ETH
- **Multi-Chain Support**:
  - Ethereum Mainnet
  - Sepolia Testnet
  - Binance Smart Chain (BSC)
  - Polygon
  - Avalanche C-Chain
- **Transaction Agent**: Tạo giao dịch SEND/SWAP từ lệnh tự nhiên
  - Ví dụ: "Send 1 ETH to 0x123..." hoặc "Swap 1 BNB to USDT on BSC"
- Tự động thêm mạng vào MetaMask nếu chưa có

### 6. **Giao Diện Neo-Brutalist**
- Thiết kế độc đáo với đường viền đậm, shadow offset
- **Dark Mode / Light Mode**
- **Responsive Design**: Tương thích mobile, tablet, desktop
- **Snow Effect**: Hiệu ứng tuyết rơi (Giáng Sinh)
- **Landing Page**: Giới thiệu sản phẩm với HeroSection, Features, FAQ, Footer

---

## 🛠️ Công Nghệ Sử Dụng

### **Frontend**
- **React 19.2.0** với **TypeScript**
- **Vite 6.2.0** (Build tool siêu nhanh)
- **Tailwind CSS** (Utility-first CSS via CDN)
- **Recharts 3.4.1**: Thư viện biểu đồ
- **Lucide React 0.554.0**: Icon library

### **AI & API**
- **Google Gemini 2.5 Flash** (`@google/genai ^1.30.0`)
  - Structured Output với JSON Schema
  - Intent Classification
  - Market Analysis
  - Smart Trade Parsing
- **CoinGecko API**: Dữ liệu giá và thông tin coin
- **Binance Futures API**: Long/Short Ratio
- **Alternative.me**: Fear & Greed Index

### **Web3**
- **Ethers.js 6.13.2**: Tương tác với blockchain
- **MetaMask**: Provider cho Ethereum

### **Other**
- **Three.js 3.181.2**: (Dự phòng cho 3D effects)

---

## 📂 Cấu Trúc Thư Mục

```
final-hackathon-15-1/
├── components/                    # React Components
│   ├── layout/                    # Header, Sidebar
│   ├── landing/                   # Landing Page Sections
│   ├── chat/                      # Chat UI (MessageItem, InputArea)
│   ├── trading/                   # Auto-Trading Components
│   ├── profile/                   # Portfolio Management
│   ├── charts/                    # Recharts Components
│   ├── modals/                    # WalletModal
│   └── ui/                        # LoadingIndicator, SnowEffect
├── services/                      # Business Logic
│   ├── agents/                    # AI Agents
│   │   ├── chatAgent.ts          # Intent Detection + Chat
│   │   ├── marketAgent.ts        # Market Analysis
│   │   ├── portfolioAgent.ts     # Portfolio Analysis
│   │   ├── transactionAgent.ts   # Web3 Transaction Parser
│   │   ├── smartTradeAgent.ts    # Smart Trade Strategy Parser
│   │   └── visionAgent.ts        # (Placeholder)
│   ├── data/                      # Data Sources
│   │   ├── marketData.ts         # CoinGecko, Binance, Sentiment API
│   │   └── mockDataSources.ts    # (Unused)
│   ├── client.ts                  # Gemini AI Client
│   ├── web3Service.ts             # MetaMask + Multi-Chain
│   ├── binanceService.ts          # (Empty)
│   └── geminiService.ts           # (Empty)
├── hooks/                         # Custom React Hooks
│   └── usePaperTrading.ts        # Paper Trading Logic
├── App.tsx                        # Main Application Component
├── index.tsx                      # React Entry Point
├── types.ts                       # TypeScript Type Definitions
├── vite.config.ts                 # Vite Configuration
├── tsconfig.json                  # TypeScript Configuration
├── package.json                   # Dependencies
├── metadata.json                  # Gemini AI Demo Metadata
└── index.html                     # HTML Template with Tailwind
```

---

## 🧩 Kiến Trúc Chi Tiết

### **1. App.tsx - Core Application**
- Quản lý state toàn ứng dụng:
  - `currentView`: landing | chat | profile | auto-trade
  - `sessions`: Danh sách chat sessions
  - `userProfile`: Thông tin người dùng và portfolio
  - `theme`: dark/light mode
- Tích hợp `usePaperTrading` hook
- Router giữa các view
- Xử lý chat flow với AI agents

### **2. AI Agents (services/agents/)**

#### **a) chatAgent.ts**
- `determineIntent()`: Phân loại ý định người dùng
  - ANALYZE: Phân tích coin mới
  - PORTFOLIO_ANALYSIS: Phân tích danh mục
  - TRANSACTION: Tạo giao dịch Web3
  - CHAT: Trò chuyện tự do
- `chatWithModel()`: Chat AI với context awareness

#### **b) marketAgent.ts**
- `analyzeCoin(coinName)`: Phân tích coin chi tiết
  1. Search coin trên CoinGecko
  2. Fetch dữ liệu song song: Price, Sentiment, Long/Short
  3. Gửi đến Gemini để tạo structured output với schema
  4. Trả về `CryptoData` object
- `generateMarketReport()`: Tạo báo cáo phân tích chuyên sâu

#### **c) portfolioAgent.ts**
- `analyzePortfolio()`: Phân tích danh mục đầu tư
  - Tính toán P&L, allocation, total value
  - Đánh giá rủi ro
  - Gợi ý rebalancing

#### **d) transactionAgent.ts**
- `createTransactionPreview()`: Parse lệnh giao dịch
  - Type: SEND | SWAP
  - Extract: token, amount, address, network
  - Chuẩn hóa tên mạng (Ethereum Mainnet, BSC, Polygon, v.v.)

#### **e) smartTradeAgent.ts**
- `parseSmartTrade()`: Parse chiến lược giao dịch từ ngôn ngữ tự nhiên
  - Trích xuất: symbol, action (BUY/SELL), amount, conditions
  - Hỗ trợ metrics: PRICE, RSI, VOLUME, MA, SENTIMENT, GAS
  - Operators: GT (>), LT (<)

### **3. Data Layer (services/data/marketData.ts)**
- `searchCoinGecko()`: Tìm kiếm coin
- `getPriceAction()`: Lấy lịch sử giá 7 ngày
- `getSentiment()`: Lấy Fear & Greed Index
- `getLongShortRatio()`: Lấy tỷ lệ Long/Short từ Binance
- `updatePortfolioRealTime()`: Cập nhật giá real-time cho portfolio

### **4. Web3 Service (services/web3Service.ts)**
- `connectToMetaMask()`: Kết nối ví MetaMask
- `sendTransaction()`: Gửi giao dịch với multi-chain support
  - Tự động switch network
  - Tự động add network nếu chưa có
- `formatAddress()`: Format địa chỉ ngắn gọn (0x1234...5678)
- **CHAIN_CONFIGS**: Config cho 5 networks

### **5. Paper Trading Hook (hooks/usePaperTrading.ts)**
- State: `wallet`, `triggers`, `trades`, `marketPrices`
- `addTrigger()`: Thêm trigger mới
- `cancelTrigger()`: Hủy trigger
- `executeTrigger()`: Thực thi giao dịch
- `updateBalance()`: Nạp/rút USDT
- **Auto-execution**: Kiểm tra giá mỗi 10 giây, tự động thực thi trigger khi đạt điều kiện
- **Email notification**: Console log thông báo khi thực thi

---

## 📊 Type Definitions (types.ts)

### **Core Types**
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text?: string;
  data?: CryptoData;               // Market Dashboard
  transactionData?: TransactionData; // Web3 Tx
  portfolioAnalysis?: PortfolioAnalysisResult; // Portfolio Card
}

interface CryptoData {
  coinName: string;
  symbol: string;
  currentPrice: number;
  summary: string;
  priceHistory: PricePoint[];
  tokenomics: TokenDistribution[];
  sentimentScore: number;
  longShortRatio: LongShortData[];
  projectScores: ProjectMetric[];
}

interface PortfolioItem {
  symbol: string;
  name: string;
  amount: number;
  avgPrice: number;
  currentPrice: number;
}

interface TradeTrigger {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  amount: number;
  type: 'BUY' | 'SELL';
  status: 'ACTIVE' | 'EXECUTED' | 'CANCELLED';
  smartConditions?: SmartCondition[]; // For Smart Trade
}

interface SmartCondition {
  metric: 'PRICE' | 'RSI' | 'VOLUME' | 'MA' | 'SENTIMENT' | 'GAS';
  operator: 'GT' | 'LT';
  value: number;
  description: string;
}
```

---

## 🎨 UI Components

### **Landing Page**
- **HeroSection**: Hero với CTA button
- **StatsSection**: Thống kê số lượng người dùng, giao dịch
- **TechTicker**: Ticker hiển thị công nghệ sử dụng
- **HowItWorks**: Hướng dẫn sử dụng 3 bước
- **TerminalPreview**: Preview giao diện chat
- **FeatureGrid**: 6 tính năng chính
- **FAQSection**: Câu hỏi thường gặp
- **Footer**: Footer với social links

### **Chat View**
- **MessageItem**: Hiển thị tin nhắn với avatar, text, data cards
- **InputArea**: Input với suggested prompts
- **LoadingIndicator**: Loading spinner với status text
- **CryptoDashboard**: Dashboard hiển thị 6 biểu đồ
- **TransactionCard**: Card preview giao dịch Web3
- **PortfolioAnalysisCard**: Card phân tích portfolio

### **Profile View**
- **ProfileHeader**: Header với refresh button
- **ProfileStats**: Thống kê tổng quan với wallet info
- **AllocationChart**: Pie chart phân bổ tài sản
- **HoldingsChart**: Bar chart giá trị nắm giữ
- **PortfolioTable**: Bảng chi tiết portfolio

### **Auto-Trade View**
- **PaperWallet**: Hiển thị số dư + nạp/rút
- **TriggerForm**: Form tạo trigger thủ công
- **SmartTriggerSection**: Form AI parsing chiến lược
- **ActiveTriggers**: Danh sách trigger đang hoạt động
- **LiveStrategyCard**: Monitoring card cho từng trigger
- **TradeHistory**: Lịch sử giao dịch

### **Layout**
- **Header**: Top navigation với theme toggle, wallet button
- **Sidebar**: Sidebar với chat sessions

---

## 🔧 Configuration Files

### **vite.config.ts**
- Server port: 3000
- API Key injection: `GEMINI_API_KEY` -> `process.env.API_KEY`
- Alias: `@/` -> project root

### **tsconfig.json**
- Target: ES2022
- Module: ESNext
- JSX: react-jsx
- Types: node

### **index.html**
- Tailwind CSS via CDN
- Custom Tailwind config:
  - Neo-brutalist colors
  - Custom shadows (neo, neo-dark, neo-lime)
  - Custom animations (page-enter, blink, progress-stripes)
  - Font: Space Grotesk, Space Mono

---

## 🚀 Cách Chạy Dự Án

### **1. Cài Đặt Dependencies**
```bash
npm install
```

### **2. Tạo File .env**
Tạo file `.env` ở root project:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

### **3. Chạy Development Server**
```bash
npm run dev
```
Ứng dụng sẽ chạy tại: http://localhost:3000

### **4. Build Production**
```bash
npm run build
```

### **5. Preview Production Build**
```bash
npm run preview
```

---

## 🧪 Các Tính Năng Đặc Biệt

### **1. Smart Scroll Logic**
- Tự động scroll xuống khi có tin nhắn mới (chỉ khi user ở gần cuối trang)
- Luôn scroll khi user gửi tin nhắn

### **2. Session Management**
- Tự động đổi tên session từ "New Chat" thành preview tin nhắn đầu tiên
- Lưu trữ toàn bộ lịch sử chat
- Delete session với confirmation

### **3. Real-Time Price Updates**
- Auto-refresh portfolio prices khi vào Profile view
- Paper trading monitor giá mỗi 10 giây
- Market prices display trên UI

### **4. Multi-Network Web3**
- Detect mạng hiện tại
- Tự động switch mạng
- Tự động add mạng vào MetaMask nếu chưa có
- Support 5 networks phổ biến

### **5. AI Structured Output**
- Sử dụng JSON Schema với Gemini
- Validate output format
- Temperature = 0.2 cho độ chính xác cao

---

## 📈 Flow Hoạt Động

### **Chat Flow**
1. User nhập tin nhắn
2. `determineIntent()` phân loại ý định
3. Dựa vào intent, gọi agent tương ứng:
   - ANALYZE → `analyzeCoin()` + `generateMarketReport()`
   - PORTFOLIO_ANALYSIS → `analyzePortfolio()`
   - TRANSACTION → `createTransactionPreview()`
   - CHAT → `chatWithModel()`
4. Render kết quả (text + data cards)

### **Auto-Trade Flow**
1. User tạo trigger (manual hoặc smart)
2. `usePaperTrading` lưu trigger vào state
3. Hook chạy interval mỗi 10s để check giá
4. Nếu điều kiện đạt → `executeTrade()`
   - Cập nhật wallet balance
   - Thêm vào trade history
   - Xóa trigger
   - Log email notification

### **Web3 Transaction Flow**
1. User nhập lệnh: "Send 1 ETH to 0x..."
2. `transactionAgent` parse thành `TransactionData`
3. UI hiển thị `TransactionCard` với preview
4. User click "Execute" → `sendTransaction()`
   - Switch network (nếu cần)
   - Add network (nếu chưa có)
   - Gửi transaction qua MetaMask

---

## 🎯 Các Agent AI

| Agent | Mô Tả | Input | Output |
|-------|-------|-------|--------|
| **chatAgent** | Intent classification + chat | User message + history | Intent type hoặc chat response |
| **marketAgent** | Phân tích coin + tạo report | Coin name | CryptoData + Report text |
| **portfolioAgent** | Phân tích portfolio | PortfolioItem[] | PortfolioAnalysisResult |
| **transactionAgent** | Parse giao dịch Web3 | User command | TransactionData |
| **smartTradeAgent** | Parse chiến lược giao dịch | Natural language strategy | SmartTradePlan |

---

## 🌐 API Endpoints Sử Dụng

### **CoinGecko**
- `https://api.coingecko.com/api/v3/search` - Tìm kiếm coin
- `https://api.coingecko.com/api/v3/coins/{id}/market_chart` - Lịch sử giá
- `https://api.coingecko.com/api/v3/simple/price` - Giá hiện tại

### **Binance Futures**
- `https://fapi.binance.com/futures/data/globalLongShortAccountRatio` - Long/Short Ratio

### **Alternative.me**
- `https://api.alternative.me/fng/?limit=1` - Fear & Greed Index

### **Google Gemini**
- Model: `gemini-2.5-flash`
- Endpoint: Qua `@google/genai` SDK

---

## 🎨 Design System

### **Colors**
- **Primary**: `#8b5cf6` (Violet)
- **Secondary**: `#a3e635` (Lime)
- **Accent**: `#f472b6` (Pink)
- **Yellow**: `#fcd34d`
- **Black**: `#000000`
- **White**: `#ffffff`
- **Dark BG**: `#050505` / `#1a1a1a`

### **Shadows**
- `shadow-neo`: 4px 4px 0px black
- `shadow-neo-dark`: 4px 4px 0px white (dark mode)
- `shadow-neo-lime`: 4px 4px 0px lime

### **Fonts**
- **Sans**: Space Grotesk, Inter
- **Mono**: Space Mono, Courier New

---

## 🐛 Known Issues & Limitations

1. **CoinGecko Rate Limit**: API free tier có giới hạn request
2. **Binance Long/Short**: Không phải tất cả coin đều có trên Binance Futures
3. **Paper Trading**: Chỉ là simulation, không kết nối sàn thật
4. **MetaMask Only**: Hiện tại chỉ hỗ trợ MetaMask (Phantom, Coinbase Wallet coming soon)
5. **Email Notifications**: Hiện tại chỉ console.log, chưa thực sự gửi email

---

## 🔐 Security Notes

- **API Key**: Đừng commit file `.env` lên Git
- **Private Key**: Không bao giờ lưu private key trong code
- **MetaMask**: Luôn verify transaction trước khi sign
- **Network Switch**: User phải approve trong MetaMask

---

## 🚀 Future Enhancements

1. **Real Exchange Integration**: Kết nối Binance/Coinbase API
2. **Email Service**: Tích hợp SendGrid/Mailgun
3. **More Wallets**: Phantom (Solana), Coinbase Wallet, WalletConnect
4. **Advanced Charts**: TradingView full integration
5. **Mobile App**: React Native version
6. **Social Trading**: Copy trading từ top traders
7. **Backtesting**: Test chiến lược với dữ liệu lịch sử
8. **Voice Input**: Chat bằng giọng nói

---

## 📝 Dependencies Summary

```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "@google/genai": "^1.30.0",
    "ethers": "6.13.2",
    "recharts": "^3.4.1",
    "lucide-react": "^0.554.0",
    "three": "^0.181.2"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "@vitejs/plugin-react": "^5.0.0",
    "typescript": "~5.8.2",
    "vite": "^6.2.0"
  }
}
```

---

## 👨‍💻 Về Dự Án

Đây là dự án **Hackathon 15/1** - một demo showcase khả năng của **Gemini 2.5 Flash** trong việc xây dựng ứng dụng Crypto Trading Platform với AI.

### **Highlights**
- ✅ 100% TypeScript
- ✅ Responsive Design
- ✅ Real-time Data
- ✅ AI-Powered Analysis
- ✅ Web3 Integration
- ✅ Neo-Brutalist UI
- ✅ Paper Trading System

---

## 📞 Support & Contact

Nếu có câu hỏi hoặc gặp vấn đề, vui lòng tạo issue trên GitHub repo.

---

## 📜 License

MIT License - Free to use for personal and commercial projects.

---

**Built with ❤️ using Gemini 2.5 Flash AI**

🌟 **Star this repo if you find it helpful!** 🌟
