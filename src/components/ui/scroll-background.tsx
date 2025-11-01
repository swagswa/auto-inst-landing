import React, { useEffect, useState } from 'react';

interface ScrollBackgroundProps {
  children: React.ReactNode;
}

const ScrollBackground: React.FC<ScrollBackgroundProps> = ({ children }) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Вычисляем тонкие изменения фона на основе скролла
  const backgroundOpacity = Math.min(0.03, scrollY / 10000); // Очень тонкий эффект
  const gradientOffset = (scrollY / 50) % 100; // Медленное движение градиента

  return (
    <div className="relative">
      {/* Динамический фоновый слой */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-300"
        style={{
          background: `linear-gradient(${gradientOffset}deg, hsl(var(--primary) / ${backgroundOpacity}), transparent, hsl(var(--accent) / ${backgroundOpacity / 2}))`,
          opacity: 0.5
        }}
      />
      
      {/* Тонкий движущийся градиент */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle at ${50 + Math.sin(scrollY / 1000) * 10}% ${50 + Math.cos(scrollY / 800) * 8}%, hsl(var(--primary) / 0.01), transparent 70%)`,
          transform: `translateY(${scrollY * 0.1}px)` // Параллакс эффект
        }}
      />
      
      {children}
    </div>
  );
};

export default ScrollBackground;