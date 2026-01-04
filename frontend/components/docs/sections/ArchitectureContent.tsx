import React from 'react';
import { Box, Cpu } from 'lucide-react';

export const ArchitectureContent = () => (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 border-2 border-black dark:border-white shadow-neo">
                <h3 className="font-black text-xl mb-4 flex items-center gap-2 border-b-2 border-black dark:border-white pb-2">
                    <Box className="w-5 h-5" /> Frontend
                </h3>
                <ul className="font-mono text-sm space-y-2 text-gray-600 dark:text-gray-300">
                    <li className="flex justify-between"><span>/components/chat</span> <span className="text-gray-400">AI Interface</span></li>
                    <li className="flex justify-between"><span>/components/trading</span> <span className="text-gray-400">Auto-trade UI</span></li>
                    <li className="flex justify-between"><span>/services/agents</span> <span className="text-gray-400">AI Logic</span></li>
                    <li className="flex justify-between"><span>/services/web3</span> <span className="text-gray-400">Ethers Wrappers</span></li>
                </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 border-2 border-black dark:border-white shadow-neo">
                <h3 className="font-black text-xl mb-4 flex items-center gap-2 border-b-2 border-black dark:border-white pb-2">
                    <Cpu className="w-5 h-5" /> Backend
                </h3>
                <ul className="font-mono text-sm space-y-2 text-gray-600 dark:text-gray-300">
                    <li className="flex justify-between"><span>/src/routes</span> <span className="text-gray-400">API Endpoints</span></li>
                    <li className="flex justify-between"><span>/src/services</span> <span className="text-gray-400">Data Layer</span></li>
                    <li className="flex justify-between"><span>/src/workers</span> <span className="text-gray-400">Background Jobs</span></li>
                    <li className="flex justify-between"><span>/prisma</span> <span className="text-gray-400">DB Schema</span></li>
                </ul>
            </div>
        </div>
    </div>
);
