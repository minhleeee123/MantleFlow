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

    // Phase 3: Bot Swap Props
    swapMode: 'quick' | 'bot';
    handleBotSwap?: () => void;
    botAuthorized?: boolean;
}

export const SwapTab: React.FC<Props> = ({
    swapFromToken, setSwapFromToken,
    swapFromAmount, setSwapFromAmount,
    estimatedOutput, handleSwap,
    vaultMnt, vaultUsdt,
    swapMode, handleBotSwap, botAuthorized
}) => {
    // Helper to determine button state
    const isBotMode = swapMode === 'bot';
    const canSwap = swapFromAmount && parseFloat(swapFromAmount) > 0 && parseFloat(swapFromAmount) <= parseFloat(swapFromToken === 'MNT' ? vaultMnt : vaultUsdt);

    // Bot swap requires authorization
    const isBotReady = !isBotMode || (isBotMode && botAuthorized);

    return (
        <div className="max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-2">
            <div className={`bg-purple-100 dark:bg-purple-900/10 p-8 border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] transition-colors rounded-xl
                ${isBotMode ? 'border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20' : 'border-black dark:border-purple-500'}`}>

                <div className="flex justify-between items-center mb-8 border-b-2 border-black dark:border-purple-500 pb-4">
                    <h4 className="font-black text-2xl uppercase flex items-center gap-3">
                        <TrendingUp className={`w-8 h-8 ${isBotMode ? 'text-purple-600' : 'text-black dark:text-white'}`} />
                        {isBotMode ? 'Bot Swap' : 'Instant Swap'}
                    </h4>
                    <div className={`text-xs font-black px-2 py-1 border border-black dark:border-white rounded-md ${isBotMode ? 'bg-purple-600 text-white' : 'bg-white dark:bg-black text-black dark:text-white'}`}>
                        {isBotMode ? 'NO SIGNATURE' : '0.0% FEE'}
                    </div>
                </div>

                <div className="relative space-y-2">
                    {/* FROM INPUT */}
                    <div className={`bg-white dark:bg-black p-4 border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] transition-colors rounded-xl
                        ${parseFloat(swapFromAmount) > parseFloat(swapFromToken === 'MNT' ? vaultMnt : vaultUsdt) ? 'border-red-500' : 'border-black dark:border-white'}`}>
                        <div className="flex justify-between mb-2 text-xs font-black uppercase tracking-wider text-gray-500">
                            <span className={parseFloat(swapFromAmount) > parseFloat(swapFromToken === 'MNT' ? vaultMnt : vaultUsdt) ? 'text-red-500 bg-red-100 px-1' : ''}>
                                {parseFloat(swapFromAmount) > parseFloat(swapFromToken === 'MNT' ? vaultMnt : vaultUsdt) ? 'INSUFFICIENT FUNDS' : 'You Pay'}
                            </span>
                            <span className="cursor-pointer hover:bg-black hover:text-white px-1"
                                onClick={() => setSwapFromAmount(swapFromToken === 'MNT' ? vaultMnt : vaultUsdt)}>
                                VAULT BALANCE: {parseFloat(swapFromToken === 'MNT' ? vaultMnt : vaultUsdt).toFixed(4)}
                            </span>
                        </div>
                        <div className="flex gap-4 items-center">
                            <input
                                type="number"
                                value={swapFromAmount}
                                onChange={(e) => setSwapFromAmount(e.target.value)}
                                className={`w-full text-3xl font-mono font-black bg-transparent outline-none placeholder:text-gray-300 ${parseFloat(swapFromAmount) > parseFloat(swapFromToken === 'MNT' ? vaultMnt : vaultUsdt) ? 'text-red-500' : ''}`}
                                placeholder="0.0"
                            />
                            <button
                                className="shrink-0 flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors font-black uppercase text-sm border-2 border-transparent rounded-lg"
                                onClick={() => setSwapFromToken(swapFromToken === 'MNT' ? 'USDT' : 'MNT')}
                            >
                                {swapFromToken}
                                <ArrowDownCircle className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* SWAP ICON */}
                    <div className="flex justify-center -my-5 relative z-10 pointer-events-none">
                        <div className="bg-white dark:bg-black border-2 border-black dark:border-white p-2 pointer-events-auto cursor-pointer hover:rotate-180 transition-transform duration-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg"
                            onClick={() => setSwapFromToken(swapFromToken === 'MNT' ? 'USDT' : 'MNT')}>
                            <ArrowDownCircle className="w-6 h-6 text-black dark:text-white" />
                        </div>
                    </div>

                    {/* TO (ESTIMATED) */}
                    <div className="bg-white dark:bg-black p-4 border-2 border-black dark:border-white opacity-80 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] rounded-xl">
                        <div className="flex justify-between mb-2 text-xs font-black uppercase tracking-wider text-gray-500">
                            <span>You Receive (Est.)</span>
                        </div>
                        <div className="flex gap-4 items-center">
                            <div className="w-full text-3xl font-mono font-black text-gray-500">
                                {estimatedOutput === '0' ? '0.0' : parseFloat(estimatedOutput).toFixed(4)}
                            </div>
                            <div className="shrink-0 flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-800 text-black dark:text-white font-black uppercase text-sm rounded-lg">
                                {swapFromToken === 'MNT' ? 'USDT' : 'MNT'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* SLIPPAGE INFO */}
                {estimatedOutput !== '0' && (
                    <div className="mt-4 p-2 bg-purple-200 dark:bg-purple-900/30 border-2 border-black dark:border-purple-500 flex justify-between text-xs font-mono font-bold text-purple-900 dark:text-purple-200 rounded-lg">
                        <span>MIN RECEIVED (5% SLIP):</span>
                        <span>{(parseFloat(estimatedOutput) * 0.95).toFixed(4)} {swapFromToken === 'MNT' ? 'USDT' : 'MNT'}</span>
                    </div>
                )}

                <button
                    onClick={isBotMode ? handleBotSwap : handleSwap}
                    disabled={!canSwap || !isBotReady}
                    className={`w-full mt-6 text-white border-2 border-black font-black py-4 text-xl hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 disabled:cursor-not-allowed uppercase rounded-xl
                        ${isBotMode ? 'bg-purple-600 hover:bg-purple-500' : 'bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200'}`}
                >
                    {isBotMode
                        ? (!botAuthorized ? 'AUTHORIZE BOT FIRST ↑' : '🤖 EXECUTE BOT SWAP')
                        : 'EXECUTE SWAP'
                    }
                </button>
            </div>
        </div>
    );
};
