import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "We scaled from 10 to 500 videos per day — without hiring a single editor.",
    author: "Sarah Chen",
    role: "Media Director",
    company: "ContentFlow Media",
  },
  {
    quote: "AutoContent Factory replaced three content managers and increased our reach by 700%.",
    author: "Marcus Rodriguez",
    role: "CEO",
    company: "ViralTech Studios",
  },
  {
    quote: "The best investment we made this year — everything runs on autopilot now.",
    author: "Emma Thompson",
    role: "Growth Lead",
    company: "ScaleUp Digital",
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <span className="text-sm text-primary font-semibold tracking-wider uppercase mb-4 block">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Trusted by content teams worldwide
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="p-8 bg-[var(--glass-bg)] border-[var(--glass-border)] backdrop-blur-xl relative"
            >
              <Quote className="absolute top-6 right-6 h-12 w-12 text-primary/10" />
              
              <div className="relative z-10">
                <p className="text-lg mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary" />
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
