import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

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
  return (
    <section id="pricing" className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <span className="text-sm text-primary font-semibold tracking-wider uppercase mb-4 block">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple pricing that scales
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The more videos you automate, the cheaper each one gets.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative p-8 ${
                plan.popular
                  ? "border-primary shadow-2xl shadow-primary/20 scale-105"
                  : "border-border"
              }`}
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

        <p className="text-center text-sm text-muted-foreground mt-12 max-w-2xl mx-auto">
          💡 The system rewards scale — the more videos you generate, the cheaper each becomes.
        </p>
      </div>
    </section>
  );
};

export default Pricing;
