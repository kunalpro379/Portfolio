import { Clock, Calendar, ArrowLeft, FolderOpen, FileText, BookOpen, Code, Code2, FileImage, Plus, Github, Menu, X, Home, LogOut, Eye, Edit, Trash2, ListTodo, ChevronRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { API_ENDPOINTS, API_BASE_URL } from "@/config/api";
import ExcalidrawCanvas from "@/components/ExcalidrawCanvas";
import LoadingSpinner from "@/components/LoadingSpinner";
import NotesTabContent from "@/components/NotesTabContent";
import GtaMumbaiMap from "@/components/GtaMumbaiMap";

interface ProjectData {
  size?: "big" | "small" | "large" | "medium"
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
  language?: string;
  description?: string;
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
  coverImage?: string;
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
  const [activeTab, setActiveTab] = useState<'guide' | 'files' | 'todo' | 'dsa' | 'documentation' | 'blogs' | 'projects' | 'diagrams' | 'code'>(tabFromUrl as any);

  // State for API data
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [documentation, setDocumentation] = useState<Documentation[]>([]);
  const [diagrams, setDiagrams] = useState<any[]>([]);
  const [codeFiles, setCodeFiles] = useState<CodeFolder[]>([]);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [dsaProjects, setDsaProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navigating, setNavigating] = useState(false);
  
  // Search states
  const [blogSearch, setBlogSearch] = useState('');
  const [docSearch, setDocSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [diagramSearch, setDiagramSearch] = useState('');
  const [todoSearch, setTodoSearch] = useState('');
  const [guideSearch, setGuideSearch] = useState('');

  // Canvas state
  const [activeCanvas, setActiveCanvas] = useState<string | null>(null);
  const [activeViewerId, setActiveViewerId] = useState<string | null>(null);
  const [canvasData, setCanvasData] = useState<any>(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [diagramAuthenticated, setDiagramAuthenticated] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCanvas, setSelectedCanvas] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [editPassword, setEditPassword] = useState<string | null>(null); // Store password for saving
  const [newCanvasName, setNewCanvasName] = useState('');
  const [newCanvasPublic, setNewCanvasPublic] = useState(false);
  const [showViewEditModal, setShowViewEditModal] = useState(false);
  const [createdCanvasId, setCreatedCanvasId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareableLink, setShareableLink] = useState('');
  const [isLoadingDiagram, setIsLoadingDiagram] = useState(false);
  const [showDeletePasswordModal, setShowDeletePasswordModal] = useState(false);
  const [deleteCanvasId, setDeleteCanvasId] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  
  // Code folder creation modal state
  const [showCreateCodeFolderModal, setShowCreateCodeFolderModal] = useState(false);
  const [codeFolderName, setCodeFolderName] = useState('');
  const [codeFolderDescription, setCodeFolderDescription] = useState('');
  const [codeFolderLanguage, setCodeFolderLanguage] = useState('python');
  const [creatingCodeFolder, setCreatingCodeFolder] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Check for canvas parameter in URL
  const canvasIdFromUrl = searchParams.get('canvas');
  const viewerIdFromUrl = searchParams.get('viewer');

  useEffect(() => {
    if (canvasIdFromUrl) {
      loadCanvasFromShare(canvasIdFromUrl);
    } else if (viewerIdFromUrl) {
      loadCanvasAsViewer(viewerIdFromUrl);
    }
  }, [canvasIdFromUrl, viewerIdFromUrl]);

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

          case 'files':
            const notesRes = await fetch(`${API_BASE_URL}${API_ENDPOINTS.notes}/folders`);
            if (!notesRes.ok) throw new Error('Failed to fetch notes');
            const notesData = await notesRes.json();
            console.log('Notes data received:', notesData.folders);
            // Filter out any folders without folderId
            const validFolders = notesData.folders.filter((f: Note) => f.folderId);
            console.log('Valid folders:', validFolders);
            setNotes(validFolders);
            break;

          case 'guide':
          case 'todo':
            // These tabs don't need API calls, handled by NotesTabContent
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
            // Fetch code folders, GitHub repos, and DSA projects in parallel
            const [codeRes, githubRes, dsaRes] = await Promise.allSettled([
              fetch(`${API_BASE_URL}${API_ENDPOINTS.code}/folders?parentPath=`),
              fetch(`${API_BASE_URL}${API_ENDPOINTS.github.repos}`),
              fetch(`${API_BASE_URL}/api/dsa`)
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

            // Handle DSA projects
            if (dsaRes.status === 'fulfilled' && dsaRes.value.ok) {
              const dsaData = await dsaRes.value.json();
              setDsaProjects(dsaData.projects || []);
            } else {
              console.error('Failed to fetch DSA projects');
              setDsaProjects([]);
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

  const handleNavigate = (path: string) => {
    setNavigating(true);
    setTimeout(() => {
      navigate(path);
    }, 300);
  };

  const changeTab = (tab: 'guide' | 'files' | 'todo' | 'documentation' | 'blogs' | 'projects' | 'diagrams' | 'code') => {
    setSearchParams({ tab });
    setActiveTab(tab);
  };

  const handleCreateBlog = () => {
    handleNavigate('/learnings/blogs/create');
  };

  const handleCreateCodeFolder = async () => {
    if (!codeFolderName.trim()) {
      alert('Please enter a codebook name');
      return;
    }

    try {
      setCreatingCodeFolder(true);
      const timestamp = new Date().toISOString();
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.code}/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: codeFolderName,
          description: codeFolderDescription,
          language: codeFolderLanguage,
          parentPath: '',
          createdAt: timestamp,
        }),
      });

      if (!response.ok) throw new Error('Failed to create codebook');

      const data = await response.json();
      
      // Close modal and reset form
      setShowCreateCodeFolderModal(false);
      setCodeFolderName('');
      setCodeFolderDescription('');
      setCodeFolderLanguage('python');
      
      // Navigate to code editor with the new folder
      if (data.folder) {
        navigate(`/learnings/code-editor?folder=${encodeURIComponent(data.folder.path)}`);
      }
    } catch (error) {
      console.error('Error creating codebook:', error);
      alert('Failed to create codebook');
    } finally {
      setCreatingCodeFolder(false);
    }
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

  const loadCanvasAsViewer = async (canvasId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/diagrams/${canvasId}`);
      
      if (!response.ok) throw new Error('Failed to load canvas');
      
      const responseData = await response.json();
      
      // Viewer link always loads in view-only mode
      setCanvasData(responseData.data);
      setActiveCanvas(canvasId);
      setViewOnly(true);
    } catch (error) {
      console.error('Error loading canvas:', error);
      alert('Failed to load canvas');
    }
  };

  const handleDeleteDiagram = async (canvasId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Show password modal
    setDeleteCanvasId(canvasId);
    setShowDeletePasswordModal(true);
  };

  const handleConfirmDelete = async () => {
    if (deletePassword !== 'kunal') {
      alert('Incorrect password!');
      return;
    }

    if (!deleteCanvasId) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/diagrams/${deleteCanvasId}`, {
        method: 'DELETE',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete diagram');
      
      // Refresh diagrams list
      const diagramsRes = await fetch(`${API_BASE_URL}/api/diagrams`);
      if (diagramsRes.ok) {
        const diagramsData = await diagramsRes.json();
        setDiagrams(diagramsData.canvases || []);
      }
      
      // Close modal and reset
      setShowDeletePasswordModal(false);
      setDeleteCanvasId(null);
      setDeletePassword('');
      
      alert('Architecture diagram deleted successfully');
    } catch (error) {
      console.error('Error deleting diagram:', error);
      alert('Failed to delete diagram');
    }
  };

  const handleCanvasClick = (canvas: any) => {
    setSelectedCanvas(canvas);
    setShowViewEditModal(true);
  };

  const handlePasswordSubmit = () => {
    if (password === 'kunal') {
      setEditPassword(password); // Store password for saving
      setPassword('');
      setDiagramAuthenticated(true);
      const canvasToLoad = createdCanvasId || selectedCanvas?.canvasId;
      if (canvasToLoad) {
        loadCanvasWithPassword(canvasToLoad);
        setCreatedCanvasId(null);
      }
    } else {
      alert('Incorrect password!');
    }
  };

  const loadCanvasWithPassword = async (canvasId: string) => {
    try {
      setIsLoadingDiagram(true);
      const response = await fetch(`${API_BASE_URL}/api/diagrams/${canvasId}`);
      
      if (!response.ok) throw new Error('Failed to load canvas');
      
      const responseData = await response.json();
      
      // Direct access with password = always editable
      setCanvasData(responseData.data);
      setActiveCanvas(canvasId);
      setActiveViewerId(responseData.canvas.viewerId);
      setViewOnly(false);
    } catch (error) {
      console.error('Error loading canvas:', error);
      alert('Failed to load canvas');
    } finally {
      setIsLoadingDiagram(false);
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
      
      // Store created canvas ID and show view/edit modal
      setCreatedCanvasId(data.canvasId);
      setShowViewEditModal(true);
      
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
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/diagrams/${activeCanvas}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ 
          data
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save canvas');
      }
    } catch (error) {
      console.error('Error saving canvas:', error);
      throw error;
    }
  };

  const handleViewDiagram = async (canvasId: string) => {
    try {
      setIsLoadingDiagram(true);
      const response = await fetch(`${API_BASE_URL}/api/diagrams/${canvasId}`);
      if (!response.ok) throw new Error('Failed to load canvas');
      
      const responseData = await response.json();
      setCanvasData(responseData.data);
      setActiveCanvas(canvasId);
      setActiveViewerId(responseData.canvas.viewerId);
      setViewOnly(true);
      setShowViewEditModal(false);
    } catch (error) {
      console.error('Error loading canvas:', error);
      alert('Failed to load canvas');
    } finally {
      setIsLoadingDiagram(false);
    }
  };

  const handleEditDiagram = () => {
    setShowViewEditModal(false);
    setShowPasswordModal(true);
  };

  const handleShareDiagram = (canvas: any) => {
    const viewerLink = canvas.viewerId 
      ? `${window.location.origin}/learnings/diagrams?viewer=${canvas.viewerId}`
      : `${window.location.origin}/learnings/diagrams?canvas=${canvas.canvasId}`;
    setShareableLink(viewerLink);
    setSelectedCanvas(canvas);
    setShowShareModal(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableLink);
    alert('Link copied to clipboard!');
  };

  // If canvas is active, show full-screen canvas
  if (activeCanvas) {
    const currentCanvas = diagrams.find(c => c.canvasId === activeCanvas);
    const canvasIsPublic = currentCanvas?.isPublic || false;
    
    return (
      <ExcalidrawCanvas
        canvasId={activeCanvas}
        viewerId={activeViewerId || undefined}
        isPublic={canvasIsPublic}
        onClose={() => {
          setActiveCanvas(null);
          setActiveViewerId(null);
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
    <div className="h-screen bg-transparent flex flex-col overflow-hidden relative">
      {/* Loading Overlay */}
      {navigating && (
        <div className="fixed inset-0 bg-gray-100 z-[9999] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )}
      
      {/* Static Background Image for Mobile */}
      <div className="fixed inset-0 z-0 md:hidden">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/back11.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'grayscale(100%)',
            opacity: 0.45
          }}
        />
      </div>

      {/* Animated Background Images - Desktop Only */}
      <div className="fixed inset-0 z-0 hidden md:block">
        <style>{`
          @keyframes backgroundSlideshow {
            0% { opacity: 0; }
            8% { opacity: 0.55; }
            16% { opacity: 0.55; }
            24% { opacity: 0; }
            100% { opacity: 0; }
          }
          
          .bg-slide {
            position: absolute;
            inset: 0;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            filter: grayscale(100%);
            opacity: 0;
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
          }
          
          .bg-slide-1 { 
            animation: backgroundSlideshow 104s ease-in-out infinite 0s; 
            background-image: url(/back1.png); 
          }
          .bg-slide-2 { 
            animation: backgroundSlideshow 104s ease-in-out infinite 8s; 
            background-image: url(/back2.png); 
          }
          .bg-slide-3 { 
            animation: backgroundSlideshow 104s ease-in-out infinite 16s; 
            background-image: url(/back3.png); 
          }
          .bg-slide-4 { 
            animation: backgroundSlideshow 104s ease-in-out infinite 24s; 
            background-image: url(/back4.png); 
          }
          .bg-slide-5 { 
            animation: backgroundSlideshow 104s ease-in-out infinite 32s; 
            background-image: url(/back5.png); 
          }
          .bg-slide-6 { 
            animation: backgroundSlideshow 104s ease-in-out infinite 40s; 
            background-image: url(/back6.png); 
          }
          .bg-slide-7 { 
            animation: backgroundSlideshow 104s ease-in-out infinite 48s; 
            background-image: url(/back7.png); 
          }
          .bg-slide-8 { 
            animation: backgroundSlideshow 104s ease-in-out infinite 56s; 
            background-image: url(/back8.png); 
          }
          .bg-slide-9 { 
            animation: backgroundSlideshow 104s ease-in-out infinite 64s; 
            background-image: url(/back9.png); 
          }
          .bg-slide-10 { 
            animation: backgroundSlideshow 104s ease-in-out infinite 72s; 
            background-image: url(/back10.png); 
          }
          .bg-slide-11 { 
            animation: backgroundSlideshow 104s ease-in-out infinite 80s; 
            background-image: url(/back11.png); 
          }
          .bg-slide-12 { 
            animation: backgroundSlideshow 104s ease-in-out infinite 88s; 
            background-image: url(/back12.png); 
          }
          .bg-slide-13 { 
            animation: backgroundSlideshow 104s ease-in-out infinite 96s; 
            background-image: url(/back13.png); 
          }
        `}</style>
        
        <div className="bg-slide bg-slide-1" />
        <div className="bg-slide bg-slide-2" />
        <div className="bg-slide bg-slide-3" />
        <div className="bg-slide bg-slide-4" />
        <div className="bg-slide bg-slide-5" />
        <div className="bg-slide bg-slide-6" />
        <div className="bg-slide bg-slide-7" />
        <div className="bg-slide bg-slide-8" />
        <div className="bg-slide bg-slide-9" />
        <div className="bg-slide bg-slide-10" />
        <div className="bg-slide bg-slide-11" />
        <div className="bg-slide bg-slide-12" />
        <div className="bg-slide bg-slide-13" />
      </div>
      
      {/* Beautiful Gradient Background - Top to Bottom */}
      <div
        className="fixed inset-0 z-[1]"
        style={{
          background: 'linear-gradient(to bottom, rgba(243, 232, 255, 0.6) 0%, rgba(219, 234, 254, 0.6) 16.67%, rgba(220, 252, 231, 0.6) 33.33%, rgba(254, 252, 232, 0.6) 50%, rgba(255, 237, 213, 0.6) 66.67%, rgba(254, 226, 226, 0.6) 83.33%, rgba(254, 226, 226, 0.5) 100%)'
        }}
      />

      {/* Background Texture Pattern on Top */}
      <div className="fixed inset-0 z-[2] opacity-20 mix-blend-multiply" style={{ backgroundImage: 'url(/page7.png)', backgroundRepeat: 'repeat', filter: 'grayscale(100%) brightness(0)' }} />
      
      {/* Desktop-only MAP vertical strip */}
      <button
        onClick={() => setShowMap(!showMap)}
        className="hidden lg:flex fixed left-0 top-1/3 z-[300] h-36 w-12 items-center justify-center bg-gradient-to-b from-red-600 via-red-500 to-red-700 text-white font-black text-xs tracking-[0.12em] transition-all hover:w-14 active:scale-95 rounded-r-md"
        style={{
          writingMode: 'vertical-rl',
          textOrientation: 'upright',
          boxShadow: '3px 3px 0px 0px rgba(0,0,0,1), inset -2px -2px 6px rgba(0,0,0,0.28), inset 2px 2px 6px rgba(255,255,255,0.22)',
          border: '2px solid black',
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
        }}
      >
        MAP
      </button>
      
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/20 backdrop-blur-3xl border-b-4 border-black py-2 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6 z-[200] shadow-lg flex-shrink-0" style={{ backdropFilter: 'blur(80px) saturate(200%)' }}>
        <div className="max-w-7xl mx-auto">
          {/* Mobile Layout - Original */}
          <div className="block md:hidden">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-black font-bold text-xs sm:text-sm transition-all hover:gap-3"
              >
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
                <span className="hidden xs:inline">Back to Home</span>
                <span className="xs:hidden">Back</span>
              </button>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 bg-black text-white rounded-lg border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" strokeWidth={2.5} /> : <Menu className="w-5 h-5" strokeWidth={2.5} />}
              </button>
            </div>

            <div className="mb-4">
              {/* Removed heading and description */}
            </div>
          </div>

          {/* Desktop Layout - Professional Navbar */}
          <div className="hidden md:block">
            <div className="flex items-center justify-between">
              {/* Left: Back Arrow + Title */}
              <div className="flex items-center gap-2 lg:gap-4">
                <button
                  onClick={() => navigate('/')}
                  className="p-1.5 lg:p-2 hover:bg-gray-200 rounded-lg transition-all group"
                  aria-label="Back to home"
                >
                  <ArrowLeft className="w-5 h-5 lg:w-7 lg:h-7 text-gray-700 group-hover:text-black transition-colors" strokeWidth={2.5} />
                </button>
                <h1 className="text-lg lg:text-2xl font-black text-black">My Learning Repository</h1>
              </div>
              
              {/* Professional Navbar for Desktop */}
              <nav className="flex items-center gap-0.5 lg:gap-1 bg-white border-3 border-black rounded-2xl p-1 lg:p-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <button
                  onClick={() => changeTab('blogs')}
                  className={`px-3 lg:px-6 py-2 lg:py-2.5 rounded-xl font-bold text-xs lg:text-sm transition-all border-r border-gray-300 ${
                    activeTab === 'blogs'
                      ? 'bg-pink-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Blogs
                </button>
                <button
                  onClick={() => changeTab('documentation')}
                  className={`px-3 lg:px-6 py-2 lg:py-2.5 rounded-xl font-bold text-xs lg:text-sm transition-all border-r border-gray-300 ${
                    activeTab === 'documentation'
                      ? 'bg-blue-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Docs
                </button>
                <button
                  onClick={() => changeTab('guide')}
                  className={`px-3 lg:px-6 py-2 lg:py-2.5 rounded-xl font-bold text-xs lg:text-sm transition-all border-r border-gray-300 ${
                    activeTab === 'guide'
                      ? 'bg-yellow-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Guide
                </button>
                <button
                  onClick={() => changeTab('files')}
                  className={`px-3 lg:px-6 py-2 lg:py-2.5 rounded-xl font-bold text-xs lg:text-sm transition-all border-r border-gray-300 ${
                    activeTab === 'files'
                      ? 'bg-cyan-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Files
                </button>
                <button
                  onClick={() => changeTab('todo')}
                  className={`px-3 lg:px-6 py-2 lg:py-2.5 rounded-xl font-bold text-xs lg:text-sm transition-all border-r border-gray-300 ${
                    activeTab === 'todo'
                      ? 'bg-red-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Tasks
                </button>
                <button
                  onClick={() => changeTab('code')}
                  className={`px-3 lg:px-6 py-2 lg:py-2.5 rounded-xl font-bold text-xs lg:text-sm transition-all border-r border-gray-300 ${
                    activeTab === 'code'
                      ? 'bg-orange-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Code
                </button>
                <button
                  onClick={() => changeTab('diagrams')}
                  className={`px-2 lg:px-5 py-2 lg:py-2.5 rounded-xl font-bold text-xs lg:text-sm transition-all border-r border-gray-300 ${
                    activeTab === 'diagrams'
                      ? 'bg-purple-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="hidden lg:inline">Architectures</span>
                  <span className="lg:hidden">Arch</span>
                </button>
                <button
                  onClick={() => changeTab('projects')}
                  className={`px-3 lg:px-6 py-2 lg:py-2.5 rounded-xl font-bold text-xs lg:text-sm transition-all ${
                    activeTab === 'projects'
                      ? 'bg-green-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Projects
                </button>
              </nav>
            </div>
          </div>

          {/* Tabs - Mobile only - 8 tabs in grid */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-3 sm:mt-4 md:hidden px-2">
            <button
              onClick={() => changeTab('blogs')}
              className={`px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg font-bold text-[10px] sm:text-xs transition-all border-2 border-black ${activeTab === 'blogs'
                  ? 'bg-pink-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform -translate-y-0.5'
                  : 'bg-white hover:bg-pink-50 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                }`}
              style={{
                borderRadius: '12px 15px 13px 14px',
              }}
            >
              Blogs
            </button>
            <button
              onClick={() => changeTab('documentation')}
              className={`px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg font-bold text-[10px] sm:text-xs transition-all border-2 border-black ${activeTab === 'documentation'
                  ? 'bg-blue-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform -translate-y-0.5'
                  : 'bg-white hover:bg-blue-50 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                }`}
              style={{
                borderRadius: '14px 12px 15px 13px',
              }}
            >
              Docs
            </button>
            <button
              onClick={() => changeTab('guide')}
              className={`px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg font-bold text-[10px] sm:text-xs transition-all border-2 border-black ${activeTab === 'guide'
                  ? 'bg-yellow-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform -translate-y-0.5'
                  : 'bg-white hover:bg-yellow-50 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                }`}
              style={{
                borderRadius: '13px 14px 12px 15px',
              }}
            >
              Guide
            </button>
            <button
              onClick={() => changeTab('files')}
              className={`px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg font-bold text-[10px] sm:text-xs transition-all border-2 border-black ${activeTab === 'files'
                  ? 'bg-cyan-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform -translate-y-0.5'
                  : 'bg-white hover:bg-cyan-50 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                }`}
              style={{
                borderRadius: '15px 13px 14px 12px',
              }}
            >
              Files
            </button>
            <button
              onClick={() => changeTab('todo')}
              className={`px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg font-bold text-[10px] sm:text-xs transition-all border-2 border-black ${activeTab === 'todo'
                  ? 'bg-red-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform -translate-y-0.5'
                  : 'bg-white hover:bg-red-50 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                }`}
              style={{
                borderRadius: '12px 15px 13px 14px',
              }}
            >
              Tasks
            </button>
            <button
              onClick={() => changeTab('code')}
              className={`px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg font-bold text-[10px] sm:text-xs transition-all border-2 border-black ${activeTab === 'code'
                  ? 'bg-orange-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform -translate-y-0.5'
                  : 'bg-white hover:bg-orange-50 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                }`}
              style={{
                borderRadius: '15px 13px 14px 12px',
              }}
            >
              Code
            </button>
            <button
              onClick={() => changeTab('diagrams')}
              className={`px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg font-bold text-[10px] sm:text-xs transition-all border-2 border-black ${activeTab === 'diagrams'
                  ? 'bg-purple-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform -translate-y-0.5'
                  : 'bg-white hover:bg-purple-50 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                }`}
              style={{
                borderRadius: '15px 13px 14px 12px',
              }}
            >
              <span className="hidden xs:inline">Architectures</span>
              <span className="xs:hidden">Arch</span>
            </button>
            <button
              onClick={() => changeTab('projects')}
              className={`px-0.5 sm:px-1 py-1 sm:py-1.5 rounded-lg font-bold text-[8px] xs:text-[9px] sm:text-[10px] transition-all border-2 border-black ${activeTab === 'projects'
                  ? 'bg-green-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform -translate-y-0.5'
                  : 'bg-white hover:bg-green-50 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
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

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[250] bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="absolute top-20 right-4 left-4 bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 space-y-2">
              {/* Navigation Buttons */}
              <button
                onClick={() => {
                  navigate('/');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 hover:bg-gray-200 border-3 border-black rounded-xl font-bold text-sm transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                <Home className="w-5 h-5" strokeWidth={2.5} />
                <span>Home</span>
              </button>

              <div className="h-px bg-gray-300 my-2"></div>

              {/* Tab Buttons */}
              <button
                onClick={() => {
                  changeTab('blogs');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 border-3 border-black rounded-xl font-bold text-sm transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                  activeTab === 'blogs' ? 'bg-pink-400 text-white' : 'bg-white hover:bg-pink-50'
                }`}
              >
                <BookOpen className="w-5 h-5" strokeWidth={2.5} />
                <span>Blogs</span>
              </button>

              <button
                onClick={() => {
                  changeTab('documentation');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 border-3 border-black rounded-xl font-bold text-sm transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                  activeTab === 'documentation' ? 'bg-blue-400 text-white' : 'bg-white hover:bg-blue-50'
                }`}
              >
                <FileText className="w-5 h-5" strokeWidth={2.5} />
                <span>Documentation</span>
              </button>

              <button
                onClick={() => {
                  changeTab('guide');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 border-3 border-black rounded-xl font-bold text-sm transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                  activeTab === 'guide' ? 'bg-yellow-400 text-white' : 'bg-white hover:bg-yellow-50'
                }`}
              >
                <BookOpen className="w-5 h-5" strokeWidth={2.5} />
                <span>Guide</span>
              </button>

              <button
                onClick={() => {
                  changeTab('files');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 border-3 border-black rounded-xl font-bold text-sm transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                  activeTab === 'files' ? 'bg-cyan-400 text-white' : 'bg-white hover:bg-cyan-50'
                }`}
              >
                <FolderOpen className="w-5 h-5" strokeWidth={2.5} />
                <span>Files</span>
              </button>

              <button
                onClick={() => {
                  changeTab('todo');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 border-3 border-black rounded-xl font-bold text-sm transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                  activeTab === 'todo' ? 'bg-red-400 text-white' : 'bg-white hover:bg-red-50'
                }`}
              >
                <ListTodo className="w-5 h-5" strokeWidth={2.5} />
                <span>Tasks</span>
              </button>

              <button
                onClick={() => {
                  changeTab('code');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 border-3 border-black rounded-xl font-bold text-sm transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                  activeTab === 'code' ? 'bg-orange-400 text-white' : 'bg-white hover:bg-orange-50'
                }`}
              >
                <Code className="w-5 h-5" strokeWidth={2.5} />
                <span>Code</span>
              </button>

              <button
                onClick={() => {
                  changeTab('diagrams');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 border-3 border-black rounded-xl font-bold text-sm transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                  activeTab === 'diagrams' ? 'bg-purple-400 text-white' : 'bg-white hover:bg-purple-50'
                }`}
              >
                <FileImage className="w-5 h-5" strokeWidth={2.5} />
                <span>Architectures</span>
              </button>

              <button
                onClick={() => {
                  changeTab('projects');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 border-3 border-black rounded-xl font-bold text-sm transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                  activeTab === 'projects' ? 'bg-green-400 text-white' : 'bg-white hover:bg-green-50'
                }`}
              >
                <Github className="w-5 h-5" strokeWidth={2.5} />
                <span>Projects</span>
              </button>

              <div className="h-px bg-gray-300 my-2"></div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  // Add logout logic here
                  console.log('Logout clicked');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-red-500 hover:bg-red-600 text-white border-3 border-black rounded-xl font-bold text-sm transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                <LogOut className="w-5 h-5" strokeWidth={2.5} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable Main Content */}
      <main className="flex-1 overflow-y-auto bg-transparent p-2 sm:p-3 md:p-4 lg:p-6 relative z-[50] pt-[220px] xs:pt-[230px] sm:pt-[240px] md:pt-[140px] lg:pt-[120px]">
        <div className="max-w-7xl mx-auto pt-2 sm:pt-3 md:pt-4">
          {/* Loading State */}
          {loading && (
            <div className="fixed inset-0 flex items-center justify-center z-[100]">
              <LoadingSpinner size="lg" />
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
              {/* GUIDE TAB */}
              {activeTab === 'guide' && (
                <NotesTabContent notes={notes} activeSubTab="guide" />
              )}

              {/* FILES TAB */}
              {activeTab === 'files' && (
                <NotesTabContent notes={notes} activeSubTab="notes" />
              )}

              {/* TODO TAB */}
              {activeTab === 'todo' && (
                <NotesTabContent notes={notes} activeSubTab="todo" />
              )}

              {/* DOCUMENTATION TAB */}
              {activeTab === 'documentation' && (
                <>
                  {/* Search Bar */}
                  <div className="mb-4 sm:mb-6">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search documentation..."
                        value={docSearch}
                        onChange={(e) => setDocSearch(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 pl-10 sm:pl-12 bg-white/80 backdrop-blur-sm border-2 sm:border-3 border-black rounded-xl font-bold text-xs sm:text-sm focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                      />
                      <svg className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                    {documentation.filter(doc =>
                      doc.title.toLowerCase().includes(docSearch.toLowerCase()) ||
                      doc.description?.toLowerCase().includes(docSearch.toLowerCase()) ||
                      doc.subject.toLowerCase().includes(docSearch.toLowerCase()) ||
                      doc.tags?.some(tag => tag.toLowerCase().includes(docSearch.toLowerCase()))
                    ).length === 0 ? (
                      <div className="col-span-full text-center py-12 sm:py-16">
                        <div className="bg-gray-50/70 backdrop-blur-sm border-3 border-black rounded-2xl p-6 sm:p-8 md:p-10 inline-block shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                          <BookOpen size={36} strokeWidth={2.5} className="sm:w-12 sm:h-12 mx-auto mb-3 text-blue-500" />
                          <p className="text-gray-600 text-sm sm:text-base font-bold">
                            {docSearch ? 'No documentation found' : 'No documentation yet'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      documentation.filter(doc =>
                        doc.title.toLowerCase().includes(docSearch.toLowerCase()) ||
                        doc.description?.toLowerCase().includes(docSearch.toLowerCase()) ||
                        doc.subject.toLowerCase().includes(docSearch.toLowerCase()) ||
                        doc.tags?.some(tag => tag.toLowerCase().includes(docSearch.toLowerCase()))
                      ).map((doc, idx) => {
                        return (
                        <div
                          key={doc.docId}
                          onClick={() => handleNavigate(`/learnings/documentation/${doc.docId}`)}
                          className="relative aspect-[4/5] cursor-pointer group rounded-lg sm:rounded-xl md:rounded-2xl border-2 sm:border-[3px] border-black bg-white overflow-hidden hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1"
                          style={{ 
                            borderRadius: idx % 2 === 0 ? '16px 20px 16px 20px' : '20px 16px 20px 16px'
                          }}
                        >
                          {/* Header with Cover Image or Icon - 40% height */}
                          {doc.coverImage ? (
                            <div className="relative w-full h-[40%] border-b-2 sm:border-b-[3px] border-black overflow-hidden">
                              <img
                                src={doc.coverImage}
                                alt={doc.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          ) : (
                            <div className="relative w-full h-[40%] bg-gradient-to-br from-blue-500 to-blue-600 border-b-2 sm:border-b-[3px] border-black flex items-center justify-center">
                              <FileText size={32} strokeWidth={2} className="sm:w-12 sm:h-12 text-white/90" />
                            </div>
                          )}
                          
                          {/* Content - 60% height */}
                          <div className="p-2 sm:p-3 h-[60%] flex flex-col">
                            {/* Title */}
                            <h3 className="text-[10px] sm:text-xs md:text-sm font-black text-black mb-1 sm:mb-1.5 line-clamp-2 leading-tight">
                              {doc.title}
                            </h3>
                            
                            {/* Description */}
                            {doc.description && (
                              <p className="text-gray-700 text-[8px] sm:text-[10px] md:text-xs font-medium leading-relaxed line-clamp-2 mb-1.5 sm:mb-2 flex-1">
                                {doc.description}
                              </p>
                            )}
                            
                            {/* Footer - Badges and Date */}
                            <div className="mt-auto space-y-1 sm:space-y-1.5">
                              <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                                <span className="px-1.5 sm:px-2 py-0.5 bg-blue-100 border border-black sm:border-2 rounded text-[7px] sm:text-[9px] font-black uppercase tracking-wider" style={{ borderRadius: '4px 6px 5px 7px' }}>
                                  {doc.subject}
                                </span>
                                {doc.isPublic && (
                                  <span className="px-1.5 sm:px-2 py-0.5 bg-green-100 border border-black sm:border-2 rounded text-[7px] sm:text-[9px] font-black uppercase tracking-wider" style={{ borderRadius: '6px 4px 7px 5px' }}>
                                    Public
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 sm:gap-2 text-[7px] sm:text-[9px] text-gray-600 font-bold">
                                {doc.date && (
                                  <div className="flex items-center gap-0.5 sm:gap-1">
                                    <Calendar size={8} strokeWidth={2.5} className="sm:w-[9px] sm:h-[9px]" />
                                    <span>{doc.date}</span>
                                  </div>
                                )}
                                {doc.time && (
                                  <div className="flex items-center gap-0.5 sm:gap-1">
                                    <Clock size={8} strokeWidth={2.5} className="sm:w-[9px] sm:h-[9px]" />
                                    <span>{doc.time}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}

              {/* BLOGS TAB */}
              {activeTab === 'blogs' && (
                <>
                  {/* Search Bar and Create Button in Same Row */}
                  <div className="mb-4 sm:mb-6 flex flex-col md:flex-row gap-2 sm:gap-3 md:gap-4 items-stretch md:items-center">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Search blogs..."
                        value={blogSearch}
                        onChange={(e) => setBlogSearch(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 pl-10 sm:pl-12 bg-white/80 backdrop-blur-sm border-2 sm:border-3 border-black rounded-xl font-bold text-xs sm:text-sm focus:outline-none focus:ring-4 focus:ring-pink-300 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                      />
                      <svg className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <button
                      onClick={handleCreateBlog}
                      className="px-4 sm:px-5 py-2 sm:py-3 bg-pink-500 text-white border-2 sm:border-3 border-black rounded-xl font-bold hover:bg-pink-600 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 whitespace-nowrap text-xs sm:text-sm"
                    >
                      <Plus size={14} strokeWidth={2.5} className="sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">Create Blog</span>
                      <span className="xs:hidden">Create</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                    {blogs.filter(blog => 
                      blog.title.toLowerCase().includes(blogSearch.toLowerCase()) ||
                      blog.shortDescription.toLowerCase().includes(blogSearch.toLowerCase()) ||
                      blog.subject.toLowerCase().includes(blogSearch.toLowerCase())
                    ).length === 0 ? (
                      <div className="col-span-full text-center py-12 sm:py-16">
                        <div className="bg-gray-50/70 backdrop-blur-sm border-3 border-black rounded-2xl p-6 sm:p-8 md:p-10 inline-block shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                          <FileText size={36} strokeWidth={2.5} className="sm:w-12 sm:h-12 mx-auto mb-3 text-pink-500" />
                          <p className="text-gray-600 text-sm sm:text-base font-bold">
                            {blogSearch ? 'No blogs found' : 'No blogs yet'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      blogs.filter(blog => 
                        blog.title.toLowerCase().includes(blogSearch.toLowerCase()) ||
                        blog.shortDescription.toLowerCase().includes(blogSearch.toLowerCase()) ||
                        blog.subject.toLowerCase().includes(blogSearch.toLowerCase())
                      ).map((blog, idx) => {
                        return (
                        <div
                          key={blog.blogId}
                          onClick={() => handleNavigate(`/learnings/blogs/${blog.blogId}`)}
                          className="relative aspect-[4/5] cursor-pointer group rounded-lg sm:rounded-xl md:rounded-2xl border-2 sm:border-[3px] border-black bg-white overflow-hidden hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1"
                          style={{ 
                            borderRadius: idx % 2 === 0 ? '16px 20px 16px 20px' : '20px 16px 20px 16px'
                          }}
                        >
                          {/* Cover Image */}
                          {blog.coverImage && (
                            <div className="relative w-full h-[40%] overflow-hidden border-b-2 sm:border-b-[3px] border-black">
                              <img
                                src={blog.coverImage}
                                alt={blog.title}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          
                          {/* Content */}
                          <div className="p-2 sm:p-3 h-[60%] flex flex-col">
                            {/* Title */}
                            <h3 className="text-[10px] sm:text-xs md:text-sm font-black text-black mb-1 sm:mb-1.5 line-clamp-2 leading-tight">
                              {blog.title}
                            </h3>
                            
                            {/* Description */}
                            <p className="text-gray-700 text-[8px] sm:text-[10px] md:text-xs font-medium leading-relaxed line-clamp-2 mb-1.5 sm:mb-2 flex-1">
                              {blog.shortDescription}
                            </p>
                            
                            {/* Footer - Subject Badge and Date */}
                            <div className="mt-auto space-y-1 sm:space-y-1.5">
                              <div className="flex items-center gap-1 sm:gap-1.5">
                                <span className="px-1.5 sm:px-2 py-0.5 bg-pink-100 border border-black sm:border-2 rounded text-[7px] sm:text-[9px] font-black uppercase tracking-wider" style={{ borderRadius: '4px 6px 5px 7px' }}>
                                  {blog.subject}
                                </span>
                              </div>
                              <div className="flex items-center gap-0.5 sm:gap-1 text-[7px] sm:text-[9px] text-gray-600 font-bold">
                                <Calendar size={8} strokeWidth={2.5} className="sm:w-[9px] sm:h-[9px]" />
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
                        );
                      })
                    )}
                  </div>
                </>
              )}

              {/* PROJECTS TAB */}
              {activeTab === 'projects' && (
                <>
                  {/* Search Bar */}
                  <div className="mb-4 sm:mb-6">
                    <div className="relative max-w-2xl">
                      <input
                        type="text"
                        placeholder="Search projects..."
                        value={projectSearch}
                        onChange={(e) => setProjectSearch(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 pl-10 sm:pl-12 bg-white/80 backdrop-blur-sm border-2 sm:border-3 border-black rounded-xl font-bold text-xs sm:text-sm focus:outline-none focus:ring-4 focus:ring-green-300 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                      />
                      <svg className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
                    {projects.filter(project =>
                      project.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
                      project.tagline.toLowerCase().includes(projectSearch.toLowerCase()) ||
                      project.badges.some(badge => badge.toLowerCase().includes(projectSearch.toLowerCase()))
                    ).length === 0 ? (
                      <div className="col-span-full text-center py-12 sm:py-16">
                        <div className="bg-gray-50/70 backdrop-blur-sm border-3 border-black rounded-2xl p-6 sm:p-8 md:p-10 inline-block shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                          <Code size={36} strokeWidth={2.5} className="sm:w-12 sm:h-12 mx-auto mb-3 text-green-500" />
                          <p className="text-gray-600 text-sm sm:text-base font-bold">
                            {projectSearch ? 'No projects found' : 'No projects yet'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      projects.filter(project =>
                        project.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
                        project.tagline.toLowerCase().includes(projectSearch.toLowerCase()) ||
                        project.badges.some(badge => badge.toLowerCase().includes(projectSearch.toLowerCase()))
                      ).map((project) => (
                        <div
                          key={project.id}
                          onClick={() => handleNavigate(`/projects/${project.id}`)}
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
                  {/* Create Codebook Button */}
                  <div className="flex justify-end mb-4 sm:mb-6">
                    <button
                      onClick={() => setShowCreateCodeFolderModal(true)}
                      className="px-4 sm:px-6 py-2 sm:py-2.5 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-all shadow-sm hover:shadow-md text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2"
                    >
                      <Plus size={16} strokeWidth={2} className="sm:w-[18px] sm:h-[18px]" />
                      <span className="hidden xs:inline">Create Codebook</span>
                      <span className="xs:hidden">Create</span>
                    </button>
                  </div>

                  {/* Compact Strip Design - Responsive Columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {/* Local Code Folders */}
                    {codeFiles.map((folder, idx) => {
                      return (
                      <div
                        key={folder.folderId}
                        onClick={() => {
                          handleNavigate(`/learnings/code-editor?folder=${encodeURIComponent(folder.path)}`);
                        }}
                        className="group relative bg-black border-2 border-white/20 rounded-xl p-3 sm:p-4 transition-all duration-300 cursor-pointer shadow-[0_8px_0_0_rgba(255,255,255,0.18)] hover:shadow-[0_12px_0_0_rgba(255,255,255,0.24)] hover:-translate-y-1 flex items-center gap-2 sm:gap-3"
                      >
                        {/* Icon */}
                        <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 bg-white/10 border border-white/30 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                          <FolderOpen size={14} strokeWidth={1.5} className="sm:w-4 sm:h-4 text-amber-400" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xs sm:text-sm font-semibold text-white transition-colors line-clamp-1 mb-0.5 sm:mb-1">
                            {folder.name}
                          </h3>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px]">
                              <span className="text-stone-300 font-medium">Local Folder</span>
                            {folder.language && (
                              <span className="px-1.5 sm:px-2 py-0.5 bg-white/10 text-stone-200 border border-white/20 rounded-full font-medium text-[8px] sm:text-[9px]">
                                {folder.language}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!window.confirm(`Delete codebook "${folder.name}"? This will delete all files inside.`)) return;
                            
                            try {
                              const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.code}/folders/${folder.folderId}`, {
                                method: 'DELETE',
                              });
                              
                              if (!response.ok) throw new Error('Failed to delete codebook');
                              
                              // Refresh code folders list
                              const codeRes = await fetch(`${API_BASE_URL}${API_ENDPOINTS.code}/folders?parentPath=`);
                              if (codeRes.ok) {
                                const codeData = await codeRes.json();
                                setCodeFiles(codeData.folders || []);
                              }
                              
                              alert('Codebook deleted successfully');
                            } catch (error) {
                              console.error('Error deleting codebook:', error);
                              alert('Failed to delete codebook');
                            }
                          }}
                          className="flex-shrink-0 p-1.5 bg-black border border-red-400/50 text-red-400 rounded-md hover:bg-red-500 hover:text-white hover:border-red-500 transition-all opacity-0 group-hover:opacity-100 z-10"
                          title="Delete codebook"
                        >
                          <Trash2 size={12} strokeWidth={2} />
                        </button>

                        {/* Arrow - Always at Right End */}
                        <div className="flex-shrink-0 opacity-70 group-hover:opacity-100 transition-all">
                          <ChevronRight size={18} strokeWidth={2} className="text-amber-400" />
                        </div>
                      </div>
                      );
                    })}

                    {/* GitHub Repositories */}
                    {githubRepos.map((repo, idx) => {
                      return (
                      <div
                        key={repo._id}
                        onClick={() => {
                          handleNavigate(`/learnings/code?repo=${repo._id}`);
                        }}
                        className="group relative bg-black border-2 border-white/20 rounded-xl p-4 transition-all duration-300 cursor-pointer shadow-[0_8px_0_0_rgba(255,255,255,0.18)] hover:shadow-[0_12px_0_0_rgba(255,255,255,0.24)] hover:-translate-y-1 flex items-center gap-3"
                      >
                        {/* Icon */}
                        <div className="flex-shrink-0 w-9 h-9 bg-white/10 border border-white/30 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Github size={16} strokeWidth={1.5} className="text-slate-300" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-white transition-colors line-clamp-1">
                              {repo.name}
                            </h3>
                            {repo.isPrivate && (
                              <span className="px-2 py-0.5 bg-red-500/20 text-red-300 border border-red-500/40 rounded-full font-medium text-[9px]">
                                Private
                              </span>
                            )}
                          </div>
                          {repo.description ? (
                            <p className="text-[10px] text-stone-300 line-clamp-1 font-medium">{repo.description}</p>
                          ) : (
                            <p className="text-[10px] text-stone-400 font-medium">{repo.fullName}</p>
                          )}
                        </div>

                        {/* Arrow - Always at Right End */}
                        <div className="flex-shrink-0 opacity-70 group-hover:opacity-100 transition-all">
                          <ChevronRight size={18} strokeWidth={2} className="text-slate-300" />
                        </div>
                      </div>
                      );
                    })}

                    {/* DSA Projects */}
                    {dsaProjects.map((project, idx) => {
                      return (
                      <div
                        key={project.dsaId}
                        onClick={() => {
                          handleNavigate(`/learnings/dsa/${project.dsaId}`);
                        }}
                        className="group relative bg-gradient-to-br from-stone-50 to-amber-50/30 border-2 border-stone-800 rounded-xl p-4 transition-all duration-300 cursor-pointer shadow-[0_4px_0_0_rgba(120,53,15,0.3)] hover:shadow-[0_6px_0_0_rgba(120,53,15,0.4)] hover:-translate-y-0.5 flex items-center gap-3"
                      >
                        {/* Icon */}
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-amber-100 to-stone-100 border-2 border-stone-700 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                          <Code2 size={18} strokeWidth={2.5} className="text-stone-800" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-stone-900 transition-colors line-clamp-1 mb-1">
                            {project.name}
                          </h3>
                          <div className="flex items-center gap-2 text-[10px]">
                            <span className="text-stone-600 font-medium">DSA Practice</span>
                            {project.files && project.files.length > 0 && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-800 rounded-full font-bold text-[9px] shadow-sm">
                                {project.files.length} {project.files.length === 1 ? 'file' : 'files'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Arrow - Always at Right End */}
                        <div className="flex-shrink-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                          <ChevronRight size={20} strokeWidth={2.5} className="text-stone-800" />
                        </div>
                      </div>
                      );
                    })}

                    {/* Empty State */}
                    {codeFiles.length === 0 && githubRepos.length === 0 && dsaProjects.length === 0 && (
                      <div className="col-span-full text-center py-20">
                        <div className="bg-gradient-to-br from-amber-50 to-stone-50 border-2 border-dashed border-stone-400 rounded-2xl p-12 inline-block shadow-sm">
                          <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-stone-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Code size={32} strokeWidth={1.5} className="text-stone-600" />
                          </div>
                          <p className="text-stone-800 text-lg font-semibold mb-2">No codebooks yet</p>
                          <p className="text-stone-500 text-sm mb-6">Create your first codebook to start organizing your code</p>
                          <button
                            onClick={() => setShowCreateCodeFolderModal(true)}
                            className="px-6 py-2.5 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-all shadow-sm hover:shadow-md text-sm inline-flex items-center gap-2"
                          >
                            <Plus size={18} strokeWidth={2} />
                            Create Codebook
                          </button>
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
                  <div className="flex justify-end mb-4 sm:mb-6">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-4 sm:px-6 py-2 sm:py-2.5 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-all shadow-sm hover:shadow-md text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2"
                    >
                      <Plus size={16} strokeWidth={2} className="sm:w-[18px] sm:h-[18px]" />
                      <span className="hidden xs:inline">New Canvas</span>
                      <span className="xs:hidden">New</span>
                    </button>
                  </div>

                  {/* Compact Strip Design - Responsive Columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {diagrams.length === 0 ? (
                      <div className="col-span-full text-center py-20">
                        <div className="bg-gradient-to-br from-stone-900 to-stone-800 border-2 border-white/20 rounded-2xl p-12 inline-block shadow-lg">
                          <div className="w-16 h-16 bg-gradient-to-br from-amber-400/20 to-stone-400/20 border border-amber-400/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <FileImage size={32} strokeWidth={1.5} className="text-amber-400" />
                          </div>
                          <p className="text-white text-lg font-semibold mb-2">No architectures yet</p>
                          <p className="text-stone-300 text-sm">Create your first architecture diagram</p>
                        </div>
                      </div>
                    ) : (
                      diagrams.map((diagram, idx) => {
                        return (
                        <div
                          key={diagram.canvasId}
                          onClick={() => handleCanvasClick(diagram)}
                          className="group relative bg-black border-2 border-white/20 rounded-xl p-4 transition-all duration-300 cursor-pointer shadow-[0_8px_0_0_rgba(255,255,255,0.18)] hover:shadow-[0_12px_0_0_rgba(255,255,255,0.24)] hover:-translate-y-1 flex items-center gap-3"
                        >
                          {/* Icon */}
                          <div className="flex-shrink-0 w-9 h-9 bg-white/10 border border-white/30 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                            <FileImage size={16} strokeWidth={1.5} className="text-amber-400" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-white transition-colors line-clamp-1 mb-1">
                              {diagram.name}
                            </h3>
                            <div className="flex items-center gap-2 text-[10px]">
                              <span className="flex items-center gap-1 text-stone-300">
                                <Calendar size={10} strokeWidth={2} />
                                <span className="font-medium">
                                  {new Date(diagram.updatedAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              </span>
                              {diagram.isPublic && (
                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full font-medium text-[9px]">
                                  Public
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={(e) => handleDeleteDiagram(diagram.canvasId, e)}
                            className="flex-shrink-0 p-1.5 bg-black border border-red-400/50 text-red-400 rounded-md hover:bg-red-500 hover:text-white hover:border-red-500 transition-all opacity-0 group-hover:opacity-100 z-10"
                            title="Delete architecture"
                          >
                            <Trash2 size={12} strokeWidth={2} />
                          </button>

                          {/* Arrow - Always at Right End */}
                          <div className="flex-shrink-0 opacity-70 group-hover:opacity-100 transition-all">
                            <ChevronRight size={18} strokeWidth={2} className="text-amber-400" />
                          </div>
                        </div>
                        );
                      })
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
            {isLoadingDiagram ? (
              <div className="text-center py-8">
                <div className="animate-spin w-16 h-16 border-4 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-black mb-2">Opening Diagram...</h3>
                <p className="text-gray-600 font-medium">Please wait while we load your diagram</p>
              </div>
            ) : (
              <>
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
                      setCreatedCanvasId(null);
                    }}
                    disabled={isLoadingDiagram}
                    className="flex-1 px-4 py-2 bg-gray-200 border-2 border-black rounded-lg font-bold hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ borderRadius: '10px 12px 11px 13px' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordSubmit}
                    disabled={isLoadingDiagram}
                    className="flex-1 px-4 py-2 bg-black text-white border-2 border-black rounded-lg font-bold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ borderRadius: '10px 12px 11px 13px' }}
                  >
                    Unlock
                  </button>
                </div>
              </>
            )}
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

      {/* View/Edit Modal */}
      {showViewEditModal && (createdCanvasId || selectedCanvas) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white border-4 border-black rounded-2xl p-6 max-w-md w-full shadow-2xl" style={{ borderRadius: '20px 25px 22px 24px' }}>
            {isLoadingDiagram ? (
              <div className="text-center py-8">
                <div className="animate-spin w-16 h-16 border-4 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-black mb-2">Opening Diagram...</h3>
                <p className="text-gray-600 font-medium">Please wait while we load your diagram</p>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-black mb-2">{createdCanvasId ? '✨ Diagram Created!' : ' Choose Action'}</h3>
                <p className="text-gray-600 mb-6 font-medium">
                  {createdCanvasId ? 'Choose how you want to open your diagram' : 'How would you like to open this diagram?'}
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={() => handleViewDiagram(createdCanvasId || selectedCanvas?.canvasId)}
                    disabled={isLoadingDiagram}
                    className="w-full flex items-center gap-3 px-6 py-4 bg-blue-100 hover:bg-blue-200 border-3 border-black rounded-xl font-bold transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ borderRadius: '12px 15px 13px 14px' }}
                  >
                    <Eye size={24} strokeWidth={2.5} />
                    <div className="text-left flex-1">
                      <div className="text-lg">View Only</div>
                      <div className="text-xs text-gray-600 font-normal">Open in read-only mode (No password required)</div>
                    </div>
                  </button>

                  <button
                    onClick={handleEditDiagram}
                    disabled={isLoadingDiagram}
                    className="w-full flex items-center gap-3 px-6 py-4 bg-green-100 hover:bg-green-200 border-3 border-black rounded-xl font-bold transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ borderRadius: '12px 15px 13px 14px' }}
                  >
                    <Edit size={24} strokeWidth={2.5} />
                    <div className="text-left flex-1">
                      <div className="text-lg">Edit Mode</div>
                      <div className="text-xs text-gray-600 font-normal">Make changes to the diagram (Password required)</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowViewEditModal(false);
                      setCreatedCanvasId(null);
                      setSelectedCanvas(null);
                    }}
                    disabled={isLoadingDiagram}
                    className="w-full px-4 py-2 bg-gray-200 border-2 border-black rounded-lg font-bold hover:bg-gray-300 transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ borderRadius: '10px 12px 11px 13px' }}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white border-4 border-black rounded-2xl p-6 max-w-md w-full shadow-2xl" style={{ borderRadius: '20px 25px 22px 24px' }}>
            <h3 className="text-2xl font-black mb-2">🔗 Share Diagram</h3>
            <p className="text-gray-600 mb-4 font-medium">Share this view-only link with others</p>
            
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareableLink}
                  readOnly
                  className="flex-1 px-4 py-2 border-2 border-black rounded-lg font-mono text-sm bg-gray-50"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-blue-500 text-white border-2 border-black rounded-lg font-bold hover:bg-blue-600 transition-all"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-3 mb-4">
              <p className="text-xs text-yellow-800 font-medium">👁️ This link allows <strong>view-only</strong> access. Recipients cannot edit the diagram.</p>
            </div>

            <button
              onClick={() => {
                setShowShareModal(false);
                setShareableLink('');
                setSelectedCanvas(null);
              }}
              className="w-full px-4 py-2 bg-gray-200 border-2 border-black rounded-lg font-bold hover:bg-gray-300 transition-all"
              style={{ borderRadius: '10px 12px 11px 13px' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Password Modal */}
      {showDeletePasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white border-4 border-black rounded-2xl p-6 max-w-md w-full shadow-2xl" style={{ borderRadius: '20px 25px 22px 24px' }}>
            <h3 className="text-2xl font-black mb-4"> Delete Architecture</h3>
            <p className="text-gray-600 mb-6 font-medium">Enter password to delete this architecture diagram</p>
            
            <div className="mb-6">
              <label className="block text-sm font-bold mb-2">Password</label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleConfirmDelete()}
                placeholder="Enter password"
                className="w-full px-4 py-2 border-2 border-black rounded-lg font-medium"
                autoFocus
              />
            </div>

            <div className="bg-red-50 border-2 border-red-400 rounded-lg p-3 mb-4">
              <p className="text-xs text-red-800 font-medium"> This action cannot be undone. The diagram will be permanently deleted.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeletePasswordModal(false);
                  setDeleteCanvasId(null);
                  setDeletePassword('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 border-2 border-black rounded-lg font-bold hover:bg-gray-300 transition-all"
                style={{ borderRadius: '10px 12px 11px 13px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-red-500 text-white border-2 border-black rounded-lg font-bold hover:bg-red-600 transition-all"
                style={{ borderRadius: '10px 12px 11px 13px' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Code Folder Modal */}
      {showCreateCodeFolderModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-8 max-w-lg w-full shadow-2xl">
            <h2 className="text-2xl font-semibold text-stone-900 mb-6">Create New Codebook</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Codebook Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={codeFolderName}
                  onChange={(e) => setCodeFolderName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl font-normal text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all"
                  placeholder="my-awesome-project"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Description</label>
                <textarea
                  value={codeFolderDescription}
                  onChange={(e) => setCodeFolderDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl font-normal text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent resize-none transition-all"
                  rows={3}
                  placeholder="Brief description of your project..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Primary Language <span className="text-red-500">*</span>
                </label>
                <select
                  value={codeFolderLanguage}
                  onChange={(e) => setCodeFolderLanguage(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent bg-white transition-all cursor-pointer max-h-48 overflow-y-auto"
                  size={1}
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                  <option value="sql">SQL</option>
                </select>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-stone-50 border border-stone-200 rounded-xl p-4">
                <p className="text-xs text-stone-600 font-medium">
                  <span className="font-semibold text-stone-700">Created:</span> {new Date().toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setShowCreateCodeFolderModal(false);
                  setCodeFolderName('');
                  setCodeFolderDescription('');
                  setCodeFolderLanguage('python');
                }}
                disabled={creatingCodeFolder}
                className="flex-1 px-5 py-2.5 bg-white border border-stone-300 text-stone-700 rounded-xl font-medium hover:bg-stone-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCodeFolder}
                disabled={creatingCodeFolder}
                className="flex-1 px-5 py-2.5 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creatingCodeFolder ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  'Create & Open'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GTA5 Mumbai Map Modal */}
      {showMap && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[400] p-4" onClick={() => setShowMap(false)}>
          <div className="relative max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => setShowMap(false)}
              className="absolute -top-4 -right-4 bg-red-600 text-white w-12 h-12 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:scale-110 font-black text-xl z-10"
            >
              ✕
            </button>
            
            {/* Map Container */}
            <div className="bg-white border-4 border-black rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-4 border-b-4 border-black">
                <h2 className="text-2xl font-black flex items-center gap-3">
                  GTAVI Mumbai
                </h2>
              </div>
              <div className="p-4 bg-gray-100">
                <GtaMumbaiMap className="h-[56vh] min-h-[360px]" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
