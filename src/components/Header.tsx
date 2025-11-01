import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const Header = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show header after scrolling 50px, and keep it visible once shown
      if (window.scrollY > 50 && !isVisible) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isVisible]);

  // Close mobile menu when clicking outside or on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (isMobileMenuOpen && !target.closest('.mobile-menu') && !target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false); // Close mobile menu when navigating
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <header
      className={`fixed left-0 right-0 z-50 border-b border-white/10 bg-background/98 backdrop-blur-xl transition-all duration-500 ease-out shadow-lg ${
        isVisible ? 'top-0' : '-top-32'
      }`}
    >
      <style>{`
        :root {
          --glass-bg: rgba(255, 255, 255, 0.05);
          --glass-border: rgba(255, 255, 255, 0.1);
        }
        .logo-glow {
          filter: drop-shadow(0 0 8px hsl(var(--primary) / 0.3));
        }
        .brand-gradient {
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <img
                src="/logo.svg"
                alt="RevyForge Logo"
                className="h-10 w-10 sm:h-12 sm:w-12 transition-all hover:scale-105 duration-300 relative z-10"
                style={{
                  filter: 'brightness(0) saturate(100%) invert(81%) sepia(28%) saturate(3486%) hue-rotate(221deg) brightness(102%) contrast(101%)'
                }}
              />
              <div className="absolute inset-0 blur-xl bg-primary/40 -z-10"></div>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">RevyForge</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" onClick={(e) => handleSmoothScroll(e, '#features')} className="text-foreground/70 hover:text-foreground transition-all duration-300 hover:scale-105 relative group">
              <span className="relative z-10">Features</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </a>
            <a href="#how-it-works" onClick={(e) => handleSmoothScroll(e, '#how-it-works')} className="text-foreground/70 hover:text-foreground transition-all duration-300 hover:scale-105 relative group">
              <span className="relative z-10">How It Works</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </a>
            <a href="#pricing" onClick={(e) => handleSmoothScroll(e, '#pricing')} className="text-foreground/70 hover:text-foreground transition-all duration-300 hover:scale-105 relative group">
              <span className="relative z-10">Pricing</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </a>
            <a href="#testimonials" onClick={(e) => handleSmoothScroll(e, '#testimonials')} className="text-foreground/70 hover:text-foreground transition-all duration-300 hover:scale-105 relative group">
              <span className="relative z-10">Testimonials</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </a>
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative hidden sm:block">
              <button
                className="group relative inline-flex h-8 sm:h-10 animate-rainbow cursor-pointer items-center justify-center rounded-xl border-0 bg-[length:200%] px-4 sm:px-6 py-2 font-medium text-white transition-all duration-300 hover:scale-105 [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]"
              >
                <span className="relative z-10 text-sm sm:text-base">Join Waitlist</span>
              </button>
              <div className="absolute inset-[-2px] -z-10 rounded-xl animate-rainbow bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] bg-[length:200%] blur-sm opacity-60"></div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden mobile-menu-button relative z-50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-white" />
              ) : (
                <Menu className="h-5 w-5 text-white" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden mobile-menu fixed inset-0 top-[72px] bg-background backdrop-blur-xl transition-all duration-300 z-40 ${
        isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <nav className="container mx-auto px-4 py-8 flex flex-col space-y-6">
          <a href="#features" onClick={(e) => handleSmoothScroll(e, '#features')} className="text-lg text-foreground/70 hover:text-foreground transition-all duration-300 hover:translate-x-2">
            Features
          </a>
          <a href="#how-it-works" onClick={(e) => handleSmoothScroll(e, '#how-it-works')} className="text-lg text-foreground/70 hover:text-foreground transition-all duration-300 hover:translate-x-2">
            How It Works
          </a>
          <a href="#pricing" onClick={(e) => handleSmoothScroll(e, '#pricing')} className="text-lg text-foreground/70 hover:text-foreground transition-all duration-300 hover:translate-x-2">
            Pricing
          </a>
          <a href="#testimonials" onClick={(e) => handleSmoothScroll(e, '#testimonials')} className="text-lg text-foreground/70 hover:text-foreground transition-all duration-300 hover:translate-x-2">
            Testimonials
          </a>
          <div className="pt-4 relative">
            <button
              className="w-full group relative inline-flex h-12 animate-rainbow cursor-pointer items-center justify-center rounded-xl border-0 bg-[length:200%] px-6 py-3 font-medium text-white transition-all duration-300 [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]"
            >
              <span className="relative z-10">Join Waitlist</span>
            </button>
            <div className="absolute inset-[-2px] -z-10 rounded-xl animate-rainbow bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] bg-[length:200%] blur-sm opacity-60"></div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
