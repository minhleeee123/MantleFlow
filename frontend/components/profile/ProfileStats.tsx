import React, { useState } from 'react';
import { User, X, Link2, Wallet, TrendingUp, AlertCircle, Edit2, Check, Save } from 'lucide-react';
import { formatAddress } from '../../services/web3Service';
import { PortfolioItem } from '../../types';

interface ProfileStatsProps {
  user: {
    name: string;
    email: string;
    joinDate: string;
    walletAddress: string | null;
    portfolio: PortfolioItem[];
  };
  totalBalance: number;
  isRefreshing: boolean;
  onConnectWallet: () => Promise<void>;
  onDisconnectWallet: () => void;
  onUpdateEmail: (email: string) => void;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({
  user,
  totalBalance,
  isRefreshing,
  onConnectWallet,
  onDisconnectWallet,
  onUpdateEmail
}) => {
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [tempEmail, setTempEmail] = useState(user.email);

  const handleSaveEmail = () => {
    onUpdateEmail(tempEmail);
    setIsEditingEmail(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* User Card */}
      <div className="md:col-span-2 bg-white dark:bg-[#1a1a1a] border-2 border-black dark:border-white shadow-neo p-6 relative overflow-hidden rounded-xl">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          <div className="w-24 h-24 bg-neo-primary border-2 border-black dark:border-white flex items-center justify-center shrink-0 shadow-neo-sm rounded-xl">
            <User className="w-12 h-12 text-white" strokeWidth={2} />
          </div>

          <div className="text-center md:text-left space-y-2 flex-1">
            <h2 className="text-2xl font-black text-black dark:text-white uppercase">{user.name}</h2>

            <div className="flex flex-col md:flex-row items-center gap-3">
              {isEditingEmail ? (
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={tempEmail}
                    onChange={(e) => setTempEmail(e.target.value)}
                    className="bg-white dark:bg-black border-2 border-black dark:border-white px-2 py-1 text-sm font-mono font-bold outline-none shadow-neo-sm rounded-lg"
                    autoFocus
                  />
                  <button onClick={handleSaveEmail} className="p-1 bg-green-500 border-2 border-black text-white hover:scale-105 transition-transform rounded-md">
                    <Check className="w-3 h-3" />
                  </button>
                  <button onClick={() => { setIsEditingEmail(false); setTempEmail(user.email); }} className="p-1 bg-red-500 border-2 border-black text-white hover:scale-105 transition-transform rounded-md">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <span className="text-sm font-bold text-gray-500 font-mono border-b-2 border-transparent hover:border-black dark:hover:border-white transition-all cursor-default">
                    {user.email}
                  </span>
                  <button
                    onClick={() => setIsEditingEmail(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded"
                  >
                    <Edit2 className="w-3 h-3 text-gray-500" />
                  </button>
                </div>
              )}

              <span className="hidden md:inline w-1 h-1 bg-black dark:bg-white rounded-full"></span>
              <span className="text-xs font-black bg-gray-200 dark:bg-gray-800 px-2 py-0.5 border border-black dark:border-gray-600 rounded-md">
                MEMBER SINCE {user.joinDate.split(' ')[1]}
              </span>
            </div>

            {/* Wallet Connection Status */}
            <div className="pt-2">
              {user.walletAddress ? (
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 border-2 border-black dark:border-green-500 px-3 py-1.5 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-mono font-bold text-sm text-black dark:text-green-400">
                      {formatAddress(user.walletAddress)}
                    </span>
                  </div>
                  <span className="text-xs font-black uppercase text-green-600 dark:text-green-400">Connected</span>
                </div>
              ) : (
                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500">
                  <div className="bg-gray-200 dark:bg-gray-800 p-2 border border-dashed border-black dark:border-gray-600 flex items-center gap-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Wallet Not Connected</span>
                  </div>
                  <span className="text-xs text-gray-400 max-w-[150px] leading-tight text-left">
                    Use the button in the top navigation bar to connect.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <User className="w-48 h-48 text-black dark:text-white" />
        </div>
      </div>

      {/* Total Balance Card */}
      <div className="bg-neo-secondary border-2 border-black dark:border-white shadow-neo p-6 flex flex-col justify-center relative overflow-hidden rounded-xl">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-black" strokeWidth={3} />
            <span className="text-xs font-black text-black uppercase tracking-widest">Net Worth</span>
          </div>
          <div className="text-4xl font-black text-black tracking-tighter">
            {isRefreshing ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              `$${totalBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
            )}
            <span className="text-lg text-black/60 font-bold">.{(totalBalance % 1).toFixed(2).substring(2)}</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="bg-black text-white px-2 py-0.5 text-xs font-bold uppercase transform -rotate-1 rounded-md">
              Real-Time
            </div>
          </div>
        </div>
        <div className="absolute -bottom-4 -right-4">
          <TrendingUp className="w-24 h-24 text-black/10 rotate-12" />
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;