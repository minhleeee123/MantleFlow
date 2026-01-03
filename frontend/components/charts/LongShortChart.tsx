import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LongShortData } from '../../types';

interface LongShortChartProps {
  data: LongShortData[];
  theme?: 'light' | 'dark';
}

const LongShortChart: React.FC<LongShortChartProps> = ({ data, theme = 'dark' }) => {
  const isLight = theme === 'light';
  const gridColor = isLight ? '#000' : '#555';
  const tickColor = isLight ? '#000' : '#fff';

  return (
    <div className="w-full h-[250px] bg-white dark:bg-[#1e1f20] p-4">
      <h3 className="text-sm font-black uppercase text-black dark:text-white mb-4 border-b-2 border-black dark:border-white inline-block">Long/Short Ratio</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} barSize={25}>
          <CartesianGrid strokeDasharray="0" stroke={gridColor} vertical={false} strokeWidth={1} />
          <XAxis 
            dataKey="time" 
            tick={{ fill: tickColor, fontSize: 12, fontWeight: 'bold' }} 
            axisLine={{ stroke: gridColor, strokeWidth: 2 }}
            tickLine={{ stroke: gridColor, strokeWidth: 2 }}
          />
          <YAxis hide />
          <Tooltip 
             cursor={{fill: 'rgba(0,0,0,0.1)'}}
             contentStyle={{ 
                 backgroundColor: '#fff', 
                 border: '2px solid black', 
                 color: 'black', 
                 borderRadius: '0px',
                 boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)'
             }}
             itemStyle={{ fontWeight: 'bold' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', color: tickColor, fontWeight: 'bold', textTransform: 'uppercase' }}/>
          <Bar dataKey="long" stackId="a" fill="#a3e635" name="Longs" stroke="black" strokeWidth={2} />
          <Bar dataKey="short" stackId="a" fill="#f472b6" name="Shorts" stroke="black" strokeWidth={2} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LongShortChart;