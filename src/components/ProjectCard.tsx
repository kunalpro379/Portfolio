import { useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Github, ExternalLink, FileText, BarChart, ArrowRight } from "lucide-react";

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
  techStack: string;
  cta?: CTAItem[];
  image?: string;
  size?: "big" | "big-width" | "large" | "medium" | "small";
  titleColor?: "white" | "black";
  descriptionColor?: "white" | "black";
  id?: string;
}

const ProjectCard = memo(function ProjectCard({
  title,
  tagline,
  badges,
  footer,
  description,
  techStack,
  cta = [],
  image,
  size = "medium",
  titleColor = "white",
  descriptionColor = "white",
  id
}: ProjectCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const navigate = useNavigate();

  // Generate a 10-character ID if not provided
  const projectId = id || Math.random().toString(36).substring(2, 12);

  const handleCardClick = () => {
    navigate(`/projects/${projectId}`);
  };

  const sizeClasses = {
    big: "lg:col-span-1 lg:row-span-2",
    "big-width": "lg:col-span-2 lg:row-span-1",
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
    "big-width": "lg:h-[380px]",
    large: "lg:h-[650px]",
    medium: "lg:h-[380px]",
    small: "lg:h-[310px]"
  };

  return (
    <div
      className={`relative ${sizeClasses[size]} h-[280px] ${sizeHeight[size]} cursor-pointer`}
      style={{ perspective: "1000px" }}
      onClick={handleCardClick}
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
            <div className="absolute inset-0 aspect-video">
              <img
                src={image}
                alt={title}
                loading="lazy"
                decoding="async"
                width={600}
                height={400}
                className="w-full h-full object-cover opacity-100 md:opacity-70 md:group-hover:opacity-80 md:transition-opacity md:duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" style={{
                background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 10%, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.3) 30%, transparent 40%)'
              }} />
            </div>
          )}

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,163,255,0.08)_0%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Mobile Layout - Title at Bottom Center + Read More Button */}
          <div className="md:hidden relative z-10 h-full flex flex-col justify-end p-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-white text-center leading-tight mb-3">
              {title}
            </h3>
            <button 
              onClick={handleCardClick}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-gray-100 transition-all shadow-lg"
            >
              Read More
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Desktop Layout - Title at Bottom */}
          <div className="hidden md:block relative z-10 h-full p-6 md:p-8">
            <div className="h-full flex flex-col justify-end">
              <div className="space-y-3">
                <div>
                  <h3
                    className={`text-2xl md:text-3xl font-black uppercase tracking-tight ${titleColor === "black" ? "text-black" : "text-white"} leading-none mb-2`}
                    style={{
                      WebkitTextStroke: titleColor === "black" ? "1.5px white" : "1.5px black",
                      paintOrder: "stroke fill"
                    }}
                  >
                    {title}
                  </h3>
                  <div className="h-[2px] w-12 bg-sky-500/60" />
                </div>

                <p
                  className={`${descriptionColor === "black" ? "text-black/70" : "text-white/70"} text-xs md:text-sm font-medium leading-relaxed max-w-lg`}
                >
                  {tagline}
                </p>
              </div>
              
              {/* Read More Button - Desktop - Bottom Right */}
              <div className="flex justify-end pt-4">
                <button 
                  onClick={handleCardClick}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-gray-100 transition-all shadow-lg"
                >
                  Read More
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BACK SIDE */}
        <div
          className="absolute inset-0 rounded-2xl md:rounded-3xl border border-sky-500/30 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 md:p-8 flex flex-col justify-between overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
        >
          {/* Description - Large Text */}
          <div className="flex-1 flex items-center justify-center">
            <p className="text-white/90 text-xs md:text-sm lg:text-base font-medium leading-relaxed text-center">
              {description}
            </p>
          </div>

          {/* GitHub Icon - Bottom Left */}
          <div className="flex justify-start">
            <a
              href={cta?.[0]?.link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <Github size={36} strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProjectCard;
