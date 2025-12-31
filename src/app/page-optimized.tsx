"use client";

import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { Home as HomeIcon, Instagram, Radio, Users, Trophy, MessageSquare, Shield, Zap, Crown, ChevronRight, Car, Briefcase, Sword, Folder } from "lucide-react";
import { useRef, useEffect, useState, useMemo, memo } from "react";
import dynamic from "next/dynamic";

// Lazy load ImageSlider
const ImageSlider = dynamic(() => import("@/components/ImageSlider"), {
  loading: () => <div className="w-full h-full bg-zinc-800 animate-pulse" />,
  ssr: false
});

// Memoized components
const SectionHeader = memo(({ icon: Icon, title, subtitle, dark = false }: { icon: any; title: string; subtitle: string; dark?: boolean; }) => (
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
));
SectionHeader.displayName = "SectionHeader";

// Memoized floating card
const FloatingCard = memo(({ props, tech, index, duration }: any) => (
  <motion.div
    key={index}
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
      delay: -(index * duration) / 15
    }}
    className="absolute w-20 h-20 md:w-32 md:h-32 backdrop-blur-md bg-white/5 border border-white/10 rounded-xl md:rounded-2xl flex flex-col items-center justify-center shadow-2xl p-2 md:p-4"
  >
    <img
      src={tech.logo}
      alt={tech.name}
      loading="lazy"
      className="w-6 h-6 md:w-10 md:h-10 mb-1 md:mb-2 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
    />
    <span className="text-[6px] md:text-[8px] font-black uppercase tracking-tighter text-white/60">{tech.name}</span>
  </motion.div>
));
FloatingCard.displayName = "FloatingCard";

// Memoized bokeh particle
const BokehParticle = memo(({ props, index }: any) => (
  <motion.div
    key={index}
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
    }}
  />
));
BokehParticle.displayName = "BokehParticle";

export default function Home() {
  const containerRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  // Memoize static data
  const technologies = useMemo(() => [
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
  ], []);

  const navItems = useMemo(() => ["About", "Stats", "Tiers", "Media"], []);

  // Generate animation props once
  const cardProps = useMemo(() => 
    Array.from({ length: 15 }).map(() => ({
      x: `${Math.random() * 100}vw`,
      rotate: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
      duration: 15 + Math.random() * 10,
      rotateEnd: Math.random() * 720
    })), []
  );

  const bokehProps = useMemo(() => 
    Array.from({ length: 15 }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: 10 + Math.random() * 10,
      delay: Math.random() * 10
    })), []
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Section visibility transforms
  const section1Opacity = useTransform(scrollYProgress, [0, 0.05, 0.07], [1, 0.3, 0]);
  const section1Scale = useTransform(scrollYProgress, [0, 0.07], [1, 0.9]);
  const section1Blur = useTransform(scrollYProgress, [0, 0.02, 0.05, 0.07], ["blur(0px)", "blur(8px)", "blur(30px)", "blur(100px)"]);

  const section2Opacity = useTransform(scrollYProgress, [0.07, 0.1, 0.14, 0.17], [0, 1, 1, 0]);
  const section3Opacity = useTransform(scrollYProgress, [0.14, 0.17, 0.21, 0.24], [0, 1, 1, 0]);
  const section4Opacity = useTransform(scrollYProgress, [0.21, 0.24, 0.28, 0.31], [0, 1, 1, 0]);
  const section5Opacity = useTransform(scrollYProgress, [0.28, 0.31, 0.35, 0.38], [0, 1, 1, 0]);
  const section6Opacity = useTransform(scrollYProgress, [0.35, 0.38, 0.42, 0.45], [0, 1, 1, 0]);

  const duration = 20;
