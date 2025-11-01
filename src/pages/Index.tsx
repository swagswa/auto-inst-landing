import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Showcase from "@/components/Showcase";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import GlobalShaderBackground from "@/components/ui/global-shader-background";

const Index = () => {
  return (
    <GlobalShaderBackground>
      <div className="min-h-screen overflow-x-hidden w-full">
        <Header />
        <Hero />
        <HowItWorks />
        <Features />
        <Showcase />
        <Pricing />
        <Testimonials />
        <Footer />
      </div>
    </GlobalShaderBackground>
  );
};

export default Index;
