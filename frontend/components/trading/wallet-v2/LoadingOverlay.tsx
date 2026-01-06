import React from 'react';
import { Loader2 } from 'lucide-react';

interface Props {
    message?: string;
}

export const LoadingOverlay: React.FC<Props> = ({ message = 'Processing transaction...' }) => (
    <div className="absolute inset-0 bg-white/90 dark:bg-black/90 backdrop-blur-none z-50 flex flex-col items-center justify-center animate-in fade-in duration-200">
        <div className="bg-white dark:bg-black border-2 border-black dark:border-white p-8 shadow-neo text-center max-w-sm w-full relative">
            {/* Animated Stripes Background Element */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDQwbDQwLTQwVjBMMCA0MHoiIGZpbGw9IiMwMDAiIGZpbGwtcnVsZT0idXZlbm9kZCIvPgo8L3N2Zz4=')]"></div>

            <Loader2 className="w-16 h-16 text-black dark:text-white animate-spin mx-auto mb-6" />
            <h3 className="text-2xl font-black uppercase text-black dark:text-white mb-2 tracking-tighter">Processing</h3>
            <div className="h-1 w-full bg-gray-200 dark:bg-gray-800 mb-4 overflow-hidden border border-black dark:border-white">
                <div className="h-full bg-black dark:bg-white animate-progress-stripes w-full origin-left"></div>
            </div>
            <p className="text-sm font-mono font-bold text-gray-600 dark:text-gray-400 uppercase">
                {message}
            </p>
        </div>
    </div>
);
