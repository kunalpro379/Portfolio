import { motion } from "framer-motion";
import { Clock, Calendar, ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";
import blogsData from "@/data/blogs.metadata.json";
import Navbar from "@/components/Navbar";
import ProjectCard from "@/components/ProjectCard";
import projectsDataRaw from "@/data/projects.json";

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

const projectsData = projectsDataRaw as { featuredProjects: ProjectData[] };

export default function LearningsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'blogs';
  const [activeTab, setActiveTab] = useState<'notes' | 'documentation' | 'blogs' | 'projects'>(tabFromUrl as any);

  useEffect(() => {
    const tab = searchParams.get('tab') || 'blogs';
    setActiveTab(tab as any);
  }, [searchParams]);

  const scrollToSection = useCallback((sectionId: string) => {
    navigate('/');
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }, [navigate]);

  const blogs = blogsData.map((blog, idx) => {
    const colors = [
      "rgb(244, 114, 182)", // Pink
      "rgb(251, 191, 36)",  // Amber
      "rgb(167, 139, 250)", // Purple
      "rgb(34, 197, 94)"    // Green
    ];
    return {
      ...blog,
      accentColor: colors[idx % colors.length]
    };
  });

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 right-0 z-[1001]">
        <Navbar scrollToSection={scrollToSection} />
      </div>

      {/* Floating Back Button - Left (same line as navbar) */}
      <button
        onClick={() => navigate('/')}
        className="hidden md:flex fixed left-6 top-4 md:top-6 z-[1002] items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md border-2 border-black rounded-full shadow-lg hover:bg-black hover:text-white transition-all group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold text-sm">Back</span>
      </button>

      {/* Floating Avatar - Right (same line as navbar) */}
      <div className="hidden md:flex fixed right-6 top-4 md:top-6 z-[1002] items-center gap-3 px-4 py-2 bg-white/90 backdrop-blur-md border-2 border-black rounded-full shadow-lg">
        <img
          src="/me.png"
          alt="Kunal Patil"
          className="w-10 h-10 rounded-full object-cover grayscale"
        />
        <span className="font-bold text-sm">Kunal Patil</span>
      </div>

      {/* Main Content - Scrollable Area */}
      <main className="flex-1 overflow-y-auto pt-[100px] md:pt-[120px]">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-12">
          {/* Content based on active tab */}
          {activeTab === 'notes' && (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {[
                { title: "Java", color: "from-red-50 to-red-100", accent: "bg-red-500" },
                { title: "DSA", color: "from-blue-50 to-blue-100", accent: "bg-blue-500" },
                { title: "C++", color: "from-purple-50 to-purple-100", accent: "bg-purple-500" },
                { title: "DevOps", color: "from-green-50 to-green-100", accent: "bg-green-500" },
                { title: "System Design", color: "from-orange-50 to-orange-100", accent: "bg-orange-500" },
                { title: "Spring Boot", color: "from-teal-50 to-teal-100", accent: "bg-teal-500" },
              ].map((note, idx) => (
                <div
                  key={idx}
                  className="group"
                >
                  <div className={`relative bg-gradient-to-br ${note.color} rounded-xl md:rounded-2xl p-4 md:p-8 hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-black/10 hover:border-black/20 hover:-translate-y-1 overflow-hidden min-h-[100px] md:min-h-[120px] flex items-center justify-center`}>
                    {/* Decorative corner accent */}
                    <div className={`absolute top-0 right-0 w-12 h-12 md:w-20 md:h-20 ${note.accent} opacity-10 rounded-bl-full`} />

                    {/* Decorative dots */}
                    <div className="absolute top-2 right-2 md:top-4 md:right-4 flex gap-1">
                      <div className={`w-1.5 h-1.5 md:w-2 md:h-2 ${note.accent} rounded-full opacity-30`} />
                      <div className={`w-1.5 h-1.5 md:w-2 md:h-2 ${note.accent} rounded-full opacity-20`} />
                      <div className={`w-1.5 h-1.5 md:w-2 md:h-2 ${note.accent} rounded-full opacity-10`} />
                    </div>

                    <div className="relative z-10 text-center">
                      {/* Title */}
                      <h3 className="text-xl md:text-3xl lg:text-4xl font-black text-gray-900 leading-tight">{note.title}</h3>
                    </div>

                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-all duration-300 rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'documentation' && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">Documentation coming soon...</p>
            </div>
          )}

          {activeTab === 'projects' && (
            <div>
              {/* Mobile Layout - Simple Vertical Stack */}
              <div className="md:hidden space-y-4">
                {projectsData.featuredProjects.map((project, index) => (
                  <ProjectCard key={index} {...project} />
                ))}
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:block">
                {/* Row 1 */}
                <div className="grid grid-cols-4 gap-6">
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

                {/* Row 2 */}
                <div className="grid grid-cols-3 gap-6 mt-6">
                  <ProjectCard {...projectsData.featuredProjects[6]} />
                  <ProjectCard {...projectsData.featuredProjects[7]} />
                  <ProjectCard {...projectsData.featuredProjects[8]} />
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-4 gap-6 mt-6">
                  <ProjectCard {...projectsData.featuredProjects[9]} />
                  <ProjectCard {...projectsData.featuredProjects[10]} />
                  <ProjectCard {...projectsData.featuredProjects[11]} />
                  <ProjectCard {...projectsData.featuredProjects[12]} />
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-4 gap-6 mt-6">
                  <div className="col-span-2 h-[650px]">
                    <ProjectCard {...projectsData.featuredProjects[13]} />
                  </div>
                  <div className="col-span-1 flex flex-col gap-6 h-[650px]">
                    <div className="flex-1">
                      <ProjectCard {...projectsData.featuredProjects[14]} />
                    </div>
                  </div>
                  <div className="col-span-1 flex flex-col gap-6 h-[650px]">
                    <div className="flex-1">
                      <ProjectCard {...projectsData.featuredProjects[23]} />
                    </div>
                    <div className="flex-1">
                      <ProjectCard {...projectsData.featuredProjects[21]} />
                    </div>
                  </div>
                </div>

                {/* Row 5 */}
                <div className="grid grid-cols-4 gap-6 mt-6">
                  <div className="col-span-1 h-[650px]">
                    <ProjectCard {...projectsData.featuredProjects[17]} />
                  </div>
                  <div className="col-span-2 flex flex-col gap-6">
                    <div className="flex-1">
                      <ProjectCard {...projectsData.featuredProjects[15]} />
                    </div>
                    <div className="flex-1">
                      <ProjectCard {...projectsData.featuredProjects[6]} />
                    </div>
                  </div>
                  <div className="col-span-1 h-[650px]">
                    <ProjectCard {...projectsData.featuredProjects[20]} />
                  </div>
                </div>

                {/* Row 6 */}
                <div className="grid grid-cols-2 gap-6 mt-6">
                  <div className="col-span-1">
                    <ProjectCard {...projectsData.featuredProjects[22]} />
                  </div>
                  <div className="col-span-1">
                    <ProjectCard {...projectsData.featuredProjects[16]} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'blogs' && (
            <div className="divide-y divide-gray-200">
              {blogs.map((blog, idx) => (
                <motion.a
                  key={idx}
                  href={blog.blogUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="group block py-8 first:pt-0"
                >
                  <article className="flex flex-col md:flex-row gap-6 p-6 rounded-lg hover:bg-gray-50 transition-all duration-300">
                    {/* Image */}
                    {blog.coverImage && (
                      <div className="md:w-1/3 flex-shrink-0">
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={blog.coverImage}
                            alt={blog.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        {/* Category Badge */}
                        <div className="mb-3">
                          <span
                            className="inline-block px-3 py-1 text-xs font-semibold rounded-full"
                            style={{
                              backgroundColor: `${blog.accentColor}20`,
                              color: blog.accentColor
                            }}
                          >
                            {blog.subject}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl font-bold text-black mb-3 group-hover:text-gray-700 transition-colors">
                          {blog.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {blog.shortDescription}
                        </p>
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          <span>
                            {new Date(blog.dateUpdated).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={16} />
                          <span>{blog.readTime}</span>
                        </div>
                        <div className="hidden sm:block">
                          <span>{blog.author}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                </motion.a>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
