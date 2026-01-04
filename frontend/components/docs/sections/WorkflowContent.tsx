import React from 'react';

export const WorkflowContent = () => (
    <div className="space-y-10">
        {/* User Registration & Wallet Deployment */}
        <div>
            <h3 className="text-2xl font-black uppercase mb-3 border-l-4 border-blue-500 pl-3">1. User Registration & Smart Wallet Deployment</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">How a new user onboards and gets their non-custodial trading wallet.</p>
            <div className="bg-gray-100 dark:bg-gray-900 p-6 border-2 border-black font-mono text-xs md:text-sm overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
                {`User connects MetaMask
        │
        ▼
┌──────────────────────────┐
│  Frontend: Request       │
│  personal_sign()         │
└──────────┬───────────────┘
           │ Signature
           ▼
┌──────────────────────────┐       ┌─────────────────────────┐
│  Backend: Verify with    │──────►│  Create/Find User in DB │
│  ethers.verifyMessage()  │       │  Issue JWT Token        │
└──────────────────────────┘       └────────┬────────────────┘
                                            │
                                            ▼
                                   ┌─────────────────────────┐
                                   │  Frontend: Check if     │
                                   │  Smart Wallet exists    │
                                   └────────┬────────────────┘
                                            │
                         ┌──────────────────┴──────────────────┐
                         │ Not Exists                   Exists │
                         ▼                                     ▼
            ┌──────────────────────────┐         ┌──────────────────────────┐
            │  Call WalletFactory      │         │  Fetch wallet address    │
            │  deployWallet(operator)  │         │  Load balances (USDC,MNT)│
            └──────────┬───────────────┘         └──────────────────────────┘
                       │ TX Hash
                       ▼
            ┌──────────────────────────┐
            │  TradingWallet Clone     │
            │  Created on-chain        │
            │  Owner: User             │
            │  Operator: Backend       │
            └──────────────────────────┘`}
            </div>
        </div>

        {/* Smart Trade Creation (AI-Powered) */}
        <div>
            <h3 className="text-2xl font-black uppercase mb-3 border-l-4 border-green-500 pl-3">2. Smart Trade Trigger Creation (AI-Powered)</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Converting natural language into executable on-chain strategies.</p>
            <div className="bg-gray-100 dark:bg-gray-900 p-6 border-2 border-black font-mono text-xs md:text-sm overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
                {`User Input: "Buy 0.1 ETH when RSI < 30 and price drops below $3000"
            │
            ▼
┌─────────────────────────────────┐
│  MantleFlow AI:              │
│  smartTradeAgent.parseStrategy()│
└──────────────┬──────────────────┘
               │ Structured JSON
               ▼
{
  "action": "BUY",
  "symbol": "ETH",
  "amount": 0.1,
  "amountUnit": "BASE",
  "conditions": [
    {"metric": "RSI", "operator": "LT", "value": 30, "description": "RSI < 30"},
    {"metric": "PRICE", "operator": "LT", "value": 3000, "description": "Price < $3000"}
  ],
  "logic": "AND"
}
               │
               ▼
┌─────────────────────────────────┐
│  Frontend validates & submits   │
│  POST /api/triggers             │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐       ┌────────────────────────┐
│  Backend: Create Trigger record │──────►│  MySQL Database        │
│  - symbol: "ETH"                │       │  - status: "ACTIVE"    │
│  - targetPrice: 3000            │       │  - smartConditions: {} │
│  - smartConditions: [...]       │       └────────────────────────┘
│  - status: "ACTIVE"             │
└─────────────────────────────────┘`}
            </div>
        </div>

        {/* Auto-Executor Workflow */}
        <div>
            <h3 className="text-2xl font-black uppercase mb-3 border-l-4 border-purple-500 pl-3">3. Auto-Executor Background Worker</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Continuous monitoring and automated execution every 10 seconds.</p>
            <div className="bg-gray-100 dark:bg-gray-900 p-6 border-2 border-black font-mono text-xs md:text-sm overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
                {`setInterval(() => {
  ┌────────────────────────────────┐
  │ Fetch all ACTIVE triggers      │
  │ FROM database WHERE status=... │
  └────────────┬───────────────────┘
               │
               ▼
  ┌────────────────────────────────┐
  │ For each trigger:              │
  │ ├─ Simple: Check price vs      │
  │ │    targetPrice (CoinGecko)   │
  │ └─ Smart: Evaluate ALL metrics │
  │      ├─ RSI (calc from history)│
  │      ├─ VOLUME (CoinGecko)     │
  │      ├─ MA (calc from history) │
  │      ├─ SENTIMENT (Alternative)│
  │      └─ GAS (Etherscan)        │
  └────────────┬───────────────────┘
               │
         ┌─────┴─────┐
         │ Condition │
         │   Met?    │
         └─────┬─────┘
               │ YES
               ▼
  ┌────────────────────────────────┐
  │ Execute Swap on Blockchain:    │
  │ 1. Get user's smart wallet     │
  │ 2. (If selling MNT) Wrap MNT   │
  │ 3. Approve Router for token    │
  │ 4. Execute exactInputSingle()  │
  │ 5. Wait for TX confirmation    │
  └────────────┬───────────────────┘
               │ Success
               ▼
  ┌────────────────────────────────┐
  │ Update Database:               │
  │ ├─ Trigger.status = "EXECUTED" │
  │ ├─ Create Execution record     │
  │ │    (SUCCESS, txHash, price)  │
  │ └─ Create Transaction record   │
  └────────────────────────────────┘
}, 10000); // Every 10 seconds`}
            </div>
            <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4">
                <strong>Error Handling:</strong> If swap fails (insufficient balance, network error, etc.), Execution record is created with status="FAILED" and errorMessage. Trigger remains ACTIVE for potential retry in next cycle.
            </div>
        </div>

        {/* Deposit & Withdrawal Flow */}
        <div>
            <h3 className="text-2xl font-black uppercase mb-3 border-l-4 border-orange-500 pl-3">4. Deposit & Withdrawal Flow</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">How users fund and withdraw from their smart wallets.</p>
            <div className="bg-gray-100 dark:bg-gray-900 p-6 border-2 border-black font-mono text-xs md:text-sm overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
                {`┌──────────────────────────┐
│ DEPOSIT (User → Wallet)  │
└──────────────────────────┘
User initiates deposit
        │
        ▼
Frontend builds TX:
  To: smartWalletAddress
  Value: amount (for MNT)
  OR
  Data: USDC.transfer(smartWalletAddress, amount)
        │
        ▼
MetaMask prompts signature
        │ User approves
        ▼
TX sent to Mantle Network
        │ Confirmed
        ▼
┌──────────────────────────┐
│ POST /api/wallet/        │
│   transactions           │
│ {type: "DEPOSIT",        │
│  token: "USDC",          │
│  amount: 100,            │
│  txHash: "0x..."}        │
└──────────────────────────┘

┌──────────────────────────┐
│ WITHDRAW (Wallet → User) │
└──────────────────────────┘
User clicks withdraw
        │
        ▼
Frontend calls:
  smartWallet.withdraw(token, amount)
  ↳ onlyOwner modifier (user must be signer)
        │
        ▼
MetaMask prompts signature
        │ User approves
        ▼
Smart contract transfers:
  - Native: payable(owner).call{value}("")
  - ERC20: IERC20(token).safeTransfer(owner, amount)
        │ Confirmed
        ▼
POST /api/wallet/transactions
  {type: "WITHDRAW", token, amount, txHash}`}
            </div>
        </div>

        {/* Market Analysis Flow */}
        <div>
            <h3 className="text-2xl font-black uppercase mb-3 border-l-4 border-red-500 pl-3">5. AI Market Analysis Flow</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Real-time coin analysis with multi-source data aggregation.</p>
            <div className="bg-gray-100 dark:bg-gray-900 p-6 border-2 border-black font-mono text-xs md:text-sm overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
                {`User: "Analyze Bitcoin market"
        │
        ▼
┌────────────────────────────────────┐
│ MantleFlow AI: classifyIntent()       │
│ Result: "ANALYZE"                  │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│ marketAnalysisAgent.analyze("BTC")│
└────────────┬───────────────────────┘
             │
       Parallel API Calls
             │
    ┌────────┼─────────┬─────────┐
    ▼        ▼         ▼         ▼
┌─────┐ ┌─────┐ ┌──────────┐ ┌──────┐
│Gecko│ │F&G  │ │ Binance  │ │Gemini│
│Price│ │Index│ │L/S Ratio │ │ AI   │
└──┬──┘ └──┬──┘ └────┬─────┘ └──┬───┘
   │       │         │          │
   └───────┴─────────┴──────────┘
             │
             ▼
   ┌────────────────────────┐
   │ Aggregate all data:    │
   │ - Current Price        │
   │ - 7-day Chart          │
   │ - Market Cap, Volume   │
   │ - Fear/Greed Score     │
   │ - Long/Short Ratio     │
   │ - AI Project Score     │
   │ - Tokenomics Chart     │
   └────────┬───────────────┘
            │
            ▼
   ┌────────────────────────┐
   │ Gemini AI generates:   │
   │ - Summary paragraph    │
   │ - Risk assessment      │
   │ - Trading recommendation
   └────────┬───────────────┘
            │
            ▼
   Display rich analysis UI with
   charts, gauges, and text`}
            </div>
        </div>

        {/* Data Flow Summary */}
        <div className="bg-neo-accent p-6 border-2 border-black">
            <h3 className="text-xl font-black uppercase mb-4">Key Workflow Principles</h3>
            <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                    <span className="font-black text-lg">•</span>
                    <span><strong>Non-Custodial Security:</strong> Backend never holds private keys. User signs all withdrawals directly.</span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="font-black text-lg">•</span>
                    <span><strong>Operator Pattern:</strong> Backend can execute trades via <code>executeCall()</code> but cannot withdraw user funds.</span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="font-black text-lg">•</span>
                    <span><strong>Atomic Execution:</strong> All swap steps (wrap, approve, swap) happen in single transaction batch for reliability.</span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="font-black text-lg">•</span>
                    <span><strong>Idempotency:</strong> Trigger execution is one-time. After successful execution, trigger status changes to EXECUTED preventing double-execution.</span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="font-black text-lg">•</span>
                    <span><strong>Full Audit Trail:</strong> Every action (deposit, withdrawal, trade, execution) is logged in database with timestamps and transaction hashes.</span>
                </li>
            </ul>
        </div>
    </div>
);
