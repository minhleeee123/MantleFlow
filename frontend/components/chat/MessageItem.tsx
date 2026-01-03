import React from 'react';
import { User, Sparkles } from 'lucide-react';
import { ChatMessage } from '../../types';
import CryptoDashboard from '../CryptoDashboard';
import TransactionCard from '../TransactionCard';
import PortfolioAnalysisCard from '../PortfolioAnalysisCard';
import { FormattedMessage } from '../ui/MarkdownRenderer';

interface MessageItemProps {
  msg: ChatMessage;
  theme?: 'light' | 'dark';
}

const MessageItem: React.FC<MessageItemProps> = ({ msg, theme = 'dark' }) => {
  return (
    <div className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} mb-6`}>
      
      {/* Avatar */}
      <div className={`w-10 h-10 border-2 border-black dark:border-white flex items-center justify-center shrink-0 
        ${msg.role === 'model' ? 'bg-neo-primary shadow-neo-sm' : 'bg-neo-yellow shadow-neo-sm'}`}>
         {msg.role === 'model' ? (
            <Sparkles className="w-6 h-6 text-white" strokeWidth={2.5} />
         ) : (
            <User className="w-6 h-6 text-black" strokeWidth={2.5} />
         )}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col max-w-[90%] md:max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
        {msg.text && (
          <div className={`p-4 border-2 border-black dark:border-white text-[15px] leading-relaxed font-medium 
            ${msg.role === 'user' 
              ? 'bg-neo-accent text-black shadow-neo-sm' 
              : 'bg-white dark:bg-[#262626] text-black dark:text-white shadow-neo-sm w-full'
            }`}>
            {msg.role === 'user' ? (
              msg.text
            ) : (
              <FormattedMessage text={msg.text} />
            )}
          </div>
        )}
        
        {msg.data && (
          <div className="w-full mt-4">
            <CryptoDashboard data={msg.data} theme={theme} />
          </div>
        )}

        {/* Web3 Transaction Card */}
        {msg.transactionData && (
            <div className="w-full mt-4">
                <TransactionCard data={msg.transactionData} />
            </div>
        )}

        {/* Portfolio Analysis Card */}
        {msg.portfolioAnalysis && (
            <div className="w-full mt-4">
                <PortfolioAnalysisCard data={msg.portfolioAnalysis} />
            </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;