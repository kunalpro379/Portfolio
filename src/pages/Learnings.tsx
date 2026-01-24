import { Clock, Calendar, ArrowLeft, FolderOpen, FileText, BookOpen, Code, FileImage, Plus, Github } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { API_ENDPOINTS, API_BASE_URL } from "@/config/api";
import ExcalidrawCanvas from "@/components/ExcalidrawCanvas";

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

interface CodeFolder {
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

interface GitHubRepo {
  _id: string;
  name: string;
  owner: string;
  fullName: string;
  description: string;
  url: string;
  defaultBranch: string;
  isPrivate: boolean;
  createdAt: string;
}

export default function LearningsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'blogs';
  const [activeTab, setActiveTab] = useState<'notes' | 'documentation' | 'blogs' | 'projects' | 'diagrams' | 'code'>(tabFromUrl as any);

  // State for API data
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [documentation, setDocumentation] = useState<Documentation[]>([]);
  const [diagrams, setDiagrams] = useState<any[]>([]);
  const [codeFiles, setCodeFiles] = useState<CodeFolder[]>([]);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Canvas state
  const [activeCanvas, setActiveCanvas] = useState<string | null>(null);
  const [canvasData, setCanvasData] = useState<any>(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCanvas, setSelectedCanvas] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [newCanvasName, setNewCanvasName] = useState('');
  const [newCanvasPublic, setNewCanvasPublic] = useState(false);

  // Check for canvas parameter in URL
  const canvasIdFromUrl = searchParams.get('canvas');

  useEffect(() => {
    if (canvasIdFromUrl) {
      loadCanvasFromShare(canvasIdFromUrl);
    }
  }, [canvasIdFromUrl]);

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
            const projectsRes = await fetch(`${API_BASE_URL}${API_ENDPOINTS.projects}`);
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
            const blogsRes = await fetch(`${API_BASE_URL}${API_ENDPOINTS.blogs}`);
            if (!blogsRes.ok) throw new Error('Failed to fetch blogs');
            const blogsData = await blogsRes.json();
            setBlogs(blogsData.blogs);
            break;

          case 'notes':
            const notesRes = await fetch(`${API_BASE_URL}${API_ENDPOINTS.notes}/folders`);
            if (!notesRes.ok) throw new Error('Failed to fetch notes');
            const notesData = await notesRes.json();
            console.log('Notes data received:', notesData.folders);
            // Filter out any folders without folderId
            const validFolders = notesData.folders.filter((f: Note) => f.folderId);
            console.log('Valid folders:', validFolders);
            setNotes(validFolders);
            break;

          case 'documentation':
            const docsRes = await fetch(`${API_BASE_URL}${API_ENDPOINTS.documentation}`);
            if (!docsRes.ok) throw new Error('Failed to fetch documentation');
            const docsData = await docsRes.json();
            setDocumentation(docsData.docs);
            break;

          case 'diagrams':
            const diagramsRes = await fetch(`${API_BASE_URL}${API_ENDPOINTS.diagrams}`);
            if (!diagramsRes.ok) throw new Error('Failed to fetch diagrams');
            const diagramsData = await diagramsRes.json();
            setDiagrams(diagramsData.canvases || []);
            break;

          case 'code':
            // Fetch both code folders and GitHub repos in parallel
            const [codeRes, githubRes] = await Promise.allSettled([
              fetch(`${API_BASE_URL}${API_ENDPOINTS.code}/folders?parentPath=`),
              fetch(`${API_BASE_URL}${API_ENDPOINTS.github.repos}`)
            ]);

            // Handle code folders
            if (codeRes.status === 'fulfilled' && codeRes.value.ok) {
              const codeData = await codeRes.value.json();
              setCodeFiles(codeData.folders || []);
            } else {
              console.error('Failed to fetch code folders');
              setCodeFiles([]);
            }

            // Handle GitHub repos
            if (githubRes.status === 'fulfilled' && githubRes.value.ok) {
              const githubData = await githubRes.value.json();
              setGithubRepos(githubData.repos || []);
            } else {
              console.error('Failed to fetch GitHub repos');
              setGithubRepos([]);
            }
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

  const changeTab = (tab: 'notes' | 'documentation' | 'blogs' | 'projects' | 'diagrams' | 'code') => {
    setSearchParams({ tab });
    setActiveTab(tab);
  };

  const loadCanvasFromShare = async (canvasId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/diagrams/${canvasId}`);
      
      if (!response.ok) throw new Error('Failed to load canvas');
      
      const responseData = await response.json();
      const isPublicCanvas = responseData.canvas.isPublic;
      
      // Share link behavior: Public = edit mode, Private = view only
      setCanvasData(responseData.data);
      setActiveCanvas(canvasId);
      setViewOnly(!isPublicCanvas);
    } catch (error) {
      console.error('Error loading canvas:', error);
      alert('Failed to load canvas');
    }
  };

  const handleCanvasClick = (canvas: any) => {
    setSelectedCanvas(canvas);
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = () => {
    if (password === 'kunal') {
      setShowPasswordModal(false);
      setPassword('');
      if (selectedCanvas) {
        loadCanvasWithPassword(selectedCanvas.canvasId);
      }
    } else {
      alert('Incorrect password!');
    }
  };

  const loadCanvasWithPassword = async (canvasId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/diagrams/${canvasId}`);
      
      if (!response.ok) throw new Error('Failed to load canvas');
      
      const responseData = await response.json();
      
      // Direct access with password = always editable
      setCanvasData(responseData.data);
      setActiveCanvas(canvasId);
      setViewOnly(false);
    } catch (error) {
      console.error('Error loading canvas:', error);
      alert('Failed to load canvas');
    }
  };

  const handleCreateCanvas = async () => {
    if (!newCanvasName.trim()) {
      alert('Please enter a canvas name');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/diagrams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCanvasName,
          isPublic: newCanvasPublic,
          data: { elements: [], appState: {} }
        })
      });

      if (!response.ok) throw new Error('Failed to create canvas');

      const data = await response.json();
      setShowCreateModal(false);
      setNewCanvasName('');
      setNewCanvasPublic(false);
      
      // Open the newly created canvas in edit mode
      setCanvasData({ elements: [], appState: {} });
      setActiveCanvas(data.canvasId);
      setViewOnly(false);
      
      // Refresh diagrams list
      if (activeTab === 'diagrams') {
        const diagramsRes = await fetch(`${API_BASE_URL}${API_ENDPOINTS.diagrams}`);
        if (diagramsRes.ok) {
          const diagramsData = await diagramsRes.json();
          setDiagrams(diagramsData.canvases || []);
        }
      }
    } catch (error) {
      console.error('Error creating canvas:', error);
      alert('Failed to create canvas');
    }
  };

  const handleSaveCanvas = async (data: any) => {
    if (!activeCanvas) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/diagrams/${activeCanvas}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data })
      });

      if (!response.ok) throw new Error('Failed to save canvas');
    } catch (error) {
      console.error('Error saving canvas:', error);
      throw error;
    }
  };

  // If canvas is active, show full-screen canvas
  if (activeCanvas) {
    const currentCanvas = diagrams.find(c => c.canvasId === activeCanvas);
    const canvasIsPublic = currentCanvas?.isPublic || false;
    
    return (
      <ExcalidrawCanvas
        canvasId={activeCanvas}
        isPublic={canvasIsPublic}
        onClose={() => {
          setActiveCanvas(null);
          setCanvasData(null);
          setViewOnly(false);
          navigate('/learnings?tab=diagrams');
        }}
        onSave={handleSaveCanvas}
        initialData={canvasData}
        viewOnly={viewOnly}
      />
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0 opacity-30"
        style={{
          backgroundImage: 'url(/page14.png)',
          backgroundSize: 'auto',
          backgroundPosition: 'top left',
          backgroundRepeat: 'repeat',
        }}
      />
      
      {/* Fixed Header */}
      <div className="bg-gray-50/80 backdrop-blur-sm border-b-4 border-black p-4 md:p-6 z-50 shadow-lg relative flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Layout - Original */}
          <div className="block md:hidden">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-black mb-3 font-bold text-sm transition-all hover:gap-3"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
              Back to Home
            </button>

            <div className="mb-4">
              <h1 className="text-3xl font-black text-black mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                My Learnings
              </h1>
              <p className="text-sm text-gray-600 font-medium">
                Explore my journey through code, design, and documentation
              </p>
            </div>
          </div>

          {/* Desktop Layout - New */}
          <div className="hidden md:block">
            <div className="flex items-start justify-between mb-4">
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 text-gray-600 hover:text-black font-bold text-base transition-all hover:gap-3 self-start"
                >
                  <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
                  Back to Home
                </button>
                <p className="text-base text-black font-medium">
                  Explore my journey through code, design, and documentation
                </p>
              </div>
              
              <div className="flex-shrink-0">
                <h1 className="text-4xl font-black text-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  My Learnings
                </h1>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-6 gap-1 md:gap-2 mt-4">
            <button
              onClick={() => changeTab('blogs')}
              className={`px-1.5 md:px-6 py-1.5 md:py-3 rounded-lg md:rounded-xl font-bold text-[10px] md:text-sm transition-all border-2 md:border-3 border-black ${activeTab === 'blogs'
                  ? 'bg-pink-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -translate-y-0.5'
                  : 'bg-white hover:bg-pink-50 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              style={{
                borderRadius: '12px 15px 13px 14px',
              }}
            >
              Blogs
            </button>
            <button
              onClick={() => changeTab('documentation')}
              className={`px-1.5 md:px-6 py-1.5 md:py-3 rounded-lg md:rounded-xl font-bold text-[10px] md:text-sm transition-all border-2 md:border-3 border-black ${activeTab === 'documentation'
                  ? 'bg-blue-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -translate-y-0.5'
                  : 'bg-white hover:bg-blue-50 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              style={{
                borderRadius: '14px 12px 15px 13px',
              }}
            >
              Docs
            </button>
            <button
              onClick={() => changeTab('notes')}
              className={`px-1.5 md:px-6 py-1.5 md:py-3 rounded-lg md:rounded-xl font-bold text-[10px] md:text-sm transition-all border-2 md:border-3 border-black ${activeTab === 'notes'
                  ? 'bg-yellow-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -translate-y-0.5'
                  : 'bg-white hover:bg-yellow-50 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              style={{
                borderRadius: '13px 14px 12px 15px',
              }}
            >
              Notes
            </button>
            <button
              onClick={() => changeTab('code')}
              className={`px-1.5 md:px-6 py-1.5 md:py-3 rounded-lg md:rounded-xl font-bold text-[10px] md:text-sm transition-all border-2 md:border-3 border-black ${activeTab === 'code'
                  ? 'bg-orange-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -translate-y-0.5'
                  : 'bg-white hover:bg-orange-50 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              style={{
                borderRadius: '15px 13px 14px 12px',
              }}
            >
              Code
            </button>
            <button
              onClick={() => changeTab('diagrams')}
              className={`px-1.5 md:px-6 py-1.5 md:py-3 rounded-lg md:rounded-xl font-bold text-[10px] md:text-sm transition-all border-2 md:border-3 border-black ${activeTab === 'diagrams'
                  ? 'bg-purple-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -translate-y-0.5'
                  : 'bg-white hover:bg-purple-50 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              style={{
                borderRadius: '15px 13px 14px 12px',
              }}
            >
              Diagrams
            </button>
            <button
              onClick={() => changeTab('projects')}
              className={`px-1.5 md:px-6 py-1.5 md:py-3 rounded-lg md:rounded-xl font-bold text-[10px] md:text-sm transition-all border-2 md:border-3 border-black ${activeTab === 'projects'
                  ? 'bg-green-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -translate-y-0.5'
                  : 'bg-white hover:bg-green-50 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              style={{
                borderRadius: '12px 15px 13px 14px',
              }}
            >
              Projects
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Main Content */}
      <main className="flex-1 overflow-y-auto bg-transparent p-4 md:p-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 animate-spin">
                  <svg className="w-32 h-32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path
                      d="M4 12a8 8 0 0 1 8-8V2.5L14.5 5 12 7.5V6a6 6 0 0 0-6 6h-2z"
                      className="text-black"
                    />
                    <path
                      d="M20 12a8 8 0 0 1-8 8v1.5L9.5 19 12 16.5V18a6 6 0 0 0 6-6h2z"
                      className="text-black"
                    />
                  </svg>
                </div>
              </div>
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                    {notes.length === 0 ? (
                      <div className="col-span-full text-center py-16">
                        <div className="bg-gray-50/70 backdrop-blur-sm border-3 border-black rounded-2xl p-10 inline-block shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                          <FolderOpen size={48} strokeWidth={2.5} className="mx-auto mb-3 text-yellow-500" />
                          <p className="text-gray-600 text-base font-bold">No notes folders yet</p>
                        </div>
                      </div>
                    ) : (
                      notes.map((note) => (
                        <div
                          key={note.folderId}
                          onClick={() => {
                            if (note.folderId) {
                              navigate(`/learnings/notes/${note.folderId}`);
                            } else {
                              console.error('Note folderId is missing:', note);
                            }
                          }}
                          className="bg-gray-50/70 backdrop-blur-sm border-3 border-black rounded-xl p-4 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer hover:-translate-y-1 group"
                          style={{ borderRadius: '12px 15px 13px 14px' }}
                        >
                          <div className="flex flex-col items-center text-center gap-2">
                            <div className="p-2.5 bg-yellow-300 border-2 border-black rounded-lg group-hover:rotate-6 transition-transform" style={{ borderRadius: '8px 10px 9px 11px' }}>
                              <FolderOpen size={24} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-sm font-black text-black line-clamp-2">{note.name}</h3>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              {/* DOCUMENTATION TAB */}
              {activeTab === 'documentation' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documentation.length === 0 ? (
                      <div className="col-span-full text-center py-16">
                        <div className="bg-gray-50/70 backdrop-blur-sm border-3 border-black rounded-2xl p-10 inline-block shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                          <BookOpen size={48} strokeWidth={2.5} className="mx-auto mb-3 text-blue-500" />
                          <p className="text-gray-600 text-base font-bold">No documentation yet</p>
                        </div>
                      </div>
                    ) : (
                      documentation.map((doc) => (
                        <div
                          key={doc.docId}
                          onClick={() => navigate(`/learnings/documentation/${doc.docId}`)}
                          className="bg-gray-50/70 backdrop-blur-sm border-3 border-black rounded-xl p-5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer hover:-translate-y-1 group h-full flex flex-col"
                          style={{ borderRadius: '14px 16px 15px 17px' }}
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className="p-2.5 bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-black rounded-lg group-hover:rotate-6 transition-transform flex-shrink-0" style={{ borderRadius: '8px 10px 9px 11px' }}>
                              <FileText size={20} strokeWidth={2.5} className="text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="px-2 py-1 bg-blue-100 border-2 border-black rounded-md text-[10px] font-bold uppercase tracking-wide">
                                  {doc.subject}
                                </span>
                                {doc.isPublic && (
                                  <span className="px-2 py-1 bg-green-100 border-2 border-black rounded-md text-[10px] font-bold uppercase tracking-wide">
                                    Public
                                  </span>
                                )}
                              </div>
                              <h3 className="text-base font-black text-black mb-2 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                                {doc.title}
                              </h3>
                            </div>
                          </div>
                          
                          {doc.description && (
                            <p className="text-gray-700 mb-3 font-medium leading-relaxed line-clamp-2 text-sm">
                              {doc.description}
                            </p>
                          )}
                          
                          {doc.tags && doc.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {doc.tags.slice(0, 3).map((tag, i) => (
                                <span key={i} className="px-2 py-0.5 text-[10px] bg-gray-100 border-2 border-black rounded-full font-bold">
                                  #{tag}
                                </span>
                              ))}
                              {doc.tags.length > 3 && (
                                <span className="px-2 py-0.5 text-[10px] bg-gray-200 border-2 border-black rounded-full font-bold">
                                  +{doc.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                          
                          <div className="mt-auto pt-3 border-t-2 border-gray-200">
                            <div className="flex items-center gap-3 text-xs text-gray-600 font-bold">
                              {doc.date && (
                                <div className="flex items-center gap-1.5">
                                  <Calendar size={14} strokeWidth={2.5} className="text-blue-500" />
                                  <span>{doc.date}</span>
                                </div>
                              )}
                              {doc.time && (
                                <div className="flex items-center gap-1.5">
                                  <Clock size={14} strokeWidth={2.5} className="text-blue-500" />
                                  <span>{doc.time}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              {/* BLOGS TAB */}
              {activeTab === 'blogs' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {blogs.length === 0 ? (
                      <div className="col-span-full text-center py-16">
                        <div className="bg-gray-50/70 backdrop-blur-sm border-3 border-black rounded-2xl p-10 inline-block shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                          <FileText size={48} strokeWidth={2.5} className="mx-auto mb-3 text-pink-500" />
                          <p className="text-gray-600 text-base font-bold">No blogs yet</p>
                        </div>
                      </div>
                    ) : (
                      blogs.map((blog) => (
                        <div
                          key={blog.blogId}
                          onClick={() => navigate(`/learnings/blogs/${blog.blogId}`)}
                          className="bg-gray-50/70 backdrop-blur-sm border-3 border-black rounded-xl overflow-hidden hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer hover:-translate-y-1 group"
                          style={{ borderRadius: '14px 16px 15px 17px' }}
                        >
                          {blog.coverImage && (
                            <div className="relative overflow-hidden">
                              <img
                                src={blog.coverImage}
                                alt={blog.title}
                                className="w-full h-32 object-cover border-b-3 border-black group-hover:scale-105 transition-transform"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <div className="mb-2">
                              <span className="px-2 py-1 bg-pink-100 border-2 border-black rounded-md text-[10px] font-bold">
                                {blog.subject}
                              </span>
                            </div>
                            <h3 className="text-sm font-black text-black mb-2 line-clamp-2">{blog.title}</h3>
                            <p className="text-gray-700 mb-3 font-medium text-xs line-clamp-2">{blog.shortDescription}</p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-600 font-medium">
                              <div className="flex items-center gap-1">
                                <Calendar size={10} strokeWidth={2.5} />
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
                </>
              )}

              {/* PROJECTS TAB */}
              {activeTab === 'projects' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {projects.length === 0 ? (
                      <div className="col-span-full text-center py-16">
                        <div className="bg-gray-50/70 backdrop-blur-sm border-3 border-black rounded-2xl p-10 inline-block shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                          <Code size={48} strokeWidth={2.5} className="mx-auto mb-3 text-green-500" />
                          <p className="text-gray-600 text-base font-bold">No projects yet</p>
                        </div>
                      </div>
                    ) : (
                      projects.map((project) => (
                        <div
                          key={project.id}
                          onClick={() => navigate(`/projects/${project.id}`)}
                          className="bg-gray-50/70 backdrop-blur-sm border-3 border-black rounded-xl overflow-hidden hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer hover:-translate-y-1 group"
                          style={{ borderRadius: '14px 16px 15px 17px' }}
                        >
                          {project.image && (
                            <img
                              src={project.image}
                              alt={project.title}
                              className="w-full h-32 object-cover border-b-3 border-black group-hover:scale-105 transition-transform"
                            />
                          )}
                          <div className="p-4">
                            <h3 className="text-sm font-black text-black mb-2 line-clamp-2">{project.title}</h3>
                            <p className="text-gray-700 mb-3 font-medium text-xs line-clamp-2">{project.tagline}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {project.badges.slice(0, 2).map((badge, i) => (
                                <span key={i} className="px-2 py-0.5 text-[10px] bg-green-100 border-2 border-black rounded font-bold">
                                  {badge}
                                </span>
                              ))}
                              {project.badges.length > 2 && (
                                <span className="px-2 py-0.5 text-[10px] bg-gray-200 border-2 border-black rounded font-bold">
                                  +{project.badges.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              {/* CODE TAB */}
              {activeTab === 'code' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {/* Local Code Folders */}
                    {codeFiles.map((folder) => (
                      <div
                        key={folder.folderId}
                        onClick={() => {
                          navigate(`/learnings/code?folder=${encodeURIComponent(folder.path)}`);
                        }}
                        className="bg-gray-50/70 backdrop-blur-sm border-3 border-black rounded-xl p-4 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer hover:-translate-y-1 group"
                        style={{ borderRadius: '12px 15px 13px 14px' }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 bg-orange-300 border-2 border-black rounded-lg group-hover:rotate-6 transition-transform flex-shrink-0" style={{ borderRadius: '8px 10px 9px 11px' }}>
                            <Code size={20} strokeWidth={2.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-black text-black mb-1">{folder.name}</h3>
                            <p className="text-xs text-gray-600">Local Folder</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* GitHub Repositories */}
                    {githubRepos.map((repo) => (
                      <div
                        key={repo._id}
                        onClick={() => {
                          navigate(`/learnings/code?repo=${repo._id}`);
                        }}
                        className="bg-gray-50/70 backdrop-blur-sm border-3 border-black rounded-xl p-4 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer hover:-translate-y-1 group"
                        style={{ borderRadius: '12px 15px 13px 14px' }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 bg-gray-300 border-2 border-black rounded-lg group-hover:rotate-6 transition-transform flex-shrink-0" style={{ borderRadius: '8px 10px 9px 11px' }}>
                            <Github size={20} strokeWidth={2.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-black text-black truncate">{repo.name}</h3>
                              {repo.isPrivate && (
                                <span className="px-1 py-0.5 bg-red-100 border border-red-300 rounded text-[8px] font-bold text-red-800">
                                  Private
                                </span>
                              )}
                            </div>
                            {repo.description ? (
                              <p className="text-xs text-gray-600 line-clamp-2">{repo.description}</p>
                            ) : (
                              <p className="text-xs text-gray-600">{repo.fullName}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Empty State */}
                    {codeFiles.length === 0 && githubRepos.length === 0 && (
                      <div className="col-span-full text-center py-16">
                        <div className="bg-gray-50/70 backdrop-blur-sm border-3 border-black rounded-2xl p-10 inline-block shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                          <Code size={48} strokeWidth={2.5} className="mx-auto mb-3 text-orange-500" />
                          <p className="text-gray-600 text-base font-bold">No code files or repositories found</p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* DIAGRAMS TAB */}
              {activeTab === 'diagrams' && (
                <>
                  {/* Create Button */}
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-6 py-2.5 bg-purple-500 text-white border-3 border-black rounded-xl font-bold hover:bg-purple-600 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] text-sm flex items-center gap-2"
                      style={{ borderRadius: '12px 15px 13px 14px' }}
                    >
                      <Plus size={20} strokeWidth={2.5} />
                      <span>New Canvas</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                    {diagrams.length === 0 ? (
                      <div className="col-span-full text-center py-16">
                        <div className="bg-gray-50/70 backdrop-blur-sm border-3 border-black rounded-2xl p-10 inline-block shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]" style={{ borderRadius: '20px 25px 22px 24px' }}>
                          <FileImage size={48} strokeWidth={2.5} className="mx-auto mb-3 text-purple-500" />
                          <p className="text-gray-600 text-base font-bold">No diagrams yet</p>
                        </div>
                      </div>
                    ) : (
                      diagrams.map((diagram) => (
                        <div
                          key={diagram.canvasId}
                          onClick={() => handleCanvasClick(diagram)}
                          className="bg-gray-50/70 backdrop-blur-sm border-3 border-black rounded-xl p-4 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer hover:-translate-y-1 group"
                          style={{ borderRadius: '12px 15px 13px 14px' }}
                        >
                          <div className="flex flex-col items-center text-center gap-2">
                            <div className="p-2.5 bg-purple-300 border-2 border-black rounded-lg group-hover:rotate-6 transition-transform" style={{ borderRadius: '8px 10px 9px 11px' }}>
                              <FileImage size={24} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-sm font-black text-black line-clamp-2">{diagram.name}</h3>
                            <p className="text-[10px] text-gray-600 font-medium">
                              {new Date(diagram.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white border-4 border-black rounded-2xl p-6 max-w-md w-full shadow-2xl" style={{ borderRadius: '20px 25px 22px 24px' }}>
            <h3 className="text-2xl font-black mb-4"> Enter Password</h3>
            
            <div className="mb-6">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                placeholder="Enter password"
                className="w-full px-4 py-2 border-2 border-black rounded-lg font-medium"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setSelectedCanvas(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 border-2 border-black rounded-lg font-bold hover:bg-gray-300 transition-all"
                style={{ borderRadius: '10px 12px 11px 13px' }}
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="flex-1 px-4 py-2 bg-black text-white border-2 border-black rounded-lg font-bold hover:bg-gray-800 transition-all"
                style={{ borderRadius: '10px 12px 11px 13px' }}
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Canvas Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white border-4 border-black rounded-2xl p-6 max-w-md w-full shadow-2xl" style={{ borderRadius: '20px 25px 22px 24px' }}>
            <h3 className="text-2xl font-black mb-4">Create New Canvas</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Canvas Name</label>
              <input
                type="text"
                value={newCanvasName}
                onChange={(e) => setNewCanvasName(e.target.value)}
                placeholder="My Awesome Diagram"
                className="w-full px-4 py-2 border-2 border-black rounded-lg font-medium"
              />
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newCanvasPublic}
                  onChange={(e) => setNewCanvasPublic(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="font-bold text-sm">
                  Make Public (Anyone with link can edit)
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewCanvasName('');
                  setNewCanvasPublic(false);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 border-2 border-black rounded-lg font-bold hover:bg-gray-300 transition-all"
                style={{ borderRadius: '10px 12px 11px 13px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCanvas}
                className="flex-1 px-4 py-2 bg-purple-500 text-white border-2 border-black rounded-lg font-bold hover:bg-purple-600 transition-all"
                style={{ borderRadius: '10px 12px 11px 13px' }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

