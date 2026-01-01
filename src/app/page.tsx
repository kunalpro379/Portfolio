"use client";

import { motion } from "framer-motion";
import { Home as HomeIcon, Instagram, Radio, Users, Trophy, MessageSquare, Shield, Zap, Crown, ChevronRight, Car, Briefcase, Sword, Folder, User, FolderKanban, Clock, Mail, BookOpen, Layers } from "lucide-react";
import { useEffect, useState } from "react";
import ImageSlider from "@/components/ImageSlider";
import TypewriterText from "@/components/TypewriterText";
import ProjectCard from "@/components/ProjectCard";
import ExperienceSection from "@/components/ExperienceSection";
import EducationSection from "@/components/EducationSection";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [cardProps, setCardProps] = useState<any[]>([]);
  const [bokehProps, setBokehProps] = useState<any[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const heroImages1 = ["/me.png"];
  const heroImages2 = ["/papa.png", "/kunal2.png", "/friends.png"];


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

    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages2.length);
    }, 4000);


    return () => clearInterval(imageInterval);
  }, []);

  const technologies = [
    // Languages
    { name: "C/C++", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg" },
    { name: "Java", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
    { name: "Python", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
    { name: "JavaScript", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
    { name: "SQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },

    // Technologies & Tools
    { name: "AWS", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg" },
    { name: "Kubernetes", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg" },
    { name: "Docker", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
    { name: "Kafka", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apachekafka/apachekafka-original.svg" },
    { name: "Spring Boot", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" },
    { name: "React", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
    { name: "Azure", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg" },
    { name: "GitHub Actions", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" },
    { name: "Linux", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg" },

    // Databases
    { name: "MySQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
    { name: "MongoDB", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
    { name: "GraphQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg" },
    { name: "Supabase", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg" },
    { name: "Redis", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg" },

    // AI/ML
    { name: "Machine Learning", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg" },
    { name: "Deep Learning", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg" },
    { name: "Generative AI", logo: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg" },
    { name: "AI Agents", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
    { name: "LLMs", logo: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg" },
    { name: "CrewAI", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
    { name: "LangGraph", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
    { name: "N8N", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
    { name: "Data Analysis", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg" }
  ];


  const duration = 20;

  const navItems = ["About", "Projects", "Experience", "TechStack", "Contact", "Blogs", "Work"];
  const mobileNavItems = [
    { name: "About", icon: User },
    { name: "Projects", icon: FolderKanban },
    { name: "Experience", icon: Briefcase },
    { name: "Contact", icon: Mail },
    { name: "Blogs", icon: BookOpen },
    { name: "Work", icon: Layers }
  ];

  const SectionHeader = ({ icon: Icon, title, subtitle, dark = false }: { icon: any; title: string; subtitle: string; dark?: boolean; }) => {
    return (
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
  };

  return (
    <div className="relative bg-[#050505] font-sans selection:bg-sky-500 selection:text-white text-white">
      {/* FIXED TAB BAR */}
      <div className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-[1000] w-auto max-w-[95%]">
        <div className="relative">
          {/* Glow Effect - Desktop Only */}
          <div className="hidden md:block absolute -inset-[2px] bg-gradient-to-r from-sky-500/20 via-purple-500/20 to-sky-500/20 rounded-full blur-xl z-[-1]" />

          {/* Main Navbar */}
          <div className="bg-black border-2 border-white/30 md:border-white/20 md:bg-black/90 md:backdrop-blur-2xl rounded-full px-3 md:px-6 py-2.5 md:py-3.5 flex items-center gap-2 md:gap-4 shadow-lg md:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            {/* Home Icon - Desktop Only */}
            <div className="hidden md:flex w-11 h-11 rounded-full bg-gradient-to-br from-sky-500 to-sky-600 items-center justify-center text-white hover:from-sky-400 hover:to-sky-500 transition-all cursor-pointer group shadow-lg hover:shadow-sky-500/50 hover:scale-110 active:scale-95">
              <HomeIcon size={18} className="group-hover:scale-110 transition-transform" />
            </div>

            {/* Divider - Desktop Only */}
            <div className="hidden md:block w-[1px] h-6 bg-white/10" />

            {/* Nav Items - Mobile */}
            <div className="flex md:hidden gap-1.5 items-center">
              {mobileNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-center p-2.5 rounded-lg text-white/80 cursor-pointer hover:text-white hover:bg-white/10 transition-all active:scale-95"
                  >
                    <Icon size={20} className="relative z-10" />
                  </div>
                );
              })}
            </div>

            {/* Nav Items - Desktop */}
            <div className="hidden md:flex gap-2 overflow-x-auto no-scrollbar">
              {navItems.map((item) => (
                <div
                  key={item}
                  className="relative px-5 py-2 rounded-full text-white/70 font-bold text-sm cursor-pointer hover:text-white transition-all hover:scale-105 active:scale-95 whitespace-nowrap group"
                >
                  {/* Hover Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-500/0 via-sky-500/10 to-sky-500/0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 border border-white/0 group-hover:border-white/20 rounded-full transition-all" />

                  {/* Text */}
                  <span className="relative z-10">{item}</span>

                  {/* Active Indicator Dot */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-sky-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1 - HERO */}
      <section className="relative min-h-screen p-2 md:p-3">

        {/* Fixed Background Elements */}
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

        {/* Refined Grid Overlay */}
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

        {/* SCROLLABLE CONTENT */}
        <div className="relative z-[5]">
          <div className="flex flex-col">
            {/* First Screen - Hero Content */}
            <div className="min-h-[75vh] flex flex-col lg:flex-row items-center justify-between px-6 md:px-24 max-w-7xl mx-auto w-full gap-10 pt-20 pb-0">
              {/* Image Second on Mobile, Second on Desktop */}
              <div className="relative w-full lg:w-[45%] aspect-square select-none order-2 lg:order-2">
                <div className="relative w-full h-full max-w-[500px] mx-auto">
                  <div className="absolute inset-0 bg-sky-500/10 rounded-[2rem] md:rounded-[4rem] rotate-6 scale-95" />
                  <div className="absolute inset-0 bg-white/5 rounded-[2rem] md:rounded-[4rem] -rotate-3 border border-white/10 backdrop-blur-sm" />
                  <div className="absolute inset-0 rounded-[2rem] md:rounded-[4rem] overflow-hidden border border-white/20 bg-gradient-to-br from-white/10 to-transparent">
                    <motion.img
                      initial={{ opacity: 0, x: 100, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{
                        duration: 1,
                        ease: "easeInOut"
                      }}
                      src="/me.png"
                      alt="Hero Character"
                      className="absolute top-1/2 left-1/2 
             -translate-x-1/2 -translate-y-1/2 
             w-[100%] h-[100%] 
             md:w-[80%] md:h-[80%] 
             object-contain md:object-cover 
             grayscale rounded-2xl"
                      style={{ imageRendering: "high-quality" }}
                    />

                  </div>

                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-3 -right-3 md:-top-6 md:-right-6 px-3 md:px-6 py-1.5 md:py-3 bg-black border border-white/10 rounded-xl md:rounded-2xl shadow-2xl"
                  >
                    <div className="text-[8px] md:text-xs font-black text-sky-400 whitespace-nowrap">AI Engineer</div>
                  </motion.div>


                </div>
              </div>

              {/* Text Content - First on Mobile, First on Desktop */}
              <div className="flex flex-col items-start justify-center lg:w-3/5 order-1 lg:order-1">
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
                <h1 className="text-6xl md:text-[10rem] font-black tracking-tighter leading-[0.8] mb-6 md:mb-8 select-none text-left">
                  KUNAL<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">PATIL</span>
                </h1>
                <p className="max-w-xl text-white/40 font-medium text-sm md:text-lg tracking-wide uppercase text-left">
                  I build scalable backends, automate the cloud, and bring AI ideas to life.
                </p>

                <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-4 md:gap-6 w-full sm:w-auto">
                  {/* <div className="px-8 md:px-10 py-4 md:py-5 bg-sky-500 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all cursor-pointer shadow-[0_20px_50px_rgba(0,163,255,0.4)] text-center text-xs md:text-base">
                    Explore Work
                  </div> */}
                  <div className="inline-flex items-center gap-4 px-6 md:px-8 py-3 md:py-4 bg-white text-black rounded-full font-black uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all cursor-pointer group text-xs md:text-base">
                    See my work <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="px-8 md:px-10 py-4 md:py-5 border border-white/10 bg-white/5 backdrop-blur-md text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all cursor-pointer text-center text-xs md:text-base">
                    Contact Me
                  </div>
                </div>
              </div>
            </div>

            {/* Second Screen - About Content */}
            <div className="pt-0 pb-10 flex flex-col lg:flex-row items-center px-6 md:px-24 max-w-7xl mx-auto w-full gap-10">
              {/* Image First on Desktop, Second on Mobile */}
              <div className="relative w-full lg:w-[45%] aspect-square select-none order-2 lg:order-1">
                <div className="relative w-full h-full max-w-[500px] mx-auto">
                  <div className="absolute inset-0 bg-sky-500/10 rounded-[2rem] md:rounded-[4rem] rotate-6 scale-95" />
                  <div className="absolute inset-0 bg-white/5 rounded-[2rem] md:rounded-[4rem] -rotate-3 border border-white/10 backdrop-blur-sm" />
                  <div className="absolute inset-0 rounded-[2rem] md:rounded-[4rem] overflow-hidden border border-white/20 bg-gradient-to-br from-white/10 to-transparent">
                    {heroImages2.map((img, index) => (
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
                  {/* <motion.div
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
                  </motion.div> */}
                </div>
              </div>
              {/* Text Content - First on Mobile, Second on Desktop */}
              <div className="space-y-6 md:space-y-10 w-full lg:w-1/2 order-1 lg:order-2">
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center gap-4">
                    {/* <div className="h-[1px] w-12 bg-sky-500" /> */}
                    <span className="text-sky-500 font-black uppercase tracking-[0.3em] text-[10px] md:text-xs"></span>
                  </div>
                  <h2 className="text-4xl md:text-8xl font-black uppercase tracking-tighter leading-none">
                    ENGINEERING<br />
                    <span className="text-transparent" style={{ WebkitTextStroke: '1.5px white' }}>Vault VI</span>
                  </h2>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <p className="text-lg md:text-2xl text-white/60 font-medium leading-relaxed">
                    I'm someone who enjoys going deep into problems, understanding how things really work, and finishing what I start.
                  </p>
                  <div className="flex flex-wrap gap-6 md:gap-10">
                    <div>
                      <div className="text-2xl md:text-4xl font-black mb-1">02+</div>
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
                  {/* <div className="inline-flex items-center gap-4 px-6 md:px-8 py-3 md:py-4 bg-white text-black rounded-full font-black uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all cursor-pointer group text-xs md:text-base">
                    See my work <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </div> */}

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STATIC TECH STACK - RANDOMLY POSITIONED */}
        <div className="absolute inset-0 z-[10] pointer-events-none overflow-hidden">
          {technologies.map((tech, i) => {
            const positions = [
              { top: '5%', left: '8%', rotate: '-12deg' },
              { top: '15%', left: '75%', rotate: '8deg' },
              { top: '25%', left: '15%', rotate: '15deg' },
              { top: '12%', left: '45%', rotate: '-8deg' },
              { top: '35%', left: '82%', rotate: '12deg' },
              { top: '45%', left: '10%', rotate: '-15deg' },
              { top: '35%', left: '92%', rotate: '12deg' },
              { top: '48%', left: '35%', rotate: '-10deg' },
              { top: '65%', left: '88%', rotate: '18deg' },
              { top: '70%', left: '20%', rotate: '-18deg' },
              { top: '75%', left: '50%', rotate: '5deg' },
              { top: '82%', left: '78%', rotate: '-12deg' },
              { top: '88%', left: '12%', rotate: '14deg' },
              { top: '85%', left: '42%', rotate: '-6deg' },
              { top: '20%', left: '92%', rotate: '20deg' },
              { top: '40%', left: '55%', rotate: '-14deg' },
              { top: '60%', left: '5%', rotate: '16deg' },
              { top: '30%', left: '28%', rotate: '8deg' },
              { top: '52%', left: '85%', rotate: '-10deg' },
              { top: '78%', left: '65%', rotate: '12deg' },
              { top: '8%', left: '60%', rotate: '10deg' },
              { top: '18%', left: '22%', rotate: '-16deg' },
              { top: '42%', left: '68%', rotate: '14deg' },
              { top: '55%', left: '18%', rotate: '-8deg' },
              { top: '62%', left: '45%', rotate: '12deg' },
              { top: '72%', left: '72%', rotate: '-14deg' },
              { top: '90%', left: '55%', rotate: '8deg' },
              { top: '28%', left: '62%', rotate: '-12deg' },
              { top: '50%', left: '92%', rotate: '16deg' }
            ];
            const pos = positions[i];
            return (
              <div
                key={i}
                className="absolute w-14 h-14 md:w-20 md:h-20 backdrop-blur-[2px] bg-white/5 border border-white/10 rounded-lg md:rounded-xl flex flex-col items-center justify-center shadow-2xl p-1.5 md:p-2"
                style={{
                  top: pos.top,
                  left: pos.left,
                  transform: `rotate(${pos.rotate})`
                }}
              >
                <img
                  src={tech.logo}
                  alt={tech.name}
                  className="w-5 h-5 md:w-7 md:h-7 mb-0.5 md:mb-1 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                />
                <span className="text-[5px] md:text-[7px] font-black uppercase tracking-tighter text-white/60 text-center">
                  {tech.name}
                </span>
              </div>
            );
          })}
        </div>

      </section>

      {/* SCROLLABLE CONTENT CONTAINER */}
      <div className="relative z-10">


        {/* SECTION 3 - MY JOURNEY */}
        <section className="flex items-center justify-center p-2 md:p-3 bg-[#0a0a0a]">
          <div className="relative w-full rounded-2xl md:rounded-3xl bg-[#0a0a0a] border border-white/5 shadow-2xl overflow-hidden">

            {/* Video Background */}
            <div className="absolute inset-0 z-0">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                style={{ objectFit: 'cover' }}
              >
                <source src="/GTAV.mp4" type="video/mp4" />
              </video>
              {/* Blur and transparency overlay */}
              <div className="absolute inset-0 backdrop-blur-sm bg-black/60" />
            </div>

            {/* Warm gradient overlay */}
            <div className="absolute inset-0 z-[1]">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.08)_0%,transparent_70%)]" />
            </div>

            {/* BUILDING THE FUTURE CONTENT */}
            <div className="relative z-4 flex flex-col min-h-[60vh] max-w-7xl mx-auto justify-center px-4 md:px-8 py-8 md:py-12">

              {/* Typewriter Text Card */}
              <div className="relative w-full space-y-4 md:space-y-12">
                <TypewriterText
                  text="I'm a backend-focused engineer who enjoys building systems that are reliable, scalable, and ready for real users. I spend most of my time designing APIs, real-time systems, and cloud-native backends using Node.js and AWS."
                  delay={500}
                  speed={40}
                  className="text-white/80 text-base md:text-4xl leading-relaxed text-left"
                />
                <TypewriterText
                  text="I care deeply about performance, clean architecture, and fault tolerance — not just making things work, but making them last. Alongside backend and DevOps, I work extensively with AI systems, including LLMs, generative models, and image generation workflows integrated into real applications."
                  delay={4000}
                  speed={40}
                  className="text-white/80 text-base md:text-4xl leading-relaxed text-left"
                />
                <TypewriterText
                  text="My focus is on making AI production-ready, not experimental. Currently, I'm exploring how generative AI, agents, and real-time infrastructure can come together to build practical, scalable, and high-impact systems."
                  delay={8500}
                  speed={40}
                  className="text-white/80 text-base md:text-4xl leading-relaxed text-left"
                />
              </div>


              {/* Background Effects */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,163,255,0.05)_0%,transparent_70%)]" />
              <div className="absolute inset-0 opacity-[0.02]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
              }} />

              <div className="relative z-10 px-6 md:px-12 py-12 md:py-16 max-w-7xl mx-auto">

                {/* Header */}
                <div className="text-center mb-12 md:mb-16">


                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-4"
                  >
                    Skills
                  </motion.h2>


                </div>

                {/* Skills Grid - 4 Parts */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-0">

                  {/* Part 1 - Languages */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="space-y-4 md:pr-8 md:border-r md:border-dotted md:border-white/40"
                  >
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-6">LANGUAGES</h3>
                    <p className="text-white/80 leading-relaxed font-['Caveat'] text-xl md:text-2xl">
                      C/C++, Java, Python, JavaScript, SQL
                    </p>
                  </motion.div>

                  {/* Part 2 - Technologies & Tools */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="space-y-4 md:px-8 md:border-r md:border-dotted md:border-white/40"
                  >
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-6">TECHNOLOGIES & TOOLS</h3>
                    <p className="text-white/80 leading-relaxed font-['Caveat'] text-xl md:text-2xl">
                      AWS, Kubernetes, Docker, Kafka, Spring Boot, React.JS, Azure, GitHub Actions, Linux
                    </p>
                  </motion.div>

                  {/* Part 3 - Databases */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="space-y-4 md:px-8 md:border-r md:border-dotted md:border-white/40"
                  >
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-6">DATABASES</h3>
                    <p className="text-white/80 leading-relaxed font-['Caveat'] text-xl md:text-2xl">
                      MySQL, MongoDB, GraphQL, Supabase, Redis
                    </p>
                  </motion.div>

                  {/* Part 4 - AI/ML */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="space-y-4 md:pl-8"
                  >
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-6">AI/ML</h3>
                    <p className="text-white/80 leading-relaxed font-['Caveat'] text-xl md:text-2xl">
                      Machine Learning, Data Analysis, Deep Learning, Generative AI, AI Agents
                    </p>
                  </motion.div>

                </div>

              </div>
            </div>


          </div>

        </section>


        {/* SECTION 5 - EXPERIENCE */}
        <ExperienceSection />

        {/* SECTION 6 - EDUCATION */}
        <EducationSection />

        {/* SECTION 7 - SERVER STATS */}
        {/* <section className="relative min-h-screen flex items-center justify-center p-2 md:p-3">
          <div
            className="relative w-full rounded-2xl md:rounded-3xl bg-gradient-to-br from-zinc-900 via-black to-zinc-900 border border-zinc-800 shadow-2xl p-6 md:p-12">

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
          </div>
        </section> */}

        {/* Projects */}
        <section className="relative bg-[#fefce8] py-12 md:py-20">
          <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,163,255,0.05)_0%,transparent_60%)]" />
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
            <SectionHeader icon={FolderKanban} title="FEATURED PROJECTS" subtitle="PREMIUM WORK COLLECTION" dark={true} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 items-start">
              <ProjectCard
                size="big"
                title="SanskritGPT"
                tagline="Building a Sanskrit Language Model from scratch using Diffusion + Transformers"
                badges={["Diffusion LLM", "Transformer Denoiser", "Low-Resource NLP", "Research Project"]}
                footer="From-scratch generative model · Oct 2024"
                description="A masked diffusion-based language model designed specifically for Sanskrit text generation, focusing on semantic denoising rather than next-token prediction."
                highlights={["Masked Diffusion Training", "Token-Level Transformer Denoiser", "Sanskrit WordNet–tagged corpus", "Iterative Unmasking Generation"]}
                techStack="Python · PyTorch · Transformers · Diffusion Models · NLP"
                cta={[
                  { label: "GitHub Repo", link: "https://github.com", icon: "github" },
                  { label: "Read Research", link: "#", icon: "external" }
                ]}
                image="/LLMThumbnail.webp"
              />

              <div className="flex flex-col gap-4 md:gap-8">
                <ProjectCard
                  size="small"
                  title="FINAgent"
                  tagline="Agentic Financial Research & Trading System"
                  badges={["LangGraph", "Multi-Agent AI", "Time Series"]}
                  footer="AI agents · Dec 2024"
                  description="A modular AI-driven financial analyst system that combines market data, agents, memory, and orchestration graphs."
                  highlights={["Market & Sentiment Agents", "Risk & Strategy Managers", "Zerodha MCP integration", "Graph-based workflows"]}
                  techStack="LSTM · ARIMA · Technical Indicators"
                  cta={[
                    { label: "GitHub Repo", link: "https://github.com", icon: "github" },
                    { label: "Workflow Diagram", link: "#", icon: "external" }
                  ]}
                  image="https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&q=80"
                />

                <ProjectCard
                  size="small"
                  title="Nexus AI"
                  tagline="Autonomous Agent Swarm for Enterprise Workflow"
                  badges={["AutoGPT", "Multi-Agent", "LangChain"]}
                  footer="DevOps Automation · Feb 2025"
                  description="A distributed swarm of AI agents that monitor system health, suggest optimizations, and autonomously deploy patches to infrastructure."
                  highlights={["Self-Healing Infrastructure", "Autonomous Log Analysis", "Multi-Cloud Orchestration", "Predictive Scaling"]}
                  techStack="Python · Go · Kubernetes · OpenAI · Terraform"
                  cta={[
                    { label: "GitHub Repo", link: "https://github.com", icon: "github" },
                    { label: "Case Study", link: "#", icon: "external" }
                  ]}
                  image="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80"
                />
              </div>

              <ProjectCard
                size="big"
                title="Video Pipeline"
                tagline="DRM-Protected Adaptive Bitrate Streaming"
                badges={["AWS", "FFMPEG", "HLS", "DRM"]}
                footer="Scalable media backend · Jan 2025"
                description="An automated video pipeline that downloads raw videos, transcodes them into multiple resolutions, encrypts segments, and delivers them via HLS."
                highlights={["Adaptive Bitrate (360p-1080p)", "DRM Encryption", "AWS S3 + SQS Pipeline", "Dockerized FFMPEG workers"]}
                techStack="Node.js · Docker · AWS · FFMPEG · HLS · C++"
                cta={[
                  { label: "GitHub (Pipeline)", link: "https://github.com", icon: "github" },
                  { label: "Architecture", link: "#", icon: "external" }
                ]}
                image="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80"
              />
            </div>
          </div>
        </section>

        {/* PROJECTS */}
        <section className="relative bg-gradient-to-br from-zinc-50 via-white to-zinc-100 py-12 md:py-20">
          <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,163,255,0.05)_0%,transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,163,255,0.05)_0%,transparent_60%)]" />
          <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
            <SectionHeader icon={Trophy} title="Projects" subtitle="Record of Excellence" dark={true} />

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 flex-1">
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
        </section>

        {/* SECTION 7 - LATEST NEWS */}
        <section className="relative bg-gradient-to-br from-white via-blue-50 to-sky-50 py-12 md:py-20">
          <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,163,255,0.05)_0%,transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,163,255,0.05)_0%,transparent_60%)]" />
          <div className="max-w-7xl mx-auto px-6 md:px-12 h-full flex flex-col relative z-10">
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
        </section>
        {/*  Projects */}
        <section className="relative bg-gradient-to-br from-sky-50 via-white to-blue-50 py-12 md:py-20">
          <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,163,255,0.05)_0%,transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,163,255,0.05)_0%,transparent_60%)]" />
          <div className="max-w-7xl mx-auto px-6 md:px-12 h-full flex flex-col relative z-10">
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
        </section>





        {/* SECTION 11 - CAREER PATHS (NEW) */}
        <section className="relative bg-gradient-to-br from-zinc-900 via-black to-zinc-900 py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-6 md:px-12 h-full flex flex-col">
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
        </section>



        <section className="relative bg-gradient-to-br from-sky-50 via-white to-blue-50 py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-6 md:px-12">

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
          </div>

        </section>

      </div>

    </div>
  );
}
