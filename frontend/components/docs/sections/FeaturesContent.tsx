import React from 'react';
import { FeatureBlock } from '../DocHelpers';

export const FeaturesContent = () => (
    <div className="space-y-6">
        <FeatureBlock title="🧠 AI Chat Agent (Gemini 2.5 Flash)">
            <ul className="list-disc ml-5 space-y-2">
                <li><strong>Intent Classification:</strong> Automatically classifies user intent (ANALYZE, PORTFOLIO, TRANSACTION).</li>
                <li><strong>Market Analysis:</strong> Real-time coin analysis using CoinGecko data.</li>
                <li><strong>Transaction Agent:</strong> Parses natural language into Web3 transaction previews.</li>
                <li><strong>Smart Trade Agent:</strong> Converts chat instructions into executable trading strategies.</li>
            </ul>
        </FeatureBlock>

        <FeatureBlock title="📊 Market Analysis Dashboard">
            <ul className="list-disc ml-5 space-y-2">
                <li><strong>Price Charts:</strong> 7-day history from CoinGecko.</li>
                <li><strong>Sentiment:</strong> Fear & Greed Index integration.</li>
                <li><strong>Project Score:</strong> AI-evaluated scores for Security, Decentralization, and Scalability.</li>
            </ul>
        </FeatureBlock>

        <FeatureBlock title="🤖 Auto-Trading System">
            <ul className="list-disc ml-5 space-y-2">
                <li><strong>Simple Triggers:</strong> Execute when price hits ABOVE/BELOW targets.</li>
                <li><strong>Smart Triggers:</strong> Complex conditions (RSI, MA, Volume, Sentiment).</li>
                <li><strong>Auto-Executor:</strong> Backend worker checks triggers every 10s and executes on-chain.</li>
            </ul>
        </FeatureBlock>

        <FeatureBlock title="💼 Contract Wallet (Smart Account)">
            <ul className="list-disc ml-5 space-y-2">
                <li>Each user gets a deployed <strong>Smart CA Wallet</strong>.</li>
                <li>Funds are held on-chain, not in a centralized database.</li>
                <li>Supports <strong>Native MNT</strong> and <strong>ERC20 tokens (USDC)</strong>.</li>
            </ul>
        </FeatureBlock>
    </div>
);
