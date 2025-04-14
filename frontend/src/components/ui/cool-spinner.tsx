import { useEffect, useState } from 'react';

interface CoolSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export const CoolSpinner = ({
  size = 'md',
  className = '',
  text
}: CoolSpinnerProps) => {
  const [rotation, setRotation] = useState(0);
  const [breath, setBreath] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRotation(prev => (prev + 5) % 360);
      setBreath(prev => (prev + 0.1) % (2 * Math.PI));
    }, 20);

    return () => clearInterval(intervalId);
  }, []);

  // Size classes for the spinner container
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10'
  };

  // Size classes for the orbs
  const orbSizes = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2'
  };

  // Base orbit radius based on size
  const baseOrbit = {
    sm: 0.5,
    md: 0.75,
    lg: 1
  };

  // Text size based on spinner size
  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  // Text color for the loading text
  const textColor = 'text-metricly-accent';

  // Orb colors using Catppuccin Mocha palette
  const orbColors = ['bg-blue', 'bg-green', 'bg-mauve'];

  // Calculate orbit radius with breathing effect
  const orbitRadius = baseOrbit[size] * (0.5 + Math.sin(breath) * 0.5);

  // Calculate position of orb based on angle
  const getOrbPosition = (angleDeg: number) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: Math.sin(angleRad) * orbitRadius,
      y: -Math.cos(angleRad) * orbitRadius
    };
  };

  // Get CSS style for orb positioning
  const getOrbStyle = (pos: { x: number; y: number }) => ({
    left: `calc(50% + ${pos.x}rem)`,
    top: `calc(50% + ${pos.y}rem)`,
    transform: 'translate(-50%, -50%)'
  });

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Spinner */}
      <div className={`relative ${sizeClasses[size]} ${text ? 'mb-4' : ''}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          {[0, 120, 240].map((offset, i) => {
            const pos = getOrbPosition(rotation + offset);
            return (
              <div key={i} className="absolute" style={getOrbStyle(pos)}>
                <div
                  className={`rounded-full ${orbSizes[size]} ${orbColors[i]}`}
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    opacity: 0.8,
                    boxShadow: '0 0 8px currentColor'
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Loading text */}
      {text && (
        <div className="text-center">
          <p className={`${textSizes[size]} ${textColor} font-medium`}>{text}</p>
          <p className="text-s text-muted-foreground mt-1">(◍•ᴗ•◍)♡</p>
        </div>
      )}
    </div>
  );
};

export default CoolSpinner;
