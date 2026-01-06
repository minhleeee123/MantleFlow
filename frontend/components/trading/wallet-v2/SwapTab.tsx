import React from 'react';
import { TrendingUp, Coins, ArrowDownCircle } from 'lucide-react';

interface Props {
    swapFromToken: 'MNT' | 'USDT';
    setSwapFromToken: (token: 'MNT' | 'USDT') => void;
    swapFromAmount: string;
    setSwapFromAmount: (v: string) => void;
    estimatedOutput: string;
    handleSwap: () => void;
    vaultMnt: string;
    vaultUsdt: string;
}

export const SwapTab: React.FC<Props> = ({
    swapFromToken, setSwapFromToken,
    swapFromAmount, setSwapFromAmount,
    estimatedOutput, handleSwap,
    vaultMnt, vaultUsdt
}) => (
    <div className="max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-2">
        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold text-lg uppercase flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-500" /> Instant Swap
                </h4>
                <div className="text-xs font-mono text-gray-400">0.0% protocol fee</div>
            </div>

            <div className="relative">
                {/* FROM INPUT */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-transparent focus-within:border-purple-500 transition-colors">
                    <div className="flex justify-between mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase">You Pay</span>
                        <span className="text-xs font-mono text-gray-500 cursor-pointer hover:text-purple-500"
                            onClick={() => setSwapFromAmount(swapFromToken === 'MNT' ? vaultMnt : vaultUsdt)}>
                            Balance: {parseFloat(swapFromToken === 'MNT' ? vaultMnt : vaultUsdt).toFixed(4)}
                        </span>
                    </div>
                    <div className="flex gap-4 items-center">
                        <input
                            type="number"
                            value={swapFromAmount}
                            onChange={(e) => setSwapFromAmount(e.target.value)}
                            className="w-full text-2xl font-mono font-bold bg-transparent outline-none"
                            placeholder="0.0"
                        />
                        <div className="shrink-0 flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full font-bold cursor-pointer hover:bg-gray-200 transition-colors"
                            onClick={() => setSwapFromToken(swapFromToken === 'MNT' ? 'USDT' : 'MNT')}>
                            {swapFromToken === 'MNT' ? <Coins className="w-4 h-4 text-blue-500" /> : <Coins className="w-4 h-4 text-green-500" />}
                            {swapFromToken}
                            <ArrowDownCircle className="w-3 h-3 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* SWAP ICON */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <button
                        onClick={() => setSwapFromToken(swapFromToken === 'MNT' ? 'USDT' : 'MNT')}
                        className="p-2 bg-gray-100 dark:bg-gray-700 border-4 border-white dark:border-gray-800 rounded-full hover:rotate-180 transition-transform duration-300 shadow-sm"
                    >
                        <ArrowDownCircle className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* TO (ESTIMATED) */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-transparent mt-2">
                    <div className="flex justify-between mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase">You Receive (Est.)</span>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className="w-full text-2xl font-mono font-bold text-gray-400">
                            {estimatedOutput === '0' ? '0.0' : parseFloat(estimatedOutput).toFixed(4)}
                        </div>
                        <div className="shrink-0 flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full font-bold opacity-80">
                            {swapFromToken === 'MNT' ? <Coins className="w-4 h-4 text-green-500" /> : <Coins className="w-4 h-4 text-blue-500" />}
                            {swapFromToken === 'MNT' ? 'USDT' : 'MNT'}
                        </div>
                    </div>
                </div>
            </div>

            {/* SLIPPAGE INFO */}
            {estimatedOutput !== '0' && (
                <div className="mt-4 px-2 flex justify-between text-xs font-mono text-gray-500">
                    <span>Min. Received (5% slip):</span>
                    <span>{(parseFloat(estimatedOutput) * 0.95).toFixed(4)} {swapFromToken === 'MNT' ? 'USDT' : 'MNT'}</span>
                </div>
            )}

            <button
                onClick={handleSwap}
                disabled={!swapFromAmount || parseFloat(swapFromAmount) <= 0}
                className="w-full mt-6 bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-700 transition-all shadow-[0px_4px_15px_rgba(124,58,237,0.3)] disabled:opacity-50 disabled:shadow-none translate-y-0 active:translate-y-1"
            >
                CONFIRM SWAP
            </button>
        </div>
    </div>
);
