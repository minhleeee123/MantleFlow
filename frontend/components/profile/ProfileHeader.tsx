import React from 'react';
import { UserCircle, RefreshCw, HelpCircle } from 'lucide-react';

interface ProfileHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onRefresh, isRefreshing }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white">
          <UserCircle className="w-6 h-6" strokeWidth={2.5} />
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-black text-black dark:text-white uppercase tracking-tighter">My Profile</h1>
          <div className="group relative">
            <HelpCircle className="w-5 h-5 text-gray-400 hover:text-black dark:hover:text-white cursor-help transition-colors" />
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 w-64 p-3 bg-white dark:bg-black border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <p className="text-xs font-bold text-center text-black dark:text-white leading-tight">
                Current portfolio assets are mock data for testing the AI portfolio.
              </p>
              {/* Tiny arrow pointing left */}
              <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-r-[8px] border-t-transparent border-b-transparent border-r-black dark:border-r-white"></div>
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className={`p-3 bg-neo-yellow border-2 border-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-2 ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
        title="Refresh Prices"
      >
        <RefreshCw className={`w-5 h-5 text-black ${isRefreshing ? 'animate-spin' : ''}`} strokeWidth={2.5} />
        <span className="hidden md:inline font-bold text-black uppercase text-sm">Refresh Data</span>
      </button>
    </div>
  );
};

export default ProfileHeader;