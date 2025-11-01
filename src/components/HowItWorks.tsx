import { Search, Wand2, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const steps = [
  {
    icon: Search,
    number: "01",
    title: "Research & Collect",
    description: "AI scans the internet and finds the most viral videos in your niche.",
  },
  {
    icon: Wand2,
    number: "02",
    title: "Remix & Uniquify",
    description: "The system edits, changes voices, subtitles, and visuals to generate unique content.",
  },
  {
    icon: Upload,
    number: "03",
    title: "Distribute & Scale",
    description: "It automatically publishes videos across 100–200 accounts — managing schedules, captions, and performance.",
  },
];

const HowItWorks = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <section
      id="how-it-works"
      ref={ref as any}
      className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-20 2xl:py-24 relative overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className={`text-center mb-12 sm:mb-16 lg:mb-20 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <span className="text-xs sm:text-sm text-primary font-semibold tracking-wider uppercase mb-3 sm:mb-4 block">
            The Process
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 px-4">
            How It Works
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Three simple steps. Zero manual effort.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card
                key={index}
                className={`relative p-6 sm:p-8 bg-white/[0.02] backdrop-blur-md border border-white/[0.05] shadow-2xl overflow-hidden hover:scale-105 hover:shadow-primary/20 transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Glass morphism background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-primary/[0.02] opacity-60" />

                {/* Number without background */}
                <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 text-6xl sm:text-8xl font-bold text-white/[0.08]">
                  {step.number}
                </div>

                <div className="relative z-10">
                  {/* Glass icon container */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-white/[0.08] to-primary/[0.06] backdrop-blur-sm border border-white/[0.1] flex items-center justify-center mb-5 sm:mb-6 shadow-lg">
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary drop-shadow-lg" />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-white drop-shadow-lg">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-200 leading-relaxed drop-shadow-sm">
                    {step.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
