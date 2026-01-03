import React, { useEffect, useMemo } from 'react';
import { PortfolioItem } from '../../types';

// Sub-components
import ProfileHeader from './ProfileHeader';
import ProfileStats from './ProfileStats';
import AllocationChart from './AllocationChart';
import HoldingsChart from './HoldingsChart';
import PortfolioTable from './PortfolioTable';

interface ProfileProps {
    user: {
      name: string;
      email: string;
      joinDate: string;
      walletAddress: string | null;
      totalBalance: number;
      portfolio: PortfolioItem[];
    };
    onRefreshPrices: () => Promise<void>;
    onConnectWallet: () => Promise<void>;
    onDisconnectWallet: () => void;
    onUpdateEmail: (email: string) => void;
    isRefreshing: boolean;
}

// Neo-Brutalist Color Palette for Charts
const COLORS = ['#a3e635', '#f472b6', '#8b5cf6', '#fcd34d', '#3b82f6', '#ef4444'];

const ProfileView: React.FC<ProfileProps> = ({ user, onRefreshPrices, onConnectWallet, onDisconnectWallet, onUpdateEmail, isRefreshing }) => {
  
  // Auto refresh when mounting profile view
  useEffect(() => {
    onRefreshPrices();
  }, []);

  // Calculate current total balance based on real-time prices
  const currentTotalBalance = user.portfolio.reduce((sum, item) => sum + (item.amount * item.currentPrice), 0);

  // Prepare Data for Charts
  const allocationData = useMemo(() => {
    return user.portfolio.map(item => ({
        name: item.symbol,
        value: item.amount * item.currentPrice
    })).sort((a, b) => b.value - a.value);
  }, [user.portfolio]);

  const valueData = useMemo(() => {
    return user.portfolio.map(item => ({
        name: item.symbol,
        value: item.amount * item.currentPrice,
        amount: item.amount
    }));
  }, [user.portfolio]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 animate-page-enter">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header / Nav */}
        <ProfileHeader 
            onRefresh={onRefreshPrices} 
            isRefreshing={isRefreshing} 
        />

        {/* Top Section: User Info & Balance Stats */}
        <ProfileStats 
            user={user}
            totalBalance={currentTotalBalance}
            isRefreshing={isRefreshing}
            onConnectWallet={onConnectWallet}
            onDisconnectWallet={onDisconnectWallet}
            onUpdateEmail={onUpdateEmail}
        />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AllocationChart 
                data={allocationData} 
                colors={COLORS} 
                totalBalance={currentTotalBalance} 
            />
            <HoldingsChart 
                data={valueData} 
                colors={COLORS} 
            />
        </div>

        {/* Portfolio Table */}
        <PortfolioTable 
            portfolio={user.portfolio} 
            walletAddress={user.walletAddress} 
        />
      </div>
    </div>
  );
};

export default ProfileView;