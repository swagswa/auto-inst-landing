import { Search, Wand2, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";

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
  return (
    <section id="how-it-works" className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <span className="text-sm text-primary font-semibold tracking-wider uppercase mb-4 block">
            The Process
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Three simple steps. Zero manual effort.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card
                key={index}
                className="relative p-8 bg-card border-border hover:border-primary/50 transition-all duration-300 group overflow-hidden"
              >
                {/* Number background */}
                <div className="absolute -top-4 -right-4 text-8xl font-bold text-primary/5">
                  {step.number}
                </div>

                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="h-7 w-7 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/5 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
