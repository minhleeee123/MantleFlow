import React from 'react';
import { PortfolioAnalysisResult } from '../types';
import { TrendingUp, TrendingDown, AlertTriangle, PieChart } from 'lucide-react';

interface Props {
  data: PortfolioAnalysisResult;
}

const PortfolioAnalysisCard: React.FC<Props> = ({ data }) => {
  return (
    <div className="w-full bg-white dark:bg-[#1e1f20] border-2 border-black dark:border-white shadow-neo mt-4 animate-fade-in">
      
      {/* Header Summary */}
      <div className="p-5 bg-neo-bg dark:bg-[#2d2e2f] border-b-2 border-black dark:border-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xs font-black text-black dark:text-white uppercase tracking-widest mb-1">Total Value</h3>
          <div className="text-3xl font-black text-black dark:text-white">
            ${data.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="flex items-center gap-2 bg-neo-accent px-3 py-1.5 border-2 border-black shadow-neo-sm transform -rotate-1">
            <PieChart className="w-4 h-4 text-black" strokeWidth={2.5} />
            <span className="text-sm font-bold text-black uppercase">{data.positions.length} Assets</span>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black text-white dark:bg-white dark:text-black text-xs font-bold uppercase tracking-wider">
              <th className="p-4 border-r border-gray-700">Asset</th>
              <th className="p-4 text-right border-r border-gray-700">Alloc %</th>
              <th className="p-4 text-right border-r border-gray-700">Price</th>
              <th className="p-4 text-right border-r border-gray-700">Value</th>
              <th className="p-4 text-right">PnL</th>
            </tr>
          </thead>
          <tbody className="text-sm font-medium">
            {data.positions.map((pos, idx) => {
               const isProfit = pos.pnlPercent >= 0;
               return (
                <tr key={idx} className="border-b-2 border-black dark:border-white last:border-0 hover:bg-yellow-50 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-black dark:text-white border-r-2 border-black dark:border-white">
                    {pos.asset} <span className="text-gray-500 text-xs ml-1 font-mono">x{pos.amount.toLocaleString()}</span>
                  </td>
                  <td className="p-4 text-right border-r-2 border-black dark:border-white">
                    <div className="flex items-center justify-end gap-2">
                        <span className="text-black dark:text-white font-mono">{pos.allocation.toFixed(1)}%</span>
                        <div className="w-12 h-2 bg-gray-200 border border-black rounded-none">
                            <div className="h-full bg-neo-primary" style={{ width: `${pos.allocation}%` }} />
                        </div>
                    </div>
                  </td>
                  <td className="p-4 text-right border-r-2 border-black dark:border-white">
                    <div className="flex flex-col">
                        <span className="text-black dark:text-white font-bold">${pos.currentPrice.toLocaleString()}</span>
                        <span className="text-xs text-gray-500 font-mono">Avg: ${pos.avgPrice.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right font-bold text-black dark:text-white border-r-2 border-black dark:border-white">
                    ${pos.currentValue.toLocaleString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className={`inline-flex items-center gap-1 font-black px-2 py-0.5 border-2 border-black shadow-neo-sm ${isProfit ? 'bg-neo-secondary text-black' : 'bg-neo-accent text-black'}`}>
                        {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {pos.pnlPercent > 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%
                    </div>
                  </td>
                </tr>
               );
            })}
          </tbody>
        </table>
      </div>

      {/* Analysis Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 bg-white dark:bg-[#1a1b1d] border-t-2 border-black dark:border-white">
          {/* Risk */}
          <div className="p-5 border-b-2 md:border-b-0 md:border-r-2 border-black dark:border-white">
              <h4 className="flex items-center gap-2 text-sm font-black text-black dark:text-white uppercase mb-3 bg-neo-yellow w-fit px-2 border border-black">
                  <AlertTriangle className="w-4 h-4" /> Risk Assessment
              </h4>
              <p className="text-sm text-black dark:text-gray-300 leading-relaxed font-medium">
                  {data.riskAnalysis}
              </p>
          </div>
          
          {/* Suggestions */}
          <div className="p-5">
              <h4 className="flex items-center gap-2 text-sm font-black text-black dark:text-white uppercase mb-3 bg-neo-secondary w-fit px-2 border border-black">
                  <TrendingUp className="w-4 h-4" /> Suggestions
              </h4>
              <ul className="space-y-2">
                  {data.rebalancingSuggestions.map((suggestion, i) => (
                      <li key={i} className="flex gap-2 text-sm text-black dark:text-gray-300 font-medium">
                          <span className="text-neo-primary font-black">►</span>
                          {suggestion}
                      </li>
                  ))}
              </ul>
          </div>
      </div>
    </div>
  );
};

export default PortfolioAnalysisCard;