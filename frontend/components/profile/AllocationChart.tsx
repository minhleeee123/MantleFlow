import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

interface AllocationChartProps {
  data: { name: string; value: number }[];
  colors: string[];
  totalBalance: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-black border-2 border-black dark:border-white p-2 shadow-neo-sm rounded-lg">
        <p className="font-black text-sm uppercase mb-1 text-black dark:text-white">{payload[0].name}</p>
        <p className="font-mono text-sm text-black dark:text-white">
          ${payload[0].value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

const AllocationChart: React.FC<AllocationChartProps> = ({ data, colors, totalBalance }) => {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] border-2 border-black dark:border-white shadow-neo p-5 flex flex-col h-[350px] rounded-xl">
      <div className="flex items-center justify-between mb-4 border-b-2 border-black dark:border-white pb-2">
        <div className="flex items-center gap-2">
          <PieIcon className="w-5 h-5 text-black dark:text-white" />
          <h3 className="font-black text-black dark:text-white uppercase">Asset Allocation</h3>
        </div>
      </div>
      <div className="flex-1 w-full min-h-0 flex gap-4">
        <div className="w-3/5 h-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="black"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-xs font-black bg-black text-white px-1">PORTFOLIO</span>
          </div>
        </div>
        <div className="w-2/5 flex flex-col justify-center gap-2 overflow-y-auto custom-scrollbar pr-2">
          {data.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 border border-black shrink-0" style={{ backgroundColor: colors[index % colors.length] }}></div>
              <div className="min-w-0">
                <div className="text-xs font-black text-black dark:text-white truncate">{entry.name}</div>
                <div className="text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400">
                  {totalBalance > 0 ? ((entry.value / totalBalance) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllocationChart;