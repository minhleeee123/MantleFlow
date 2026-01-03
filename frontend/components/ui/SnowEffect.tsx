import React, { useEffect, useState } from 'react';

interface Snowflake {
  id: number;
  left: number;
  animationDuration: number;
  opacity: number;
  size: number;
}

const SnowEffect: React.FC = () => {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    // Generate snowflakes
    const flakes = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // Random horizontal position %
      animationDuration: Math.random() * 3 + 2, // Random speed between 2s and 5s
      opacity: Math.random(),
      size: Math.random() * 5 + 5, // Random size
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden" aria-hidden="true">
      <style>
        {`
          @keyframes snowfall {
            0% {
              transform: translateY(-10px) translateX(0) rotate(0deg);
            }
            100% {
              transform: translateY(110vh) translateX(20px) rotate(360deg);
            }
          }
        `}
      </style>
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute bg-white rounded-full"
          style={{
            left: `${flake.left}vw`,
            top: '-10px',
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            animationName: 'snowfall',
            animationDuration: `${flake.animationDuration}s`,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            animationDelay: `-${Math.random() * 5}s`, // Random start delay
            boxShadow: '0 0 5px rgba(255, 255, 255, 0.8)',
          }}
        ></div>
      ))}
    </div>
  );
};

export default SnowEffect;