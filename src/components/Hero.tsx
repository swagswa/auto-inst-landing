import AnimatedShaderHero from "@/components/ui/animated-shader-hero";
import { TrustedCarousel } from "@/components/ui/trusted-carousel";
import { RainbowButton } from "@/components/ui/rainbow-button";

const Hero = () => {
  return (
    <div className="relative">
      <AnimatedShaderHero
        trustBadge={{
          text: "AI-Powered Content Automation",
          icons: ["✨"]
        }}
        headline={{
          line1: "RevyForge",
          line2: "Content Creation Automated"
        }}
        subtitle="AI that researches, downloads, edits, and posts videos across 200+ accounts — automatically."
        customButton={
          <RainbowButton
            onClick={() => console.log("Join Waitlist clicked")}
            className="text-lg sm:text-xl md:text-2xl px-8 sm:px-12 md:px-16 py-4 sm:py-5 md:py-6 h-auto min-w-[280px] sm:min-w-[320px]"
          >
            Join Waitlist
          </RainbowButton>
        }
      />
      <TrustedCarousel />
    </div>
  );
};

export default Hero;
