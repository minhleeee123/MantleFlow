import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ProjectMetric } from '../../types';

interface ProjectScoreChartProps {
  data: ProjectMetric[];
  theme?: 'light' | 'dark';
}

const ProjectScoreChart: React.FC<ProjectScoreChartProps> = ({ data, theme = 'dark' }) => {
  const tickColor = theme === 'light' ? '#000' : '#fff';

  return (
    <div className="w-full h-[300px] bg-white dark:bg-[#1e1f20] p-4">
      <h3 className="text-sm font-black uppercase text-black dark:text-white mb-2 border-b-2 border-black dark:border-white inline-block">Project Score</h3>
      <ResponsiveContainer width="100%" height="90%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#000" strokeWidth={1} />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: tickColor, fontSize: 11, fontWeight: 'bold' }} 
            tickFormatter={(value) => value.toString().toUpperCase()}
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Score"
            dataKey="A"
            stroke="black"
            strokeWidth={3}
            fill="#8b5cf6"
            fillOpacity={0.6}
          />
           <Tooltip 
             contentStyle={{ 
                backgroundColor: '#fff', 
                border: '2px solid black', 
                color: 'black', 
                borderRadius: '0px',
                boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)'
             }}
             itemStyle={{ fontWeight: 'bold', color: 'black' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProjectScoreChart;