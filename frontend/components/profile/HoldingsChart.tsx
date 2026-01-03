import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { BarChart3 } from 'lucide-react';

interface HoldingsChartProps {
  data: { name: string; value: number; amount: number }[];
  colors: string[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-black border-2 border-black dark:border-white p-2 shadow-neo-sm">
        <p className="font-black text-sm uppercase mb-1 text-black dark:text-white">{payload[0].payload.name}</p>
        <p className="font-mono text-sm text-black dark:text-white">
          ${payload[0].value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

const HoldingsChart: React.FC<HoldingsChartProps> = ({ data, colors }) => {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] border-2 border-black dark:border-white shadow-neo p-5 flex flex-col h-[350px]">
      <div className="flex items-center justify-between mb-4 border-b-2 border-black dark:border-white pb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-black dark:text-white" />
          <h3 className="font-black text-black dark:text-white uppercase">Holdings Value (USD)</h3>
        </div>
      </div>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#555" vertical={false} opacity={0.3} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#888', fontSize: 12, fontWeight: 'bold' }} 
              axisLine={{ stroke: '#000' }}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip 
                content={<CustomTooltip />} 
                cursor={{fill: 'rgba(128,128,128,0.1)'}} 
            />
            <Bar dataKey="value" fill="#8b5cf6" stroke="black" strokeWidth={2}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HoldingsChart;