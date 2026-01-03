import React from 'react';
import { CryptoData } from '../types';
import PriceChart from './charts/PriceChart';
import TokenomicsChart from './charts/TokenomicsChart';
import SentimentChart from './charts/SentimentChart';
import LongShortChart from './charts/LongShortChart';
import ProjectScoreChart from './charts/ProjectScoreChart';
import { Sparkles } from 'lucide-react';

interface Props {
  data: CryptoData;
  theme?: 'light' | 'dark';
}

const CryptoDashboard: React.FC<Props> = ({ data, theme = 'dark' }) => {
  return (
    <div className="w-full mt-4 space-y-6 animate-fade-in">
      
      {/* Header Summary */}
      <div className="p-6 bg-neo-yellow dark:bg-[#262626] border-2 border-black dark:border-white shadow-neo dark:shadow-neo-lime">
        <div className="flex items-center gap-2 mb-2 border-b-2 border-black dark:border-white pb-2">
          <Sparkles className="w-5 h-5 text-black dark:text-yellow-400" strokeWidth={2.5} />
          <h2 className="text-xl font-black uppercase text-black dark:text-white">{data.coinName} Report</h2>
          <span className="ml-auto text-2xl font-black text-black dark:text-white bg-white dark:bg-black px-2 border-2 border-black dark:border-white transform rotate-2">${data.currentPrice.toLocaleString()}</span>
        </div>
        <p className="text-black dark:text-gray-300 text-base font-medium leading-relaxed mt-4">
          {data.summary}
        </p>
      </div>

      {/* Top Row: Price & Sentiment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 neo-card">
          <PriceChart symbol={data.symbol || "BTC"} theme={theme} />
        </div>
        <div className="md:col-span-1 neo-card">
          <SentimentChart score={data.sentimentScore} theme={theme} />
        </div>
      </div>

      {/* Middle Row: Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="neo-card overflow-hidden">
            <TokenomicsChart data={data.tokenomics} theme={theme} />
        </div>
        <div className="neo-card overflow-hidden">
            <ProjectScoreChart data={data.projectScores} theme={theme} />
        </div>
        <div className="neo-card overflow-hidden">
            <LongShortChart data={data.longShortRatio} theme={theme} />
        </div>
      </div>
    </div>
  );
};

export default CryptoDashboard;