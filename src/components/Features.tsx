import { Brain, Video, Rocket, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const features = [
  {
    icon: Brain,
    title: "AI Researcher",
    description: "Finds viral trends and top-performing videos in your niche.",
  },
  {
    icon: Video,
    title: "Smart Editor",
    description: "Automatically remixes, revoices, and recreates each video to be unique.",
  },
  {
    icon: Rocket,
    title: "Bulk Publisher",
    description: "Posts across 200+ accounts in parallel with smart scheduling.",
  },
  {
    icon: BarChart3,
    title: "Analytics Hub",
    description: "Tracks reach, engagement, and content performance in real time.",
  },
];

const Features = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <section
      id="features"
      ref={ref as any}
      className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-20 2xl:py-24 relative"
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] lg:w-[800px] h-[400px] sm:h-[600px] lg:h-[800px] bg-primary/10 rounded-full blur-[100px] sm:blur-[150px]" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className={`text-center mb-12 sm:mb-16 lg:mb-20 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <span className="text-xs sm:text-sm text-primary font-semibold tracking-wider uppercase mb-3 sm:mb-4 block">
            Key Features
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 px-4">
            Every step. Fully automated.
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            From idea to viral — without human input.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className={`p-5 sm:p-6 bg-[var(--glass-bg)] border-[var(--glass-border)] backdrop-blur-xl hover:bg-[var(--glass-bg)]/80 hover:scale-105 hover:shadow-xl hover:shadow-primary/20 transition-all duration-500 group ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="mb-4 p-3 w-fit rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 group-hover:from-accent/30 group-hover:to-primary/30 group-hover:scale-110 transition-all duration-300">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
