import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const plans = [
  {
    name: "Starter",
    price: "$20",
    period: "month",
    description: "For solo creators automating daily uploads.",
    limit: "Up to 20 videos/day",
    costPer: "$1.00/video/day",
    features: [
      "AI Research & Editing",
      "Up to 20 videos daily",
      "5 connected accounts",
      "Basic analytics",
      "Email support",
    ],
    cta: "Get Started",
    variant: "glass" as const,
  },
  {
    name: "Pro",
    price: "$100",
    period: "month",
    description: "For small media teams or agencies scaling up.",
    limit: "Up to 150 videos/day",
    costPer: "~$0.66/video/day",
    popular: true,
    features: [
      "Everything in Starter",
      "Up to 150 videos daily",
      "50 connected accounts",
      "Advanced analytics",
      "Priority support",
      "Custom branding",
    ],
    cta: "Start Free Trial",
    variant: "hero" as const,
  },
  {
    name: "Enterprise",
    price: "$500",
    period: "month",
    description: "For full-scale automation and unlimited content production.",
    limit: "Unlimited videos/day",
    costPer: "Flat rate, unlimited",
    features: [
      "Everything in Pro",
      "Unlimited videos",
      "Unlimited accounts",
      "Custom AI training",
      "Dedicated account manager",
      "SLA & 24/7 support",
    ],
    cta: "Contact Sales",
    variant: "glass" as const,
  },
];

const Pricing = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.05, rootMargin: '0px' });

  return (
    <section id="pricing" ref={ref as any} className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-20 2xl:py-24 relative">
      <div className="container mx-auto px-4 sm:px-6">
        <div className={`text-center mb-12 sm:mb-16 lg:mb-20 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <span className="text-xs sm:text-sm text-primary font-semibold tracking-wider uppercase mb-3 sm:mb-4 block">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 px-4">
            Simple pricing that scales
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            The more videos you automate, the cheaper each one gets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative p-6 sm:p-8 transition-all duration-500 hover:scale-105 ${
                plan.popular
                  ? "border-primary shadow-2xl shadow-primary/20 md:scale-105"
                  : "border-border hover:shadow-xl hover:shadow-primary/10"
              } ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-accent to-primary rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.limit}</p>
                <p className="text-sm text-primary font-semibold mt-1">{plan.costPer}</p>
              </div>

              <Button variant={plan.variant} className="w-full mb-6">
                {plan.cta}
              </Button>

              <div className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <p className={`text-center text-xs sm:text-sm text-muted-foreground mt-8 sm:mt-12 max-w-2xl mx-auto px-4 transition-all duration-1000 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          💡 The system rewards scale — the more videos you generate, the cheaper each becomes.
        </p>
      </div>
    </section>
  );
};

export default Pricing;
