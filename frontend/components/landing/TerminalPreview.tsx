import React, { useEffect, useState, useRef } from 'react';
import { Terminal, Circle, Maximize2, Minus } from 'lucide-react';

const INITIAL_LOGS = [
  "> System Boot Sequence Initiated...",
  "> Connecting to CoinGecko API... [OK]",
  "> Fetching BTC/USDT OHLCV Data... [OK]",
  "> Analyzing Sentiment (Source: Alternative.me)... [FEAR: 32]",
  "> Loading MantleFlow AI Module... [RE ADY]",
  "> Scanning Portfolio Addresses... [3 WALLETS FOUND]",
];

const CODE_SNIPPETS = [
  "const portfolio = await web3.eth.getAccounts();",
  "if (riskScore > 80) await rebalanceStrategy('conservative');",
  "analyzing chart pattern: 'DOUBLE_BOTTOM' detected (Confidence: 94%);",
  "executing smart contract call: 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;",
  "fetching gas fees... [OPTIMIZED: 15 gwei];",
  "generating report_v2.json...",
  "Done."
];

const TerminalPreview: React.FC = () => {
  const [lines, setLines] = useState<string[]>([]);
  const [userTypedLines, setUserTypedLines] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Detect Intersection
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Only trigger once
        }
      },
      { threshold: 0.3 } // Trigger when 30% visible
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Initial Auto-Typing - Only runs when isVisible is true
  useEffect(() => {
    if (!isVisible) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index < INITIAL_LOGS.length) {
        setLines(prev => [...prev, INITIAL_LOGS[index]]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 800);
    return () => clearInterval(interval);
  }, [isVisible]);

  // "Hacker Typer" Effect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default only if necessary, but here we just want effect
      const randomSnippet = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
      const timestamp = new Date().toLocaleTimeString();
      setUserTypedLines(prev => [...prev, `[${timestamp}] user@admin: ${randomSnippet}`].slice(-5));

      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div ref={containerRef} className="w-full py-8 overflow-hidden relative z-10 shrink-0">
      <div className="container mx-auto px-6 flex flex-col items-center">

        <div className="mt-0 mb-8 text-center relative w-full max-w-4xl flex flex-col items-center">
          {/* 3D Mascot - Demo - Positioned relative in flex flow to avoid overflow clipping */}
          <div className="hidden lg:block animate-[float_6s_ease-in-out_infinite_0.5s] z-20 mb-4">
            <img
              src="/picture/mascot_demo-removebg-preview.png"
              alt="MantleFlow Bot Hacking"
              className="w-80 h-80 object-contain drop-shadow-xl transform rotate-12"
            />
          </div>

          <div className="inline-block bg-neo-accent text-black px-2 py-1 text-xs font-black uppercase mb-2 border border-black transform -rotate-2 relative z-30">
            Interactive Demo
          </div>
        </div>

        <div className="w-full max-w-4xl bg-black text-green-500 font-mono text-sm md:text-base border-2 border-black dark:border-white shadow-neo-lg rounded-none transform transition-transform hover:scale-[1.01] duration-300">
          {/* Terminal Header */}
          <div className="bg-gray-800 border-b border-gray-700 p-3 flex items-center justify-between">
            <div className="flex gap-2">
              <Circle className="w-3 h-3 text-red-500 fill-current hover:opacity-80 cursor-pointer" />
              <Circle className="w-3 h-3 text-yellow-500 fill-current hover:opacity-80 cursor-pointer" />
              <Circle className="w-3 h-3 text-green-500 fill-current hover:opacity-80 cursor-pointer" />
            </div>
            <div className="text-gray-400 text-xs font-bold uppercase flex items-center gap-2 select-none">
              <Terminal className="w-3 h-3" />
              mantleflow-core.exe
            </div>
            <div className="flex gap-2">
              <Minus className="w-4 h-4 text-gray-500 cursor-pointer" />
              <Maximize2 className="w-3 h-3 text-gray-500 cursor-pointer" />
            </div>
          </div>

          {/* Terminal Body */}
          <div ref={scrollRef} className="p-6 h-80 overflow-y-auto space-y-3 custom-scrollbar bg-black/95">
            <div className="text-white mb-4">
              Welcome to <span className="text-neo-primary font-bold">MantleFlow</span>. {isVisible ? "Initializing system..." : "Waiting for user..."}
            </div>

            {/* System Logs */}
            {lines.map((line, i) => (
              <div key={`sys-${i}`} className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="text-gray-500 shrink-0">$</span>
                <span className="break-words">{line}</span>
              </div>
            ))}

            {/* User "Typed" Logs */}
            {userTypedLines.map((line, i) => (
              <div key={`user-${i}`} className="flex gap-2 text-neo-yellow animate-in fade-in">
                <span className="text-neo-accent shrink-0">{'>'}</span>
                <span className="break-words">{line}</span>
              </div>
            ))}

            <div className="flex items-center gap-1">
              <span className="text-neo-secondary">root@mantleflow:~#</span>
              <span className="w-2 h-4 bg-green-500 animate-pulse block"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalPreview;