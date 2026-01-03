import React from 'react';
import { UserCircle, RefreshCw } from 'lucide-react';

interface ProfileHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onRefresh, isRefreshing }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white">
            <UserCircle className="w-6 h-6" strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-black text-black dark:text-white uppercase tracking-tighter">My Profile</h1>
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