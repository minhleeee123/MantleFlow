import React from 'react';
import { Github, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <div className="bg-black text-white py-12 px-6 border-t-2 border-black">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">CryptoInsight AI</h2>
            <p className="text-gray-400 font-mono text-sm mt-1">Hackathon Build v2.5.0</p>
        </div>

        <div className="flex gap-4">
            <a href="#" className="p-2 border border-white hover:bg-white hover:text-black transition-colors">
                <Github className="w-5 h-5" />
            </a>
            <a href="#" className="p-2 border border-white hover:bg-white hover:text-black transition-colors">
                <Twitter className="w-5 h-5" />
            </a>
        </div>

        <div className="text-right text-xs font-bold text-gray-500 uppercase">
            © 2024 Gemini Hackathon Team.<br/>All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Footer;