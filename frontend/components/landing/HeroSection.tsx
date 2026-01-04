import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onStart?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onStart }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Mouse Parallax Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX - window.innerWidth / 2) / 20,
        y: (e.clientY - window.innerHeight / 2) / 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative border-b-2 border-black dark:border-white w-full flex flex-col shrink-0 overflow-hidden min-h-[700px] justify-center">

      {/* Parallax Background Shapes */}
      <div
        className="absolute top-20 right-10 w-32 h-32 md:w-48 md:h-48 bg-neo-yellow rounded-full border-2 border-black dark:border-white shadow-neo opacity-50 z-0 pointer-events-none transition-transform duration-100 ease-out"
        style={{ transform: `translate(${mousePos.x * -1}px, ${mousePos.y * -1}px)` }}
      ></div>
      <div
        className="absolute bottom-20 left-10 w-24 h-24 md:w-40 md:h-40 bg-neo-accent transform rotate-12 border-2 border-black dark:border-white shadow-neo opacity-60 z-0 pointer-events-none transition-transform duration-100 ease-out"
        style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px) rotate(12deg)` }}
      ></div>
      <div
        className="absolute top-1/2 left-1/4 w-16 h-16 bg-neo-primary border-2 border-black dark:border-white shadow-neo opacity-40 z-0 pointer-events-none transition-transform duration-100 ease-out"
        style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px) rotate(-15deg)` }}
      ></div>

      <div className="container mx-auto px-4 py-20 flex flex-col items-center text-center relative z-10">

        {/* Live Ticker Badge - Updated for Auto-Trade */}
        <div className="mb-8 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 bg-neo-accent text-black px-4 py-2 border-2 border-black transform -rotate-1 shadow-neo-sm hover:rotate-0 transition-transform cursor-default">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs md:text-sm font-black uppercase tracking-widest">Auto-Trade Live</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-8 text-6xl md:text-8xl lg:text-9xl font-black text-black dark:text-white uppercase tracking-tighter leading-none select-none">
          <span className="block mb-2 md:mb-4 relative inline-block">
            MantleFlow
          </span>
          <br className="hidden md:block" />
          <span className="block text-2xl md:text-5xl lg:text-6xl mt-4 font-extrabold stroke-text bg-neo-yellow/20 px-4 transform skew-x-[-10deg]">
            Automated Trading Terminal
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mb-10 text-lg md:text-2xl font-medium text-gray-700 dark:text-gray-300 max-w-3xl font-mono leading-relaxed px-4">
          Stop staring at charts. Start automating. <br className="hidden md:block" />
          <span className="bg-neo-accent/20 px-1 border-b-2 border-black dark:border-white">Smart Triggers</span>,
          <span className="bg-neo-primary/20 px-1 border-b-2 border-black dark:border-white mx-1">Risk Management</span>, and
          <span className="bg-neo-secondary/20 px-1 border-b-2 border-black dark:border-white">24/7 Execution</span>.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col md:flex-row gap-6 w-full md:w-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <button
            onClick={onStart}
            className="group relative px-8 py-5 bg-neo-primary text-white border-2 border-black dark:border-white font-black text-xl uppercase shadow-neo hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all flex items-center justify-center gap-3 overflow-hidden animate-pulse-slow"
          >
            <span className="relative z-10 flex items-center gap-2">Launch App <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" strokeWidth={3} /></span>
            <div className="absolute inset-0 bg-black transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0"></div>
          </button>

          <button className="px-8 py-5 bg-white dark:bg-[#1a1a1a] text-black dark:text-white border-2 border-black dark:border-white font-black text-xl uppercase shadow-neo hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all hover:bg-neo-yellow/20">
            View Live Demo
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;