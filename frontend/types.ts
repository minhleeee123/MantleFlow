

// Types for the data structure returned by the AI

export interface PricePoint {
    time: string;
    price: number;
}

export interface TokenDistribution {
    name: string;
    value: number;
}

export interface LongShortData {
    time: string;
    long: number;
    short: number;
}

export interface ProjectMetric {
    subject: string;
    A: number; // The score
    fullMark: number; // Always 100 usually
}

export interface CryptoData {
    coinName: string;
    symbol: string; // Added symbol for TradingView (e.g. "BTC")
    currentPrice: number;
    summary: string;
    priceHistory: PricePoint[];
    tokenomics: TokenDistribution[];
    sentimentScore: number; // 0 to 100
    longShortRatio: LongShortData[];
    projectScores: ProjectMetric[];
}

// New Interface for Transaction Agent
export interface TransactionData {
    type: 'SEND' | 'SWAP';
    token?: string; // Source token
    targetToken?: string; // For SWAP (e.g. USDT)
    amount?: number;
    toAddress?: string; // Recipient (required for SEND)
    network?: string;
    summary?: string;
}

// New Interface for Portfolio Analysis
export interface PortfolioPositionAnalysis {
    asset: string;
    amount: number;
    avgPrice: number;
    currentPrice: number;
    currentValue: number;
    pnlPercent: number;
    allocation: number;
}

export interface PortfolioAnalysisResult {
    totalValue: number;
    positions: PortfolioPositionAnalysis[];
    riskAnalysis: string;
    rebalancingSuggestions: string[];
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text?: string;
    data?: CryptoData;
    transactionData?: TransactionData; // Web3 Tx
    portfolioAnalysis?: PortfolioAnalysisResult; // New Field
    isLoading?: boolean;
}

export interface ChatSession {
    id: string;
    title: string;
    date: number; // Timestamp
    messages: ChatMessage[];
}

export interface PortfolioItem {
    symbol: string;
    name: string;
    amount: number;
    avgPrice: number;
    currentPrice: number;
}

// --- SMART TRADE TYPES ---

export type SmartMetricType = 'PRICE' | 'RSI' | 'VOLUME' | 'MA' | 'SENTIMENT' | 'GAS';
export type SmartOperator = 'GT' | 'LT'; // Greater Than, Less Than

export interface SmartCondition {
    metric: SmartMetricType;
    operator: SmartOperator;
    value: number;
    description: string; // Human readable description of this specific condition
}

export interface SmartTradePlan {
    symbol: string;
    action: 'BUY' | 'SELL';
    amount: number; // USD amount
    conditions: SmartCondition[];
    explanation: string;
}

export interface MonitorLog {
    timestamp: string;
    metric: string;
    realValue: string;
    targetValue: string;
    status: 'PASS' | 'FAIL';
    message: string;
}

// --- AUTO TRADING TYPES ---

export type TradeCondition = 'ABOVE' | 'BELOW';
export type TradeType = 'BUY' | 'SELL';

export interface TradeTrigger {
    id: string;
    symbol: string;
    targetPrice: number;
    condition: TradeCondition;
    amount: number; // Amount in USDT for BUY, Amount in Token for SELL
    type: TradeType;
    createdAt: number;
    status: 'ACTIVE' | 'EXECUTED' | 'CANCELLED';
    smartConditions?: SmartCondition[]; // Added for Smart Trade support
}

export interface TradeRecord {
    id: string;
    symbol: string;
    price: number;
    amount: number;
    totalUsd: number;
    type: TradeType;
    status: 'SUCCESS' | 'FAILED'; // Added status
    txHash?: string;
    timestamp: number;
}

export interface PaperWallet {
    usdtBalance: number;
    holdings: Record<string, number>; // symbol -> amount
}
