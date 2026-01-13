import React from 'react';
import { CheckItem, StepBlock, CodeBlock } from '../DocHelpers';
import { Rocket } from 'lucide-react';

export const QuickstartContent = () => (
    <div className="space-y-8">
        <p className="text-lg">Get MantleFlow up and running in under 10 minutes. This guide covers installation and local deployment.</p>

        <div>
            <h3 className="text-xl font-black uppercase mb-4">Prerequisites</h3>
            <ul className="space-y-2">
                <CheckItem>Node.js 20+ and npm</CheckItem>
                <CheckItem>Git for cloning repository</CheckItem>
                <CheckItem>MySQL Database (local or cloud)</CheckItem>
                <CheckItem>MetaMask installed in browser</CheckItem>
            </ul>
        </div>

        <StepBlock step="1" title="Clone the Repository">
            <CodeBlock code={`git clone https://github.com/minhleeee123/MantleFlow.git
cd MantleFlow`} />
        </StepBlock>

        <StepBlock step="2" title="Setup Backend">
            <CodeBlock code={`cd backend
npm install
cp .env.example .env
# Configure DATABASE_URL & PRIVATE_KEYS in .env
npx prisma migrate dev
npm run dev`} />
        </StepBlock>

        <StepBlock step="3" title="Setup Frontend">
            <CodeBlock code={`cd frontend
npm install
npm run dev`} />
        </StepBlock>

        <div className="bg-neo-accent p-4 border-2 border-black font-bold text-center flex items-center justify-center gap-2 rounded-xl">
            <Rocket className="w-5 h-5" /> Open <a href="http://localhost:3000" target="_blank" rel="noreferrer" className="underline">http://localhost:3000</a> to verify installation
        </div>
    </div>
);
