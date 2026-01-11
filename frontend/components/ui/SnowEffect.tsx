import React, { useEffect, useState } from 'react';

interface Snowflake {
  id: number;
  left: number;
  animationDuration: number;
  opacity: number;
  size: number;
  character: string;
}

const SnowEffect: React.FC = () => {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    const snowflakeChars = ['❄', '❅', '❆'];
    // Generate snowflakes
    const flakes = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // Random horizontal position %
      animationDuration: Math.random() * 3 + 4, // Slower fall: 4-7s
      opacity: Math.random() * 0.5 + 0.3, // 0.3 - 0.8 opacity
      size: Math.random() * 10 + 10, // Larger size for text: 10px - 20px
      character: snowflakeChars[Math.floor(Math.random() * snowflakeChars.length)]
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden" aria-hidden="true">
      <style>
        {`
          @keyframes snowfall {
            0% {
              transform: translateY(-20px) translateX(0) rotate(0deg);
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
          className="absolute text-sky-400 dark:text-white select-none drop-shadow-md"
          style={{
            left: `${flake.left}vw`,
            top: '-20px',
            fontSize: `${flake.size}px`,
            opacity: flake.opacity,
            animationName: 'snowfall',
            animationDuration: `${flake.animationDuration}s`,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            animationDelay: `-${Math.random() * 5}s`, // Random start delay
          }}
        >
          {flake.character}
        </div>
      ))}
    </div>
  );
};

export default SnowEffect;