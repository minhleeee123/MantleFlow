import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { TrendingUp, PieChart, ArrowRightLeft } from 'lucide-react';
import { ChatMessage, CryptoData, ChatSession, PortfolioItem, TransactionData, PortfolioAnalysisResult } from './types';

// Modular Services Imports
import { analyzeCoin, generateMarketReport } from './services/agents/marketAgent';
import { analyzePortfolio } from './services/agents/portfolioAgent';
import { createTransactionPreview } from './services/agents/transactionAgent';
import { determineIntent, chatWithModel } from './services/agents/chatAgent';
import { updatePortfolioRealTime } from './services/data/marketData';

import { connectToMetaMask } from './services/web3Service';
import { authApi } from './services/backendApi';

// Hooks
import { useBackendTrading } from './hooks/useBackendTrading';

// UI Components
import Sidebar from './components/layout/Sidebar';
import Header, { ViewType } from './components/layout/Header';
import ProfileView from './components/profile/ProfileView';
import LandingPage from './components/landing/LandingPage';
import MessageItem from './components/chat/MessageItem';
import InputArea from './components/chat/InputArea';
import LoadingIndicator from './components/ui/LoadingIndicator';
import AutoTradingView from './components/trading/AutoTradingView';
import SnowEffect from './components/ui/SnowEffect';
import Documentation from './components/docs/Documentation';

// --- Types & Mock Data for Profile ---

const INITIAL_USER_DATA = {
  name: "Crypto Explorer",
  email: "trader@mantleflow.ai",
  joinDate: "September 2023",
  walletAddress: null as string | null,
  totalBalance: 0,
  portfolio: [
    { symbol: 'BTC', name: 'Bitcoin', amount: 0.45, avgPrice: 45000, currentPrice: 64200 },
    { symbol: 'ETH', name: 'Ethereum', amount: 5.2, avgPrice: 2100, currentPrice: 3450 },
    { symbol: 'SOL', name: 'Solana', amount: 150, avgPrice: 45, currentPrice: 148 },
    { symbol: 'DOT', name: 'Polkadot', amount: 500, avgPrice: 8.5, currentPrice: 7.2 },
  ] as PortfolioItem[]
};

// --- Constants for suggested Prompts ---

const SUGGESTED_PROMPTS = [
  {
    title: "Market Analysis",
    subtitle: "Deep dive into Bitcoin",
    prompt: "Analyze Bitcoin price action and current market sentiment.",
    icon: TrendingUp,
    color: "bg-neo-secondary"
  },
  {
    title: "Portfolio Health",
    subtitle: "Review diversification",
    prompt: "Analyze my portfolio risks and suggest rebalancing.",
    icon: PieChart,
    color: "bg-neo-primary"
  },
  {
    title: "Transaction Agent",
    subtitle: "Draft a swap",
    prompt: "Swap 1 ETH for USDT",
    icon: ArrowRightLeft,
    color: "bg-neo-accent"
  }
];

// --- Main App Component ---

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isSnowing, setIsSnowing] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleSnow = () => {
    setIsSnowing(prev => !prev);
  }

  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Updated View State
  const [currentView, setCurrentView] = useState<ViewType>('landing');
  const [userProfile, setUserProfile] = useState(INITIAL_USER_DATA);
  const [isRefreshingPortfolio, setIsRefreshingPortfolio] = useState(false);

  // --- Paper Wallet State (for demo/testing) ---
  const [paperWallet, setPaperWallet] = useState({
    usdtBalance: 10000, // Start with 10k USDT
    holdings: {} as Record<string, number>
  });

  // Handle paper wallet balance updates
  const handleUpdateBalance = (amount: number, type: 'DEPOSIT' | 'WITHDRAW') => {
    setPaperWallet(prev => ({
      ...prev,
      usdtBalance: type === 'DEPOSIT'
        ? prev.usdtBalance + amount
        : prev.usdtBalance - amount
    }));
  };

  // --- Backend Trading Hook (replaces usePaperTrading) ---
  // Pass walletAddress so hook only loads data when wallet is connected
  const backendTrading = useBackendTrading(userProfile.walletAddress);

  const initialSessionId = 'init-session';
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: initialSessionId,
      title: 'New Chat',
      date: Date.now(),
      messages: [
        {
          id: 'welcome',
          role: 'model',
          text: 'I am MantleFlow AI. I analyze markets, check portfolio health, and draft web3 transactions. What\'s the move today?'
        }
      ]
    }
  ]);
  const [activeSessionId, setActiveSessionId] = useState<string>(initialSessionId);
  const [messages, setMessages] = useState<ChatMessage[]>(sessions[0].messages);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSessions(prevSessions => {
      return prevSessions.map(session => {
        if (session.id === activeSessionId) {
          let newTitle = session.title;
          if (session.title === 'New Chat') {
            const firstUserMsg = messages.find(m => m.role === 'user');
            if (firstUserMsg && firstUserMsg.text) {
              newTitle = firstUserMsg.text.slice(0, 30) + (firstUserMsg.text.length > 30 ? '...' : '');
            }
          }
          return { ...session, messages: messages, title: newTitle };
        }
        return session;
      });
    });
  }, [messages, activeSessionId]);

  // SMART SCROLL LOGIC
  // Only auto-scroll if the user is already near the bottom
  useEffect(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      // Check if user is within 150px of the bottom
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;

      // If it's a new message from user, always scroll
      const lastMsg = messages[messages.length - 1];
      const isUserMsg = lastMsg?.role === 'user';

      if (isNearBottom || isUserMsg) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, [messages, isLoading, loadingStatus]);

  const handleUpdateEmail = (newEmail: string) => {
    setUserProfile(prev => ({
      ...prev,
      email: newEmail
    }));
  };

  const handleRefreshPortfolio = async () => {
    setIsRefreshingPortfolio(true);
    try {
      const updatedPortfolio = await updatePortfolioRealTime(userProfile.portfolio);
      setUserProfile(prev => ({
        ...prev,
        portfolio: updatedPortfolio
      }));
    } catch (e) {
      console.error("Failed to refresh portfolio", e);
    } finally {
      setIsRefreshingPortfolio(false);
    }
  };

  const handleConnectWallet = async () => {
    const walletData = await connectToMetaMask();
    if (walletData) {
      // Sign message for backend authentication
      try {
        const message = `Sign this message to login to Auto-Trading Platform.\nTimestamp: ${Date.now()}`;
        const signature = await (window as any).ethereum.request({
          method: 'personal_sign',
          params: [message, walletData.address],
        });

        // Login to backend
        const { token, user } = await authApi.login(walletData.address, signature, message);
        localStorage.setItem('auth_token', token);
        console.log('✅ Logged in to backend successfully');

        // Refresh backend data
        backendTrading.refreshTriggers();
        backendTrading.refreshHistory();
      } catch (error) {
        console.error('❌ Backend login failed:', error);
        alert('Backend authentication failed. You can still use the app but triggers won\'t be saved.');
      }

      setUserProfile(prev => {
        const cleanPortfolio = prev.portfolio.filter(p => !p.name.includes("(Wallet)"));

        // 1. MNT (Native)
        const mntItem: PortfolioItem = {
          symbol: 'MNT',
          name: 'Mantle (Wallet)',
          amount: parseFloat(walletData.nativeBalance),
          avgPrice: 0.85, // Approx Testnet Price
          currentPrice: 0.85
        };

        // 2. USDC
        const usdcItem: PortfolioItem = {
          symbol: 'USDC',
          name: 'USDC (Testnet) (Wallet)',
          amount: parseFloat(walletData.usdcBalance),
          avgPrice: 1.00,
          currentPrice: 1.00
        };

        return {
          ...prev,
          walletAddress: walletData.address,
          portfolio: [mntItem, usdcItem, ...cleanPortfolio]
        };
      });
    }
  };

  const handleDisconnectWallet = () => {
    localStorage.removeItem('auth_token');
    setUserProfile(prev => ({
      ...prev,
      walletAddress: null,
      portfolio: prev.portfolio.filter(p => !p.name.includes("(Wallet)"))
    }));
  };

  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: 'New Chat',
      date: Date.now(),
      messages: [{
        id: 'welcome',
        role: 'model',
        text: 'Ready for a new analysis. Which coin shall we look at?'
      }]
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setMessages(newSession.messages);
    setIsLoading(false);
    setCurrentView('chat');

    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const loadSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setActiveSessionId(sessionId);
      setMessages(session.messages);
      setIsLoading(false);
      setCurrentView('chat');

      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    }
  };

  const deleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();

    const newSessions = sessions.filter(s => s.id !== sessionId);
    if (sessionId === activeSessionId) {
      if (newSessions.length > 0) {
        setActiveSessionId(newSessions[0].id);
        setMessages(newSessions[0].messages);
      } else {
        handleNewChat();
        return;
      }
    }
    setSessions(newSessions);
  };

  const getLastCryptoData = (msgs: ChatMessage[]): CryptoData | undefined => {
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].data) return msgs[i].data;
    }
    return undefined;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const currentInput = input;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: currentInput
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setLoadingStatus('thinking');

    try {
      const intent = await determineIntent(currentInput);

      if (intent.type === 'ANALYZE' && intent.coinName) {
        setLoadingStatus('fetching-data');
        const coinName = intent.coinName;
        const data: CryptoData = await analyzeCoin(coinName);

        const chartMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          data: data
        };
        setMessages(prev => [...prev, chartMsg]);

        setLoadingStatus('analyzing');
        const reportMsgId = (Date.now() + 2).toString();
        const reportText = await generateMarketReport(data);
        setLoadingStatus('');
        setMessages(prev => [...prev, { id: reportMsgId, role: 'model', text: reportText }]);

      } else if (intent.type === 'PORTFOLIO_ANALYSIS') {
        setLoadingStatus('analyzing-portfolio');
        const portfolioResult: PortfolioAnalysisResult = await analyzePortfolio(userProfile.portfolio);
        setLoadingStatus('');
        const portfolioMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          portfolioAnalysis: portfolioResult,
          text: "I've analyzed your portfolio structure. Here is the breakdown along with risk factors and rebalancing suggestions."
        }
        setMessages(prev => [...prev, portfolioMsg]);

      } else if (intent.type === 'TRANSACTION') {
        setLoadingStatus('creating-transaction');
        const txData: TransactionData = await createTransactionPreview(currentInput);
        const txMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          transactionData: txData,
          text: `I've prepared the transaction for you. Please review the details below.`
        };
        setMessages(prev => [...prev, txMsg]);

      } else {
        setLoadingStatus('thinking');
        const contextData = getLastCryptoData(messages);
        const responseText = await chatWithModel(currentInput, messages, contextData);
        const textMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: responseText
        };
        setMessages(prev => [...prev, textMsg]);
      }

    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I'm sorry, I encountered an error processing your request. Please try again."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  // Determine if Sidebar should be shown
  const showSidebar = currentView === 'chat';

  return (
    <div className="flex flex-col h-screen w-full bg-[#f0f2f5] dark:bg-[#050505] text-black dark:text-white overflow-hidden font-sans relative transition-colors duration-0">
      {isSnowing && <SnowEffect />}

      {/* Header - Always on Top (Full Width) */}
      <Header
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        currentView={currentView}
        setCurrentView={setCurrentView}
        theme={theme}
        toggleTheme={toggleTheme}
        isSidebarVisible={showSidebar}
        walletAddress={userProfile.walletAddress}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
        isSnowing={isSnowing}
        toggleSnow={toggleSnow}
      />

      {/* Main Container - Contains Sidebar and Page Content side-by-side */}
      <div className="flex-1 flex overflow-hidden relative w-full">

        {/* Sidebar - Sits inside this container, so it's below the Header */}
        {showSidebar && (
          <Sidebar
            isOpen={isSidebarOpen}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            sessions={sessions}
            activeSessionId={activeSessionId}
            currentView={currentView as 'chat' | 'profile'}
            setCurrentView={(view) => setCurrentView(view as any)}
            onNewChat={handleNewChat}
            onLoadSession={loadSession}
            onDeleteSession={deleteSession}
          />
        )}

        {/* Content Area - Applied .bg-checkered here */}
        <div className="flex-1 flex flex-col relative h-full w-full min-w-0 bg-checkered border-l-2 border-black dark:border-white">

          {/* View Switcher */}
          <div className="flex-1 relative w-full h-full overflow-hidden flex flex-col">

            {currentView === 'landing' && (
              <LandingPage onStart={() => setCurrentView('chat')} />
            )}

            {currentView === 'profile' && (
              <ProfileView
                user={userProfile}
                onRefreshPrices={handleRefreshPortfolio}
                onConnectWallet={handleConnectWallet}
                onDisconnectWallet={handleDisconnectWallet}
                isRefreshing={isRefreshingPortfolio}
                onUpdateEmail={handleUpdateEmail}
              />
            )}

            {currentView === 'docs' && (
              <Documentation />
            )}

            {currentView === 'auto-trade' && (
              <AutoTradingView
                wallet={paperWallet}
                triggers={backendTrading.triggers}
                trades={backendTrading.trades}
                marketPrices={backendTrading.marketPrices}
                notificationEmail={userProfile.email}
                onUpdateBalance={handleUpdateBalance}
                onAddTrigger={backendTrading.addTrigger}
                onCancelTrigger={backendTrading.cancelTrigger}
                executeTrigger={backendTrading.executeTrigger}
                onUpdateEmail={handleUpdateEmail}
                userWalletAddress={userProfile.walletAddress || undefined}
              />
            )}

            {currentView === 'chat' && (
              /* Chat View Container - Constrained Width */
              <div className="w-full h-full flex flex-col max-w-5xl mx-auto relative animate-page-enter">
                <div
                  className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth"
                  ref={scrollRef}
                >
                  {messages.map((msg) => (
                    <div key={msg.id} className={msg.data && msg.data.symbol ? "mb-2" : ""}>
                      {msg.data && (
                        React.cloneElement(<MessageItem msg={{ ...msg, data: undefined }} theme={theme} />, {}, null)
                      )}
                      <MessageItem key={msg.id} msg={msg} theme={theme} />
                    </div>
                  ))}

                  {isLoading && <LoadingIndicator status={loadingStatus} />}

                  {/* Spacer div */}
                  <div className="w-full h-48 shrink-0" />
                </div>

                <InputArea
                  input={input}
                  setInput={setInput}
                  handleSend={handleSend}
                  isLoading={isLoading}
                  showSuggestions={messages.length === 1}
                  suggestedPrompts={SUGGESTED_PROMPTS}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;