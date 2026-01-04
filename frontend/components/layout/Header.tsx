import React, { useState } from 'react';
import { Menu, Sun, Moon, Home, MessageSquare, User, Bot, Wallet, LogOut, ChevronDown, HelpCircle, Snowflake, Book } from 'lucide-react';
import { formatAddress } from '../../services/web3Service';
import WalletModal from '../modals/WalletModal';

export type ViewType = 'landing' | 'chat' | 'profile' | 'auto-trade' | 'docs';

interface HeaderProps {
    toggleSidebar: () => void;
    currentView: ViewType;
    setCurrentView: (view: ViewType) => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    isSidebarVisible: boolean;
    walletAddress: string | null;
    onConnectWallet: () => Promise<void>;
    onDisconnectWallet: () => void;
    isSnowing?: boolean;
    toggleSnow?: () => void;
}

const Header: React.FC<HeaderProps> = ({
    toggleSidebar,
    currentView,
    setCurrentView,
    theme,
    toggleTheme,
    isSidebarVisible,
    walletAddress,
    onConnectWallet,
    onDisconnectWallet,
    isSnowing,
    toggleSnow
}) => {
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);

    const navItems: { id: ViewType; label: string; icon: any }[] = [
        { id: 'landing', label: 'Intro', icon: Home },
        { id: 'chat', label: 'Chat', icon: MessageSquare },
        { id: 'auto-trade', label: 'Auto-Trade', icon: Bot },
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'docs', label: 'Docs', icon: Book },
    ];

    const handleConnect = async (walletId: string) => {
        // In a real app, switch logic based on walletId (e.g. Phantom vs MetaMask)
        // For now, we default to the existing MetaMask logic
        if (walletId !== 'metamask') {
            alert(`Support for ${walletId} is coming soon! Using MetaMask for now.`);
        }
        await onConnectWallet();
        setIsWalletModalOpen(false);
    };

    return (
        <>
            <div className="flex items-center justify-between p-3 md:p-4 border-b-2 border-black dark:border-white bg-white dark:bg-[#1a1a1a] w-full z-20 sticky top-0">

                {/* LEFT: Logo & System Toggles */}
                <div className="flex items-center gap-4 flex-1">
                    {/* Mobile Toggle Button */}
                    {isSidebarVisible && (
                        <button
                            onClick={toggleSidebar}
                            className="p-2 border-2 border-black dark:border-white bg-neo-yellow hover:translate-x-[2px] hover:translate-y-[2px] transition-all md:hidden shrink-0"
                            title="Open Menu"
                        >
                            <Menu className="w-5 h-5 text-black" strokeWidth={3} />
                        </button>
                    )}

                    <div
                        className="flex items-center gap-2 overflow-hidden shrink-0 cursor-pointer"
                        onClick={() => setCurrentView('landing')}
                    >
                        <span className="text-xl md:text-2xl font-black text-black dark:text-white tracking-tighter uppercase truncate">
                            Mantle<span className="text-neo-primary">Flow</span>
                        </span>
                    </div>

                    {/* Theme Toggle & Snow Toggle */}
                    <div className="hidden sm:flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="p-1.5 border-2 border-black dark:border-white shadow-neo-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all bg-white dark:bg-black text-black dark:text-white"
                            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                        >
                            {theme === 'dark' ? <Sun className="w-4 h-4" strokeWidth={2.5} /> : <Moon className="w-4 h-4" strokeWidth={2.5} />}
                        </button>

                        {/* Snow Effect Toggle */}
                        {toggleSnow && (
                            <div className="relative group">
                                <button
                                    onClick={toggleSnow}
                                    className={`p-1.5 border-2 border-black dark:border-white shadow-neo-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-start gap-0.5 ${isSnowing ? 'bg-neo-primary text-white' : 'bg-white dark:bg-black text-black dark:text-white'}`}
                                >
                                    <Snowflake className="w-4 h-4" strokeWidth={2.5} />
                                    <HelpCircle className="w-2 h-2 mt-0.5 opacity-70" strokeWidth={3} />
                                </button>
                                {/* Tooltip */}
                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover:flex items-center whitespace-nowrap bg-black text-white text-xs font-bold uppercase px-2 py-1 border-2 border-white shadow-lg z-50">
                                    <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] border-r-black"></div>
                                    Christmas Snow Mode! Click to toggle.
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Navigation & Wallet */}
                <div className="flex items-center gap-4 flex-shrink-0">
                    {/* Nav Tabs */}
                    <div className="hidden lg:flex items-center bg-gray-100 dark:bg-black p-1 border-2 border-black dark:border-white shadow-neo-sm">
                        {navItems.map((item) => {
                            const isActive = currentView === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setCurrentView(item.id)}
                                    className={`
                                flex items-center gap-2 px-3 py-1.5 font-black uppercase text-sm transition-all whitespace-nowrap
                                ${isActive
                                            ? 'bg-neo-primary text-white border-2 border-black dark:border-white shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 border-2 border-transparent'
                                        }
                            `}
                                >
                                    <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} strokeWidth={2.5} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Connect Wallet Button */}
                    <div className="relative">
                        {walletAddress ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
                                    className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 border-2 border-transparent hover:bg-gray-800 dark:hover:bg-gray-200 font-bold uppercase text-sm shadow-neo-sm"
                                >
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    {formatAddress(walletAddress)}
                                    <ChevronDown className="w-4 h-4 ml-1" />
                                </button>

                                {/* Dropdown Menu */}
                                {isWalletMenuOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1a1a1a] border-2 border-black dark:border-white shadow-neo z-50 animate-in fade-in slide-in-from-top-2">
                                        <div className="p-2 border-b-2 border-black dark:border-white">
                                            <div className="text-[10px] uppercase font-bold text-gray-500">Connected as</div>
                                            <div className="font-mono font-bold truncate text-xs">{walletAddress}</div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                onDisconnectWallet();
                                                setIsWalletMenuOpen(false);
                                            }}
                                            className="w-full text-left flex items-center gap-2 p-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 font-bold uppercase text-sm"
                                        >
                                            <LogOut className="w-4 h-4" strokeWidth={2.5} /> Disconnect
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsWalletModalOpen(true)}
                                className="flex items-center gap-2 bg-neo-accent px-4 py-2 border-2 border-black font-black uppercase text-sm shadow-neo hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                            >
                                <Wallet className="w-4 h-4" strokeWidth={2.5} />
                                <span className="hidden sm:inline">Connect Wallet</span>
                                <span className="sm:hidden">Connect</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            <WalletModal
                isOpen={isWalletModalOpen}
                onClose={() => setIsWalletModalOpen(false)}
                onConnect={handleConnect}
            />

            {/* Backdrop for Dropdown */}
            {isWalletMenuOpen && (
                <div className="fixed inset-0 z-10 bg-transparent" onClick={() => setIsWalletMenuOpen(false)}></div>
            )}
        </>
    );
};

export default Header;