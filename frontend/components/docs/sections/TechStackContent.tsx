import React from 'react';

export const TechStackContent = () => (
    <div className="space-y-8">
        {/* Tech Stack Table */}
        <div className="overflow-x-auto">
            <table className="w-full text-left border-2 border-black dark:border-white">
                <thead className="bg-black text-white dark:bg-white dark:text-black uppercase text-sm">
                    <tr>
                        <th className="p-4">Layer</th>
                        <th className="p-4">Technology</th>
                        <th className="p-4">Version/Details</th>
                    </tr>
                </thead>
                <tbody className="divide-y-2 divide-black dark:divide-white text-sm font-mono font-bold">
                    <tr>
                        <td className="p-4 bg-gray-50 dark:bg-white/5">Frontend Core</td>
                        <td className="p-4">React, Vite, TypeScript</td>
                        <td className="p-4 text-gray-500">v19.2, v6.2, v5.8</td>
                    </tr>
                    <tr>
                        <td className="p-4 bg-gray-50 dark:bg-white/5">Styling</td>
                        <td className="p-4">Tailwind CSS (Neo-brutalism)</td>
                        <td className="p-4 text-gray-500">Custom design system</td>
                    </tr>
                    <tr>
                        <td className="p-4 bg-gray-50 dark:bg-white/5">AI</td>
                        <td className="p-4">@google/genai</td>
                        <td className="p-4 text-gray-500">Gemini 2.5 Flash v1.30</td>
                    </tr>
                    <tr>
                        <td className="p-4 bg-gray-50 dark:bg-white/5">Web3</td>
                        <td className="p-4">ethers.js</td>
                        <td className="p-4 text-gray-500">v6.13.2</td>
                    </tr>
                    <tr>
                        <td className="p-4 bg-gray-50 dark:bg-white/5">Charts</td>
                        <td className="p-4">Recharts</td>
                        <td className="p-4 text-gray-500">v3.4.1 (Line, Pie, Radar)</td>
                    </tr>
                    <tr>
                        <td className="p-4 bg-gray-50 dark:bg-white/5">Icons</td>
                        <td className="p-4">Lucide React</td>
                        <td className="p-4 text-gray-500">v0.554 (Tree-shakeable)</td>
                    </tr>
                    <tr>
                        <td className="p-4 bg-gray-50 dark:bg-white/5">Backend Runtime</td>
                        <td className="p-4">Node.js + Express</td>
                        <td className="p-4 text-gray-500">v20+, v4.18.2</td>
                    </tr>
                    <tr>
                        <td className="p-4 bg-gray-50 dark:bg-white/5">ORM</td>
                        <td className="p-4">Prisma Client</td>
                        <td className="p-4 text-gray-500">v5.7 + MySQL</td>
                    </tr>
                    <tr>
                        <td className="p-4 bg-gray-50 dark:bg-white/5">Authentication</td>
                        <td className="p-4">jsonwebtoken</td>
                        <td className="p-4 text-gray-500">v9.0.2 (7-day tokens)</td>
                    </tr>
                    <tr>
                        <td className="p-4 bg-gray-50 dark:bg-white/5">Validation</td>
                        <td className="p-4">Zod</td>
                        <td className="p-4 text-gray-500">v3.22.4 (Schema validation)</td>
                    </tr>
                    <tr>
                        <td className="p-4 bg-gray-50 dark:bg-white/5">Smart Contracts</td>
                        <td className="p-4">Solidity + Hardhat</td>
                        <td className="p-4 text-gray-500">v0.8.20, v2.19</td>
                    </tr>
                    <tr>
                        <td className="p-4 bg-gray-50 dark:bg-white/5">Security Libs</td>
                        <td className="p-4">OpenZeppelin Contracts</td>
                        <td className="p-4 text-gray-500">v5.0 (Ownable, SafeERC20)</td>
                    </tr>
                    <tr>
                        <td className="p-4 bg-gray-50 dark:bg-white/5">Blockchain</td>
                        <td className="p-4">Mantle Sepolia Testnet</td>
                        <td className="p-4 text-gray-500">ChainID: 5003</td>
                    </tr>
                </tbody>
            </table>
        </div>

        {/* External APIs */}
        <div className="bg-white dark:bg-gray-800 p-6 border-2 border-black dark:border-white">
            <h3 className="text-xl font-black uppercase mb-4">External API Integrations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-bold">CoinGecko API</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Price data, market charts, coin search, historical data</p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                    <h4 className="font-bold">Alternative.me API</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Fear & Greed Index (Crypto sentiment score 0-100)</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-bold">Binance Futures API</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Long/Short Ratio, institutional positioning data</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-bold">Etherscan Gas Oracle</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Real-time gas price recommendations (for GAS condition triggers)</p>
                </div>
            </div>
        </div>

        {/* Smart Contract Addresses */}
        <div className="bg-gray-100 dark:bg-gray-900 p-6 border-2 border-black">
            <h3 className="text-xl font-black uppercase mb-4">Deployed Contract Addresses (Mantle Sepolia)</h3>
            <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between items-center bg-white dark:bg-black p-3 border border-gray-300">
                    <span className="font-bold">WalletFactory:</span>
                    <code className="text-blue-600 dark:text-blue-400">0xYourFactoryAddress</code>
                </div>
                <div className="flex justify-between items-center bg-white dark:bg-black p-3 border border-gray-300">
                    <span className="font-bold">FusionX Router:</span>
                    <code className="text-blue-600 dark:text-blue-400">0xb5Dc27be0a565A4A80440f41c74137001920CB22</code>
                </div>
                <div className="flex justify-between items-center bg-white dark:bg-black p-3 border border-gray-300">
                    <span className="font-bold">WMNT (Wrapped MNT):</span>
                    <code className="text-blue-600 dark:text-blue-400">0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF</code>
                </div>
                <div className="flex justify-between items-center bg-white dark:bg-black p-3 border border-gray-300">
                    <span className="font-bold">USDC (Testnet):</span>
                    <code className="text-blue-600 dark:text-blue-400">0x09Bc4E0D864854c6aFB6eB9A9cdF58ac190D0df9</code>
                </div>
            </div>
        </div>
    </div>
);
