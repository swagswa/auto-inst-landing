import dashboardMockup from "@/assets/dashboard-mockup.jpg";
import shape1 from "@/assets/shape-1.png";
import shape2 from "@/assets/shape-2.png";

const Showcase = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Your Control Center
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Monitor, manage, and optimize your entire content empire from one dashboard.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl shadow-primary/20">
            <img 
              src={dashboardMockup} 
              alt="AutoContent Factory Dashboard" 
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Showcase;
