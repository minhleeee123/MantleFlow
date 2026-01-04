import React, { useState } from 'react';
import { Terminal, Database, Cpu, Layers, Shield, Code, GitBranch, Globe, Play, BookOpen, Server } from 'lucide-react';

// Import content sections
import { IntroContent } from './sections/IntroContent';
import { QuickstartContent } from './sections/QuickstartContent';
import { FeaturesContent } from './sections/FeaturesContent';
import { ArchitectureContent } from './sections/ArchitectureContent';
import { WorkflowContent } from './sections/WorkflowContent';
import { TechStackContent } from './sections/TechStackContent';
import { SecurityContent } from './sections/SecurityContent';
import { ApiContent } from './sections/ApiContent';

// --- Types ---
type DocSectionId = 'intro' | 'quickstart' | 'architecture' | 'features' | 'workflow' | 'techstack' | 'security' | 'api';

interface DocSection {
    id: DocSectionId;
    title: string;
    icon: any;
    content: React.ReactNode;
}

interface DocCategory {
    title: string;
    items: DocSectionId[];
}

// --- Main Component ---
const Documentation: React.FC = () => {
    const [activeSection, setActiveSection] = useState<DocSectionId>('intro');

    const categories: DocCategory[] = [
        { title: 'Getting Started', items: ['intro', 'quickstart'] },
        { title: 'Core Concepts', items: ['features', 'architecture', 'workflow'] },
        { title: 'Reference', items: ['techstack', 'security', 'api'] },
    ];

    const sections: Record<DocSectionId, DocSection> = {
        intro: {
            id: 'intro',
            title: 'Introduction',
            icon: Globe,
            content: <IntroContent />
        },
        quickstart: {
            id: 'quickstart',
            title: 'Quickstart Guide',
            icon: Play,
            content: <QuickstartContent />
        },
        features: {
            id: 'features',
            title: 'Core Features',
            icon: Terminal,
            content: <FeaturesContent />
        },
        architecture: {
            id: 'architecture',
            title: 'System Architecture',
            icon: Layers,
            content: <ArchitectureContent />
        },
        workflow: {
            id: 'workflow',
            title: 'Workflows',
            icon: GitBranch,
            content: <WorkflowContent />
        },
        techstack: {
            id: 'techstack',
            title: 'Tech Stack',
            icon: Code,
            content: <TechStackContent />
        },
        security: {
            id: 'security',
            title: 'Security',
            icon: Shield,
            content: <SecurityContent />
        },
        api: {
            id: 'api',
            title: 'API Reference',
            icon: Server,
            content: <ApiContent />
        }
    };

    return (
        <div className="flex h-full w-full bg-[#f0f2f5] dark:bg-[#050505] text-black dark:text-white animate-page-enter">
            {/* LEFT SIDEBAR */}
            <div className="w-64 flex-shrink-0 border-r-2 border-black dark:border-white bg-neo-yellow dark:bg-[#111] overflow-y-auto custom-scrollbar">
                <div className="p-4">
                    <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2 px-2 mt-4">
                        <BookOpen className="w-6 h-6 text-black" /> Docs
                    </h2>

                    <div className="space-y-8">
                        {categories.map((cat) => (
                            <div key={cat.title}>
                                <h3 className="text-xs font-black text-black dark:text-gray-500 uppercase tracking-widest mb-2 px-2 border-b-2 border-black dark:border-white pb-1">
                                    {cat.title}
                                </h3>
                                <div className="space-y-2 mt-2">
                                    {cat.items.map((itemId) => {
                                        const section = sections[itemId];
                                        const isActive = activeSection === itemId;
                                        return (
                                            <button
                                                key={itemId}
                                                onClick={() => setActiveSection(itemId)}
                                                className={`
                                                    w-full text-left px-3 py-2 text-sm font-bold border-2 transition-all flex items-center gap-3
                                                    ${isActive
                                                        ? 'bg-neo-primary border-black dark:border-white text-white shadow-neo-sm'
                                                        : 'bg-white border-transparent hover:border-black text-black'
                                                    }
                                                `}
                                            >
                                                <div className="overflow-hidden">
                                                    {section.title}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT CONTENT AREA */}
            <div className="flex-1 overflow-y-auto bg-checkered p-8 md:p-12 relative">
                <div className="max-w-4xl mx-auto min-h-full pb-20">
                    <div className="mb-8 border-b-4 border-black dark:border-white pb-4">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="p-2 bg-yellow-400 border-2 border-black shadow-neo-sm">
                                {React.createElement(sections[activeSection].icon, { className: "w-6 h-6 text-black" })}
                            </span>
                            <h1 className="text-4xl font-black uppercase tracking-tight">{sections[activeSection].title}</h1>
                        </div>
                    </div>

                    <div className="prose dark:prose-invert max-w-none">
                        {sections[activeSection].content}
                    </div>

                    {/* Footer for content */}
                    <div className="mt-20 pt-6 border-t-2 border-dashed border-gray-300 dark:border-gray-700 text-sm text-gray-500">
                        Designed with CryptoInsight Neo-Brutalism System
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Documentation;
