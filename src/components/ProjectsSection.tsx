import { FolderKanban } from "lucide-react";
import ProjectCard from "./ProjectCard";
import projectsDataRaw from "@/data/projects.json";
import backgroundsData from "@/data/backgrounds.json";

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
}

const projectsData = projectsDataRaw as { featuredProjects: ProjectData[] };

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
          {projectsData.featuredProjects.map((project, index) => (
            <ProjectCard key={index} {...project} />
          ))}
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          {/* Row 1 - 4 columns with mixed heights */}
          <div className="grid grid-cols-4 gap-6 mt-8">
            <div className="col-span-1 h-[650px]">
              <ProjectCard {...projectsData.featuredProjects[0]} />
            </div>
            <div className="col-span-1 flex flex-col gap-6">
              <ProjectCard {...projectsData.featuredProjects[1]} />
              <ProjectCard {...projectsData.featuredProjects[2]} />
            </div>
            <div className="col-span-1 h-[650px]">
              <ProjectCard {...projectsData.featuredProjects[3]} />
            </div>
            <div className="col-span-1 flex flex-col gap-6">
              <ProjectCard {...projectsData.featuredProjects[4]} />
              <ProjectCard {...projectsData.featuredProjects[5]} />
            </div>
          </div>

          {/* Row 2 - 3 equal columns */}
          <div className="grid grid-cols-3 gap-6 mt-6">
            <ProjectCard {...projectsData.featuredProjects[6]} />
            <ProjectCard {...projectsData.featuredProjects[7]} />
            <ProjectCard {...projectsData.featuredProjects[8]} />
          </div>

          {/* Row 3 - 4 equal columns */}
          <div className="grid grid-cols-4 gap-6 mt-6">
            <ProjectCard {...projectsData.featuredProjects[9]} />
            <ProjectCard {...projectsData.featuredProjects[10]} />
            <ProjectCard {...projectsData.featuredProjects[11]} />
            <ProjectCard {...projectsData.featuredProjects[12]} />
          </div>

          {/* Row 4 - 2 large + 2 stacked */}
          <div className="grid grid-cols-4 gap-6 mt-6">
            <div className="col-span-2 h-[650px]">
              <ProjectCard {...projectsData.featuredProjects[13]} />
            </div>
            <div className="col-span-1 h-[650px]">
              <ProjectCard {...projectsData.featuredProjects[14]} />
            </div>
            <div className="col-span-1 flex flex-col gap-6 h-[650px]">
              <div className="flex-1">
                <ProjectCard {...projectsData.featuredProjects[15]} />
              </div>
              <div className="flex-1">
                <ProjectCard {...projectsData.featuredProjects[16]} />
              </div>
            </div>
          </div>

          {/* Row 5 - Mixed layout */}
          <div className="grid grid-cols-4 gap-6 mt-6">
            <div className="col-span-1 h-[650px]">
              <ProjectCard {...projectsData.featuredProjects[17]} />
            </div>
            <div className="col-span-2 h-[650px]">
              <ProjectCard {...projectsData.featuredProjects[18]} />
            </div>
            <div className="col-span-1 h-[650px]">
              <ProjectCard {...projectsData.featuredProjects[19]} />
            </div>
          </div>

          {/* Row 6 - 4 equal columns */}
          <div className="grid grid-cols-4 gap-6 mt-6">
            <ProjectCard {...projectsData.featuredProjects[20]} />
            <ProjectCard {...projectsData.featuredProjects[21]} />
            <ProjectCard {...projectsData.featuredProjects[22]} />
            <ProjectCard {...projectsData.featuredProjects[23]} />
          </div>
        </div>
      </div>
    </section>
  );
}
