"use client";

import { useEffect, useRef, useState } from "react";

interface Logo {
  id: string;
  name: string;
  url: string;
}

const logos: Logo[] = [
  { id: "1", name: "YouTube", url: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/youtube.svg" },
  { id: "2", name: "TikTok", url: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/tiktok.svg" },
  { id: "3", name: "Instagram", url: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/instagram.svg" },
  { id: "4", name: "Twitter", url: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/x.svg" },
  { id: "5", name: "Facebook", url: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/facebook.svg" },
  { id: "6", name: "LinkedIn", url: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/linkedin.svg" },
  { id: "7", name: "Twitch", url: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/twitch.svg" },
  { id: "8", name: "Reddit", url: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/reddit.svg" },
  { id: "9", name: "Discord", url: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/discord.svg" },
  { id: "10", name: "Telegram", url: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/telegram.svg" },
];

export const TrustedCarousel = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const animationRef = useRef<number>();

  // Fade in animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Get actual mouse position relative to viewport
      setMouseX(e.clientX);
    };

    const handleMouseLeave = () => {
      setMouseX(null);
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Auto scroll animation with seamless loop - continues on hover
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollPosition = 0;
    const scrollSpeed = 0.3;

    const animate = () => {
      scrollPosition += scrollSpeed;

      if (container.scrollWidth > 0 && container.clientWidth > 0) {
        // Calculate the width of one set of logos
        const singleSetWidth = container.scrollWidth / 5; // We have 5 copies

        // Reset position seamlessly when we've scrolled through 2 sets
        if (scrollPosition >= singleSetWidth * 2) {
          scrollPosition = singleSetWidth;
        }

        container.scrollLeft = scrollPosition;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const calculateScale = (itemCenterX: number, itemWidth: number) => {
    if (mouseX === null) return 1;

    // itemCenterX is already the center position from viewport
    const distance = Math.abs(mouseX - itemCenterX);
    const maxDistance = 200; // Distance of effect spread
    const maxScale = 2.5; // Maximum scale when hovering

    if (distance > maxDistance) return 1;

    const scale = 1 + ((maxDistance - distance) / maxDistance) * (maxScale - 1);
    return scale;
  };

  const calculateTranslateY = (itemCenterX: number, itemWidth: number) => {
    if (mouseX === null) return 0;

    // itemCenterX is already the center position from viewport
    const distance = Math.abs(mouseX - itemCenterX);
    const maxDistance = 200;
    const maxTranslate = -15; // Move up when hovering (reduced from -40)

    if (distance > maxDistance) return 0;

    const translate = ((maxDistance - distance) / maxDistance) * maxTranslate;
    return translate;
  };

  return (
    <div className={`absolute bottom-12 sm:bottom-16 left-1/2 transform -translate-x-1/2 z-20 transition-all duration-1000 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}>
      <div className="mx-auto px-2 sm:px-4 max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl overflow-hidden">
        {/* macOS Dock style carousel */}
        <div className="relative">
          <div
            ref={containerRef}
            className="flex items-end justify-center gap-3 sm:gap-4 px-4 sm:px-8"
            style={{
              height: '200px',
              paddingTop: '80px',
              paddingBottom: '20px',
              scrollBehavior: 'auto',
              overflowX: 'scroll',
              overflowY: 'visible',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
              maxWidth: '100%'
            }}
          >
            {/* Duplicate logos 5 times for seamless loop */}
            {[...logos, ...logos, ...logos, ...logos, ...logos].map((logo, index) => {
              const itemRef = useRef<HTMLDivElement>(null);
              const [itemX, setItemX] = useState(0);
              const [itemWidth, setItemWidth] = useState(0);

              useEffect(() => {
                if (itemRef.current) {
                  const updatePosition = () => {
                    const itemRect = itemRef.current!.getBoundingClientRect();
                    // Get position relative to viewport
                    setItemX(itemRect.left + itemRect.width / 2);
                    setItemWidth(itemRect.width);
                  };

                  updatePosition();

                  // Update on scroll and resize
                  const interval = setInterval(updatePosition, 50);
                  window.addEventListener('resize', updatePosition);

                  return () => {
                    clearInterval(interval);
                    window.removeEventListener('resize', updatePosition);
                  };
                }
              }, []);

              const scale = calculateScale(itemX, itemWidth);
              const translateY = calculateTranslateY(itemX, itemWidth);

              return (
                <div
                  key={`${logo.id}-${index}`}
                  ref={itemRef}
                  className="flex-shrink-0"
                  style={{
                    transform: `scale(${scale}) translateY(${translateY}px)`,
                    transformOrigin: 'bottom center',
                    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                >
                  <div className="relative group">
                    {/* Logo image */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center p-2 sm:p-3 shadow-xl">
                      <img
                        src={logo.url}
                        alt={logo.name}
                        className="w-full h-full object-contain brightness-0 invert opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          filter: 'brightness(0) invert(1) saturate(0) opacity(0.8)'
                        }}
                        onError={(e) => {
                          // Fallback if image fails to load
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Text below carousel - can be overlapped by icons */}
        <div className="text-center mt-2 sm:mt-4 relative z-0">
          <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider font-semibold">
            Works with all major platforms
          </p>
        </div>
      </div>
    </div>
  );
};
