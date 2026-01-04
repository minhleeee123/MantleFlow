import React from 'react';
import { Box, Server, Code, Cpu, CheckCircle, Shield } from 'lucide-react';

// --- HELPER COMPONENTS ---

export const InfoCard = ({ title, icon: Icon, children }: any) => (
    <div className="bg-white dark:bg-gray-800 p-4 border-2 border-black dark:border-white hover:bg-neo-bg transition-colors">
        <div className="flex items-center gap-2 mb-2 font-black uppercase text-sm">
            <Icon className="w-4 h-4" /> {title}
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
            {children}
        </p>
    </div>
);

export const CheckItem = ({ children }: any) => (
    <li className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-300">
        <CheckCircle className="w-5 h-5 text-neo-green" /> {children}
    </li>
);

export const StepBlock = ({ step, title, children }: any) => (
    <div className="relative pl-8 border-l-2 border-gray-300 dark:border-gray-700 pb-8 last:pb-0">
        <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-black border-4 border-[#f0f2f5] dark:border-[#050505]">
            {step}
        </div>
        <h4 className="text-lg font-bold mb-3 mt-1 ml-2">{title}</h4>
        <div className="ml-2">
            {children}
        </div>
    </div>
);

export const CodeBlock = ({ code }: { code: string }) => (
    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm border-2 border-black shadow-neo-sm overflow-x-auto">
        <pre>{code}</pre>
    </div>
);

export const FeatureBlock = ({ title, children }: any) => (
    <div className="bg-white dark:bg-gray-800 p-6 border-2 border-black dark:border-white shadow-neo-sm">
        <h3 className="text-lg font-black mb-3 text-neo-secondary uppercase">{title}</h3>
        <div className="text-sm leading-relaxed">{children}</div>
    </div>
);

export const SecurityItem = ({ title, desc }: any) => (
    <div className="bg-white dark:bg-gray-800 p-4 border-l-4 border-green-500 shadow-sm">
        <h4 className="font-bold uppercase flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-500" /> {title}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{desc}</p>
    </div>
);

export const Endpoint = ({ method, path, desc }: any) => {
    const colors: any = { GET: 'bg-blue-500', POST: 'bg-green-500', DELETE: 'bg-red-500', PATCH: 'bg-yellow-500' };
    return (
        <div className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 border-2 border-black dark:border-white font-mono text-sm">
            <span className={`px-2 py-1 text-white font-bold text-xs w-16 text-center ${colors[method] || 'bg-gray-500'}`}>
                {method}
            </span>
            <span className="font-bold">{path}</span>
            <span className="text-gray-500 ml-auto hidden md:block">{desc}</span>
        </div>
    );
};
