import React from 'react';

interface InputFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    balance: string;
    symbol: string;
    onMax: () => void;
}

export const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, balance, symbol, onMax }) => (
    <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold uppercase text-gray-500">
            <label>{label}</label>
            <span className="cursor-pointer hover:text-black dark:hover:text-white transition-colors" onClick={onMax}>
                Avail: {parseFloat(balance).toFixed(4)}
            </span>
        </div>
        <div className="relative">
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 font-mono text-lg focus:border-black dark:focus:border-white focus:outline-none transition-colors"
                autoFocus={true}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                    onClick={onMax}
                    className="text-[10px] font-bold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-2 py-1 rounded transition-colors"
                >
                    MAX
                </button>
                <span className="font-bold text-sm text-gray-400">{symbol}</span>
            </div>
        </div>
    </div>
);
