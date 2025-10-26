import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import shape1 from "@/assets/shape-1.png";
import shape2 from "@/assets/shape-2.png";

const FinalCTA = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <img 
          src={shape1} 
          alt="" 
          className="absolute left-0 top-0 w-96 h-96 opacity-20 animate-float"
        />
        <img 
          src={shape2} 
          alt="" 
          className="absolute right-0 bottom-0 w-96 h-96 opacity-20 animate-float [animation-delay:3s]"
        />
      </div>

      {/* Central glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/20 via-accent/10 to-transparent rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Turn AI into your{" "}
            <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              content team
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-muted-foreground mb-4">
            Build a system that never sleeps.
          </p>

          <div className="flex flex-col gap-2 mb-12">
            <p className="text-lg font-semibold">100% automation. Zero manual labor.</p>
            <p className="text-lg font-semibold">Scale to infinity.</p>
          </div>

          <Button variant="hero" size="lg" className="group text-lg px-12 py-6 h-auto">
            Start Free Trial
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>

          <p className="text-sm text-muted-foreground mt-8">
            Join 500+ creators automating their content production
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
