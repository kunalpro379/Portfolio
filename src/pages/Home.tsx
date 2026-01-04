import { memo, useCallback } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import TechStackOverlay from "@/components/TechStackOverlay";
import ProjectsSection from "@/components/ProjectsSection";
import ExperienceSection from "@/components/ExperienceSection";
import EducationSection from "@/components/EducationSection";
import BlogsSection from "@/components/BlogsSection";
import ContactSection from "@/components/ContactSection";

const Home = memo(function Home() {
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div className="relative font-sans selection:bg-sky-500 selection:text-white text-black">
      {/* Beautiful Gradient Background - Top to Bottom */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: 'linear-gradient(to bottom, rgba(243, 232, 255, 0.6) 0%, rgba(219, 234, 254, 0.6) 16.67%, rgba(220, 252, 231, 0.6) 33.33%, rgba(254, 252, 232, 0.6) 50%, rgba(255, 237, 213, 0.6) 66.67%, rgba(254, 226, 226, 0.6) 83.33%, rgba(254, 226, 226, 0.5) 100%)'
        }}
      />

      {/* Background Texture Pattern on Top */}
      <div className="fixed inset-0 -z-[8] opacity-40 mix-blend-multiply" style={{ backgroundImage: 'url(/page7.png)', backgroundRepeat: 'repeat', filter: 'grayscale(100%) brightness(0)' }} />

      {/* Fixed Navigation Bar */}
      <Navbar scrollToSection={scrollToSection} />

      {/* Hero Section with Tech Stack Overlay */}
      <div className="relative">
        <HeroSection />
        <TechStackOverlay />
      </div>

      {/* Projects Section */}
      <ProjectsSection />

      {/* Experience Section */}
      <div id="experience">
        <ExperienceSection />
      </div>



      {/* Blogs Section */}
      <div id="blogs">
        <BlogsSection />
      </div>
        {/* Education Section */}
      <div id="education">
        <EducationSection />
      </div>

      {/* Contact Section */}
      <div id="contact">
        <ContactSection />
      </div>
    </div>
  );
});

export default Home;
