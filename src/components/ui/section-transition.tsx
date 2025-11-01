import React from 'react';

interface SectionTransitionProps {
  variant?: 'gradient' | 'blur' | 'glow' | 'wave';
  direction?: 'up' | 'down';
  intensity?: 'light' | 'medium' | 'strong';
  className?: string;
}

const SectionTransition: React.FC<SectionTransitionProps> = ({
  variant = 'gradient',
  direction = 'down',
  intensity = 'medium',
  className = ''
}) => {
  const getTransitionStyles = () => {
    const baseClasses = "absolute left-0 right-0 pointer-events-none z-10";
    const heightClasses = {
      light: "h-32",
      medium: "h-48", 
      strong: "h-64"
    };
    
    const positionClasses = direction === 'up' ? 'bottom-0' : 'top-0';
    
    switch (variant) {
      case 'gradient':
        return `${baseClasses} ${heightClasses[intensity]} ${positionClasses} bg-gradient-to-${direction === 'up' ? 't' : 'b'} from-transparent via-background/50 to-background`;
      
      case 'blur':
        return `${baseClasses} ${heightClasses[intensity]} ${positionClasses} backdrop-blur-xl bg-gradient-to-${direction === 'up' ? 't' : 'b'} from-background/0 via-background/30 to-background/80`;
      
      case 'glow':
        return `${baseClasses} ${heightClasses[intensity]} ${positionClasses} bg-gradient-to-${direction === 'up' ? 't' : 'b'} from-transparent via-primary/5 to-background`;
      
      case 'wave':
        return `${baseClasses} ${heightClasses[intensity]} ${positionClasses}`;
      
      default:
        return `${baseClasses} ${heightClasses[intensity]} ${positionClasses}`;
    }
  };

  const getWaveStyles = () => {
    if (variant !== 'wave') return null;
    
    return (
      <div className="absolute inset-0 overflow-hidden">
        <svg
          className="absolute bottom-0 w-full h-full"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--background))" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(var(--background))" stopOpacity="0.5" />
              <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="1" />
            </linearGradient>
          </defs>
          <path
            d="M0,0 C300,60 600,60 900,0 C1050,30 1150,30 1200,0 L1200,120 L0,120 Z"
            fill="url(#waveGradient)"
          />
        </svg>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      <div className={getTransitionStyles()}>
        {variant === 'glow' && (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent blur-2xl" />
          </>
        )}
        {getWaveStyles()}
      </div>
    </div>
  );
};

// Компонент для создания премиального фонового эффекта между секциями
export const PremiumSectionDivider: React.FC<{
  type?: 'subtle' | 'elegant' | 'luxurious';
  className?: string;
}> = ({ type = 'elegant', className = '' }) => {
  const getDividerContent = () => {
    switch (type) {
      case 'subtle':
        return (
          <div className="relative h-32 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/10 to-transparent blur-xl" />
          </div>
        );
      
      case 'elegant':
        return (
          <div className="relative h-48 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent blur-2xl" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/3 to-transparent blur-3xl" />
          </div>
        );
      
      case 'luxurious':
        return (
          <div className="relative h-64 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background" />
            
            {/* Центральная линия с эффектом свечения */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-px">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent blur-sm" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/20 to-transparent blur-md" />
            </div>
            
            {/* Боковые эффекты свечения */}
            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
            
            {/* Общий градиентный фон */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 blur-2xl" />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {getDividerContent()}
    </div>
  );
};

export default SectionTransition;