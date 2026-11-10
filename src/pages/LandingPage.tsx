import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/sections/ProblemSection";
import SolutionSection from "@/components/landing/sections/SolutionSection";
import HowItWorksSection from "@/components/landing/sections/HowItWorksSection";
import LectureTimetableSection from "@/components/landing/sections/LectureTimetableSection";
import ExamTimetableSection from "@/components/landing/sections/ExamTimetableSection";
import VenueManagementSection from "@/components/landing/sections/VenueManagementSection";
import DiscrepancySection from "@/components/landing/sections/DiscrepancySection";
import RolesSection from "@/components/landing/sections/RolesSection";
import WebMobileSection from "@/components/landing/sections/WebMobileSection";
import TrustSection from "@/components/landing/sections/TrustSection";
import NsukSection from "@/components/landing/sections/NsukSection";
import TechStackSection from "@/components/landing/sections/TechStackSection";
import RoadmapSection from "@/components/landing/sections/RoadmapSection";
import FaqSection from "@/components/landing/sections/FaqSection";
import CtaFooterSection from "@/components/landing/sections/CtaFooterSection";

export default function LandingPage() {
  return (
    <div className="w-full min-h-dvh bg-background">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <LectureTimetableSection />
      <ExamTimetableSection />
      <VenueManagementSection />
      <DiscrepancySection />
      <RolesSection />
      <WebMobileSection />
      <TrustSection />
      <NsukSection />
      <TechStackSection />
      <RoadmapSection />
      <FaqSection />
      <CtaFooterSection />
    </div>
  );
}
