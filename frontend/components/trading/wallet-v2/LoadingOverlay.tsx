import React from 'react';
import { Loader2 } from 'lucide-react';

interface Props {
    message?: string;
}

export const LoadingOverlay: React.FC<Props> = ({ message = 'Processing transaction...' }) => (
    <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-xl animate-in fade-in duration-200">
        <Loader2 className="w-12 h-12 text-black dark:text-white animate-spin mb-4" />
        <h3 className="text-lg font-black uppercase text-black dark:text-white mb-2">Processing</h3>
        <p className="text-sm font-mono text-gray-600 dark:text-gray-400 animate-pulse">
            {message}
        </p>
    </div>
);
