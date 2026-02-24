import { memo, useCallback, useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import TechStackOverlay from "@/components/TechStackOverlay";
import ProjectsSection from "@/components/ProjectsSection";
import ExperienceSection from "@/components/ExperienceSection";
import EducationSection from "@/components/EducationSection";
import BlogsSection from "@/components/BlogsSection";
import ContactSection from "@/components/ContactSection";
import { Volume2, VolumeX } from "lucide-react";

const Home = memo(function Home() {
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3; // Set volume to 30%
      // Auto-play on mount
      audioRef.current.play().catch(err => {
        console.log('Autoplay prevented:', err);
        setIsPlaying(false);
      });
    }
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="relative font-sans selection:bg-sky-500 selection:text-white text-black">
      {/* Background Music */}
      <audio
        ref={audioRef}
        src="/Grand-Theft-Auto-San-Andreas-Theme-Song.mp3"
        loop
        preload="auto"
      />

      {/* Music Control Button */}
      <button
        onClick={togglePlay}
        className={`fixed top-6 left-6 z-50 p-2 border-2 border-white rounded-full shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)] hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.7)] transition-all hover:scale-110 active:scale-95 ${
          isPlaying ? 'bg-green-500 animate-pulse' : 'bg-black'
        }`}
        aria-label={isPlaying ? "Pause music" : "Play music"}
        title={isPlaying ? "Music playing" : "Click to play music"}
      >
        {isPlaying ? (
          <Volume2 size={16} strokeWidth={2.5} className="text-white" />
        ) : (
          <VolumeX size={16} strokeWidth={2.5} className="text-white" />
        )}
      </button>

      {/* Animated Background Images - Slideshow with grayscale and blur */}
      <div className="fixed inset-0 -z-[12]">
        <style>{`
          @keyframes backgroundSlideshow {
            0% { opacity: 0; }
            6% { opacity: 0.55; }
            14% { opacity: 0.55; }
            20% { opacity: 0; }
            100% { opacity: 0; }
          }
          .bg-slide-1 { animation: backgroundSlideshow 91s ease-in-out infinite 0s; }
          .bg-slide-2 { animation: backgroundSlideshow 91s ease-in-out infinite 7s; }
          .bg-slide-3 { animation: backgroundSlideshow 91s ease-in-out infinite 14s; }
          .bg-slide-4 { animation: backgroundSlideshow 91s ease-in-out infinite 21s; }
          .bg-slide-5 { animation: backgroundSlideshow 91s ease-in-out infinite 28s; }
          .bg-slide-6 { animation: backgroundSlideshow 91s ease-in-out infinite 35s; }
          .bg-slide-7 { animation: backgroundSlideshow 91s ease-in-out infinite 42s; }
          .bg-slide-8 { animation: backgroundSlideshow 91s ease-in-out infinite 49s; }
          .bg-slide-9 { animation: backgroundSlideshow 91s ease-in-out infinite 56s; }
          .bg-slide-10 { animation: backgroundSlideshow 91s ease-in-out infinite 63s; }
          .bg-slide-11 { animation: backgroundSlideshow 91s ease-in-out infinite 70s; }
          .bg-slide-12 { animation: backgroundSlideshow 91s ease-in-out infinite 77s; }
          .bg-slide-13 { animation: backgroundSlideshow 91s ease-in-out infinite 84s; }
        `}</style>
        
        <div 
          className="absolute inset-0 bg-slide-1"
          style={{
            backgroundImage: 'url(/back1.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'grayscale(100%)',
            opacity: 0
          }}
        />
        <div 
          className="absolute inset-0 bg-slide-2"
          style={{
            backgroundImage: 'url(/back2.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'grayscale(100%)',
            opacity: 0
          }}
        />
        <div 
          className="absolute inset-0 bg-slide-3"
          style={{
            backgroundImage: 'url(/back3.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'grayscale(100%)',
            opacity: 0
          }}
        />
        <div 
          className="absolute inset-0 bg-slide-4"
          style={{
            backgroundImage: 'url(/back4.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'grayscale(100%)',
            opacity: 0
          }}
        />
        <div 
          className="absolute inset-0 bg-slide-5"
          style={{
            backgroundImage: 'url(/back5.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'grayscale(100%)',
            opacity: 0
          }}
        />
        <div 
          className="absolute inset-0 bg-slide-6"
          style={{
            backgroundImage: 'url(/back6.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'grayscale(100%)',
            opacity: 0
          }}
        />
        <div 
          className="absolute inset-0 bg-slide-7"
          style={{
            backgroundImage: 'url(/back7.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'grayscale(100%)',
            opacity: 0
          }}
        />
        <div 
          className="absolute inset-0 bg-slide-8"
          style={{
            backgroundImage: 'url(/back8.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'grayscale(100%)',
            opacity: 0
          }}
        />
        <div 
          className="absolute inset-0 bg-slide-9"
          style={{
            backgroundImage: 'url(/back9.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'grayscale(100%)',
            opacity: 0
          }}
        />
        <div 
          className="absolute inset-0 bg-slide-10"
          style={{
            backgroundImage: 'url(/back10.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'grayscale(100%)',
            opacity: 0
          }}
        />
        <div 
          className="absolute inset-0 bg-slide-11"
          style={{
            backgroundImage: 'url(/back11.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'grayscale(100%)',
            opacity: 0
          }}
        />
        <div 
          className="absolute inset-0 bg-slide-12"
          style={{
            backgroundImage: 'url(/back12.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'grayscale(100%)',
            opacity: 0
          }}
        />
        <div 
          className="absolute inset-0 bg-slide-13"
          style={{
            backgroundImage: 'url(/back13.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'grayscale(100%)',
            opacity: 0
          }}
        />
      </div>
      
      {/* Beautiful Gradient Background - Top to Bottom */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: 'linear-gradient(to bottom, rgba(243, 232, 255, 0.6) 0%, rgba(219, 234, 254, 0.6) 16.67%, rgba(220, 252, 231, 0.6) 33.33%, rgba(254, 252, 232, 0.6) 50%, rgba(255, 237, 213, 0.6) 66.67%, rgba(254, 226, 226, 0.6) 83.33%, rgba(254, 226, 226, 0.5) 100%)'
        }}
      />

      {/* Background Texture Pattern on Top */}
      <div className="fixed inset-0 -z-[8] opacity-20 mix-blend-multiply" style={{ backgroundImage: 'url(/page7.png)', backgroundRepeat: 'repeat', filter: 'grayscale(100%) brightness(0)' }} />

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
