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

      {/* SCROLLABLE CONTENT CONTAINER */}
      <div className="relative z-10">

        {/* SECTION 1 - HERO */}
        <motion.section
          style={{ opacity: section1Opacity, scale: section1Scale, filter: section1Blur }}
          className="min-h-screen flex flex-col items-center justify-center text-center p-6 md:p-20 relative overflow-hidden"
        >
          {/* Animated Background Bokeh */}
          <div className="absolute inset-0 z-0">
            {bokehProps.map((prop, i) => (
              <motion.div
                key={i}
                initial={{ top: prop.top, left: prop.left, opacity: 0 }}
                animate={{
                  opacity: [0.1, 0.3, 0.1],
                  scale: [1, 1.2, 1],
                  x: [0, 50, 0],
                  y: [0, 30, 0]
                }}
                transition={{
                  duration: prop.duration,
                  repeat: Infinity,
                  delay: prop.delay,
                  ease: "linear"
                }}
                className="absolute w-64 h-64 bg-sky-500/10 rounded-full blur-[80px]"
              />
            ))}
          </div>

          <div className="relative z-10 space-y-8 md:space-y-12">
            <div className="relative inline-block">
              <div className="absolute -inset-4 bg-sky-500/20 blur-2xl rounded-full" />
              <img
                src={heroImages[currentImageIndex]}
                alt="Kunal"
                className="relative w-40 h-40 md:w-64 md:h-64 object-cover rounded-full border-4 border-white/10 shadow-2xl transition-all duration-1000 grayscale hover:grayscale-0"
              />
            </div>

            <div className="space-y-4 md:space-y-6">
              <h1 className="text-6xl md:text-[12rem] font-black uppercase tracking-tighter leading-none text-white">
                KUNAL<br />
                <span className="text-transparent" style={{ WebkitTextStroke: '2px white' }}>CHAUHAN</span>
              </h1>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-sky-400 font-black tracking-[0.5em] text-xs md:text-xl uppercase">
                <span>Developer</span>
                <div className="hidden md:block w-2 h-2 bg-sky-500 rounded-full" />
                <span>Designer</span>
                <div className="hidden md:block w-2 h-2 bg-sky-500 rounded-full" />
                <span>AI Specialist</span>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
              <span className="text-white/20 font-black uppercase tracking-[0.3em] text-[10px]">Scroll to Explore</span>
              <div className="w-[1px] h-12 bg-gradient-to-b from-sky-500 to-transparent" />
            </motion.div>
          </div>
        </motion.section>

        {/* SECTION 2 - BEYOND THE CODE */}
        <motion.section
          style={{ opacity: section2Opacity, scale: section2Scale }}
          className="min-h-screen flex flex-col lg:grid lg:grid-cols-2 items-center gap-10 md:gap-20 p-6 md:p-20"
        >
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

          <div className="relative aspect-square w-full max-w-[500px] lg:max-w-none order-1 lg:order-2">
            <div className="absolute inset-0 bg-sky-500/10 blur-3xl rounded-full scale-75" />
            <ImageSlider />
          </div>
        </motion.section>

        {/* SECTION 3 - MY JOURNEY */}
        <motion.section
          style={{ opacity: section3Opacity, x: section3Translate }}
          className="min-h-screen flex items-center justify-center p-6 md:p-20"
        >
          <div className="relative z-10 flex flex-col lg:grid lg:grid-cols-2 items-center gap-10 md:gap-20 max-w-7xl mx-auto">
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
        </motion.section>

        {/* SECTION 4 - SERVER STATS */}
        <motion.section
          style={{ opacity: section4Opacity }}
          className="min-h-screen flex items-center justify-center p-6 md:p-20"
        >
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 md:gap-12 w-full max-w-7xl">
            <div className="lg:col-span-5 space-y-6 md:space-y-8">
              <SectionHeader icon={Users} title="COMMUNITY" subtitle="Growing Fast" />
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {[
                  { label: "Active Users", value: "85k+", icon: Users },
                  { label: "Total Projects", value: "120+", icon: Folder },
                  { label: "Awards", value: "15", icon: Trophy },
                  { label: "Messages", value: "1.2M", icon: MessageSquare }
                ].
                  map((stat, i) => <div key={i} className="bg-white/5 border border-white/10 p-4 md:p-8 rounded-xl md:rounded-2xl hover:bg-white/10 transition-all cursor-crosshair group">
                    <stat.icon size={20} className="text-sky-400 mb-2 md:mb-4 group-hover:scale-110 transition-transform" />
                    <div className="text-2xl md:text-4xl font-black mb-1 text-white">{stat.value}</div>
                    <div className="text-white/40 font-bold text-[8px] md:text-[10px] uppercase tracking-widest">{stat.label}</div>
                  </div>
                  )}
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="relative h-full min-h-[300px] md:min-h-0 bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden group">
                <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80" className="w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute bottom-6 md:bottom-12 left-6 md:left-12 right-6 md:right-12">
                  <h3 className="text-3xl md:text-6xl font-black uppercase tracking-tighter mb-2 md:mb-4 text-white leading-none">SYSTEM <span className="text-sky-400">ARCHITECTURE</span></h3>
                  <p className="text-white/70 text-sm md:text-xl font-medium max-w-xl">Deep dive into the high-performance systems and AI architectures that power modern web apps.</p>
                  <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 md:gap-4">
                    <div className="px-6 md:px-10 py-3 md:py-5 bg-sky-500 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all cursor-pointer text-center text-xs">Architecture</div>
                    <div className="px-6 md:px-10 py-3 md:py-5 bg-white/10 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest hover:bg-white/20 transition-all cursor-pointer text-center text-xs">Documentation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* SECTION 5 - MEMBERSHIP TIERS */}
        <motion.section
          style={{ opacity: section5Opacity }}
          className="min-h-screen flex flex-col items-center justify-center p-6 md:p-20"
        >
          <div className="max-w-7xl mx-auto w-full">
            <SectionHeader icon={Crown} title="MEMBERSHIP TIERS" subtitle="Unlock Premium Features" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[
                { name: "DIAMOND", price: "$49.99", icon: Zap, color: "text-sky-400", bg: "bg-sky-400/5", border: "border-sky-400/20", features: ["Priority Queue (Instant)", "Custom Character Slots", "Exclusive High-End Cars", "Admin Support Access"] },
                { name: "PLATINUM", price: "$29.99", icon: Shield, color: "text-zinc-400", bg: "bg-white/5", border: "border-white/10", features: ["Priority Queue (Fast)", "Extra Inventory Slots", "Custom License Plate", "Premium Discord Role"] },
                { name: "GOLD", price: "$14.99", icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/5", border: "border-yellow-500/20", features: ["Faster Connection", "Starter Pack ($50k)", "Monthly Mystery Box", "Gold Badge in Chat"] }
              ].
                map((tier, i) => <div key={i} className={`relative p-6 md:p-8 rounded-2xl md:rounded-3xl border ${tier.border} ${tier.bg} flex flex-col items-center text-center group transition-all duration-500 hover:scale-[1.02] md:hover:scale-105 shadow-xl overflow-hidden h-fit`}>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                  <tier.icon className={`${tier.color} mb-4 md:mb-8`} size={48} />
                  <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-2 md:mb-4 text-white">{tier.name}</h3>
                  <div className="text-xl md:text-3xl font-bold mb-6 md:mb-10 opacity-70 italic text-white">{tier.price}<span className="text-xs md:text-sm uppercase not-italic">/mo</span></div>
                  <ul className="space-y-2 md:space-y-4 mb-8 md:mb-12 flex-1">
                    {tier.features.map((f, j) => <li key={j} className="text-white/40 font-bold uppercase text-[8px] md:text-xs tracking-widest">{f}</li>
                    )}
                  </ul>
                  <div className={`w-full py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-widest cursor-pointer transition-all text-xs md:text-sm ${i === 0 ? 'bg-sky-500 text-white shadow-[0_15px_30px_rgba(0,163,255,0.4)]' : 'bg-white/10 text-white hover:bg-sky-400'}`}>
                    Select Plan
                  </div>
                </div>
                )}
            </div>
          </div>
        </motion.section>

        {/* SECTION 6 - GALLERY / RECENT EVENTS */}
        <motion.section
          style={{ opacity: section6Opacity }}
          className="min-h-screen flex flex-col items-center justify-center p-6 md:p-20"
        >
          <div className="max-w-7xl mx-auto w-full">
            <SectionHeader icon={Trophy} title="CITY ARCHIVE" subtitle="Record of Excellence" />

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
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
                map((src, i) => <div key={i} className="relative rounded-xl md:rounded-2xl overflow-hidden border border-white/10 group cursor-pointer aspect-square bg-white/5">
                  <img src={`${src}?auto=format&fit=crop&q=80`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-sky-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="px-3 md:px-4 py-1.5 md:py-2 bg-black text-white font-black uppercase text-[8px] md:text-xs rounded-full tracking-widest">View</div>
                  </div>
                </div>
                )}
            </div>
          </div>
        </motion.section>

        {/* SECTION 7 - LATEST NEWS */}
        <motion.section
          style={{ opacity: section7Opacity }}
          className="min-h-screen flex flex-col items-center justify-center p-6 md:p-20"
        >
          <div className="max-w-7xl mx-auto w-full">
            <SectionHeader icon={Radio} title="LATEST NEWS" subtitle="City Updates" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[
                { date: "Oct 24", title: "New Diamond Casino Heist", desc: "Experience the most complex heist in city history.", img: "https://images.unsplash.com/photo-1593305841991-05c297ba4575" },
                { date: "Oct 22", title: "Updated Police Fleet", desc: "LSPD receives high-speed interceptors and new gear.", img: "https://images.unsplash.com/photo-1563200020-03a088373307" },
                { date: "Oct 20", title: "Autumn Season Pass", desc: "Exclusive rewards, new outfits, and seasonal events.", img: "https://images.unsplash.com/photo-1518770660439-4636190af475" }
              ].
                map((news, i) => <div key={i} className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-sky-400 transition-all h-fit">
                  <div className="h-48 md:h-64 overflow-hidden">
                    <img src={`${news.img}?auto=format&fit=crop&q=80`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" />
                  </div>
                  <div className="p-6 md:p-10">
                    <div className="text-sky-400 font-bold text-[10px] md:text-xs uppercase tracking-widest mb-2 md:mb-4">{news.date}</div>
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-2 md:mb-4 text-white leading-none">{news.title}</h3>
                    <p className="text-white/50 font-medium text-sm md:text-base mb-6 md:mb-8">{news.desc}</p>
                    <div className="text-white font-black uppercase tracking-widest text-[10px] md:text-sm flex items-center gap-2 group-hover:gap-4 transition-all cursor-pointer">
                      Read More <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
                )}
            </div>
          </div>
        </motion.section>

        {/* SECTION 8 - HOW TO JOIN */}
        <motion.section
          style={{ opacity: section8Opacity }}
          className="min-h-screen flex flex-col items-center justify-center p-6 md:p-20"
        >
          <div className="max-w-7xl mx-auto w-full">
            <SectionHeader icon={Zap} title="HOW TO JOIN" subtitle="Start Your Story" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {[
                { step: "01", title: "Discord", desc: "Join our vibrant community and get verified." },
                { step: "02", title: "Direct Link", desc: "Connect using our high-speed direct entry line." },
                { step: "03", title: "Character", desc: "Create your unique persona with custom tools." },
                { step: "04", title: "Play", desc: "Dive into the most immersive RP experience." }
              ].
                map((step, i) => <div key={i} className="relative p-8 md:p-12 bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl flex flex-col justify-between group hover:bg-white/10 transition-all h-fit min-h-[200px] md:min-h-[280px]">
                  <div className="text-4xl md:text-6xl font-black text-white/5 italic group-hover:text-sky-400/20 transition-colors leading-none">{step.step}</div>
                  <div className="mt-4">
                    <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-2 md:mb-4 text-white leading-none">{step.title}</h3>
                    <p className="text-white/40 font-bold uppercase text-[8px] md:text-[10px] tracking-[0.2em]">{step.desc}</p>
                  </div>
                  <div className="mt-6 md:mt-8 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-colors">
                    <ChevronRight size={20} />
                  </div>
                </div>
                )}
            </div>
          </div>
        </motion.section>

        {/* SECTION 9 - MEDIA PARTNERS */}
        <motion.section
          style={{ opacity: section9Opacity }}
          className="min-h-screen flex flex-col items-center justify-center p-6 md:p-20"
        >
          <div className="max-w-7xl mx-auto w-full">
            <SectionHeader icon={Users} title="OFFICIAL PARTNERS" subtitle="Powering The Future" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-12 items-center">
              {[
                { src: "/next.svg", name: "Next.js" },
                { src: "/vercel.svg", name: "Vercel" },
                { src: "/file.svg", name: "Partner 3" },
                { src: "/globe.svg", name: "Partner 4" },
                { src: "/window.svg", name: "Partner 5" }
              ].map((partner, index) => <div key={index} className="grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer flex justify-center items-center p-4">
                <img src={partner.src} alt={partner.name} className="h-8 md:h-12 w-auto object-contain invert" />
              </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* SECTION 10 - LUXURY GARAGE */}
        <motion.section
          style={{ opacity: section10Opacity }}
          className="min-h-screen flex flex-col items-center justify-center p-6 md:p-20"
        >
          <div className="max-w-7xl mx-auto w-full">
            <SectionHeader icon={Car} title="LUXURY GARAGE" subtitle="Premium Vehicle Collection" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
              <div className="relative group overflow-hidden rounded-2xl md:rounded-3xl border border-white/10 aspect-video md:aspect-auto bg-white/5">
                <img src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60 group-hover:opacity-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10">
                  <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-white">Diamond Series</h3>
                  <p className="text-sky-400 font-bold text-[8px] md:text-xs uppercase tracking-widest mt-1 md:mt-2">Exclusive Import</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2 gap-4 md:gap-8">
                <div className="relative group overflow-hidden rounded-2xl md:rounded-3xl border border-white/10 aspect-video bg-white/5">
                  <img src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60 group-hover:opacity-100" />
                  <div className="absolute bottom-6 md:bottom-8 left-6 md:left-8">
                    <h3 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-white">Carbon Custom</h3>
                  </div>
                </div>
                <div className="relative group overflow-hidden rounded-2xl md:rounded-3xl border border-white/10 aspect-video bg-white/5">
                  <img src="https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&q=80" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60 group-hover:opacity-100" />
                  <div className="absolute bottom-6 md:bottom-8 left-6 md:left-8">
                    <h3 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-white">Urban Legend</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* SECTION 11 - CAREER PATHS */}
        <motion.section
          style={{ opacity: section11Opacity }}
          className="min-h-screen flex flex-col items-center justify-center p-6 md:p-20"
        >
          <div className="max-w-7xl mx-auto w-full">
            <SectionHeader icon={Briefcase} title="CAREER PATHS" subtitle="Choose Your Destiny" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {[
                { title: "LSPD", role: "Enforce Justice", img: "https://images.unsplash.com/photo-1579822396902-50341071018e" },
                { title: "EMS", role: "Save Lives", img: "https://images.unsplash.com/photo-1583946099379-f9c9cb8bc030" },
                { title: "MECHANIC", role: "Performance Pros", img: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3" },
                { title: "ENTREPRENEUR", role: "Build Empire", img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab" }
              ].
                map((job, i) => <div key={i} className="relative rounded-xl md:rounded-2xl overflow-hidden border-2 border-white/10 group hover:border-sky-400 transition-all cursor-pointer aspect-square md:aspect-auto bg-white/5">
                  <img src={`${job.img}?auto=format&fit=crop&q=80`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 opacity-40 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 md:p-6">
                    <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-1 md:mb-2 scale-90 group-hover:scale-100 transition-transform text-white leading-none">{job.title}</h3>
                    <p className="text-sky-400 font-bold text-[8px] md:text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">{job.role}</p>
                  </div>
                </div>
                )}
            </div>
          </div>
        </motion.section>

        {/* SECTION 12 - FACTION WARFARE */}
        <motion.section
          style={{ opacity: section12Opacity }}
          className="min-h-screen flex flex-col items-center justify-center p-6 md:p-20"
        >
          <div className="max-w-7xl mx-auto w-full">
            <SectionHeader icon={Sword} title="FACTION WARFARE" subtitle="Territory & Influence" />
            <div className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 group min-h-[400px] bg-white/5">
              <img src="https://images.unsplash.com/photo-1542224566-6e85f2e6772f?auto=format&fit=crop&q=80" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-40 group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-16 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div className="max-w-2xl">
                  <h3 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-3 md:mb-6 leading-none text-white">DOMINATE THE <span className="text-sky-400">STREETS</span></h3>
                  <p className="text-white/70 text-sm md:text-xl font-medium">Join established families or start your own creed. Control distribution, manage turf, and rise as the ultimate power in Lucid City.</p>
                </div>
                <div className="w-full lg:w-auto px-8 md:px-16 py-4 md:py-8 bg-sky-500 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest hover:scale-110 transition-all cursor-pointer shadow-[0_20px_60px_rgba(0,163,255,0.4)] text-center text-xs md:text-base">
                  Claim Turf
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* SECTION 13 - LUCID CITY */}
        <motion.section
          style={{ opacity: section13Opacity }}
          className="min-h-screen flex flex-col items-center justify-center p-6 md:p-20"
        >
          <div className="relative z-10 w-full max-w-7xl flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 md:w-40 md:h-40 bg-sky-500 rounded-2xl md:rounded-3xl rotate-45 flex items-center justify-center mb-8 md:mb-16 shadow-[0_0_100px_rgba(0,163,255,0.2)] border-2 md:border-4 border-white/10 shrink-0">
              <Shield size={40} className="text-white -rotate-45" />
            </div>

            <h2 className="text-5xl md:text-[10rem] font-black uppercase tracking-tighter leading-none mb-4 md:mb-8 text-white">
              LUCID <span className="text-sky-400 italic">CITY</span>
            </h2>

            <p className="text-white/40 text-sm md:text-2xl font-bold uppercase tracking-[0.2em] md:tracking-[0.5em] max-w-2xl mb-8 md:mb-16 leading-relaxed md:leading-loose">
              The Premier Hardcore Roleplay Experience
            </p>

            <div className="flex flex-col sm:flex-row gap-4 md:gap-8 w-full sm:w-auto">
              <div className="px-8 md:px-20 py-4 md:py-8 bg-white text-black rounded-xl md:rounded-2xl font-black uppercase tracking-[0.2em] text-sm md:text-xl hover:bg-sky-500 hover:text-white transition-all transform md:hover:scale-110 cursor-pointer shadow-2xl">
                Join Discord
              </div>
              <div className="px-8 md:px-20 py-4 md:py-8 bg-white/5 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-[0.2em] text-sm md:text-xl border border-white/10 hover:border-sky-400 transition-all transform md:hover:scale-110 cursor-pointer shadow-2xl">
                Server Rules
              </div>
            </div>

            <div className="mt-12 md:mt-24 pt-6 md:pt-12 border-t border-white/5 w-full max-w-4xl flex flex-col md:flex-row justify-between items-center text-white/20 font-bold uppercase tracking-widest text-[8px] md:text-xs gap-4">
              <div>© 2024 LUCID CITY NETWORKS. ALL RIGHTS RESERVED.</div>
              <div className="flex gap-4 md:gap-8">
                <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
                <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
              </div>
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );

}
