import React from 'react';
import { Wallet, TrendingUp, TrendingDown, Link2 } from 'lucide-react';
import { PortfolioItem } from '../../types';

interface PortfolioTableProps {
  portfolio: PortfolioItem[];
  walletAddress: string | null;
}

const PortfolioTable: React.FC<PortfolioTableProps> = ({ portfolio, walletAddress }) => {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] border-2 border-black dark:border-white shadow-neo overflow-hidden rounded-xl">
      <div className="p-4 bg-neo-bg dark:bg-[#2d2e2f] border-b-2 border-black dark:border-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-black dark:text-white" strokeWidth={2.5} />
          <h3 className="text-lg font-black text-black dark:text-white uppercase">Assets Breakdown</h3>
        </div>
        {walletAddress && (
          <span className="text-[10px] font-black uppercase bg-orange-100 text-orange-800 px-2 py-1 border border-orange-800 rounded-md">
            Web3 Connected
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black text-white dark:bg-white dark:text-black text-xs font-black uppercase tracking-wider">
              <th className="p-4 border-r border-gray-700 dark:border-gray-300">Asset</th>
              <th className="p-4 text-right border-r border-gray-700 dark:border-gray-300">Balance</th>
              <th className="p-4 text-right border-r border-gray-700 dark:border-gray-300">Market Price</th>
              <th className="p-4 text-right border-r border-gray-700 dark:border-gray-300">Value (USD)</th>
              <th className="p-4 text-right">Performance</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-gray-100 dark:divide-white/10">
            {portfolio.map((coin, idx) => {
              const value = coin.amount * coin.currentPrice;
              const pnlPercent = coin.avgPrice > 0 ? ((coin.currentPrice - coin.avgPrice) / coin.avgPrice) * 100 : 0;
              const isProfit = pnlPercent >= 0;
              const isWeb3 = coin.name.includes("(Wallet)");

              return (
                <tr key={idx} className="hover:bg-yellow-50 dark:hover:bg-white/5 transition-colors group">
                  <td className="p-4 border-r-2 border-transparent group-hover:border-black dark:group-hover:border-white/20 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 border-2 border-black flex items-center justify-center text-sm font-black text-black rounded-lg ${isWeb3 ? 'bg-orange-400' : 'bg-gray-200'}`}>
                        {coin.symbol[0]}
                      </div>
                      <div>
                        <div className="font-bold text-black dark:text-white flex items-center gap-1 uppercase">
                          {coin.name.replace(" (Wallet)", "")}
                          {isWeb3 && <Link2 className="w-3 h-3 text-orange-500" />}
                        </div>
                        <div className="text-xs font-mono text-gray-500">{coin.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-gray-700 dark:text-gray-300">
                    {coin.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-gray-700 dark:text-gray-300">
                    ${coin.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-right font-mono font-black text-black dark:text-white">
                    ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-right">
                    {coin.avgPrice > 0 ? (
                      <div className={`inline-flex items-center gap-1 px-2 py-1 border-2 border-black shadow-neo-sm font-black text-xs uppercase rounded-md ${isProfit ? 'bg-neo-secondary text-black' : 'bg-neo-accent text-black'}`}>
                        {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {pnlPercent > 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs font-black uppercase">N/A</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PortfolioTable;