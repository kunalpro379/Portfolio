"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Github, ExternalLink, ChevronRight } from "lucide-react";

interface ProjectCardProps {
  title: string;
  tagline: string;
  badges: string[];
  footer: string;
  description: string;
  highlights: string[];
  techStack: string;
  cta: { label: string; link: string; icon?: any }[];
  size?: "big" | "medium" | "small";
  image?: string;
}

export function ProjectCard({
  title,
  tagline,
  badges,
  footer,
  description,
  highlights,
  techStack,
  cta,
  size = "small",
  image
}: ProjectCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className={`relative w-full group cursor-pointer ${
        size === "big" ? "aspect-video md:aspect-auto h-full" : "aspect-video"
      }`}
      style={{ perspective: "2000px" }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
            <motion.div
              className="relative w-full h-full"
              style={{ transformStyle: "preserve-3d" }}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20, 
                mass: 0.5 
              }}
            >
          {/* FRONT SIDE */}
          <div 
            className="absolute inset-0 backface-hidden rounded-2xl md:rounded-3xl border border-zinc-200 overflow-hidden bg-white shadow-xl"
            style={{ backfaceVisibility: "hidden" }}
          >
            {image && (
              <img 
                src={image} 
                alt={title} 
                className="absolute inset-0 w-full h-full object-cover opacity-80" 
              />
            )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end">
            <div className="space-y-2 md:space-y-4">
              <div className="flex flex-wrap gap-2">
                {badges.map((badge, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                    {badge}
                  </span>
                ))}
              </div>
              <h3 className={`${size === "big" ? "text-3xl md:text-5xl" : "text-xl md:text-3xl"} font-black uppercase tracking-tighter text-white leading-none`}>
                {title}
              </h3>
              <p className="text-white/70 font-bold text-[10px] md:text-sm uppercase tracking-widest max-w-md">
                {tagline}
              </p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
              <span className="text-sky-400 font-bold text-[8px] md:text-xs uppercase tracking-widest">{footer}</span>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                <ChevronRight size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* BACK SIDE */}
        <div 
          className="absolute inset-0 backface-hidden rounded-2xl md:rounded-3xl border border-white/10 bg-black overflow-hidden p-6 md:p-10 flex flex-col justify-between"
          style={{ 
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
        >
          <div className="space-y-4 md:space-y-6">
            <div className="space-y-2">
              <h4 className="text-sky-400 font-black text-[10px] md:text-xs uppercase tracking-[0.2em]">Project Overview</h4>
              <p className="text-white text-sm md:text-xl font-medium leading-relaxed">
                {description}
              </p>
            </div>
            
              <div className="pt-2">
                <h4 className="text-sky-400 font-black text-[10px] md:text-xs uppercase tracking-[0.2em] mb-1">Architecture</h4>
                <p className="text-white/40 text-[10px] md:text-xs font-black uppercase tracking-[0.1em]">
                  {techStack}
                </p>
              </div>
          </div>

          <div className="flex flex-wrap gap-3 md:gap-4 mt-4">
            {cta.map((item, i) => (
                <a 
                  key={i} 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-sky-500 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                >
                {item.icon === "github" ? <Github size={14} /> : <ExternalLink size={14} />}
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
