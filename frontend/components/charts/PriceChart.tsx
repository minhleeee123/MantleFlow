import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, X, Send, Camera, Bot, Loader2 } from 'lucide-react';
import { analyzeChartImage } from '../../services/agents/visionAgent';
import { FormattedMessage } from '../ui/MarkdownRenderer';

interface PriceChartProps {
  symbol: string;
  theme?: 'light' | 'dark';
}

interface ChartChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    isAnalysis?: boolean;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

const PriceChart: React.FC<PriceChartProps> = ({ symbol, theme = 'dark' }) => {
  const containerId = useRef(`tv-widget-${Math.random().toString(36).substring(7)}`);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChartChatMessage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const getTVSymbol = (sym: string) => {
    return `BINANCE:${sym.toUpperCase()}USDT`;
  };

  const loadWidget = (containerId: string, isFull: boolean) => {
    if (document.getElementById(containerId) && window.TradingView) {
      new window.TradingView.widget({
        "autosize": true,
        "symbol": getTVSymbol(symbol),
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": theme, 
        "style": "1", 
        "locale": "en",
        "enable_publishing": false,
        "backgroundColor": theme === 'dark' ? "rgba(26, 26, 26, 1)" : "rgba(255, 255, 255, 1)",
        "gridColor": theme === 'dark' ? "rgba(50, 50, 50, 0.5)" : "rgba(0, 0, 0, 0.1)",
        "hide_top_toolbar": !isFull,
        "hide_legend": !isFull,
        "save_image": false,
        "container_id": containerId,
        "toolbar_bg": theme === 'dark' ? "#1e1f20" : "#f3f4f6",
        "withdateranges": isFull,
        "hide_side_toolbar": !isFull,
        "allow_symbol_change": isFull,
      });
    }
  };

  useEffect(() => {
    if (window.TradingView) {
         loadWidget(containerId.current, false);
    } else {
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        script.onload = () => loadWidget(containerId.current, false);
        document.head.appendChild(script);
    }
  }, [symbol, theme]);

  useEffect(() => {
    if (isModalOpen && window.TradingView) {
        setChatMessages([{
            id: 'init',
            role: 'model',
            text: 'Draw support/resistance lines, then click "Analyze Chart" to let me confirm your setup.'
        }]);
        
        setTimeout(() => {
            loadWidget("tv-modal-container", true);
        }, 100);
    }
  }, [isModalOpen, symbol, theme]);

  const captureAndAnalyze = async () => {
    try {
        setIsAnalyzing(true);
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: { 
                displaySurface: "browser",
            } as any, 
            audio: false
        });

        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;

        await new Promise<void>((resolve) => {
            video.onloadedmetadata = () => {
                video.play();
                setTimeout(resolve, 500); 
            };
        });

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) throw new Error("Canvas context failed");
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Image = canvas.toDataURL('image/png');

        stream.getTracks().forEach(track => track.stop());

        const userMsgId = Date.now().toString();
        setChatMessages(prev => [...prev, { id: userMsgId, role: 'user', text: "Analyze this chart setup." }]);
        
        const modelMsgId = (Date.now() + 1).toString();
        const analysisText = await analyzeChartImage(base64Image, "Analyze indicators, S/R levels, and chart patterns. Be critical.");

        setChatMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: analysisText, isAnalysis: true }]);

    } catch (error: any) {
        console.error("Capture failed:", error);
        if (error.name !== 'NotAllowedError') {
             setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Capture failed. Use 'Current Tab'." }]);
        }
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async () => {
     if (!chatInput.trim()) return;
     const userText = chatInput;
     setChatInput('');
     setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userText }]);
     
     setTimeout(() => {
         setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Interesting level. Draw it on the chart and click 'Analyze Screen' for a second opinion." }]);
     }, 1000);
  };

  return (
    <>
        {/* Main Dashboard Widget */}
        <div className="w-full h-[250px] bg-white dark:bg-[#1e1f20] relative group overflow-hidden">
            <div id={containerId.current} className="w-full h-full" />
            
            {/* Overlay */}
            <div 
                onClick={() => setIsModalOpen(true)}
                className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors cursor-pointer z-10 flex items-center justify-center group"
                title="Expand Chart"
            >
                <div className="bg-neo-primary border-2 border-black p-2 opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100 shadow-neo">
                    <Maximize2 className="w-6 h-6 text-white" strokeWidth={3} />
                </div>
            </div>
        </div>

        {/* Full Screen Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-[95vw] h-[90vh] border-4 border-black dark:border-white shadow-neo-dark flex flex-col relative">
                    
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-4 border-b-4 border-black dark:border-white bg-neo-yellow">
                        <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-white">
                                <Bot className="w-6 h-6" strokeWidth={2.5} />
                             </div>
                             <div>
                                <h2 className="text-black font-black text-xl uppercase tracking-tighter">{symbol} VISION ANALYSIS</h2>
                                <span className="text-black font-bold text-xs bg-white px-1">AI TECHNICAL ASSISTANT</span>
                             </div>
                        </div>
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="p-2 bg-white border-2 border-black hover:bg-black hover:text-white transition-colors shadow-neo-sm"
                        >
                            <X className="w-6 h-6" strokeWidth={3} />
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="flex-1 flex overflow-hidden">
                        
                        {/* LEFT: TradingView Chart */}
                        <div className="w-3/4 h-full border-r-4 border-black dark:border-white bg-white relative">
                            <div id="tv-modal-container" className="w-full h-full" />
                            
                            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
                                <button 
                                    onClick={captureAndAnalyze}
                                    disabled={isAnalyzing}
                                    className="neo-btn flex items-center gap-2 bg-neo-accent text-black px-8 py-4 text-lg border-2 border-black shadow-neo disabled:opacity-50"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" /> SCANNING...
                                        </>
                                    ) : (
                                        <>
                                            <Camera className="w-5 h-5" strokeWidth={2.5} /> ANALYZE SCREEN
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* RIGHT: Chat Interface */}
                        <div className="w-1/4 h-full bg-neo-bg dark:bg-[#121212] flex flex-col">
                             <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                {chatMessages.map((msg) => (
                                    <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[90%] px-4 py-3 border-2 border-black text-sm font-bold ${
                                            msg.role === 'user' 
                                                ? 'bg-black text-white shadow-neo-sm' 
                                                : 'bg-white text-black shadow-neo-sm'
                                        }`}>
                                            {msg.role === 'user' ? (
                                                msg.text
                                            ) : (
                                                <FormattedMessage text={msg.text} />
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isAnalyzing && (
                                    <div className="flex justify-start">
                                        <div className="bg-neo-yellow border-2 border-black px-4 py-3 shadow-neo-sm flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 text-black animate-spin" />
                                            <span className="text-xs font-bold uppercase">Vision Processing...</span>
                                        </div>
                                    </div>
                                )}
                             </div>

                             <div className="p-4 border-t-2 border-black dark:border-white bg-white dark:bg-[#1a1a1a]">
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="text" 
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Ask about levels..."
                                        className="flex-1 bg-transparent text-sm font-bold text-black dark:text-white placeholder-gray-500 outline-none border-2 border-black p-2 shadow-neo-sm"
                                    />
                                    <button 
                                        onClick={handleSendMessage}
                                        className="p-2 bg-neo-primary border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                    >
                                        <Send className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                             </div>
                        </div>

                    </div>
                </div>
            </div>
        )}
    </>
  );
};

export default PriceChart;