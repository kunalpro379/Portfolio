"use client";

import { useState } from "react";
import { Github, ExternalLink, FileText, BarChart } from "lucide-react";

interface ProjectCardProps {
  title: string;
  tagline: string;
  badges: string[];
  footer: string;
  description: string;
  highlights: string[];
  techStack: string;
  links: {
    github?: string;
    demo?: string;
    docs?: string;
    other?: { label: string; url: string };
  };
  size?: "large" | "medium" | "small";
}

export default function ProjectCard({
  title,
  tagline,
  badges,
  footer,
  description,
  highlights,
  techStack,
  links,
  size = "medium"
}: ProjectCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const sizeClasses = {
    large: "lg:col-span-2 lg:row-span-2",
    medium: "lg:col-span-1 lg:row-span-2",
    small: "lg:col-span-1 lg:row-span-1"
  };

  return (
    <div
      className={`relative ${sizeClasses[size]} h-[450px] lg:h-auto perspective-1000`}
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
          className="absolute inset-0 rounded-2xl md:rounded-3xl border border-zinc-700 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 p-6 md:p-8 flex flex-col justify-between overflow-hidden group"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,163,255,0.08)_0%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10 space-y-4">
            {/* Title - Single Line, Left Aligned */}
            <div>
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white leading-none mb-2">
                {title}
              </h3>
              <div className="h-[2px] w-12 bg-sky-500/60" />
            </div>
            
            {/* Tagline - Professional, Left Aligned */}
            <p className="text-white/50 text-xs md:text-sm font-medium leading-relaxed max-w-lg">
              {tagline}
            </p>
            
            {/* Badges - Compact */}
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

          {/* Footer - Clean Line */}
          <div className="relative z-10 space-y-3">
            <div className="h-[1px] w-full bg-white/10" />
            <div className="flex items-center justify-between">
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">
                {footer}
              </p>
              <span className="text-sky-400/50 text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                Hover →
              </span>
            </div>
          </div>
        </div>

        {/* BACK SIDE */}
        <div
          className="absolute inset-0 rounded-2xl md:rounded-3xl border border-sky-500/30 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 md:p-8 flex flex-col overflow-y-auto"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
        >
          <div className="space-y-5 flex-1">
            {/* What it is */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-[2px] w-8 bg-sky-500" />
                <h4 className="text-sky-400 text-[10px] font-black uppercase tracking-widest">
                  Overview
                </h4>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                {description}
              </p>
            </div>

            {/* Key Highlights */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-[2px] w-8 bg-sky-500" />
                <h4 className="text-sky-400 text-[10px] font-black uppercase tracking-widest">
                  Key Features
                </h4>
              </div>
              <ul className="space-y-2">
                {highlights.map((highlight, i) => (
                  <li key={i} className="text-white/60 text-xs flex items-start gap-2 leading-relaxed">
                    <span className="text-sky-400 mt-0.5 text-sm">•</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tech Stack */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-[2px] w-8 bg-sky-500" />
                <h4 className="text-sky-400 text-[10px] font-black uppercase tracking-widest">
                  Tech Stack
                </h4>
              </div>
              <p className="text-white/60 text-xs leading-relaxed">
                {techStack}
              </p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-white/10">
            {links.github && (
              <a
                href={links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
              >
                <Github size={14} />
                GitHub
              </a>
            )}
            {links.docs && (
              <a
                href={links.docs}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all border border-white/20"
              >
                <FileText size={14} />
                Docs
              </a>
            )}
            {links.demo && (
              <a
                href={links.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all border border-white/20"
              >
                <ExternalLink size={14} />
                Demo
              </a>
            )}
            {links.other && (
              <a
                href={links.other.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all border border-white/20"
              >
                <BarChart size={14} />
                {links.other.label}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
