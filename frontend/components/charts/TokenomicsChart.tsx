import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { TokenDistribution } from '../../types';

interface TokenomicsChartProps {
  data: TokenDistribution[];
  theme?: 'light' | 'dark';
}

// Neobrutalist Palette
const COLORS = ['#8b5cf6', '#a3e635', '#f472b6', '#fcd34d', '#000000'];

const TokenomicsChart: React.FC<TokenomicsChartProps> = ({ data, theme = 'dark' }) => {
  return (
    <div className="w-full h-[300px] bg-white dark:bg-[#1e1f20] p-4 flex flex-col">
      <h3 className="text-sm font-black uppercase text-black dark:text-white mb-2 border-b-2 border-black dark:border-white pb-1 inline-block w-full">Tokenomics</h3>
      
      <div className="flex items-center flex-1 w-full min-h-0">
        {/* Chart Section */}
        <div className="w-[55%] h-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie
                    data={data as any}
                    cx="50%"
                    cy="50%"
                    innerRadius="50%"
                    outerRadius="80%"
                    paddingAngle={2}
                    dataKey="value"
                    stroke="black"
                    strokeWidth={2}
                >
                    {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '2px solid black', 
                        color: 'black', 
                        borderRadius: '0px',
                        boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)'
                    }}
                    itemStyle={{ color: 'black', fontWeight: 'bold' }}
                    formatter={(val: number) => [`${val}%`, 'Allocation']}
                />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <span className="text-xs font-black bg-black text-white px-1">DIST</span>
            </div>
        </div>

        {/* Custom Legend Section */}
        <div className="w-[45%] flex flex-col justify-center pl-4 space-y-3 overflow-y-auto max-h-full py-2 custom-scrollbar">
            {data.map((item, index) => (
                <div key={index} className="flex items-center gap-2 group">
                    <div 
                        className="w-4 h-4 border-2 border-black shrink-0 hover:translate-x-0.5 hover:translate-y-0.5 transition-transform" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                    />
                    <div className="flex flex-col min-w-0">
                         <span className="text-xs font-bold text-black dark:text-white leading-tight truncate w-full uppercase" title={item.name}>
                            {item.name}
                         </span>
                         <span className="text-xs text-gray-600 dark:text-gray-400 font-mono font-bold bg-gray-100 dark:bg-gray-800 px-1 border border-black dark:border-white w-fit">{item.value}%</span>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default TokenomicsChart;