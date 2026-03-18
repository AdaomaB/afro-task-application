// Import custom components
import Footer from "../components/Footer";
import ServiceSection from "../components/landing/ServiceSection";
import FreelancerHireSection from "../components/landing/FreelancerHireSection";
import WhyAfroTaskFeatures from "../components/landing/WhyAfroTaskFeatures";
import CTA from "../components/landing/CTA";
import WhyAfroTaskSection from "../components/landing/WhyAfroTaskSection";
import StuckVibeSection from "../components/landing/StuckVibeSection";
import WhiteNavbar from "../components/navbar/WhiteNavbar";
import LandingPageNavbar from "../components/landing/LandingPageNavbar";
import HeroSection from "../components/landing/HeroSection";
// import ProductSection from "../components/landing/ProductSection";

// LandingPage Component
// Main entry point for the AfroTask platform

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#00564C] relative text-white">
      <WhiteNavbar />

      {/* Category Navigation Bar - service categories */}
      <LandingPageNavbar />

      <HeroSection />

      <ServiceSection />

      <section className="bg-white flex justify-center items-center p-4 md:p-10 overflow-visible flex-col gap-y-8 md:gap-y-12">
        <WhyAfroTaskSection />

        {/* Freelancer cards section */}
        <FreelancerHireSection />

        <StuckVibeSection />

        {/* Made on Afro Task Section - Displays recent work/projects */}
        {/* <ProductSection /> */}
      </section>

      {/* Why Choose Afro Task Features Section */}
      <WhyAfroTaskFeatures />

      {/* Call-to-Action Section */}
      <CTA />

      <Footer />
    </div>
  );
}
