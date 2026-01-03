import React from 'react';
import { Send, Mic, Search, ArrowUpRight } from 'lucide-react';

interface Suggestion {
    title: string;
    subtitle: string;
    prompt: string;
    icon: any;
    color: string; // Tailwinc class for bg color
}

interface InputAreaProps {
  input: string;
  setInput: (val: string) => void;
  handleSend: () => void;
  isLoading: boolean;
  showSuggestions: boolean;
  suggestedPrompts: Suggestion[];
}

const InputArea: React.FC<InputAreaProps> = ({ 
  input, 
  setInput, 
  handleSend, 
  isLoading, 
  showSuggestions,
  suggestedPrompts
}) => {

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center justify-end pointer-events-none bg-transparent">
      <div className="w-full max-w-3xl pointer-events-auto flex flex-col gap-4">
         
         {/* Suggested Prompts as Vertical List */}
         {showSuggestions && !isLoading && (
            <div className="bg-white dark:bg-[#1a1a1a] border-2 border-black dark:border-white shadow-neo animate-in fade-in slide-in-from-bottom-4 duration-500">
                {suggestedPrompts.map((item, idx) => (
                   <button
                      key={idx}
                      onClick={() => setInput(item.prompt)}
                      className="w-full text-left flex items-center justify-between p-4 hover:bg-neo-bg dark:hover:bg-white/5 transition-colors border-b-2 border-black dark:border-white last:border-0 group"
                   >
                      <div className="flex items-center gap-3">
                         <div className={`w-8 h-8 ${item.color} border-2 border-black flex items-center justify-center`}>
                            <item.icon className="w-4 h-4 text-black" strokeWidth={2.5} />
                         </div>
                         <div>
                            <div className="font-bold text-black dark:text-white uppercase text-xs">{item.title}</div>
                            <div className="text-gray-600 dark:text-gray-300 text-sm font-medium">{item.subtitle}</div>
                         </div>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-black dark:text-white group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
                   </button>
                ))}
            </div>
         )}

         {/* Input Box */}
         <div className="w-full bg-white dark:bg-[#1a1a1a] flex items-center p-2 border-2 border-black dark:border-white shadow-neo transition-all">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask CryptoInsight..."
              className="flex-1 bg-transparent border-none outline-none text-black dark:text-white placeholder-gray-500 text-lg font-bold px-4 h-12"
              disabled={isLoading}
            />
            
            <div className="flex items-center gap-2 px-2">
                <button className="p-3 bg-gray-200 dark:bg-gray-800 border-2 border-black dark:border-white hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all shadow-neo-sm">
                  <Mic className="w-5 h-5 text-black dark:text-white" strokeWidth={2.5} />
                </button>
                {input.trim() && (
                  <button 
                    onClick={handleSend}
                    className="p-3 bg-neo-primary border-2 border-black dark:border-white hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all shadow-neo-sm"
                  >
                    <Send className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </button>
                )}
            </div>
         </div>
      </div>
      
      <div className="mt-4 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 bg-white dark:bg-black px-2 py-1 border-2 border-black dark:border-gray-600 pointer-events-none">
        AI can make mistakes. DYOR.
      </div>
    </div>
  );
};

export default InputArea;