import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/features/FeaturesSection";

export default function LandingPage() {
  return (
    <div className="w-full min-h-dvh bg-background">
      <HeroSection />
      <FeaturesSection />
    </div>
  );
}
