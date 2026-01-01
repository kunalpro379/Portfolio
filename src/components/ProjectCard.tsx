"use client";

import { useState } from "react";
import { Github, ExternalLink, FileText, BarChart } from "lucide-react";

interface CTAItem {
  label: string;
  link: string;
  icon?: string;
}

interface ProjectCardProps {
  title: string;
  tagline: string;
  badges: string[];
  footer: string;
  description: string;
  highlights: string[];
  techStack: string;
  cta?: CTAItem[];
  image?: string;
  size?: "big" | "large" | "medium" | "small";
}

export default function ProjectCard({
  title,
  tagline,
  badges,
  footer,
  description,
  highlights,
  techStack,
  cta = [],
  image,
  size = "medium"
}: ProjectCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const sizeClasses = {
    big: "lg:col-span-1 lg:row-span-2",
    large: "lg:col-span-2 lg:row-span-2",
    medium: "lg:col-span-1 lg:row-span-1",
    small: "lg:col-span-1 lg:row-span-1"
  };

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case "github":
        return <Github size={14} />;
      case "external":
        return <ExternalLink size={14} />;
      case "docs":
        return <FileText size={14} />;
      default:
        return <BarChart size={14} />;
    }
  };

    const sizeHeight = {
      big: "lg:h-[650px]",
      large: "lg:h-[650px]",
      medium: "lg:h-[310px]",
      small: "lg:h-[310px]"
    };

    return (
      <div
        className={`relative ${sizeClasses[size]} ${sizeHeight[size]} h-[450px] cursor-pointer`}
        style={{ perspective: "1000px" }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div
        className="relative w-full h-full transition-transform duration-700"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
        }}
      >
        {/* FRONT SIDE */}
        <div
          className="absolute inset-0 rounded-2xl md:rounded-3xl border border-zinc-700 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 overflow-hidden group"
          style={{ backfaceVisibility: "hidden" }}
        >
          {image && (
            <div className="absolute inset-0">
              <img 
                src={image} 
                alt={title}
                className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,163,255,0.08)_0%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10 h-full p-6 md:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white leading-none mb-2">
                  {title}
                </h3>
                <div className="h-[2px] w-12 bg-sky-500/60" />
              </div>
              
              <p className="text-white/50 text-xs md:text-sm font-medium leading-relaxed max-w-lg">
                {tagline}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {badges.map((badge, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[9px] font-bold uppercase tracking-wide"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="h-[1px] w-full bg-white/10" />
              <div className="flex items-center justify-between">
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">
                  {footer}
                </p>
                <span className="text-sky-400/50 text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                  Hover for details
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BACK SIDE */}
        <div
          className="absolute inset-0 rounded-2xl md:rounded-3xl border border-sky-500/30 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 md:p-8 flex flex-col justify-center items-center text-center overflow-y-auto"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
        >
          <div className="space-y-5 flex-1 flex flex-col justify-center">
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="h-[2px] w-8 bg-sky-500" />
                <h4 className="text-sky-400 text-[10px] font-black uppercase tracking-widest">
                  Overview
                </h4>
                <div className="h-[2px] w-8 bg-sky-500" />
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                {description}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="h-[2px] w-8 bg-sky-500" />
                <h4 className="text-sky-400 text-[10px] font-black uppercase tracking-widest">
                  Key Features
                </h4>
                <div className="h-[2px] w-8 bg-sky-500" />
              </div>
              <ul className="space-y-2">
                {highlights.map((highlight, i) => (
                  <li key={i} className="text-white/60 text-xs flex items-center justify-center gap-2 leading-relaxed">
                    <span className="text-sky-400 text-sm">•</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="h-[2px] w-8 bg-sky-500" />
                <h4 className="text-sky-400 text-[10px] font-black uppercase tracking-widest">
                  Tech Stack
                </h4>
                <div className="h-[2px] w-8 bg-sky-500" />
              </div>
              <p className="text-white/60 text-xs leading-relaxed">
                {techStack}
              </p>
            </div>
          </div>

          {cta.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mt-6 pt-5 border-t border-white/10">
              {cta.map((item, i) => (
                <a
                  key={i}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    i === 0
                      ? "bg-sky-500 hover:bg-sky-600 text-white"
                      : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  }`}
                >
                  {getIcon(item.icon)}
                  {item.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
