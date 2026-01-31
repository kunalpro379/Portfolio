import { FolderKanban } from "lucide-react";
import ProjectCard from "./ProjectCard";
import { useEffect, useState } from "react";
import { API_ENDPOINTS, API_BASE_URL } from "@/config/api";

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

// Transform the API data to match ProjectCard props
const transformProjects = (projects: RawProjectData[]): ProjectData[] => {
  return projects
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
};

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
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const apiUrl = `${API_BASE_URL}${API_ENDPOINTS.projects}`;
        console.log('Fetching projects from:', apiUrl);
        
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Projects response status:', response.status);
        console.log('Projects response headers:', response.headers);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Projects HTTP error response:', errorText);
          throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const responseText = await response.text();
          console.error('Projects non-JSON response:', responseText);
          throw new Error('Server returned non-JSON response');
        }
        
        const data = await response.json();
        console.log('Projects data received:', data);
        const transformedProjects = transformProjects(data.projects);
        setProjects(transformedProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err instanceof Error ? err.message : 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <section id="projects" className="relative py-12 md:py-20">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
          <SectionHeader icon={FolderKanban} title="FEATURED PROJECTS" subtitle="PREMIUM WORK COLLECTION" />
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin w-16 h-16 border-4 border-sky-400 border-t-transparent rounded-full" style={{ animationDuration: '1.5s' }}></div>
              <div className="text-sky-400 text-lg font-bold">Loading projects...</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="projects" className="relative py-12 md:py-20">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
          <SectionHeader icon={FolderKanban} title="FEATURED PROJECTS" subtitle="PREMIUM WORK COLLECTION" />
          <div className="flex items-center justify-center py-20">
            <div className="text-red-500 text-lg">Error: {error}</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="relative py-12 md:py-20 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 relative z-10">
        <SectionHeader icon={FolderKanban} title="FEATURED PROJECTS" subtitle="PREMIUM WORK COLLECTION" />

        {/* Mobile Layout - Simple Vertical Stack */}
        <div className="block md:hidden space-y-4 mt-8">
          {projects.map((project, index) => (
            <div key={index} className="w-full aspect-[4/3]">
              <ProjectCard {...project} size="medium" />
            </div>
          ))}
        </div>

        {/* Tablet Layout - 2 Column Grid */}
        <div className="hidden md:grid lg:hidden grid-cols-2 gap-4 mt-8">
          {projects.map((project, index) => (
            <div key={index} className="w-full aspect-[4/3]">
              <ProjectCard {...project} size="medium" />
            </div>
          ))}
        </div>

        {/* Desktop Layout - Bento Grid with Proper Heights */}
        <div className="hidden lg:grid grid-cols-4 gap-4 xl:gap-6 mt-8" style={{ gridAutoRows: '280px' }}>
          {projects.slice(0, 24).map((project, index) => {
            // First 6 cards - alternating pattern (tall, medium, medium, tall, medium, medium)
            if (index === 0 || index === 3) {
              return (
                <div key={index} className="col-span-1 row-span-2">
                  <ProjectCard {...project} size="big" />
                </div>
              );
            }
            if (index === 1 || index === 2 || index === 4 || index === 5) {
              return (
                <div key={index} className="col-span-1 row-span-1">
                  <ProjectCard {...project} size="medium" />
                </div>
              );
            }
            // Cards 7-9: medium, wide, medium
            if (index === 6 || index === 8) {
              return (
                <div key={index} className="col-span-1 row-span-1">
                  <ProjectCard {...project} size="medium" />
                </div>
              );
            }
            if (index === 7) {
              return (
                <div key={index} className="col-span-2 row-span-1">
                  <ProjectCard {...project} size="big-width" />
                </div>
              );
            }
            // Cards 10-13: tall, wide, medium, large
            if (index === 9) {
              return (
                <div key={index} className="col-span-1 row-span-2">
                  <ProjectCard {...project} size="big" />
                </div>
              );
            }
            if (index === 10) {
              return (
                <div key={index} className="col-span-2 row-span-1">
                  <ProjectCard {...project} size="big-width" />
                </div>
              );
            }
            if (index === 11) {
              return (
                <div key={index} className="col-span-1 row-span-1">
                  <ProjectCard {...project} size="big-width" />
                </div>
              );
            }
            if (index === 12) {
              return (
                <div key={index} className="col-span-2 row-span-2">
                  <ProjectCard {...project} size="big" />
                </div>
              );
            }
            return (
              <div key={index} className="col-span-1 row-span-1">
                <ProjectCard {...project} size="medium" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
