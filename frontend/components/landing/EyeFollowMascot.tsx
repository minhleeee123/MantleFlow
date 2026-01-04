import React, { useState, useEffect, useRef } from 'react';

const EyeFollowMascot: React.FC = () => {
    const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
    const mascotRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!mascotRef.current) return;

            const mascotRect = mascotRef.current.getBoundingClientRect();
            const mascotCenterX = mascotRect.left + mascotRect.width / 2;
            const mascotCenterY = mascotRect.top + mascotRect.height / 2;

            const angle = Math.atan2(e.clientY - mascotCenterY, e.clientX - mascotCenterX);
            const distance = Math.min(
                Math.sqrt(
                    Math.pow(e.clientX - mascotCenterX, 2) +
                    Math.pow(e.clientY - mascotCenterY, 2)
                ) / 20,
                8 // Max distance pupils can move
            );

            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;

            setEyePosition({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div
            ref={mascotRef}
            className="fixed top-8 left-8 z-50 pointer-events-none select-none"
            style={{
                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
                animation: 'float 6s ease-in-out infinite'
            }}
        >
            {/* Robot Head */}
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Antenna */}
                <line x1="60" y1="10" x2="60" y2="25" stroke="#000" strokeWidth="3" />
                <circle cx="60" cy="8" r="5" fill="#FFD700" stroke="#000" strokeWidth="2" />

                {/* Head */}
                <rect x="30" y="25" width="60" height="60" rx="8" fill="#FFD700" stroke="#000" strokeWidth="3" />

                {/* Face panel */}
                <rect x="35" y="35" width="50" height="45" rx="4" fill="#FFF" stroke="#000" strokeWidth="2" />

                {/* Left Eye */}
                <g transform="translate(47, 50)">
                    <circle cx="0" cy="0" r="10" fill="#FFF" stroke="#000" strokeWidth="2" />
                    <circle
                        cx={eyePosition.x}
                        cy={eyePosition.y}
                        r="5"
                        fill="#000"
                        style={{ transition: 'all 0.1s ease-out' }}
                    />
                </g>

                {/* Right Eye */}
                <g transform="translate(73, 50)">
                    <circle cx="0" cy="0" r="10" fill="#FFF" stroke="#000" strokeWidth="2" />
                    <circle
                        cx={eyePosition.x}
                        cy={eyePosition.y}
                        r="5"
                        fill="#000"
                        style={{ transition: 'all 0.1s ease-out' }}
                    />
                </g>

                {/* Mouth */}
                <path
                    d="M 45 70 Q 60 75 75 70"
                    stroke="#000"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                />

                {/* Ears/Side panels */}
                <rect x="20" y="45" width="10" height="15" rx="2" fill="#FFD700" stroke="#000" strokeWidth="2" />
                <rect x="90" y="45" width="10" height="15" rx="2" fill="#FFD700" stroke="#000" strokeWidth="2" />

                {/* Screws */}
                <circle cx="40" cy="32" r="2" fill="#000" />
                <circle cx="80" cy="32" r="2" fill="#000" />
            </svg>

            {/* Label */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-xs font-black uppercase bg-neo-accent text-black px-2 py-1 border-2 border-black shadow-neo-sm">
                    MantleBot
                </span>
            </div>
        </div>
    );
};

export default EyeFollowMascot;
