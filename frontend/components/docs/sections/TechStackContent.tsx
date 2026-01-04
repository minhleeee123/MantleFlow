import React from 'react';

export const TechStackContent = () => (
    <div className="overflow-x-auto">
        <table className="w-full text-left border-2 border-black dark:border-white">
            <thead className="bg-black text-white dark:bg-white dark:text-black uppercase text-sm">
                <tr>
                    <th className="p-4">Layer</th>
                    <th className="p-4">Technology</th>
                    <th className="p-4">Purpose</th>
                </tr>
            </thead>
            <tbody className="divide-y-2 divide-black dark:divide-white text-sm font-mono font-bold">
                <tr>
                    <td className="p-4 bg-gray-50 dark:bg-white/5">Frontend</td>
                    <td className="p-4">React 19, Vite, Tailwind</td>
                    <td className="p-4 text-gray-500">UI/UX & State</td>
                </tr>
                <tr>
                    <td className="p-4 bg-gray-50 dark:bg-white/5">AI</td>
                    <td className="p-4">Gemini 2.5 Flash SDK</td>
                    <td className="p-4 text-gray-500">Intelligence & NLP</td>
                </tr>
                <tr>
                    <td className="p-4 bg-gray-50 dark:bg-white/5">Backend</td>
                    <td className="p-4">Node.js, Express, Prisma</td>
                    <td className="p-4 text-gray-500">API & Background Jobs</td>
                </tr>
                <tr>
                    <td className="p-4 bg-gray-50 dark:bg-white/5">Blockchain</td>
                    <td className="p-4">Mantle Sepolia, Solidity</td>
                    <td className="p-4 text-gray-500">Settlement Layer</td>
                </tr>
            </tbody>
        </table>
    </div>
);
