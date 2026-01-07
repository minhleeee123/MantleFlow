import React, { useEffect, useState, useRef } from 'react';

const NeoBot: React.FC = () => {
  // Position State
  const [pos, setPos] = useState({ x: 50, y: 100 }); // Initial position
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Physics State
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);

  // Interaction State
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPos = useRef({ x: 50, y: 100 });

  // 1. Auto Blink Logic
  useEffect(() => {
    const blinkInterval = setInterval(() => {
        if (!isClicked && Math.random() > 0.7) {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 200);
        }
    }, 3000);
    return () => clearInterval(blinkInterval);
  }, [isClicked]);

  // 2. Drag & Eye Tracking Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // --- DRAG LOGIC ---
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        // Calculate velocity for tilt effect
        const vx = newX - lastPos.current.x;
        setVelocity({ x: vx, y: newY - lastPos.current.y });
        
        // Tilt based on velocity (max 20 degrees)
        setRotation(Math.max(Math.min(vx * 1.5, 20), -20));

        setPos({ x: newX, y: newY });
        lastPos.current = { x: newX, y: newY };
      } 
      // --- IDLE PHYSICS (Return to upright) ---
      else if (rotation !== 0) {
        setRotation(prev => prev * 0.9); // Decelerate rotation
        if (Math.abs(rotation) < 0.5) setRotation(0);
      }

      // --- EYE TRACKING LOGIC ---
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;

        // Clamp eye movement
        const x = Math.min(Math.max(deltaX / 15, -8), 8);
        const y = Math.min(Math.max(deltaY / 15, -6), 6);
        setMousePos({ x, y });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setRotation(0); // Reset tilt on release
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, rotation]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    });
  };

  const handleClick = () => {
    if (!isDragging) {
        setIsClicked(true);
        setTimeout(() => setIsClicked(false), 500);
    }
  };

  // Determine Eye Shape
  const getEyeScale = () => {
    if (isClicked) return "scale-y-10";
    if (isBlinking) return "scale-y-0";
    if (isHovered) return "scale-110";
    return "scale-100";
  };

  return (
    <div 
      ref={containerRef}
      style={{ 
        left: `${pos.x}px`, 
        top: `${pos.y}px`,
        transform: `rotate(${rotation}deg)`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      className="fixed z-50 select-none transition-transform duration-75 ease-out"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <div className={`relative group ${!isDragging ? 'animate-[float_4s_ease-in-out_infinite]' : ''}`}>
        
        {/* Speech Bubble */}
        <div className={`
            absolute -top-16 -right-24 bg-white border-2 border-black px-4 py-2 shadow-neo-sm
            transition-all duration-300 origin-bottom-left z-20 pointer-events-none
            ${(isHovered || isDragging) ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
        `}>
          <p className="text-xs font-black uppercase whitespace-nowrap">
            {isDragging ? "Wheeeeee!" : isClicked ? "Ouch!" : "Drag me!"}
          </p>
          <div className="absolute -bottom-2 left-2 w-3 h-3 bg-white border-b-2 border-r-2 border-black transform rotate-45"></div>
        </div>

        {/* --- THE ROBOT SVG --- */}
        <svg width="120" height="120" viewBox="0 0 120 120" className="overflow-visible drop-shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
            
            {/* Left Arm */}
            <g className={`transition-transform duration-200 origin-top-right`} style={{ transform: `rotate(${isDragging ? 45 : (isHovered ? 15 : 0)}deg)` }}>
                 <rect x="0" y="55" width="20" height="8" rx="4" fill="black" />
                 <circle cx="0" cy="59" r="6" fill="#f472b6" stroke="black" strokeWidth="2" />
            </g>

            {/* Right Arm */}
            <g className={`transition-transform duration-200 origin-top-left`} style={{ transform: `rotate(${isDragging ? -45 : (isHovered ? -15 : 0)}deg)` }}>
                 <rect x="100" y="55" width="20" height="8" rx="4" fill="black" />
                 <circle cx="120" cy="59" r="6" fill="#f472b6" stroke="black" strokeWidth="2" />
            </g>

            {/* Antenna - Fixed to rotate at base instead of bounce */}
            <g 
                className={isHovered ? 'animate-[antenna-wiggle_0.5s_ease-in-out_infinite]' : ''} 
                style={{ transformOrigin: '60px 15px' }} // Pivot point where antenna meets head
            >
                <line x1="60" y1="15" x2="60" y2="0" stroke="black" strokeWidth="3" />
                <circle cx="60" cy="0" r="5" fill={isDragging ? "#ef4444" : "#f472b6"} stroke="black" strokeWidth="3" />
                {/* Antenna Waves */}
                {isDragging && (
                    <>
                        <path d="M 50 -5 Q 60 -15 70 -5" fill="none" stroke="black" strokeWidth="2" opacity="0.5" />
                        <path d="M 45 -10 Q 60 -25 75 -10" fill="none" stroke="black" strokeWidth="2" opacity="0.3" />
                    </>
                )}
            </g>

            {/* Head Shape */}
            <rect 
                x="25" y="15" width="70" height="70" rx="12" 
                fill="#fcd34d" stroke="black" strokeWidth="3" 
                className="transition-colors duration-300"
            />
            {/* Head Highlight */}
            <path d="M 30 20 L 90 20 L 85 30 L 35 30 Z" fill="white" opacity="0.3" />

            {/* Face Shadow */}
            <path d="M 25 70 Q 60 85 95 70 v 15 h -70 z" fill="rgba(0,0,0,0.1)" />

            {/* --- EYES & BROWS --- */}
            <g transform="translate(0, 5)">
                {/* Left Eyebrow */}
                <rect 
                    x="35" y="28" width="20" height="4" rx="2" fill="black" 
                    className="transition-transform duration-200 origin-center"
                    style={{ transform: `rotate(${isClicked ? 20 : (isHovered ? -10 : 0)}deg) translateY(${isClicked ? 5 : 0}px)` }}
                />

                {/* Left Eye */}
                <g className={`transition-transform duration-100 origin-center ${getEyeScale()}`}>
                    <circle cx="45" cy="45" r="12" fill="white" stroke="black" strokeWidth="3" />
                    <circle cx={45 + mousePos.x} cy={45 + mousePos.y} r="5" fill="black" />
                    <circle cx={47 + mousePos.x} cy={43 + mousePos.y} r="2" fill="white" />
                </g>

                {/* Right Eyebrow */}
                <rect 
                    x="65" y="28" width="20" height="4" rx="2" fill="black" 
                    className="transition-transform duration-200 origin-center"
                    style={{ transform: `rotate(${isClicked ? -20 : (isHovered ? 10 : 0)}deg) translateY(${isClicked ? 5 : 0}px)` }}
                />

                {/* Right Eye */}
                <g className={`transition-transform duration-100 origin-center ${getEyeScale()}`}>
                    <circle cx="75" cy="45" r="12" fill="white" stroke="black" strokeWidth="3" />
                    <circle cx={75 + mousePos.x} cy={45 + mousePos.y} r="5" fill="black" />
                    <circle cx={77 + mousePos.x} cy={43 + mousePos.y} r="2" fill="white" />
                </g>
            </g>

            {/* Mouth */}
            <g className="transition-all duration-300" transform="translate(0, 5)">
                {isClicked ? (
                    <circle cx="60" cy="70" r="6" fill="black" />
                ) : isDragging ? (
                    <ellipse cx="60" cy="72" rx="4" ry="6" fill="black" />
                ) : isHovered ? (
                    <path d="M 45 68 Q 60 78 75 68" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" />
                ) : (
                    <rect x="48" y="68" width="24" height="4" rx="2" fill="black" />
                )}
            </g>

            {/* Cheeks */}
            <circle cx="35" cy="65" r="4" fill="#f472b6" opacity={isHovered ? 0.6 : 0} className="transition-opacity" />
            <circle cx="85" cy="65" r="4" fill="#f472b6" opacity={isHovered ? 0.6 : 0} className="transition-opacity" />

        </svg>

        {/* Dynamic Shadow (Below SVG) */}
        <div className={`
            absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black/20 rounded-[100%] blur-sm pointer-events-none transition-all duration-300
            ${isDragging ? 'w-16 h-4 opacity-10' : 'w-20 h-6 opacity-30'}
        `} />
      </div>
      
      {/* Helper styles for animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes antenna-wiggle {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
      `}</style>
    </div>
  );
};

export default NeoBot;
