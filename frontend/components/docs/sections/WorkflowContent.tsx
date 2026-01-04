import React from 'react';

export const WorkflowContent = () => (
    <div className="space-y-6">
        <h3 className="text-2xl font-black uppercase">Smart Trade Execution Flow</h3>
        <p className="text-gray-600 dark:text-gray-300">How a natural language command becomes an on-chain transaction.</p>

        <div className="bg-gray-100 dark:bg-gray-900 p-6 border-2 border-black font-mono text-xs md:text-sm overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
            {`User Input: "Buy ETH if RSI < 30 and price below 3000"
            │
            ▼
┌─────────────────────┐       ┌─────────────────────┐
│  Smart Trade Agent  │──────►│   Parsed Strategy   │
└─────────────────────┘       └─────────────────────┘
                                        │
┌─────────────────────┐       ┌─────────────────────┐
│    Auto-Executor    │◄──────│   Backend Trigger   │
│  (Every 10 seconds) │       │   (Save to MySQL)   │
└─────────────────────┘       └─────────────────────┘
            │
            ▼
┌─────────────────────┐
│   Smart Contract    │
│   executeSwap()     │
└─────────────────────┘`}
        </div>
    </div>
);
