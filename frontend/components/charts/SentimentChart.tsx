import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

interface SentimentChartProps {
  score: number;
  theme?: 'light' | 'dark';
}

const SentimentChart: React.FC<SentimentChartProps> = ({ score, theme = 'dark' }) => {
  
  // Determine color based on score (Neo colors)
  let color = '#fcd34d'; // Yellow
  let status = 'Neutral';
  
  if (score <= 30) {
    color = '#f472b6'; // Pink (Fear)
    status = 'Extreme Fear';
  } else if (score >= 70) {
    color = '#a3e635'; // Lime (Greed)
    status = 'Extreme Greed';
  }

  const data = [{ name: 'Sentiment', value: score, fill: color }];
  const bgFill = theme === 'light' ? '#e5e7eb' : '#333';

  return (
    <div className="w-full h-[250px] bg-white dark:bg-[#1e1f20] p-4 flex flex-col items-center justify-center relative">
      <h3 className="text-sm font-black uppercase text-black dark:text-white absolute top-4 left-4 border-b-2 border-black dark:border-white">Market Sentiment</h3>
      
      <div className="w-full h-[180px] relative mt-6">
        <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart 
            cx="50%" 
            cy="70%" 
            innerRadius="70%" 
            outerRadius="100%" 
            barSize={30} 
            data={data} 
            startAngle={180} 
            endAngle={0}
            >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar
                background={{ fill: bgFill }}
                dataKey="value"
                cornerRadius={0} // Sharp edges
            />
            </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute top-[65%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-5xl font-black text-black dark:text-white tracking-tighter" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.2)' }}>{score}</div>
            <div className="text-xs font-bold uppercase bg-black text-white px-2 py-1 mt-1 transform -rotate-2">{status}</div>
        </div>
      </div>
    </div>
  );
};

export default SentimentChart;