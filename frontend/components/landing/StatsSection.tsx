import React, { useEffect, useState, useRef } from 'react';

const StatItem = ({ label, value, prefix = "", suffix = "" }: { label: string, value: number, prefix?: string, suffix?: string }) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) setIsVisible(true);
        }, { threshold: 0.5 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;
        let start = 0;
        const duration = 2000;
        const increment = value / (duration / 16);
        
        const timer = setInterval(() => {
            start += increment;
            if (start >= value) {
                setCount(value);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, 16);
        return () => clearInterval(timer);
    }, [isVisible, value]);

    return (
        <div ref={ref} className="text-center p-6 border-r-2 last:border-r-0 border-black dark:border-white bg-white dark:bg-black group hover:bg-neo-yellow transition-colors duration-300">
            <div className="text-4xl md:text-6xl font-black text-black dark:text-white mb-2 font-mono group-hover:scale-110 transition-transform">
                {prefix}{Math.floor(count).toLocaleString()}{suffix}
            </div>
            <div className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 group-hover:text-black">
                {label}
            </div>
        </div>
    );
};

const StatsSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-b-2 border-black dark:border-white shrink-0">
        <StatItem label="Total Volume Analyzed" value={450} prefix="$" suffix="M+" />
        <StatItem label="Active Portfolios" value={12000} suffix="" />
        <StatItem label="AI Predictions" value={89} suffix="%" />
        <StatItem label="Chains Supported" value={15} suffix="+" />
    </div>
  );
};

export default StatsSection;