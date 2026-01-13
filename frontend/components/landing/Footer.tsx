import React from 'react';
import { Github, Twitter, Facebook, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <div className="bg-black text-white py-12 px-6 border-t-2 border-black">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter">MantleFlow</h2>
          <p className="text-gray-400 font-mono text-sm mt-1">Hackathon Build</p>
        </div>

        <div className="flex gap-4">
          <a href="https://github.com/minhleeee123/MantleFlow" target="_blank" rel="noopener noreferrer" className="p-2 border border-white hover:bg-white hover:text-black transition-colors rounded-xl">
            <Github className="w-5 h-5" />
          </a>
          <a href="https://x.com/minh_quang28278" target="_blank" rel="noopener noreferrer" className="p-2 border border-white hover:bg-white hover:text-black transition-colors rounded-xl">
            <Twitter className="w-5 h-5" />
          </a>
          <a href="https://www.facebook.com/minh.le.187327" target="_blank" rel="noopener noreferrer" className="p-2 border border-white hover:bg-white hover:text-black transition-colors rounded-xl">
            <Facebook className="w-5 h-5" />
          </a>
          <a href="https://www.linkedin.com/in/quang-minh-l%C3%AA-08b71037a/" target="_blank" rel="noopener noreferrer" className="p-2 border border-white hover:bg-white hover:text-black transition-colors rounded-xl">
            <Linkedin className="w-5 h-5" />
          </a>
        </div>

        <div className="text-right text-xs font-bold text-gray-500 uppercase">
          © 2025 MantleFlow Labs.<br />All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Footer;