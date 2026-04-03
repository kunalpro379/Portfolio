import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useState, useEffect, useMemo, lazy, Suspense } from "react";

// Lazy load tech stack component
const TechStackIcons = lazy(() => import('./TechStackIcons'));

const technologies = [
  // Languages
  // { name: "C/C++", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg" },
  // { name: "Java", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
  // { name: "Python", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
  // { name: "JavaScript", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },

  // Technologies & Tools
  // { name: "Java", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
  { name: "Java", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },

  { name: "AWS", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg" },
  { name: "Kubernetes", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg" },
  { name: "Docker", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
  { name: "Kafka", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apachekafka/apachekafka-original.svg" },
  { name: "Spring Boot", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" },
  // { name: "Azure", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg" },
  // { name: "Linux", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg" },

  // Databases
  { name: "MySQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
  // { name: "MongoDB", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
  { name: "GraphQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg" },
  // { name: "Supabase", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg" },
  { name: "Redis", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg" },
];

export default function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const heroImages2 = useMemo(() => ["/kunal.png", "/papa.png", "/friends.png", "/kunal2.png", "/bhushan.png"], []);

  // Memoize bokeh props to prevent recalculation
  const bokehProps = useMemo(() =>
    Array.from({ length: 8 }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: 10 + Math.random() * 10,
      delay: Math.random() * 10
    })), []
  );

  useEffect(() => {
    // Image rotation for heroImages2
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages2.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroImages2.length]);

  // Simplified animation variants
  const fadeIn = shouldReduceMotion ? {} : {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 }
  };

  return (
    <section id="home" className="relative min-h-screen p-2 md:p-3">
      {/* Simplified Background - Static */}
      <div
        className="absolute inset-0 z-[2] opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Static gradient blobs */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-sky-400/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-blue-400/15 rounded-full blur-[140px]" />
      </div>

      {/* Simplified Grid Overlay */}
      <div
        className="absolute inset-0 z-[2] opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)`,
          backgroundSize: '100px 100px',
          maskImage: 'radial-gradient(circle at center, black, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 90%)'
        }}
      />

      {/* Reduced Bokeh particles - only show if motion is allowed */}
      {!shouldReduceMotion && (
        <div className="absolute inset-0 z-[3] pointer-events-none">
          {bokehProps.slice(0, 4).map((props, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.3, 0],
                y: [0, -100]
              }}
              transition={{
                duration: props.duration,
                repeat: Infinity,
                ease: "linear",
                delay: props.delay
              }}
              className="absolute w-1 h-1 bg-sky-500 rounded-full blur-[1px]"
              style={{
                top: props.top,
                left: props.left,
              }}
            />
          ))}
        </div>
      )}

      {/* Subtle Aura behind Text */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[40%] h-[40%] bg-sky-400/10 rounded-full blur-[180px] z-[4] pointer-events-none" />

      {/* SCROLLABLE CONTENT */}
      <div className="relative z-[5]">
        <div className="flex flex-col">
          {/* First Screen - Hero Content */}
          <div className="min-h-[75vh] flex flex-col md:flex-row lg:flex-row items-start justify-between px-6 md:px-12 lg:px-24 max-w-7xl mx-auto w-full gap-6 pt-16 md:pt-32 pb-0">
            {/* Text Content - First Column (Left) */}
            <div className="flex flex-col items-start justify-center md:w-1/2 lg:w-1/2 order-1">
              <motion.div {...fadeIn} className="mb-2 md:mb-6">
                <span className="px-3 md:px-4 py-1 md:py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-600 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em]">
                  Crafting Future Tech
                </span>
              </motion.div>
              <h1 className="hero-title text-8xl md:text-7xl lg:text-9xl font-black tracking-tighter leading-[0.8] mb-3 md:mb-6 lg:mb-8 select-none text-left" style={{
                color: '#000',
                textShadow: `
                  3px 3px 0px rgba(0, 0, 0, 0.2),
                  6px 6px 0px rgba(0, 0, 0, 0.15),
                  9px 9px 0px rgba(0, 0, 0, 0.1),
                  12px 12px 0px rgba(0, 0, 0, 0.05)
                `
              }}>
                KUNAL<br />
                <span style={{
                  background: 'linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.4) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: `
                    3px 3px 0px rgba(0, 0, 0, 0.2),
                    6px 6px 0px rgba(0, 0, 0, 0.15),
                    9px 9px 0px rgba(0, 0, 0, 0.1),
                    12px 12px 0px rgba(0, 0, 0, 0.05)
                  `
                }}>PATIL</span>
              </h1>
              <p className="max-w-xl text-black font-medium text-xs md:text-lg tracking-wide uppercase text-left mb-3 md:mb-0 whitespace-nowrap">
                I build scalable backends, automate the cloud,
              </p>
              <p className="max-w-xl text-black font-medium text-xs md:text-lg tracking-wide uppercase text-left mb-3 md:mb-0 whitespace-nowrap">
                and bring AI ideas to life.
              </p>
            

              <div className="mt-3 md:mt-8 flex flex-col gap-3 md:gap-6 w-full sm:w-auto mb-3 md:mb-6">
                <div className="flex gap-3 md:gap-6">
                  <a 
                    href="/learnings?tab=projects" 
                    className="flex-1 inline-flex items-center justify-center gap-2 md:gap-4 px-4 md:px-8 py-3 md:py-4 bg-black text-white rounded-full font-black uppercase tracking-wider md:tracking-widest hover:bg-sky-500 hover:text-white transition-all cursor-pointer group text-[10px] md:text-base shadow-lg active:scale-95 whitespace-nowrap"
                  >
                    See My Work <ChevronRight size={16} className="md:w-[18px] md:h-[18px] group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a 
                    href="/learnings?tab=blogs" 
                    className="flex-1 px-4 md:px-8 py-3 md:py-4 border-2 border-black bg-gradient-to-r from-amber-100 to-pink-100 text-black rounded-full font-black uppercase tracking-wider md:tracking-widest hover:from-amber-200 hover:to-pink-200 transition-all cursor-pointer text-center text-[10px] md:text-base shadow-lg active:scale-95 whitespace-nowrap"
                  >
                    Learn With Me
                  </a>
                </div>
                <a href="#contact" className="w-full px-8 md:px-10 py-4 md:py-5 border border-black/20 bg-white/50 backdrop-blur-md text-black rounded-xl md:rounded-2xl font-black uppercase tracking-widest hover:bg-white/80 transition-all cursor-pointer text-center text-xs md:text-base shadow-lg active:scale-95">
                  Contact Me
                </a>
              </div>

              {/* Animated Images Card - Below Buttons - Hidden on mobile, shown on desktop */}
              <div className="relative mt-6 w-full max-w-[380px] sm:max-w-[420px] md:max-w-[300px] lg:max-w-[350px] xl:max-w-[400px] mx-auto hidden md:block">
                <div className="relative aspect-square w-full">
                  <div className="absolute inset-0 rounded-[2rem] md:rounded-[4rem] rotate-6 scale-95" />
                  <div className="absolute inset-0 bg-black/5 rounded-[2rem] md:rounded-[4rem] -rotate-3 border border-black/10 backdrop-blur-sm" />
                  <div className="absolute inset-0 rounded-[2rem] md:rounded-[4rem] overflow-hidden border border-black/20">
                    {/* Patchy color background */}
                    <div className="absolute inset-0 bg-amber-50/20">
                      {/* Yellow patches */}
                      <div className="absolute top-[10%] left-[5%] w-[25%] h-[30%] bg-yellow-200/40 rounded-full blur-[60px]"></div>
                      <div className="absolute top-[5%] left-[15%] w-[15%] h-[20%] bg-yellow-300/30 rounded-full blur-[40px]"></div>
                      
                      {/* Gray patches */}
                      <div className="absolute top-[20%] right-[10%] w-[20%] h-[25%] bg-gray-300/35 rounded-full blur-[50px]"></div>
                      <div className="absolute top-[30%] right-[5%] w-[12%] h-[18%] bg-gray-400/25 rounded-full blur-[35px]"></div>
                      
                      {/* Red patches */}
                      <div className="absolute bottom-[15%] left-[8%] w-[22%] h-[28%] bg-red-200/35 rounded-full blur-[55px]"></div>
                      <div className="absolute bottom-[25%] left-[20%] w-[14%] h-[16%] bg-red-300/25 rounded-full blur-[40px]"></div>
                      
                      {/* Green patches */}
                      <div className="absolute top-[40%] left-[35%] w-[18%] h-[22%] bg-green-200/30 rounded-full blur-[45px]"></div>
                      <div className="absolute top-[50%] left-[25%] w-[12%] h-[15%] bg-green-300/25 rounded-full blur-[35px]"></div>
                      
                      {/* Blue patches */}
                      <div className="absolute bottom-[20%] right-[15%] w-[24%] h-[26%] bg-blue-200/40 rounded-full blur-[58px]"></div>
                      <div className="absolute bottom-[10%] right-[8%] w-[16%] h-[20%] bg-blue-300/30 rounded-full blur-[42px]"></div>
                      
                      {/* Additional trailing patches */}
                      <div className="absolute top-[60%] right-[30%] w-[10%] h-[12%] bg-purple-200/25 rounded-full blur-[30px]"></div>
                      <div className="absolute bottom-[40%] left-[50%] w-[13%] h-[16%] bg-orange-200/28 rounded-full blur-[38px]"></div>
                    </div>
                    {heroImages2.map((img, index) => {
                      const isActive = currentImageIndex === index;
                      return (
                        <img
                          key={img}
                          src={img}
                          alt="Character"
                          loading="lazy"
                          decoding="async"
                          width={500}
                          height={500}
                          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] md:w-[85%] md:h-[95%] object-contain md:object-cover grayscale rounded-2xl transition-opacity duration-1000 -rotate-3 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                          style={{ pointerEvents: 'none' }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Image Card, Battle Card, and Engineering Vault */}
            <div className="md:w-1/2 lg:w-1/2 order-2 flex flex-col gap-2 sm:gap-3 md:gap-4 lg:gap-6">
              {/* Image Card - Order 1 on mobile */}
              <div className="relative group order-1">
                <div className="relative w-full aspect-square max-w-[380px] sm:max-w-[420px] md:max-w-[300px] lg:max-w-[350px] xl:max-w-[400px] mx-auto">
                  <div className="absolute inset-0 rounded-[2rem] md:rounded-[4rem] rotate-6 scale-95" />
                  <div className="absolute inset-0 bg-black/5 rounded-[2rem] md:rounded-[4rem] -rotate-3 border border-black/10 backdrop-blur-sm" />
                  <div className="absolute inset-0 rounded-[2rem] md:rounded-[4rem] overflow-hidden border border-black/20 bg-amber-50/20">
                    {/* Colored patches */}
                    <div className="absolute top-[10%] left-[5%] w-[25%] h-[30%] bg-yellow-200/40 rounded-full blur-[60px]"></div>
                    <div className="absolute top-[5%] left-[15%] w-[15%] h-[20%] bg-yellow-300/30 rounded-full blur-[40px]"></div>
                    <div className="absolute top-[20%] right-[10%] w-[20%] h-[25%] bg-gray-300/35 rounded-full blur-[50px]"></div>
                    <div className="absolute top-[30%] right-[5%] w-[12%] h-[18%] bg-gray-400/25 rounded-full blur-[35px]"></div>
                    <div className="absolute bottom-[15%] left-[8%] w-[22%] h-[28%] bg-red-200/35 rounded-full blur-[55px]"></div>
                    <div className="absolute bottom-[25%] left-[20%] w-[14%] h-[16%] bg-red-300/25 rounded-full blur-[40px]"></div>
                    <div className="absolute top-[40%] left-[35%] w-[18%] h-[22%] bg-green-200/30 rounded-full blur-[45px]"></div>
                    <div className="absolute top-[50%] left-[25%] w-[12%] h-[15%] bg-green-300/25 rounded-full blur-[35px]"></div>
                    <div className="absolute bottom-[20%] right-[15%] w-[24%] h-[26%] bg-blue-200/40 rounded-full blur-[58px]"></div>
                    <div className="absolute bottom-[10%] right-[8%] w-[16%] h-[20%] bg-blue-300/30 rounded-full blur-[42px]"></div>
                    <div className="absolute top-[60%] right-[30%] w-[10%] h-[12%] bg-purple-200/25 rounded-full blur-[30px]"></div>
                    <div className="absolute bottom-[40%] left-[50%] w-[13%] h-[16%] bg-orange-200/28 rounded-full blur-[38px]"></div>
                    
                    {/* Image */}
                    <img
                      src="/me.png"
                      alt="Hero Character"
                      loading="eager"
                      fetchPriority="high"
                      width={500}
                      height={500}
                      decoding="async"
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] md:w-[85%] md:h-[95%] object-contain md:object-cover grayscale rounded-2xl transition-all duration-300 group-hover:scale-105"
                    />
                  </div>
                </div>
              </div>

              {/* Battle Ground Card - Order 2 on mobile */}
              <div className="relative group max-w-[380px] sm:max-w-[420px] md:max-w-[300px] lg:max-w-[350px] xl:max-w-[400px] mx-auto w-full order-2">
                <a 
                  href="https://arena.kunalpatil.me" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="relative bg-white border-2 border-black rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
                    <div className="relative">
                      <img 
                        src="/LLMbattle.png" 
                        alt="LLM Battle" 
                        className="w-full h-auto object-cover transition-all duration-300 group-hover:scale-105"
                        style={{ 
                          filter: 'sepia(0.4) saturate(0.6) hue-rotate(20deg) brightness(0.95)',
                          opacity: 1
                        }}
                      />
                    </div>
                  </div>
                </a>
                <div className="mt-1.5 sm:mt-2 md:mt-3 lg:mt-4 text-center">
                  <h3 className="text-sm xs:text-base sm:text-lg md:text-base lg:text-lg font-black text-black mb-2 sm:mb-3 md:mb-3 px-1 sm:px-2 leading-tight">
                    Join the Battle Ground of AI Agents
                  </h3>
                  <a 
                    href="https://arena.kunalpatil.me" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block px-5 xs:px-6 sm:px-7 md:px-6 lg:px-8 py-2 xs:py-2.5 sm:py-3 md:py-2.5 bg-black text-white rounded-full font-black uppercase tracking-wider text-xs xs:text-sm sm:text-base md:text-sm hover:bg-sky-500 transition-all active:scale-95 shadow-lg"
                  >
                    Join
                  </a>
                </div>
              </div>

              {/* Engineering Vault Image - Order 4 on mobile */}
              <div className="w-full max-w-[380px] sm:max-w-[420px] md:max-w-[300px] lg:max-w-[350px] xl:max-w-[400px] mx-auto order-4">
                <img
                  src="/hero.png"
                  alt="Engineering Vault VI"
                  width={448}
                  height={280}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Animated Images Card - Order 3 on mobile, shown only on mobile */}
              <div className="relative w-full max-w-[380px] sm:max-w-[420px] md:max-w-[300px] lg:max-w-[350px] xl:max-w-[400px] mx-auto order-3 md:hidden">
                <div className="relative aspect-square w-full">
                  <div className="absolute inset-0 rounded-[2rem] md:rounded-[4rem] rotate-6 scale-95" />
                  <div className="absolute inset-0 bg-black/5 rounded-[2rem] md:rounded-[4rem] -rotate-3 border border-black/10 backdrop-blur-sm" />
                  <div className="absolute inset-0 rounded-[2rem] md:rounded-[4rem] overflow-hidden border border-black/20">
                    <div className="absolute inset-0 bg-amber-50/20">
                      <div className="absolute top-[10%] left-[5%] w-[25%] h-[30%] bg-yellow-200/40 rounded-full blur-[60px]"></div>
                      <div className="absolute top-[5%] left-[15%] w-[15%] h-[20%] bg-yellow-300/30 rounded-full blur-[40px]"></div>
                      <div className="absolute top-[20%] right-[10%] w-[20%] h-[25%] bg-gray-300/35 rounded-full blur-[50px]"></div>
                      <div className="absolute top-[30%] right-[5%] w-[12%] h-[18%] bg-gray-400/25 rounded-full blur-[35px]"></div>
                      <div className="absolute bottom-[15%] left-[8%] w-[22%] h-[28%] bg-red-200/35 rounded-full blur-[55px]"></div>
                      <div className="absolute bottom-[25%] left-[20%] w-[14%] h-[16%] bg-red-300/25 rounded-full blur-[40px]"></div>
                      <div className="absolute top-[40%] left-[35%] w-[18%] h-[22%] bg-green-200/30 rounded-full blur-[45px]"></div>
                      <div className="absolute top-[50%] left-[25%] w-[12%] h-[15%] bg-green-300/25 rounded-full blur-[35px]"></div>
                      <div className="absolute bottom-[20%] right-[15%] w-[24%] h-[26%] bg-blue-200/40 rounded-full blur-[58px]"></div>
                      <div className="absolute bottom-[10%] right-[8%] w-[16%] h-[20%] bg-blue-300/30 rounded-full blur-[42px]"></div>
                      <div className="absolute top-[60%] right-[30%] w-[10%] h-[12%] bg-purple-200/25 rounded-full blur-[30px]"></div>
                      <div className="absolute bottom-[40%] left-[50%] w-[13%] h-[16%] bg-orange-200/28 rounded-full blur-[38px]"></div>
                    </div>
                    {heroImages2.map((img, index) => {
                      const isActive = currentImageIndex === index;
                      return (
                        <img
                          key={img}
                          src={img}
                          alt="Character"
                          loading="lazy"
                          decoding="async"
                          width={500}
                          height={500}
                          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] md:w-[85%] md:h-[95%] object-contain md:object-cover grayscale rounded-2xl transition-opacity duration-1000 -rotate-3 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                          style={{ pointerEvents: 'none' }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Only - Additional Text Below Image Section */}
          <div className="px-4 sm:px-6 pb-10 max-w-7xl mx-auto w-full">
            {/* Hand-Drawn Bio Text */}
            <div className="space-y-5 text-base md:text-lg lg:text-xl leading-relaxed" style={{ fontFamily: "'Kalam', 'Comic Sans MS', 'Brush Script MT', cursive" }}>
              <p className="font-bold text-gray-900" style={{ fontWeight: 700 }}>
                I'm a <span className="font-black text-black bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 px-3 py-1.5 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black transform -rotate-1 inline-block" style={{ fontFamily: "'Kalam', 'Comic Sans MS', cursive", fontWeight: 800 }}>backend-focused engineer</span> who enjoys building systems that are reliable, scalable, and ready for real users. I spend most of my time designing <span className="font-black text-black bg-gradient-to-r from-pink-300 via-pink-400 to-pink-300 px-3 py-1.5 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black transform rotate-1 inline-block" style={{ fontFamily: "'Kalam', 'Comic Sans MS', cursive", fontWeight: 800 }}>APIs, real-time systems</span>, and cloud-native backends using <span className="font-black text-black bg-gradient-to-r from-green-300 via-green-400 to-green-300 px-3 py-1.5 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black transform rotate-1 inline-block" style={{ fontFamily: "'Kalam', 'Comic Sans MS', cursive", fontWeight: 800 }}>Node.js and AWS</span>.
              </p>
              
              <p className="font-bold text-gray-900" style={{ fontWeight: 700 }}>
                I care deeply about <span className="font-black text-black bg-gradient-to-r from-cyan-300 via-cyan-400 to-cyan-300 px-3 py-1.5 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black transform rotate-1 inline-block" style={{ fontFamily: "'Kalam', 'Comic Sans MS', cursive", fontWeight: 800 }}>performance, clean architecture</span>, and fault tolerance — not just making things work, but making them last. Alongside backend and DevOps, I work extensively with <span className="font-black text-black bg-gradient-to-r from-purple-300 via-purple-400 to-purple-300 px-3 py-1.5 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black transform -rotate-1 inline-block" style={{ fontFamily: "'Kalam', 'Comic Sans MS', cursive", fontWeight: 800 }}>AI systems, LLMs</span>, generative models, and image generation workflows integrated into real applications.
              </p>
              
              <div className="inline-block bg-gradient-to-r from-purple-300 via-purple-400 to-purple-300 border-3 border-black rounded-2xl px-6 py-3 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transform -rotate-1 hover:rotate-0 transition-transform">
                <p className="text-lg md:text-xl font-black text-black uppercase tracking-wide" style={{ fontFamily: "'Kalam', 'Comic Sans MS', cursive", fontWeight: 800 }}> CURRENT FOCUS</p>
              </div>
              
              <p className="font-bold text-gray-900" style={{ fontWeight: 700 }}>
                My focus is on making AI <span className="font-black text-black bg-gradient-to-r from-blue-300 via-blue-400 to-blue-300 px-3 py-1.5 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black transform rotate-1 inline-block" style={{ fontFamily: "'Kalam', 'Comic Sans MS', cursive", fontWeight: 800 }}>production-ready</span>, not experimental. Currently, I'm exploring how <span className="font-black text-black bg-gradient-to-r from-orange-300 via-orange-400 to-orange-300 px-3 py-1.5 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black transform -rotate-1 inline-block" style={{ fontFamily: "'Kalam', 'Comic Sans MS', cursive", fontWeight: 800 }}>generative AI, agents</span>, and real-time infrastructure can come together to build practical, scalable, and high-impact systems.
              </p>
            </div>

            {/* Skills Table */}
            <div className="mt-12 bg-white/60 backdrop-blur-sm border-4 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="grid grid-cols-1 divide-y-4 divide-black">
                <div className="p-6 md:p-8 bg-gradient-to-r from-purple-50 to-pink-50">
                  <h3 className="text-black font-black uppercase tracking-wider text-base md:text-lg mb-4 flex items-center gap-2" style={{ fontFamily: "'Kalam', 'Comic Sans MS', cursive", fontWeight: 900 }}>
                    <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                    LANGUAGES
                  </h3>
                  <div className="text-gray-800 text-lg md:text-2xl font-bold leading-relaxed" style={{ fontFamily: "'Kalam', 'Comic Sans MS', cursive", fontWeight: 600 }}>
                    C/C++, Java, Python, JavaScript, SQL
                  </div>
                </div>
                <div className="p-6 md:p-8 bg-gradient-to-r from-blue-50 to-cyan-50">
                  <h3 className="text-black font-black uppercase tracking-wider text-base md:text-lg mb-4 flex items-center gap-2" style={{ fontFamily: "'Kalam', 'Comic Sans MS', cursive", fontWeight: 900 }}>
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    TECHNOLOGIES & TOOLS
                  </h3>
                  <div className="text-gray-800 text-lg md:text-2xl font-bold leading-relaxed" style={{ fontFamily: "'Kalam', 'Comic Sans MS', cursive", fontWeight: 600 }}>
                    AWS, Kubernetes, Docker, Kafka, Spring Boot, React.JS, Azure, GitHub Actions, Linux
                  </div>
                </div>
                <div className="p-6 md:p-8 bg-gradient-to-r from-green-50 to-emerald-50">
                  <h3 className="text-black font-black uppercase tracking-wider text-base md:text-lg mb-4 flex items-center gap-2" style={{ fontFamily: "'Kalam', 'Comic Sans MS', cursive", fontWeight: 900 }}>
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    DATABASES
                  </h3>
                  <div className="text-gray-800 text-lg md:text-2xl font-bold leading-relaxed" style={{ fontFamily: "'Kalam', 'Comic Sans MS', cursive", fontWeight: 600 }}>
                    MySQL, MongoDB, GraphQL, Supabase, Redis
                  </div>
                </div>
                <div className="p-6 md:p-8 bg-gradient-to-r from-orange-50 to-red-50">
                  <h3 className="text-black font-black uppercase tracking-wider text-base md:text-lg mb-4 flex items-center gap-2" style={{ fontFamily: "'Kalam', 'Comic Sans MS', cursive", fontWeight: 900 }}>
                    <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                    AI/ML
                  </h3>
                  <div className="text-gray-800 text-lg md:text-2xl font-bold leading-relaxed" style={{ fontFamily: "'Kalam', 'Comic Sans MS', cursive", fontWeight: 600 }}>
                    Machine Learning, Data Analysis, Deep Learning, Generative AI, AI Agents
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LAZY LOADED TECH STACK */}
      <Suspense fallback={null}>
        <TechStackIcons technologies={technologies} />
      </Suspense>
    </section>
  );
}
