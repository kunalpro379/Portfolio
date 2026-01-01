"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Home as HomeIcon, Instagram, Radio, Users, Trophy, MessageSquare, Shield, Zap, Crown, ChevronRight, Car, Briefcase, Sword, Folder } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import ImageSlider from "@/components/ImageSlider";

export default function Home() {
  const containerRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);
  const [cardProps, setCardProps] = useState<any[]>([]);
  const [bokehProps, setBokehProps] = useState<any[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const heroImages = ["/papa.png", "/kunal2.png", "/friends.png"];

  useEffect(() => {
    setIsMounted(true);
    const props = Array.from({ length: 15 }).map(() => ({
      x: `${Math.random() * 100}vw`,
      rotate: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
      duration: 15 + Math.random() * 10,
      rotateEnd: Math.random() * 720
    }));
    setCardProps(props);

    const bProps = Array.from({ length: 15 }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: 10 + Math.random() * 10,
      delay: Math.random() * 10
    }));
    setBokehProps(bProps);

    // Cycle through images every 4 seconds
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);

    return () => clearInterval(imageInterval);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Section visibility transforms (updated for 14 sections)
  const section1Opacity = useTransform(scrollYProgress, [0, 0.05, 0.07], [1, 0.3, 0]);
  const section1Scale = useTransform(scrollYProgress, [0, 0.07], [1, 0.9]);
  const section1Blur = useTransform(scrollYProgress, [0, 0.02, 0.05, 0.07], ["blur(0px)", "blur(8px)", "blur(30px)", "blur(100px)"]);

  const section2Opacity = useTransform(scrollYProgress, [0.07, 0.1, 0.14, 0.17], [0, 1, 1, 0]);
  const section2Scale = useTransform(scrollYProgress, [0.07, 0.1], [1.1, 1]);

  const section3Opacity = useTransform(scrollYProgress, [0.14, 0.17, 0.21, 0.24], [0, 1, 1, 0]);
  const section3Translate = useTransform(scrollYProgress, [0.14, 0.17], [100, 0]);

  const section4Opacity = useTransform(scrollYProgress, [0.21, 0.24, 0.28, 0.31], [0, 1, 1, 0]);
  const section5Opacity = useTransform(scrollYProgress, [0.28, 0.31, 0.35, 0.38], [0, 1, 1, 0]);
  const section6Opacity = useTransform(scrollYProgress, [0.35, 0.38, 0.42, 0.45], [0, 1, 1, 0]);
  const section7Opacity = useTransform(scrollYProgress, [0.42, 0.45, 0.49, 0.52], [0, 1, 1, 0]);
  const section8Opacity = useTransform(scrollYProgress, [0.49, 0.52, 0.56, 0.59], [0, 1, 1, 0]);
  const section9Opacity = useTransform(scrollYProgress, [0.56, 0.59, 0.63, 0.66], [0, 1, 1, 0]);
  const section10Opacity = useTransform(scrollYProgress, [0.63, 0.66, 0.70, 0.73], [0, 1, 1, 0]);
  const section11Opacity = useTransform(scrollYProgress, [0.70, 0.73, 0.77, 0.80], [0, 1, 1, 0]);
  const section12Opacity = useTransform(scrollYProgress, [0.77, 0.80, 0.84, 0.87], [0, 1, 1, 0]);
  const section13Opacity = useTransform(scrollYProgress, [0.84, 0.87, 0.91, 0.94], [0, 1, 1, 0]);
  const section14Opacity = useTransform(scrollYProgress, [0.91, 0.94, 1.0, 1.0], [0, 1, 1, 1]);

  const technologies = [
    { name: "Java", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
    { name: "Python", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
    { name: "JavaScript", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
    { name: "C/C++", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg" },
    { name: "SQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
    { name: "Spring Boot", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" },
    { name: "AWS", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg" },
    { name: "Docker", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
    { name: "Kubernetes", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg" },
    { name: "CI/CD", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" },
    { name: "Azure", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg" },
    { name: "MySQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
    { name: "MongoDB", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
    { name: "Redis", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg" },
    { name: "Supabase", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },
    { name: "GraphQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg" },
    { name: "Generative AI", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg" },
    { name: "AI Agents", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
    { name: "Kafka", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apache/apache-original.svg" },
    { name: "React", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" }
  ];

  const duration = 20;

  const navItems = ["About", "Stats", "Tiers", "Media"];

  const SectionHeader = ({ icon: Icon, title, subtitle, dark = false }: { icon: any; title: string; subtitle: string; dark?: boolean; }) => (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 mb-8 md:mb-12">
      <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
        <Icon className="relative z-10 text-sky-400" size={32} />
      </div>
      <div>
        <h2 className={`text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none drop-shadow-2xl ${dark ? 'text-black' : 'text-white'}`}>{title}</h2>
        <div className="flex items-center gap-2 mt-2">
          <div className="h-1 w-8 bg-sky-400 rounded-full" />
          <p className="text-sky-400 font-bold tracking-[0.2em] text-[10px] md:text-sm uppercase">{subtitle}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="relative bg-[#050505] font-sans selection:bg-sky-500 selection:text-white text-white">
      {/* FIXED TAB BAR */}
      <div className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-[1000] w-[95%] md:w-auto">
        <div className="relative">
          <div className="absolute -inset-[1px] bg-white/10 rounded-full blur-md z-[-1]" />
          <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-4 md:px-8 py-2 md:py-3 flex items-center justify-between md:justify-start gap-2 md:gap-6 shadow-2xl">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-sky-500 hover:border-sky-400 transition-all cursor-pointer group">
              <HomeIcon size={16} className="group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex gap-1 md:gap-2 overflow-x-auto no-scrollbar md:overflow-visible max-w-[70vw] md:max-w-none">
              {navItems.map((item) => (
                <div
                  key={item}
                  className="px-3 md:px-6 py-1.5 md:py-2 rounded-full text-white/60 font-bold text-[10px] md:text-xs cursor-pointer hover:bg-white/10 hover:text-white transition-all hover:scale-105 active:scale-95 border border-transparent hover:border-white/10 whitespace-nowrap"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1 - HERO */}
      <section className="relative min-h-screen flex items-center justify-center p-2 md:p-3 overflow-hidden">
        <motion.div
          className="relative w-full h-screen rounded-2xl md:rounded-3xl overflow-hidden bg-[#030303]">

          <div className="absolute inset-0 z-[2] opacity-[0.04] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

          <div className="absolute inset-0 z-0">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.15, 0.1],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-sky-500/5 rounded-full blur-[140px]" />
            <motion.div
              animate={{
                scale: [1.1, 1, 1.1],
                opacity: [0.05, 0.1, 0.05],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-indigo-500/5 rounded-full blur-[140px]" />
          </div>

          {/* Light Beams/Rays */}
          <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
            <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] rotate-45 opacity-[0.05]" style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(255,255,255,0.1) 50px, rgba(255,255,255,0.1) 51px)',
            }} />
          </div>

          {/* Refined Grid Overlay - Finer lines */}
          <div className="absolute inset-0 z-[2] opacity-[0.1]" style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), 
              linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
            maskImage: 'radial-gradient(circle at center, black, transparent 90%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 90%)'
          }} />

          {/* Floating Bokeh / Particles */}
          <div className="absolute inset-0 z-[3] pointer-events-none">
            {isMounted && bokehProps.map((props, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 0.2, 0],
                  scale: [0.5, 1, 0.5],
                  y: [0, -100]
                }}
                transition={{
                  duration: props.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: props.delay
                }}
                className="absolute w-1 h-1 bg-sky-400 rounded-full blur-[1px]"
                style={{
                  top: props.top,
                  left: props.left,
                }} />
            ))}
          </div>

          {/* Subtle Aura behind Text */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[40%] h-[40%] bg-sky-500/5 rounded-full blur-[180px] z-[4] pointer-events-none" />

          {/* Vignette */}
          <div className="absolute inset-0 z-[4] pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />

          {/* CHARACTER IMAGE */}
          <div className="absolute left-[2%] right-[2%] top-[10%] sm:right-[5%] sm:left-auto sm:top-[10%] md:right-[8%] md:top-[15%] lg:bottom-[20%] lg:top-auto z-[4] h-[40%] sm:h-[45%] md:h-[50%] lg:h-[65%] w-auto sm:w-[30%] md:w-[32%] lg:w-[30%] pointer-events-none select-none">
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-sky-500/10 rounded-[2rem] md:rounded-[4rem] rotate-6 scale-95" />
              <div className="absolute inset-0 bg-white/5 rounded-[2rem] md:rounded-[4rem] -rotate-3 border border-white/10 backdrop-blur-sm" />
              <div className="absolute inset-0 rounded-[2rem] md:rounded-[4rem] overflow-hidden border border-white/20 bg-gradient-to-br from-white/10 to-transparent">
                {heroImages.map((img, index) => (
                  <motion.img
                    key={img}
                    initial={{ opacity: index === 0 ? 1 : 0, x: index === 0 ? 0 : 100 }}
                    animate={{
                      opacity: currentImageIndex === index ? 1 : 0,
                      x: currentImageIndex === index ? 0 : 100,
                      scale: 1
                    }}
                    transition={{
                      opacity: { duration: 1, ease: "easeInOut" },
                      x: { duration: 1, ease: "easeInOut" },
                      scale: { duration: 1, ease: "easeInOut" }
                    }}
                    src={img}
                    alt="Character"
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] md:w-[80%] md:h-[80%] object-contain md:object-cover grayscale rounded-2xl"
                    style={{ imageRendering: 'high-quality' }} />
                ))}
              </div>

              {/* Floating Badges */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-3 -right-3 md:-top-6 md:-right-6 px-3 md:px-6 py-1.5 md:py-3 bg-black border border-white/10 rounded-xl md:rounded-2xl shadow-2xl"
              >
                <div className="text-[8px] md:text-xs font-black text-sky-400 whitespace-nowrap">NEXT.JS EXPERT</div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-3 -left-3 md:-bottom-6 md:-left-6 px-3 md:px-6 py-1.5 md:py-3 bg-black border border-white/10 rounded-xl md:rounded-2xl shadow-2xl"
              >
                <div className="text-[8px] md:text-xs font-black text-white whitespace-nowrap">AI ENGINEER</div>
              </motion.div>
            </div>
          </div>

          <div className="absolute inset-0 flex flex-col items-start justify-center pt-48 md:pt-0 z-[5] px-6 md:px-24 max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mb-4 md:mb-6"
            >
              <span className="px-3 md:px-4 py-1 md:py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em]">
                Crafting Future Tech
              </span>
            </motion.div>
            <h1 className="text-6xl md:text-[12rem] font-black tracking-tighter leading-[0.8] mb-6 md:mb-8 select-none text-left">
              KUNAL<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">PORTFOLIO</span>
            </h1>
            <p className="max-w-xl text-white/40 font-medium text-sm md:text-lg tracking-wide uppercase text-left">
              Crafting immersive digital experiences through <span className="text-white">Full-Stack Development</span> & <span className="text-white">Generative AI</span>.
            </p>

            <div className="mt-8 md:mt-12 flex flex-col sm:flex-row gap-4 md:gap-6 w-full sm:w-auto">
              <div className="px-8 md:px-10 py-4 md:py-5 bg-sky-500 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all cursor-pointer shadow-[0_20px_50px_rgba(0,163,255,0.4)] text-center text-xs md:text-base">
                Explore Work
              </div>
              <div className="px-8 md:px-10 py-4 md:py-5 border border-white/10 bg-white/5 backdrop-blur-md text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all cursor-pointer text-center text-xs md:text-base">
                Contact Me
              </div>
            </div>
          </div>
        </motion.div>

        {/* IMPROVED CARDS ANIMATION */}
        {isMounted && cardProps.length > 0 && (
          <div className="absolute inset-0 z-[10] pointer-events-none overflow-hidden">
            {cardProps.map((props, i) => <motion.div
              key={i}
              initial={{
                x: props.x,
                y: "110vh",
                opacity: 0,
                rotate: props.rotate,
                scale: props.scale
              }}
              animate={{
                y: "-20vh",
                opacity: [0, 0.8, 0.8, 0],
                rotate: [props.rotate, props.rotateEnd]
              }}
              transition={{
                duration: props.duration,
                repeat: Infinity,
                ease: "linear",
                delay: -(i * duration) / 15
              }}
              className="absolute w-20 h-20 md:w-32 md:h-32 backdrop-blur-md bg-white/5 border border-white/10 rounded-xl md:rounded-2xl flex flex-col items-center justify-center shadow-2xl p-2 md:p-4">
              <img
                src={technologies[i % technologies.length].logo}
                alt={technologies[i % technologies.length].name}
                className="w-6 h-6 md:w-10 md:h-10 mb-1 md:mb-2 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
              <span className="text-[6px] md:text-[8px] font-black uppercase tracking-tighter text-white/60">{technologies[i % technologies.length].name}</span>
            </motion.div>
            )}
          </div>
        )}

      </section>

      {/* SCROLLABLE CONTENT CONTAINER */}
      <div className="relative z-10">

        {/* SECTION 2 - BEYOND THE CODE */}
        <section className="min-h-screen flex items-center justify-center p-2 md:p-3 overflow-hidden bg-[#0a0a0a]">
          <div className="relative w-full h-full">

            <div className="absolute inset-0">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.03)_0%,transparent_70%)]" />
            </div>

            <div className="relative z-10 flex flex-col lg:grid lg:grid-cols-2 min-h-screen max-w-7xl mx-auto items-center gap-10 md:gap-20 p-6 md:p-20">
              <div className="space-y-6 md:space-y-10 order-2 lg:order-1">
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-[1px] w-12 bg-sky-500" />
                    <span className="text-sky-500 font-black uppercase tracking-[0.3em] text-[10px] md:text-xs">About My Craft</span>
                  </div>
                  <h2 className="text-4xl md:text-8xl font-black uppercase tracking-tighter leading-none">
                    BEYOND<br />
                    <span className="text-transparent" style={{ WebkitTextStroke: '1.5px white' }}>THE CODE</span>
                  </h2>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <p className="text-lg md:text-2xl text-white/60 font-medium leading-relaxed">
                    Passionate Full-Stack Developer with a focus on building <span className="text-white">high-performance</span>,
                    user-centric applications. Specializing in bridging the gap between <span className="text-white">AI agents</span> and modern web architectures.
                  </p>
                  <div className="flex flex-wrap gap-6 md:gap-10">
                    <div>
                      <div className="text-2xl md:text-4xl font-black mb-1">05+</div>
                      <div className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-white/40">Years Exp.</div>
                    </div>
                    <div>
                      <div className="text-2xl md:text-4xl font-black mb-1">40+</div>
                      <div className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-white/40">Projects</div>
                    </div>
                    <div>
                      <div className="text-2xl md:text-4xl font-black mb-1">12k+</div>
                      <div className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-white/40">Commits</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 md:pt-6">
                  <div className="inline-flex items-center gap-4 px-6 md:px-8 py-3 md:py-4 bg-white text-black rounded-full font-black uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all cursor-pointer group text-xs md:text-base">
                    See my work <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              {/* <div className="relative aspect-[2/3] w-full max-w-[300px] md:max-w-none md:w-[95%] mx-auto order-1 lg:order-2">
                <div className="absolute inset-0 bg-sky-500/10 rounded-[2rem] md:rounded-[4rem] rotate-6 scale-95" />
                <div className="absolute inset-0 bg-white/5 rounded-[2rem] md:rounded-[4rem] -rotate-3 border border-white/10 backdrop-blur-sm" />
                <div className="absolute inset-0 rounded-[2rem] md:rounded-[4rem] overflow-hidden border border-white/20 bg-gradient-to-br from-white/10 to-transparent">
                  <ImageSlider />
                </div>

                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-3 -right-3 md:-top-6 md:-right-6 px-3 md:px-6 py-1.5 md:py-3 bg-black border border-white/10 rounded-xl md:rounded-2xl shadow-2xl"
                >
                  <div className="text-[8px] md:text-xs font-black text-sky-400 whitespace-nowrap">NEXT.JS EXPERT</div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-3 -left-3 md:-bottom-6 md:-left-6 px-3 md:px-6 py-1.5 md:py-3 bg-black border border-white/10 rounded-xl md:rounded-2xl shadow-2xl"
                >
                  <div className="text-[8px] md:text-xs font-black text-white whitespace-nowrap">AI ENGINEER</div>
                </motion.div>
              </div> 
            </div>
            */}
          </div>
        </section>

        {/* SECTION 3 - MY JOURNEY */}
        <section className="min-h-screen flex items-center justify-center p-2 md:p-3 overflow-hidden pointer-events-none">
          <motion.div
            className="relative w-full h-full rounded-2xl md:rounded-3xl overflow-y-auto bg-[#0a0a0a] border border-white/5 shadow-2xl pointer-events-auto custom-scrollbar">

            <div className="absolute inset-0">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.03)_0%,transparent_70%)]" />
            </div>

            {/* BUILDING THE FUTURE CONTENT */}
            <div className="relative z-10 flex flex-col lg:grid lg:grid-cols-2 h-screen max-w-7xl mx-auto items-center gap-10 md:gap-20 p-6 md:p-20">
              <div className="relative aspect-[2/3] w-full max-w-[300px] md:max-w-none md:w-[95%] mx-auto order-1 lg:order-1">
                <div className="absolute inset-0 bg-sky-500/10 rounded-[2rem] md:rounded-[4rem] rotate-6 scale-95" />
                <div className="absolute inset-0 bg-white/5 rounded-[2rem] md:rounded-[4rem] -rotate-3 border border-white/10 backdrop-blur-sm" />
                <div className="absolute inset-0 rounded-[2rem] md:rounded-[4rem] overflow-hidden border border-white/20 bg-gradient-to-br from-white/10 to-transparent">
                  <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80" className="w-full h-full object-cover" alt="Coding Journey" />
                </div>

                {/* Floating Badges */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-3 -right-3 md:-top-6 md:-right-6 px-3 md:px-6 py-1.5 md:py-3 bg-black border border-white/10 rounded-xl md:rounded-2xl shadow-2xl"
                >
                  <div className="text-[8px] md:text-xs font-black text-sky-400 whitespace-nowrap">PROBLEM SOLVER</div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-3 -left-3 md:-bottom-6 md:-left-6 px-3 md:px-6 py-1.5 md:py-3 bg-black border border-white/10 rounded-xl md:rounded-2xl shadow-2xl"
                >
                  <div className="text-[8px] md:text-xs font-black text-white whitespace-nowrap">INNOVATOR</div>
                </motion.div>
              </div>

              <div className="space-y-6 md:space-y-10 order-2 lg:order-2">
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-[1px] w-12 bg-sky-500" />
                    <span className="text-sky-500 font-black uppercase tracking-[0.3em] text-[10px] md:text-xs">My Journey</span>
                  </div>
                  <h2 className="text-4xl md:text-8xl font-black uppercase tracking-tighter leading-none">
                    BUILDING<br />
                    <span className="text-transparent" style={{ WebkitTextStroke: '1.5px white' }}>THE FUTURE</span>
                  </h2>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <p className="text-lg md:text-2xl text-white/60 font-medium leading-relaxed">
                    From crafting <span className="text-white">scalable microservices</span> to building intelligent <span className="text-white">AI-powered solutions</span>,
                    I transform complex challenges into elegant, production-ready applications.
                  </p>
                  <div className="flex flex-wrap gap-6 md:gap-10">
                    <div>
                      <div className="text-2xl md:text-4xl font-black mb-1">100%</div>
                      <div className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-white/40">Success Rate</div>
                    </div>
                    <div>
                      <div className="text-2xl md:text-4xl font-black mb-1">24/7</div>
                      <div className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-white/40">Availability</div>
                    </div>
                    <div>
                      <div className="text-2xl md:text-4xl font-black mb-1">∞</div>
                      <div className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-white/40">Innovation</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 md:pt-6">
                  <div className="inline-flex items-center gap-4 px-6 md:px-8 py-3 md:py-4 bg-white text-black rounded-full font-black uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all cursor-pointer group text-xs md:text-base">
                    View Projects <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* ALL REMAINING SECTIONS SCROLL INSIDE */}
            <div className="relative z-10 space-y-8 p-6 md:p-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 flex-1">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <div key={i} className="group relative bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:border-sky-400/50 transition-all duration-500 shadow-xl h-fit">
                  <div className="h-40 md:h-48 w-full overflow-hidden relative">
                    <img src={`https://picsum.photos/seed/${i + 50}/600/400`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 left-4 bg-red-600 px-3 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-white">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
                    </div>
                  </div>
                  <div className="p-4 md:p-6 flex items-center gap-4">
                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-sky-500 flex items-center justify-center overflow-hidden border-2 border-white/10 group-hover:rotate-12 transition-transform shrink-0">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} className="w-full h-full" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg md:text-xl uppercase tracking-tighter text-black truncate">User_{i}</h4>
                      <p className="text-zinc-500 font-bold text-[8px] md:text-xs uppercase tracking-widest group-hover:text-sky-400 transition-colors">Digital Creator</p>
                    </div>
                  </div>
                </div>
                )}
              </div>
            </div>
          </motion.div>
        </section>

        {/* SECTION 4 - SERVER STATS */}
        <section className="relative h-screen flex items-center justify-center p-2 md:p-3 overflow-hidden pointer-events-none">
          <motion.div
            className="relative w-full h-full rounded-2xl md:rounded-3xl overflow-y-auto bg-gradient-to-br from-zinc-900 via-black to-zinc-900 border border-zinc-800 shadow-2xl pointer-events-auto custom-scrollbar">

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,163,255,0.08)_0%,transparent_70%)]" />

            <div className="relative z-10 h-full flex items-center justify-center p-6 md:p-12">
              <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 md:gap-12 w-full max-w-7xl">
                <div className="lg:col-span-5 space-y-6 md:space-y-8">
                  <SectionHeader icon={Users} title="COMMUNITY" subtitle="Growing Fast" dark={true} />
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    {[
                      { label: "Active Users", value: "85k+", icon: Users },
                      { label: "Total Projects", value: "120+", icon: Folder },
                      { label: "Awards", value: "15", icon: Trophy },
                      { label: "Messages", value: "1.2M", icon: MessageSquare }
                    ].
                      map((stat, i) => <div key={i} className="bg-zinc-800 border border-zinc-700 p-4 md:p-8 rounded-xl md:rounded-2xl hover:bg-zinc-700 transition-all cursor-crosshair group">
                        <stat.icon size={20} className="text-sky-400 mb-2 md:mb-4 group-hover:scale-110 transition-transform" />
                        <div className="text-2xl md:text-4xl font-black mb-1 text-white">{stat.value}</div>
                        <div className="text-zinc-400 font-bold text-[8px] md:text-[10px] uppercase tracking-widest">{stat.label}</div>
                      </div>
                      )}
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <div className="relative h-full min-h-[300px] md:min-h-0 bg-zinc-800 border border-zinc-700 rounded-2xl md:rounded-3xl overflow-hidden group">
                    <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80" className="w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                    <div className="absolute bottom-6 md:bottom-12 left-6 md:left-12 right-6 md:right-12">
                      <h3 className="text-3xl md:text-6xl font-black uppercase tracking-tighter mb-2 md:mb-4 text-white leading-none">SYSTEM <span className="text-sky-400">ARCHITECTURE</span></h3>
                      <p className="text-zinc-300 text-sm md:text-xl font-medium max-w-xl">Deep dive into the high-performance systems and AI architectures that power modern web apps.</p>
                      <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 md:gap-4">
                        <div className="px-6 md:px-10 py-3 md:py-5 bg-sky-500 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all cursor-pointer text-center text-xs">Architecture</div>
                        <div className="px-6 md:px-10 py-3 md:py-5 bg-white/10 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest hover:bg-white/20 transition-all cursor-pointer text-center text-xs">Documentation</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* SECTION 5 - MEMBERSHIP TIERS */}
        <section className="relative h-screen flex items-center justify-center p-2 md:p-3 overflow-hidden pointer-events-none">
          <motion.div
            className="relative w-full h-full rounded-2xl md:rounded-3xl overflow-y-auto bg-gradient-to-br from-sky-50 via-white to-blue-50 border border-sky-200 shadow-2xl pointer-events-auto p-6 md:p-12 custom-scrollbar">

            <div className="max-w-7xl mx-auto h-full flex flex-col">
              <SectionHeader icon={Crown} title="MEMBERSHIP TIERS" subtitle="Unlock Premium Features" dark={true} />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 flex-1">
                {[
                  { name: "DIAMOND", price: "$49.99", icon: Zap, color: "text-sky-400", bg: "bg-sky-400/5", border: "border-sky-400/20", features: ["Priority Queue (Instant)", "Custom Character Slots", "Exclusive High-End Cars", "Admin Support Access"] },
                  { name: "PLATINUM", price: "$29.99", icon: Shield, color: "text-zinc-600", bg: "bg-zinc-50", border: "border-zinc-200", features: ["Priority Queue (Fast)", "Extra Inventory Slots", "Custom License Plate", "Premium Discord Role"] },
                  { name: "GOLD", price: "$14.99", icon: Trophy, color: "text-yellow-600", bg: "bg-yellow-500/5", border: "border-yellow-500/20", features: ["Faster Connection", "Starter Pack ($50k)", "Monthly Mystery Box", "Gold Badge in Chat"] }
                ].
                  map((tier, i) => <div key={i} className={`relative p-6 md:p-8 rounded-2xl md:rounded-3xl border ${tier.border} ${tier.bg} flex flex-col items-center text-center group transition-all duration-500 hover:scale-[1.02] md:hover:scale-105 shadow-xl overflow-hidden h-fit`}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-black/5 to-transparent" />
                    <tier.icon className={`${tier.color} mb-4 md:mb-8`} size={48} md-size={64} />
                    <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-2 md:mb-4 text-black">{tier.name}</h3>
                    <div className="text-xl md:text-3xl font-bold mb-6 md:mb-10 opacity-70 italic text-black">{tier.price}<span className="text-xs md:text-sm uppercase not-italic">/mo</span></div>
                    <ul className="space-y-2 md:space-y-4 mb-8 md:mb-12 flex-1">
                      {tier.features.map((f, j) => <li key={j} className="text-zinc-500 font-bold uppercase text-[8px] md:text-xs tracking-widest">{f}</li>
                      )}
                    </ul>
                    <div className={`w-full py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-widest cursor-pointer transition-all text-xs md:text-sm ${i === 0 ? 'bg-sky-500 text-white shadow-[0_15px_30px_rgba(0,163,255,0.4)]' : 'bg-black text-white hover:bg-sky-400'}`}>
                      Select Plan
                    </div>
                  </div>
                  )}
              </div>
            </div>
          </motion.div>
        </section>

        {/* SECTION 6 - GALLERY / RECENT EVENTS */}
        <section className="relative h-screen flex items-center justify-center p-2 md:p-3 overflow-hidden pointer-events-none">
          <motion.div
            className="relative w-full h-full rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-zinc-100 border border-zinc-200 shadow-2xl pointer-events-auto p-6 md:p-12">

            <div className="max-w-7xl mx-auto h-full flex flex-col">
              <SectionHeader icon={Trophy} title="CITY ARCHIVE" subtitle="Record of Excellence" />

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 flex-1 overflow-hidden">
                {[
                  "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957",
                  "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf",
                  "https://images.unsplash.com/photo-1511919884226-fd3cad34687c",
                  "https://images.unsplash.com/photo-1542281286-9e0a16bb7366",
                  "https://images.unsplash.com/photo-1614332287897-cdc485fa562d",
                  "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
                  "https://images.unsplash.com/photo-1580273916550-e323be2ae537",
                  "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2"
                ].
                  map((src, i) => <div key={i} className="relative rounded-xl md:rounded-2xl overflow-hidden border border-zinc-200 group cursor-pointer aspect-square">
                    <img src={`${src}?auto=format&fit=crop&q=80`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-sky-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="px-3 md:px-4 py-1.5 md:py-2 bg-black text-white font-black uppercase text-[8px] md:text-xs rounded-full tracking-widest">View</div>
                    </div>
                  </div>
                  )}
              </div>
            </div>
          </motion.div>
        </section>

        {/* SECTION 7 - LATEST NEWS */}
        <section className="relative h-screen flex items-center justify-center p-2 md:p-3 overflow-hidden pointer-events-none">
          <motion.div
            className="relative w-full h-full rounded-2xl md:rounded-3xl overflow-y-auto bg-gradient-to-br from-white via-blue-50 to-sky-50 border border-sky-200 shadow-2xl pointer-events-auto p-6 md:p-12 custom-scrollbar">

            <div className="max-w-7xl mx-auto h-full flex flex-col">
              <SectionHeader icon={Radio} title="LATEST NEWS" subtitle="City Updates" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 flex-1">
                {[
                  { date: "Oct 24", title: "New Diamond Casino Heist", desc: "Experience the most complex heist in city history.", img: "https://images.unsplash.com/photo-1593305841991-05c297ba4575" },
                  { date: "Oct 22", title: "Updated Police Fleet", desc: "LSPD receives high-speed interceptors and new gear.", img: "https://images.unsplash.com/photo-1563200020-03a088373307" },
                  { date: "Oct 20", title: "Autumn Season Pass", desc: "Exclusive rewards, new outfits, and seasonal events.", img: "https://images.unsplash.com/photo-1518770660439-4636190af475" }
                ].
                  map((news, i) => <div key={i} className="group relative bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden hover:border-sky-400 transition-all h-fit">
                    <div className="h-48 md:h-64 overflow-hidden">
                      <img src={`${news.img}?auto=format&fit=crop&q=80`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="p-6 md:p-10">
                      <div className="text-sky-400 font-bold text-[10px] md:text-xs uppercase tracking-widest mb-2 md:mb-4">{news.date}</div>
                      <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-2 md:mb-4 text-black leading-none">{news.title}</h3>
                      <p className="text-zinc-600 font-medium text-sm md:text-base mb-6 md:mb-8">{news.desc}</p>
                      <div className="text-black font-black uppercase tracking-widest text-[10px] md:text-sm flex items-center gap-2 group-hover:gap-4 transition-all cursor-pointer">
                        Read More <ChevronRight size={16} md-size={18} />
                      </div>
                    </div>
                  </div>
                  )}
              </div>
            </div>
          </motion.div>
        </section>

        {/* SECTION 8 - HOW TO JOIN */}
        <section className="relative h-screen flex items-center justify-center p-2 md:p-3 overflow-hidden pointer-events-none">
          <motion.div
            className="relative w-full h-full rounded-2xl md:rounded-3xl overflow-y-auto bg-gradient-to-br from-zinc-900 via-black to-zinc-900 border border-zinc-800 shadow-2xl pointer-events-auto p-6 md:p-12 custom-scrollbar">

            <div className="max-w-7xl mx-auto h-full flex flex-col">
              <SectionHeader icon={Zap} title="HOW TO JOIN" subtitle="Start Your Story" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 flex-1">
                {[
                  { step: "01", title: "Discord", desc: "Join our vibrant community and get verified." },
                  { step: "02", title: "Direct Link", desc: "Connect using our high-speed direct entry line." },
                  { step: "03", title: "Character", desc: "Create your unique persona with custom tools." },
                  { step: "04", title: "Play", desc: "Dive into the most immersive RP experience." }
                ].
                  map((step, i) => <div key={i} className="relative p-8 md:p-12 bg-zinc-50 border border-zinc-100 rounded-2xl md:rounded-3xl flex flex-col justify-between group hover:bg-zinc-100 transition-all h-fit min-h-[200px] md:min-h-[280px]">
                    <div className="text-4xl md:text-6xl font-black text-black/5 italic group-hover:text-sky-400/20 transition-colors leading-none">{step.step}</div>
                    <div className="mt-4">
                      <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-2 md:mb-4 text-black leading-none">{step.title}</h3>
                      <p className="text-zinc-500 font-bold uppercase text-[8px] md:text-[10px] tracking-[0.2em]">{step.desc}</p>
                    </div>
                    <div className="mt-6 md:mt-8 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-black/5 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-colors">
                      <ChevronRight size={20} md-size={24} />
                    </div>
                  </div>
                  )}
              </div>
            </div>
          </motion.div>
        </section>

        {/* SECTION 9 - MEDIA PARTNERS */}
        <section className="relative h-screen flex items-center justify-center p-2 md:p-3 overflow-hidden pointer-events-none">
          <motion.div
            className="relative w-full h-full rounded-2xl md:rounded-3xl overflow-y-auto bg-gradient-to-br from-white via-zinc-50 to-zinc-100 border border-zinc-200 shadow-2xl pointer-events-auto p-6 md:p-12 custom-scrollbar">

            <div className="max-w-7xl mx-auto h-full flex flex-col">
              <SectionHeader icon={Users} title="OFFICIAL PARTNERS" subtitle="Powering The Future" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-12 flex-1 items-center">
                {[
                  { src: "/next.svg", name: "Next.js" },
                  { src: "/vercel.svg", name: "Vercel" },
                  { src: "/file.svg", name: "Partner 3" },
                  { src: "/globe.svg", name: "Partner 4" },
                  { src: "/window.svg", name: "Partner 5" },
                  { src: "/next.svg", name: "Next.js" },
                  { src: "/vercel.svg", name: "Vercel" },
                  { src: "/file.svg", name: "Partner 3" },
                  { src: "/globe.svg", name: "Partner 4" },
                  { src: "/window.svg", name: "Partner 5" }
                ].map((partner, index) => <div key={index} className="grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer flex justify-center items-center p-4">
                  <img src={partner.src} alt={partner.name} className="h-8 md:h-12 w-auto object-contain" />
                </div>
                )}
                <div className="col-span-full text-center mt-8 md:mt-12">
                  <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] md:tracking-[0.5em] text-[10px] md:text-sm italic">Trusted by the biggest names in the industry</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* SECTION 10 - LUXURY GARAGE (NEW) */}
        <section className="relative h-screen flex items-center justify-center p-2 md:p-3 overflow-hidden pointer-events-none">
          <motion.div
            className="relative w-full h-full rounded-2xl md:rounded-3xl overflow-y-auto bg-gradient-to-br from-sky-50 via-white to-blue-50 border border-sky-200 shadow-2xl pointer-events-auto p-6 md:p-12 custom-scrollbar">

            <div className="max-w-7xl mx-auto h-full flex flex-col">
              <SectionHeader icon={Car} title="LUXURY GARAGE" subtitle="Premium Vehicle Collection" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 flex-1">
                <div className="relative group overflow-hidden rounded-2xl md:rounded-3xl border border-zinc-200 aspect-video md:aspect-auto">
                  <img src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10">
                    <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-white">Diamond Series</h3>
                    <p className="text-sky-400 font-bold text-[8px] md:text-xs uppercase tracking-widest mt-1 md:mt-2">Exclusive Import</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2 gap-4 md:gap-8">
                  <div className="relative group overflow-hidden rounded-2xl md:rounded-3xl border border-zinc-200 aspect-video">
                    <img src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute bottom-6 md:bottom-8 left-6 md:left-8">
                      <h3 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-white">Carbon Custom</h3>
                    </div>
                  </div>
                  <div className="relative group overflow-hidden rounded-2xl md:rounded-3xl border border-zinc-200 aspect-video">
                    <img src="https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&q=80" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute bottom-6 md:bottom-8 left-6 md:left-8">
                      <h3 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-white">Urban Legend</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* SECTION 11 - CAREER PATHS (NEW) */}
        <section className="relative h-screen flex items-center justify-center p-2 md:p-3 overflow-hidden pointer-events-none">
          <motion.div
            className="relative w-full h-full rounded-2xl md:rounded-3xl overflow-y-auto bg-gradient-to-br from-zinc-900 via-black to-zinc-900 border border-zinc-800 shadow-2xl pointer-events-auto p-6 md:p-12 custom-scrollbar">

            <div className="max-w-7xl mx-auto h-full flex flex-col">
              <SectionHeader icon={Briefcase} title="CAREER PATHS" subtitle="Choose Your Destiny" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 flex-1">
                {[
                  { title: "LSPD", role: "Enforce Justice", img: "https://images.unsplash.com/photo-1579822396902-50341071018e" },
                  { title: "EMS", role: "Save Lives", img: "https://images.unsplash.com/photo-1583946099379-f9c9cb8bc030" },
                  { title: "MECHANIC", role: "Performance Pros", img: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3" },
                  { title: "ENTREPRENEUR", role: "Build Empire", img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab" }
                ].
                  map((job, i) => <div key={i} className="relative rounded-xl md:rounded-2xl overflow-hidden border-2 border-zinc-200 group hover:border-sky-400 transition-all cursor-pointer aspect-square md:aspect-auto">
                    <img src={`${job.img}?auto=format&fit=crop&q=80`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 md:p-6">
                      <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-1 md:mb-2 scale-90 group-hover:scale-100 transition-transform text-white leading-none">{job.title}</h3>
                      <p className="text-sky-400 font-bold text-[8px] md:text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">{job.role}</p>
                    </div>
                  </div>
                  )}
              </div>
            </div>
          </motion.div>
        </section>

        <section className="relative h-screen flex items-center justify-center p-2 md:p-3 overflow-hidden pointer-events-none">
          <motion.div
            className="relative w-full h-full rounded-2xl md:rounded-3xl overflow-y-auto bg-gradient-to-br from-white via-zinc-50 to-zinc-100 border border-zinc-200 shadow-2xl pointer-events-auto p-6 md:p-12 custom-scrollbar">

            {/* Video Background - GTAV */}
            <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl md:rounded-3xl">
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover opacity-40"
                style={{
                  filter: 'blur(3px)',
                  transform: 'scale(1.05) translateZ(0)',
                  willChange: 'transform'
                }}
              >
                <source src="/GTAV.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-zinc-50/80 to-zinc-100/70 backdrop-blur-sm" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col">
              <SectionHeader icon={Sword} title="FACTION WARFARE" subtitle="Territory & Influence" />
              <div className="relative flex-1 rounded-2xl md:rounded-3xl overflow-hidden border border-zinc-200 group min-h-[400px]">
                <img src="https://images.unsplash.com/photo-1542224566-6e85f2e6772f?auto=format&fit=crop&q=80" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-16 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                  <div className="max-w-2xl">
                    <h3 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-3 md:mb-6 leading-none text-white lg:text-black">DOMINATE THE <span className="text-sky-400">STREETS</span></h3>
                    <p className="text-white lg:text-zinc-700 text-sm md:text-xl font-medium">Join established families or start your own creed. Control distribution, manage turf, and rise as the ultimate power in Lucid City.</p>
                  </div>
                  <div className="w-full lg:w-auto px-8 md:px-16 py-4 md:py-8 bg-sky-500 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest hover:scale-110 transition-all cursor-pointer shadow-[0_20px_60px_rgba(0,163,255,0.4)] text-center text-xs md:text-base">
                    Claim Turf
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="relative h-screen flex items-center justify-center p-2 md:p-3 overflow-hidden pointer-events-none">
          <motion.div
            className="relative w-full h-full rounded-2xl md:rounded-3xl overflow-y-auto bg-gradient-to-br from-sky-50 via-white to-blue-50 border border-sky-200 shadow-2xl pointer-events-auto custom-scrollbar">

            <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,163,255,0.05)_0%,transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,163,255,0.05)_0%,transparent_60%)]" />

            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-6 md:p-12">
              <div className="w-24 h-24 md:w-40 md:h-40 bg-sky-500 rounded-2xl md:rounded-3xl rotate-45 flex items-center justify-center mb-8 md:mb-16 shadow-[0_0_100px_rgba(0,163,255,0.2)] border-2 md:border-4 border-zinc-200 shrink-0">
                <Shield size={40} md-size={80} className="text-white -rotate-45" />
              </div>

              <h2 className="text-5xl md:text-[10rem] font-black uppercase tracking-tighter leading-none mb-4 md:mb-8 text-black">
                LUCID <span className="text-sky-400 italic">CITY</span>
              </h2>

              <p className="text-zinc-500 text-sm md:text-2xl font-bold uppercase tracking-[0.2em] md:tracking-[0.5em] max-w-2xl mb-8 md:mb-16 leading-relaxed md:leading-loose">
                The Premier Hardcore Roleplay Experience
              </p>

              <div className="flex flex-col sm:flex-row gap-4 md:gap-8 w-full sm:w-auto">
                <div className="px-8 md:px-20 py-4 md:py-8 bg-black text-white rounded-xl md:rounded-2xl font-black uppercase tracking-[0.2em] text-sm md:text-xl hover:bg-sky-500 transition-all transform md:hover:scale-110 cursor-pointer shadow-2xl">
                  Join Discord
                </div>
                <div className="px-8 md:px-20 py-4 md:py-8 bg-zinc-100 text-black rounded-xl md:rounded-2xl font-black uppercase tracking-[0.2em] text-sm md:text-xl border border-zinc-200 hover:border-sky-400 transition-all transform md:hover:scale-110 cursor-pointer shadow-2xl">
                  Server Rules
                </div>
              </div>

              <div className="mt-12 md:mt-24 pt-6 md:pt-12 border-t border-zinc-100 w-full max-w-4xl flex flex-col md:flex-row justify-between items-center text-zinc-400 font-bold uppercase tracking-widest text-[8px] md:text-xs gap-4">
                <div>© 2024 LUCID CITY NETWORKS. ALL RIGHTS RESERVED.</div>
                <div className="flex gap-4 md:gap-8">
                  <span className="hover:text-black cursor-pointer">Terms of Service</span>
                  <span className="hover:text-black cursor-pointer">Privacy Policy</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

      </div> {/* End of scrollable content container */}

      <style jsx global>{`
        @keyframes scanline {
          0% { bottom: 0; opacity: 0; }
          50% { opacity: 0.5; }
          100% { bottom: 100%; opacity: 0; }
        }
        .scanline {
          position: absolute;
          animation: scanline 2s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 163, 255, 1);
          border-radius: 10px;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div >
  );

}
