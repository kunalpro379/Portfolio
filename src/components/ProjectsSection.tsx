import { FolderKanban } from "lucide-react";
import ProjectCard from "./ProjectCard";
import projectsDataRaw from "@/data/projects.json";

interface RawProjectData {
  _id: string;
  projectId: string;
  title: string;
  slug: string;
  tagline: string;
  footer: string;
  description: string;
  tags: string[];
  links: Array<{ name: string; url: string; _id?: string }>;
  mdFiles: string[];
  assets: any[];
  cardasset: any[];
  created_at: string;
  updated_at: string;
  featured: boolean;
  __v?: number;
}

interface ProjectData {
  size?: "big" | "small" | "large" | "medium";
  title: string;
  tagline: string;
  badges: string[];
  footer: string;
  description: string;
  techStack: string;
  cta?: Array<{ label: string; link: string; icon?: string }>;
  image?: string;
  titleColor?: "white" | "black";
  descriptionColor?: "white" | "black";
  id?: string;
}

const rawData = projectsDataRaw as { projects: RawProjectData[] };

// Transform the new JSON structure to match ProjectCard props
const transformedProjects: ProjectData[] = rawData.projects
  .filter(project => project.featured)
  .map((project, index) => {
    // Define sizes for specific positions
    let size: "big" | "small" | "large" | "medium" = "medium";

    // First row layout: tall, medium, medium, tall, medium, medium
    if (index === 0 || index === 3) size = "big"; // SlangBot and Parallel File Encryptor
    else if (index === 1 || index === 2 || index === 4 || index === 5) size = "medium";

    return {
      title: project.title,
      tagline: project.tagline,
      footer: project.footer,
      description: project.description,
      badges: project.tags,
      techStack: project.tags.join(" · "),
      cta: project.links.map(link => ({
        label: link.name,
        link: link.url,
        icon: link.name.toLowerCase().includes("github") ? "github" :
          link.name.toLowerCase().includes("demo") || link.name.toLowerCase().includes("live") || link.name.toLowerCase().includes("website") ? "external" :
            "docs"
      })),
      image: project.cardasset?.[0] || `/projects/${project.slug}.webp`,
      id: project.projectId,
      size
    };
  });

const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 mb-8 md:mb-12">
      <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
        <Icon className="relative z-10 text-sky-400" size={32} />
      </div>
      <div>
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none drop-shadow-2xl text-black">{title}</h2>
        <div className="flex items-center gap-2 mt-2">
          <div className="h-1 w-8 bg-sky-400 rounded-full" />
          <p className="text-sky-400 font-bold tracking-[0.2em] text-[10px] md:text-sm uppercase">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default function ProjectsSection() {
  return (
    <section id="projects" className="relative py-12 md:py-20">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
        <SectionHeader icon={FolderKanban} title="FEATURED PROJECTS" subtitle="PREMIUM WORK COLLECTION" />

        {/* Mobile Layout - Simple Vertical Stack */}
        <div className="md:hidden space-y-4 mt-8">
          {transformedProjects.map((project, index) => (
            <ProjectCard key={index} {...project} />
          ))}
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          {/* Row 1 - Layout: Tall | Medium+Medium | Tall | Medium+Medium */}
          <div className="grid grid-cols-4 gap-6 mt-8">
            <div className="col-span-1">
              <ProjectCard {...transformedProjects[0]} size="big" />
            </div>
            <div className="col-span-1 flex flex-col gap-6">
              <div className="h-[313px]">
                <ProjectCard {...transformedProjects[1]} size="small" />
              </div>
              <div className="h-[313px]">
                <ProjectCard {...transformedProjects[2]} size="small" />
              </div>
            </div>
            {/* Parallel File Encryptor - Tall */}
            <div className="col-span-1">
              <ProjectCard {...transformedProjects[3]} size="big" />
            </div>
            {/* Multithreaded Proxy + Resync - Stacked Medium */}
            <div className="col-span-1 flex flex-col gap-6">
              <div className="h-[313px]">
                <ProjectCard {...transformedProjects[4]} size="small" />
              </div>
              <div className="h-[313px]">
                <ProjectCard {...transformedProjects[5]} size="small" />
              </div>
            </div>
          </div>

          {/* Row 2 - Reverse Proxy | Sketch-to-Face (wide) | Hydralite */}
          <div className="grid grid-cols-4 gap-6 mt-6">
            {/* Reverse Proxy Web Server */}
            <div className="col-span-1">
              <ProjectCard {...transformedProjects[6]} size="medium" />
            </div>
            {/* Sketch-to-Face GAN System - Wide */}
            <div className="col-span-2">
              <ProjectCard {...transformedProjects[7]} size="big-width" />
            </div>
            {/* Hydralite.in */}
            <div className="col-span-1">
              <ProjectCard {...transformedProjects[8]} size="medium" />
            </div>
          </div>

          {/* Row 3 - ProSmart | Hydralite+Remote Desktop (stacked) | Video Pipeline */}
          <div className="grid grid-cols-12 gap-6 mt-6">
            {/* ProSmart.in - Left */}
            <div className="col-span-4">
              <ProjectCard {...transformedProjects[9]} size="big" />
            </div>
            {/* Hydralite + Remote Desktop - Stacked in middle (narrower) */}
            <div className="col-span-3 flex flex-col gap-6">
              <div className="h-[313px]">
                <ProjectCard {...transformedProjects[10]} size="small" />
              </div>
              <div className="h-[313px]">
                <ProjectCard {...transformedProjects[11]} size="small" />
              </div>
            </div>
            {/* Video Pipeline - Right */}
            <div className="col-span-5">
              <ProjectCard {...transformedProjects[12]} size="big" />
            </div>
          </div>

          {/* Row 4 - Remaining cards in standard grid */}
          <div className="grid grid-cols-4 gap-6 mt-6">
            <ProjectCard {...transformedProjects[13]} size="medium" />
            <ProjectCard {...transformedProjects[14]} size="medium" />
            <ProjectCard {...transformedProjects[15]} size="medium" />
            <ProjectCard {...transformedProjects[16]} size="medium" />
          </div>

          {/* Row 5 - Tall | 2 Stacked | Extra Large (Reduced Heights) */}
          <div className="grid grid-cols-4 gap-6 mt-6">
            {/* Tall card - reduced height */}
            <div className="col-span-1 h-[500px]">
              <ProjectCard {...transformedProjects[17]} size="big" />
            </div>
            {/* 2 Stacked medium cards - reduced heights */}
            <div className="col-span-1 flex flex-col gap-6">
              <div className="h-[313px]">
                <ProjectCard {...transformedProjects[18]} size="small" />
              </div>
              <div className="h-[313px]">
                <ProjectCard {...transformedProjects[19]} size="small" />
              </div>
            </div>
            {/* Extra Large card - 2 columns wide, reduced height */}
            <div className="col-span-2 h-[500px]">
              <ProjectCard {...transformedProjects[20]} size="big" />
            </div>
          </div>

          {/* Row 6 - Tall | 2 Stacked | Extra Large */}
          <div className="grid grid-cols-4 gap-6 mt-6">
            {/* Tall card */}
            <div className="col-span-2">
              <ProjectCard {...transformedProjects[21]} size="small" />
            </div>
              <div className="col-span-1">
                <ProjectCard {...transformedProjects[22]} size="small" />
              </div>
                <div className="col-span-1">
                  <ProjectCard {...transformedProjects[23]} size="small" />
                </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}
