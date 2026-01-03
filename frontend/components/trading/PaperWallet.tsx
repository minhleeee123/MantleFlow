import React from 'react';
import { Wallet, ArrowDownCircle, ArrowUpCircle, DollarSign } from 'lucide-react';
import { PaperWallet as IPaperWallet } from '../../types';

interface Props {
    wallet: IPaperWallet;
    onUpdateBalance: (amount: number, type: 'DEPOSIT' | 'WITHDRAW') => void;
}

const PaperWallet: React.FC<Props> = ({ wallet, onUpdateBalance }) => {
    return (
        <div className="bg-neo-secondary border-2 border-black dark:border-white shadow-neo p-6 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-black text-white p-1.5 border border-white">
                             <Wallet className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-black text-black uppercase tracking-widest">Paper Trading Balance</span>
                    </div>
                    <div className="text-4xl font-black text-black tracking-tighter flex items-baseline">
                        ${wallet.usdtBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <span className="text-lg ml-1 font-bold opacity-60">USDT</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={() => onUpdateBalance(1000, 'DEPOSIT')}
                        className="flex flex-col items-center justify-center w-20 h-20 bg-white border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                    >
                        <ArrowDownCircle className="w-6 h-6 text-green-600 mb-1" />
                        <span className="text-[10px] font-black uppercase">Deposit</span>
                    </button>
                     <button 
                        onClick={() => onUpdateBalance(100, 'WITHDRAW')}
                        className="flex flex-col items-center justify-center w-20 h-20 bg-white border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                    >
                        <ArrowUpCircle className="w-6 h-6 text-red-600 mb-1" />
                        <span className="text-[10px] font-black uppercase">Withdraw</span>
                    </button>
                </div>
            </div>

            {/* Holdings Strip */}
            {Object.keys(wallet.holdings).length > 0 && (
                <div className="mt-6 pt-4 border-t-2 border-black border-dashed flex gap-4 overflow-x-auto">
                    {Object.entries(wallet.holdings).map(([symbol, amount]) => (
                        <div key={symbol} className="bg-black text-white px-3 py-1 text-xs font-bold border border-white shadow-sm whitespace-nowrap">
                            {symbol}: {amount.toLocaleString()}
                        </div>
                    ))}
                </div>
            )}

            <div className="absolute -bottom-6 -left-6 opacity-10 pointer-events-none">
                <DollarSign className="w-40 h-40 text-black" />
            </div>
        </div>
    );
};

export default PaperWallet;
