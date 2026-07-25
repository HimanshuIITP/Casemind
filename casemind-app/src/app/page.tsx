import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import StatsSection from "@/components/sections/StatsSection";
import TrustedBySection from "@/components/sections/TrustedBySection";
import ProblemSection from "@/components/sections/ProblemSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import UsersSection from "@/components/sections/UsersSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import CTASection from "@/components/sections/CTASection";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <TrustedBySection />
      <div className="space-y-32 pb-32">
        <ProblemSection />
        <FeaturesSection />
        <HowItWorksSection />
        <UsersSection />
        <TestimonialsSection />
      </div>
      <CTASection />
      <Footer />
    </main>
  );
}
