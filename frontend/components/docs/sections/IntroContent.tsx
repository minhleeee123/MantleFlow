import React from 'react';
import { Box, Server, Code, Cpu, Target } from 'lucide-react';
import { InfoCard } from '../DocHelpers';

export const IntroContent = () => (
    <div className="space-y-6">
        <p className="text-lg font-bold leading-relaxed">
            Welcome to the <span className="bg-yellow-200 dark:bg-yellow-900 px-1">MantleFlow</span> documentation.
            This platform combines the power of Generative AI (Gemini 2.5 Flash), decentralized settlement on Mantle Sepolia Network,
            and an automated background execution system to solve the complexity of crypto trading through natural language commands.
        </p>

        <div className="bg-white dark:bg-gray-800 p-6 border-2 border-black dark:border-white shadow-neo">
            <h3 className="text-xl font-black uppercase mb-4">System Overview</h3>
            <div className="bg-gray-100 dark:bg-black p-4 border border-black font-mono text-xs md:text-sm overflow-x-auto whitespace-pre leading-relaxed">
                {`┌─────────────────────────────────────────────────────────────────┐
│                     MantleFlow Platform                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐    │
│  │   Frontend   │  │   Backend    │  │   Smart Contract    │    │
│  │  (React 19)  │◄─┤  (Node.js)   │◄─┤  (Solidity 0.8.20)  │    │
│  │   + Gemini AI│  │  + Prisma ORM│  │  + Wallet Factory   │    │
│  │   + Ethers.js│  │  + MySQL DB  │  │  + Agni DEX Router  │    │
│  └──────────────┘  └──────────────┘  └─────────────────────┘    │
│         │                 │                      │               │
│         └─────────────────┴──────────────────────┘               │
│                    Mantle Sepolia Testnet                        │
└─────────────────────────────────────────────────────────────────┘`}
            </div>
        </div>

        <div className="bg-neo-accent p-5 border-2 border-black shadow-neo">
            <h3 className="text-lg font-black uppercase mb-3 flex items-center gap-2"><Target className="w-5 h-5" /> What Makes This Unique?</h3>
            <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                    <span className="font-black text-lg">•</span>
                    <span><strong>Smart Account Abstraction:</strong> Each user deploys their own non-custodial smart wallet via Factory pattern (EIP-1167 Clones)</span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="font-black text-lg">•</span>
                    <span><strong>AI-Powered Trading:</strong> Convert natural language to executable on-chain strategies using Gemini 2.5 Flash</span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="font-black text-lg">•</span>
                    <span><strong>Background Automation:</strong> Auto-Executor worker monitors triggers every 10 seconds and executes swaps when conditions are met</span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="font-black text-lg">•</span>
                    <span><strong>Multi-DEX Integration:</strong> Swaps executed on Agni Finance (Uniswap V3 fork) on Mantle Network</span>
                </li>
            </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard title="Frontend" icon={Box}>
                React 19 with Vite. Features Neo-brutalist UI, real-time market charts (Recharts), MetaMask integration, and AI chat interface powered by Gemini SDK.
            </InfoCard>
            <InfoCard title="Backend" icon={Server}>
                Node.js/Express server with Prisma ORM (MySQL). Handles JWT auth, trigger CRUD, and auto-executor worker. Ethers.js for blockchain interactions.
            </InfoCard>
            <InfoCard title="Smart Contracts" icon={Code}>
                WalletFactory deploys TradingWallet clones (EIP-1167). Each wallet supports deposits, withdrawals, and generic executeCall() for swaps via operator.
            </InfoCard>
            <InfoCard title="AI Agents" icon={Cpu}>
                Gemini 2.5 Flash powers multiple agents: Market Analysis, Portfolio Evaluation, Transaction Parsing, and Smart Trade Strategy Generation.
            </InfoCard>
        </div>

        <div className="bg-gray-100 dark:bg-gray-900 p-4 border-l-4 border-blue-500">
            <p className="text-sm">
                <strong>Network:</strong> Mantle Sepolia (Chain ID: 5003) •
                <strong className="ml-2">RPC:</strong> https://rpc.sepolia.mantle.xyz •
                <strong className="ml-2">Explorer:</strong> https://explorer.sepolia.mantle.xyz
            </p>
        </div>
    </div>
);
