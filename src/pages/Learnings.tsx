import { Clock, Calendar, ArrowLeft, FolderOpen, FileText, BookOpen, Code } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/config/api";

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

interface Blog {
  blogId: string;
  title: string;
  slug: string;
  tagline: string;
  subject: string;
  shortDescription: string;
  tags: string[];
  datetime: string;
  footer: string;
  coverImage: string;
  blogLinks: Array<{ name: string; url: string }>;
}

interface Note {
  folderId: string;
  name: string;
  path: string;
  parentPath: string;
  createdAt: string;
}

interface Documentation {
  docId: string;
  title: string;
  subject: string;
  description: string;
  tags: string[];
  date: string;
  time: string;
  slug: string;
  isPublic: boolean;
  createdAt: string;
}

export default function LearningsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'blogs';
  const [activeTab, setActiveTab] = useState<'notes' | 'documentation' | 'blogs' | 'projects'>(tabFromUrl as any);

  // State for API data
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [documentation, setDocumentation] = useState<Documentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Show more states
  const [showAllBlogs, setShowAllBlogs] = useState(false);
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [showAllDocs, setShowAllDocs] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);

  const ITEMS_TO_SHOW = 6;

  useEffect(() => {
    const tab = searchParams.get('tab') || 'blogs';
    setActiveTab(tab as any);
  }, [searchParams]);

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        switch (activeTab) {
          case 'projects':
            const projectsRes = await fetch(API_ENDPOINTS.projects);
            if (!projectsRes.ok) throw new Error('Failed to fetch projects');
            const projectsData = await projectsRes.json();
            const transformedProjects = projectsData.projects
              .filter((p: any) => p.featured)
              .map((project: any) => ({
                title: project.title,
                tagline: project.tagline,
                footer: project.footer,
                description: project.description,
                badges: project.tags,
                techStack: project.tags.join(" · "),
                cta: project.links.map((link: any) => ({
                  label: link.name,
                  link: link.url,
                  icon: link.name.toLowerCase().includes("github") ? "github" :
                    link.name.toLowerCase().includes("demo") || link.name.toLowerCase().includes("live") ? "external" : "docs"
                })),
                image: project.cardasset?.[0] || `/projects/${project.slug}.webp`,
                id: project.projectId,
                size: "medium" as const
              }));
            setProjects(transformedProjects);
            break;

          case 'blogs':
            const blogsRes = await fetch(API_ENDPOINTS.blogs);
            if (!blogsRes.ok) throw new Error('Failed to fetch blogs');
            const blogsData = await blogsRes.json();
            setBlogs(blogsData.blogs);
            break;

          case 'notes':
            const notesRes = await fetch(`${API_ENDPOINTS.notes}/folders`);
            if (!notesRes.ok) throw new Error('Failed to fetch notes');
            const notesData = await notesRes.json();
            console.log('Notes data received:', notesData.folders);
            // Filter out any folders without folderId
            const validFolders = notesData.folders.filter((f: Note) => f.folderId);
            console.log('Valid folders:', validFolders);
            setNotes(validFolders);
            break;

          case 'documentation':
            const docsRes = await fetch(API_ENDPOINTS.documentation);
            if (!docsRes.ok) throw new Error('Failed to fetch documentation');
            const docsData = await docsRes.json();
            setDocumentation(docsData.docs);
            break;
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const changeTab = (tab: 'notes' | 'documentation' | 'blogs' | 'projects') => {
    setSearchParams({ tab });
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b-4 border-black p-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-4 font-bold text-base"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
            Back to Home
          </button>

          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-black text-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              My Learnings
            </h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
            <button
              onClick={() => changeTab('blogs')}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all border-3 border-black ${activeTab === 'blogs'
                  ? 'bg-pink-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white hover:bg-gray-100'
                }`}
            >
              Blogs
            </button>
            <button
              onClick={() => changeTab('documentation')}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all border-3 border-black ${activeTab === 'documentation'
                  ? 'bg-blue-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white hover:bg-gray-100'
                }`}
            >
              Documentation
            </button>
            <button
              onClick={() => changeTab('notes')}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all border-3 border-black ${activeTab === 'notes'
                  ? 'bg-yellow-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white hover:bg-gray-100'
                }`}
            >
              Notes
            </button>
            <button
              onClick={() => changeTab('projects')}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all border-3 border-black ${activeTab === 'projects'
                  ? 'bg-green-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white hover:bg-gray-100'
                }`}
            >
              Projects
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-gray-900 text-2xl font-black">Loading {activeTab}...</div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex items-center justify-center py-20">
              <div className="bg-red-100 border-4 border-black rounded-xl p-8 text-center">
                <p className="text-red-600 text-xl font-black">Error: {error}</p>
              </div>
            </div>
          )}

          {/* Content based on active tab */}
          {!loading && !error && (
            <>
              {/* NOTES TAB */}
              {activeTab === 'notes' && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {notes.length === 0 ? (
                      <div className="col-span-full text-center py-20">
                        <div className="bg-white border-4 border-black rounded-2xl p-12 inline-block">
                          <FolderOpen size={64} strokeWidth={2.5} className="mx-auto mb-4" />
                          <p className="text-gray-600 text-lg font-bold">No notes folders yet</p>
                        </div>
                      </div>
                    ) : (
                      (showAllNotes ? notes : notes.slice(0, ITEMS_TO_SHOW)).map((note) => (
                        <div
                          key={note.folderId}
                          onClick={() => {
                            if (note.folderId) {
                              navigate(`/learnings/notes/${note.folderId}`);
                            } else {
                              console.error('Note folderId is missing:', note);
                            }
                          }}
                          className="bg-yellow-100 border-3 border-black rounded-xl p-4 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer hover:-translate-y-1 group"
                        >
                          <div className="flex flex-col items-center text-center gap-3">
                            <div className="p-3 bg-yellow-300 border-2 border-black rounded-lg group-hover:rotate-6 transition-transform">
                              <FolderOpen size={32} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-base font-black text-black line-clamp-2">{note.name}</h3>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {notes.length > ITEMS_TO_SHOW && (
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={() => setShowAllNotes(!showAllNotes)}
                        className="px-8 py-3 bg-black text-white border-3 border-black rounded-xl font-bold hover:bg-gray-800 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                      >
                        {showAllNotes ? '← Show Less' : 'Show More →'}
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* DOCUMENTATION TAB */}
              {activeTab === 'documentation' && (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {documentation.length === 0 ? (
                      <div className="col-span-full text-center py-20">
                        <div className="bg-white border-4 border-black rounded-2xl p-12 inline-block">
                          <BookOpen size={64} strokeWidth={2.5} className="mx-auto mb-4" />
                          <p className="text-gray-600 text-lg font-bold">No documentation yet</p>
                        </div>
                      </div>
                    ) : (
                      (showAllDocs ? documentation : documentation.slice(0, ITEMS_TO_SHOW)).map((doc) => (
                        <div
                          key={doc.docId}
                          onClick={() => navigate(`/learnings/documentation/${doc.docId}`)}
                          className="bg-white border-4 border-black rounded-2xl p-8 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer hover:-translate-y-1 group h-full flex flex-col"
                        >
                          <div className="flex items-start gap-5 mb-4">
                            <div className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 border-3 border-black rounded-xl group-hover:rotate-6 transition-transform flex-shrink-0">
                              <FileText size={32} strokeWidth={2.5} className="text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-3 flex-wrap">
                                <span className="px-3 py-1.5 bg-blue-100 border-2 border-black rounded-lg text-xs font-bold uppercase tracking-wide">
                                  {doc.subject}
                                </span>
                                {doc.isPublic && (
                                  <span className="px-3 py-1.5 bg-green-100 border-2 border-black rounded-lg text-xs font-bold uppercase tracking-wide">
                                    Public
                                  </span>
                                )}
                              </div>
                              <h3 className="text-2xl font-black text-black mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                                {doc.title}
                              </h3>
                            </div>
                          </div>
                          
                          {doc.description && (
                            <p className="text-gray-700 mb-4 font-medium leading-relaxed line-clamp-3">
                              {doc.description}
                            </p>
                          )}
                          
                          {doc.tags && doc.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {doc.tags.slice(0, 4).map((tag, i) => (
                                <span key={i} className="px-3 py-1 text-xs bg-gray-100 border-2 border-black rounded-full font-bold">
                                  #{tag}
                                </span>
                              ))}
                              {doc.tags.length > 4 && (
                                <span className="px-3 py-1 text-xs bg-gray-200 border-2 border-black rounded-full font-bold">
                                  +{doc.tags.length - 4}
                                </span>
                              )}
                            </div>
                          )}
                          
                          <div className="mt-auto pt-4 border-t-2 border-gray-200">
                            <div className="flex items-center gap-4 text-sm text-gray-600 font-bold">
                              {doc.date && (
                                <div className="flex items-center gap-2">
                                  <Calendar size={16} strokeWidth={2.5} className="text-blue-500" />
                                  <span>{doc.date}</span>
                                </div>
                              )}
                              {doc.time && (
                                <div className="flex items-center gap-2">
                                  <Clock size={16} strokeWidth={2.5} className="text-blue-500" />
                                  <span>{doc.time}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {documentation.length > ITEMS_TO_SHOW && (
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={() => setShowAllDocs(!showAllDocs)}
                        className="px-8 py-3 bg-black text-white border-3 border-black rounded-xl font-bold hover:bg-gray-800 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                      >
                        {showAllDocs ? '← Show Less' : 'Show More →'}
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* BLOGS TAB */}
              {activeTab === 'blogs' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {blogs.length === 0 ? (
                      <div className="col-span-full text-center py-20">
                        <div className="bg-white border-4 border-black rounded-2xl p-12 inline-block">
                          <FileText size={64} strokeWidth={2.5} className="mx-auto mb-4" />
                          <p className="text-gray-600 text-lg font-bold">No blogs yet</p>
                        </div>
                      </div>
                    ) : (
                      (showAllBlogs ? blogs : blogs.slice(0, ITEMS_TO_SHOW)).map((blog) => (
                        <div
                          key={blog.blogId}
                          onClick={() => navigate(`/learnings/blogs/${blog.blogId}`)}
                          className="bg-white border-4 border-black rounded-2xl overflow-hidden hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer hover:-translate-y-1 group"
                        >
                          {blog.coverImage && (
                            <div className="relative overflow-hidden">
                              <img
                                src={blog.coverImage}
                                alt={blog.title}
                                className="w-full h-48 object-cover border-b-4 border-black group-hover:scale-105 transition-transform"
                              />
                            </div>
                          )}
                          <div className="p-6">
                            <div className="mb-3">
                              <span className="px-3 py-1 bg-pink-100 border-2 border-black rounded-lg text-xs font-bold">
                                {blog.subject}
                              </span>
                            </div>
                            <h3 className="text-xl font-black text-black mb-3 line-clamp-2">{blog.title}</h3>
                            <p className="text-gray-700 mb-4 font-medium text-sm line-clamp-2">{blog.shortDescription}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-600 font-medium">
                              <div className="flex items-center gap-1">
                                <Calendar size={12} strokeWidth={2.5} />
                                <span>
                                  {new Date(blog.datetime).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {blogs.length > ITEMS_TO_SHOW && (
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={() => setShowAllBlogs(!showAllBlogs)}
                        className="px-8 py-3 bg-black text-white border-3 border-black rounded-xl font-bold hover:bg-gray-800 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                      >
                        {showAllBlogs ? '← Show Less' : 'Show More →'}
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* PROJECTS TAB */}
              {activeTab === 'projects' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.length === 0 ? (
                      <div className="col-span-full text-center py-20">
                        <div className="bg-white border-4 border-black rounded-2xl p-12 inline-block">
                          <Code size={64} strokeWidth={2.5} className="mx-auto mb-4" />
                          <p className="text-gray-600 text-lg font-bold">No projects yet</p>
                        </div>
                      </div>
                    ) : (
                      (showAllProjects ? projects : projects.slice(0, ITEMS_TO_SHOW)).map((project) => (
                        <div
                          key={project.id}
                          onClick={() => navigate(`/projects/${project.id}`)}
                          className="bg-white border-4 border-black rounded-2xl overflow-hidden hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer hover:-translate-y-1 group"
                        >
                          {project.image && (
                            <img
                              src={project.image}
                              alt={project.title}
                              className="w-full h-48 object-cover border-b-4 border-black group-hover:scale-105 transition-transform"
                            />
                          )}
                          <div className="p-6">
                            <h3 className="text-xl font-black text-black mb-2">{project.title}</h3>
                            <p className="text-gray-700 mb-3 font-medium text-sm">{project.tagline}</p>
                            <div className="flex flex-wrap gap-2">
                              {project.badges.slice(0, 3).map((badge, i) => (
                                <span key={i} className="px-2 py-1 text-xs bg-green-100 border-2 border-black rounded font-bold">
                                  {badge}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {projects.length > ITEMS_TO_SHOW && (
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={() => setShowAllProjects(!showAllProjects)}
                        className="px-8 py-3 bg-black text-white border-3 border-black rounded-xl font-bold hover:bg-gray-800 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                      >
                        {showAllProjects ? '← Show Less' : 'Show More →'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
