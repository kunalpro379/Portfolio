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
      
      // Try to auto-play
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(err => {
            console.log('Autoplay prevented, waiting for user interaction:', err);
            setIsPlaying(false);
            
            // On mobile, play after first interaction
            const handleInteraction = () => {
              if (audioRef.current) {
                audioRef.current.play().then(() => {
                  setIsPlaying(true);
                }).catch(e => console.log('Play failed:', e));
              }
            };
            
            document.addEventListener('click', handleInteraction, { once: true });
            document.addEventListener('touchstart', handleInteraction, { once: true });
          });
      }
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

      {/* Music Control Button - Mobile Optimized */}
      <button
        onClick={togglePlay}
        className={`fixed top-4 left-4 md:top-6 md:left-6 z-50 p-2 md:p-3 border-2 border-white rounded-full shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)] hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.7)] transition-all hover:scale-110 active:scale-95 ${
          isPlaying ? 'bg-green-500 animate-pulse' : 'bg-black'
        }`}
        aria-label={isPlaying ? "Pause music" : "Play music"}
        title={isPlaying ? "Music playing" : "Tap to play music"}
      >
        {isPlaying ? (
          <Volume2 size={18} strokeWidth={2.5} className="text-white md:w-4 md:h-4" />
        ) : (
          <VolumeX size={18} strokeWidth={2.5} className="text-white md:w-4 md:h-4" />
        )}
      </button>

      {/* Animated Background Images - Slideshow - Mobile Optimized (No Flicker) */}
      <div className="fixed inset-0 -z-[12]">
        <style>{`
          @keyframes backgroundSlideshow {
            0% { opacity: 0; }
            8% { opacity: 0.55; }
            16% { opacity: 0.55; }
            24% { opacity: 0; }
            100% { opacity: 0; }
          }
          
          @media (max-width: 768px) {
            @keyframes backgroundSlideshow {
              0% { opacity: 0; }
              8% { opacity: 0.45; }
              16% { opacity: 0.45; }
              24% { opacity: 0; }
              100% { opacity: 0; }
            }
          }
          
          .bg-slide {
            position: absolute;
            inset: 0;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            filter: grayscale(100%);
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
          }
          
          .bg-slide-1 { animation: backgroundSlideshow 104s ease-in-out infinite 0s; background-image: url(/back1.png); }
          .bg-slide-2 { animation: backgroundSlideshow 104s ease-in-out infinite 8s; background-image: url(/back2.png); }
          .bg-slide-3 { animation: backgroundSlideshow 104s ease-in-out infinite 16s; background-image: url(/back3.png); }
          .bg-slide-4 { animation: backgroundSlideshow 104s ease-in-out infinite 24s; background-image: url(/back4.png); }
          .bg-slide-5 { animation: backgroundSlideshow 104s ease-in-out infinite 32s; background-image: url(/back5.png); }
          .bg-slide-6 { animation: backgroundSlideshow 104s ease-in-out infinite 40s; background-image: url(/back6.png); }
          .bg-slide-7 { animation: backgroundSlideshow 104s ease-in-out infinite 48s; background-image: url(/back7.png); }
          .bg-slide-8 { animation: backgroundSlideshow 104s ease-in-out infinite 56s; background-image: url(/back8.png); }
          .bg-slide-9 { animation: backgroundSlideshow 104s ease-in-out infinite 64s; background-image: url(/back9.png); }
          .bg-slide-10 { animation: backgroundSlideshow 104s ease-in-out infinite 72s; background-image: url(/back10.png); }
          .bg-slide-11 { animation: backgroundSlideshow 104s ease-in-out infinite 80s; background-image: url(/back11.png); }
          .bg-slide-12 { animation: backgroundSlideshow 104s ease-in-out infinite 88s; background-image: url(/back12.png); }
          .bg-slide-13 { animation: backgroundSlideshow 104s ease-in-out infinite 96s; background-image: url(/back13.png); }
        `}</style>
        
        <div className="bg-slide bg-slide-1" />
        <div className="bg-slide bg-slide-2" />
        <div className="bg-slide bg-slide-3" />
        <div className="bg-slide bg-slide-4" />
        <div className="bg-slide bg-slide-5" />
        <div className="bg-slide bg-slide-6" />
        <div className="bg-slide bg-slide-7" />
        <div className="bg-slide bg-slide-8" />
        <div className="bg-slide bg-slide-9" />
        <div className="bg-slide bg-slide-10" />
        <div className="bg-slide bg-slide-11" />
        <div className="bg-slide bg-slide-12" />
        <div className="bg-slide bg-slide-13" />
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
