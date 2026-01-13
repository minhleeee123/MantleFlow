import React from 'react';

interface InputFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    balance: string;
    symbol: string;
    onMax: () => void;
    error?: string;
    balanceLabel?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, balance, symbol, onMax, error, balanceLabel = 'AVAIL' }) => (
    <div className="space-y-2">
        <div className="flex justify-between text-xs font-black uppercase text-black dark:text-white items-end">
            <label className={`px-2 py-1 ${error ? 'bg-red-500 text-white' : 'bg-black text-white dark:bg-white dark:text-black'}`}>
                {error ? 'INSUFFICIENT FUNDS' : label}
            </label>
            <span className="cursor-pointer hover:bg-yellow-400 hover:text-black px-2 py-1 font-mono border border-transparent hover:border-black transition-all" onClick={onMax}>
                {balanceLabel}: {parseFloat(balance).toFixed(4)}
            </span>
        </div>
        <div className="relative">
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="0.00"
                className={`w-full bg-white dark:bg-black border-2 p-4 font-mono text-2xl font-bold focus:outline-none transition-colors rounded-xl placeholder:text-gray-300 ${error ? 'border-red-500 text-red-500 focus:bg-red-50 dark:focus:bg-red-900/10' : 'border-black dark:border-white focus:bg-yellow-50 dark:focus:bg-gray-900'}`}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                <button
                    onClick={onMax}
                    className="text-xs font-black bg-black text-white hover:bg-yellow-400 hover:text-black px-3 py-1 border-2 border-transparent transition-colors uppercase rounded-md"
                >
                    MAX
                </button>
                <span className="font-black text-lg text-black dark:text-white uppercase">{symbol}</span>
            </div>
        </div>
    </div>
);
