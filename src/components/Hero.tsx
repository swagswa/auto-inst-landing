import { Button } from "@/components/ui/button";
import { Sparkles, Play } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBg} 
          alt="" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background" />
      </div>

      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-glow-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-glow-pulse delay-1000" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-xl mb-6 animate-fade-in">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm">AI-Powered Content Automation</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in [animation-delay:200ms]">
          Build a 24/7 Content Factory{" "}
          <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            — Fully Automated
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto animate-fade-in [animation-delay:400ms]">
          AI that researches, downloads, edits, and posts videos across 200+ accounts — automatically.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in [animation-delay:600ms]">
          <Button variant="hero" size="lg" className="group">
            <Sparkles className="h-5 w-5 transition-transform group-hover:rotate-12" />
            Get Early Access
          </Button>
          <Button variant="glass" size="lg" className="group">
            <Play className="h-5 w-5 transition-transform group-hover:scale-110" />
            Watch Demo
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-8 animate-fade-in [animation-delay:800ms]">
          Stop managing content. Start scaling it — automatically.
        </p>
      </div>
    </section>
  );
};

export default Hero;
