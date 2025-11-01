import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

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
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <section id="testimonials" ref={ref as any} className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-20 2xl:py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className={`text-center mb-12 sm:mb-16 lg:mb-20 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <span className="text-xs sm:text-sm text-primary font-semibold tracking-wider uppercase mb-3 sm:mb-4 block">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 px-4">
            Trusted by content teams worldwide
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className={`p-6 sm:p-8 bg-[var(--glass-bg)] border-[var(--glass-border)] backdrop-blur-xl relative hover:scale-105 hover:shadow-xl hover:shadow-primary/20 transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Quote className="absolute top-4 sm:top-6 right-4 sm:right-6 h-10 w-10 sm:h-12 sm:w-12 text-primary/10" />

              <div className="relative z-10">
                <p className="text-base sm:text-lg mb-5 sm:mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>

                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-accent to-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm sm:text-base">{testimonial.author}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
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
