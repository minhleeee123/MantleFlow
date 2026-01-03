import React from 'react';

const TECHS = ["GEMINI 2.5 FLASH", "ETHEREUM", "SOLIDITY", "TAILWIND CSS", "REACT 19", "WEB3.JS", "RECHARTS", "LUCIDE UI"];

const TechTicker: React.FC = () => {
  return (
    <div className="w-full bg-neo-yellow border-b-2 border-black overflow-hidden py-4 relative z-20 shrink-0">
      <div className="flex whitespace-nowrap animate-marquee items-center">
        {[...TECHS, ...TECHS, ...TECHS, ...TECHS].map((tech, i) => (
            <div key={i} className="flex items-center mx-8">
                <span className="text-lg md:text-xl font-black text-black uppercase tracking-widest">{tech}</span>
                <span className="ml-12 w-2 h-2 md:w-3 md:h-3 bg-black transform rotate-45"></span>
            </div>
        ))}
      </div>
      <style>{`
        .animate-marquee {
            animation: marquee 30s linear infinite;
        }
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default TechTicker;