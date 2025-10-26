import { Brain, Video, Rocket, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";

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
  return (
    <section id="features" className="py-32 relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <span className="text-sm text-primary font-semibold tracking-wider uppercase mb-4 block">
            Key Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Every step. Fully automated.
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From idea to viral — without human input.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="p-6 bg-[var(--glass-bg)] border-[var(--glass-border)] backdrop-blur-xl hover:bg-[var(--glass-bg)]/80 transition-all duration-300 group"
              >
                <div className="mb-4 p-3 w-fit rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 group-hover:from-accent/30 group-hover:to-primary/30 transition-all">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
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
