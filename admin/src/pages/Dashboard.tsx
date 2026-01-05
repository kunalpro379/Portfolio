import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, FolderOpen, Eye, BookOpen, StickyNote, Plus, Edit, FileEdit, Clock } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    projects: 0,
    blogs: 0,
    documentation: 0,
    notes: 0,
    views: 0
  });
  const [recentItems, setRecentItems] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchRecentItems();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch all stats in parallel
      const [projectsRes, blogsRes, docsRes] = await Promise.all([
        fetch('http://localhost:5000/api/projects'),
        fetch('http://localhost:5000/api/blogs'),
        fetch('http://localhost:5000/api/documentation')
      ]);

      const [projectsData, blogsData, docsData] = await Promise.all([
        projectsRes.json(),
        blogsRes.json(),
        docsRes.json()
      ]);

      // Fetch notes folders count
      let notesCount = 0;
      try {
        const notesRes = await fetch('http://localhost:5000/api/notes/folders?parentPath=');
        if (notesRes.ok) {
          const notesData = await notesRes.json();
          notesCount = notesData.folders?.length || 0;
        }
      } catch (e) {
        console.log('Notes API not available');
      }

      setStats({
        projects: projectsData.projects?.length || 0,
        blogs: blogsData.blogs?.length || 0,
        documentation: docsData.docs?.length || 0,
        notes: notesCount,
        views: 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentItems = async () => {
    try {
      const [projectsRes, blogsRes, docsRes] = await Promise.all([
        fetch('http://localhost:5000/api/projects'),
        fetch('http://localhost:5000/api/blogs'),
        fetch('http://localhost:5000/api/documentation')
      ]);

      const [projectsData, blogsData, docsData] = await Promise.all([
        projectsRes.json(),
        blogsRes.json(),
        docsRes.json()
      ]);

      const allItems = [
        ...(projectsData.projects || []).map((p: any) => ({ ...p, type: 'project', date: p.updatedAt || p.createdAt })),
        ...(blogsData.blogs || []).map((b: any) => ({ ...b, type: 'blog', date: b.updatedAt || b.createdAt })),
        ...(docsData.docs || []).map((d: any) => ({ ...d, type: 'documentation', date: d.updatedAt || d.createdAt }))
      ];

      // Sort by date and take top 5
      const sorted = allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
      setRecentItems(sorted);
    } catch (error) {
      console.error('Error fetching recent items:', error);
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'project': return <FolderOpen className="w-4 h-4" strokeWidth={2.5} />;
      case 'blog': return <FileText className="w-4 h-4" strokeWidth={2.5} />;
      case 'documentation': return <BookOpen className="w-4 h-4" strokeWidth={2.5} />;
      case 'note': return <StickyNote className="w-4 h-4" strokeWidth={2.5} />;
      default: return <FileText className="w-4 h-4" strokeWidth={2.5} />;
    }
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case 'project': return 'bg-yellow-200';
      case 'blog': return 'bg-blue-200';
      case 'documentation': return 'bg-green-200';
      case 'note': return 'bg-purple-200';
      default: return 'bg-gray-200';
    }
  };

  const formatDate = (date: string) => {
    if (!date) return 'No date';
    
    const d = new Date(date);
    
    // Check if date is valid
    if (isNaN(d.getTime())) return 'No date';
    
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Card */}
        <div className="bg-white border-4 border-black rounded-2xl p-4 md:p-8 mb-4 md:mb-8 relative transform rotate-0 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="absolute top-4 right-4 w-12 h-12 md:w-16 md:h-16 border-2 border-black rounded-full opacity-10"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 md:w-12 md:h-12 border-2 border-black opacity-10 transform rotate-45"></div>
          
          <h2 className="text-xl md:text-3xl font-black text-black mb-2 md:mb-3" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            Welcome back, {user?.username}!
          </h2>
          <p className="text-gray-700 font-medium text-sm md:text-lg">
            You're successfully logged in. Manage your content from here.
          </p>
          
          <svg className="mt-2" width="200" height="8" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 4 Q 50 2, 100 4 T 200 4" stroke="black" fill="none" strokeWidth="2" opacity="0.2"/>
          </svg>
        </div>

        {/* Recently Updated */}
        {recentItems.length > 0 && (
          <div className="bg-white border-4 border-black rounded-2xl p-4 md:p-6 mb-4 md:mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
              <h3 className="text-lg md:text-2xl font-black text-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                Recently Updated
              </h3>
            </div>
            <div className="space-y-2">
              {recentItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 md:gap-3 p-2 md:p-3 border-2 border-black rounded-lg hover:bg-gray-50 transition"
                >
                  <div className={`w-6 h-6 md:w-8 md:h-8 border-2 border-black rounded-lg flex items-center justify-center ${getItemColor(item.type)}`}>
                    {getItemIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-black truncate text-sm md:text-base">{item.title}</p>
                    <p className="text-xs text-gray-600 font-medium capitalize">{item.type}</p>
                  </div>
                  <span className="text-xs text-gray-500 font-medium whitespace-nowrap">{formatDate(item.date)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-8">
          <div className="bg-white border-4 border-black rounded-2xl p-3 md:p-6 relative transform -rotate-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
            <div className="flex items-start justify-between mb-2 md:mb-4">
              <div className="w-8 h-8 md:w-12 md:h-12 border-3 border-black rounded-lg flex items-center justify-center bg-yellow-200 transform rotate-3">
                <FolderOpen className="w-4 h-4 md:w-6 md:h-6 text-black" strokeWidth={2.5} />
              </div>
            </div>
            <h3 className="text-gray-600 text-xs md:text-sm font-black mb-1 md:mb-2 uppercase tracking-wide">Total Projects</h3>
            <p className="text-3xl md:text-5xl font-black text-black">{stats.projects}</p>
          </div>

          <div className="bg-white border-4 border-black rounded-2xl p-3 md:p-6 relative transform rotate-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
            <div className="flex items-start justify-between mb-2 md:mb-4">
              <div className="w-8 h-8 md:w-12 md:h-12 border-3 border-black rounded-lg flex items-center justify-center bg-blue-200 transform -rotate-3">
                <FileText className="w-4 h-4 md:w-6 md:h-6 text-black" strokeWidth={2.5} />
              </div>
            </div>
            <h3 className="text-gray-600 text-xs md:text-sm font-black mb-1 md:mb-2 uppercase tracking-wide">Total Blogs</h3>
            <p className="text-3xl md:text-5xl font-black text-black">{stats.blogs}</p>
          </div>

          <div className="bg-white border-4 border-black rounded-2xl p-3 md:p-6 relative transform -rotate-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
            <div className="flex items-start justify-between mb-2 md:mb-4">
              <div className="w-8 h-8 md:w-12 md:h-12 border-3 border-black rounded-lg flex items-center justify-center bg-green-200 transform rotate-2">
                <BookOpen className="w-4 h-4 md:w-6 md:h-6 text-black" strokeWidth={2.5} />
              </div>
            </div>
            <h3 className="text-gray-600 text-xs md:text-sm font-black mb-1 md:mb-2 uppercase tracking-wide">Total Docs</h3>
            <p className="text-3xl md:text-5xl font-black text-black">{stats.documentation}</p>
          </div>

          <div className="bg-white border-4 border-black rounded-2xl p-3 md:p-6 relative transform rotate-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
            <div className="flex items-start justify-between mb-2 md:mb-4">
              <div className="w-8 h-8 md:w-12 md:h-12 border-3 border-black rounded-lg flex items-center justify-center bg-purple-200 transform -rotate-2">
                <StickyNote className="w-4 h-4 md:w-6 md:h-6 text-black" strokeWidth={2.5} />
              </div>
            </div>
            <h3 className="text-gray-600 text-xs md:text-sm font-black mb-1 md:mb-2 uppercase tracking-wide">Total Notes</h3>
            <p className="text-3xl md:text-5xl font-black text-black">{stats.notes}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border-4 border-black rounded-2xl p-4 md:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-lg md:text-2xl font-black text-black mb-4 md:mb-6" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            Quick Actions
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <button 
              onClick={() => navigate('/projects/create')}
              className="flex items-center gap-3 md:gap-4 p-3 md:p-5 bg-white border-3 border-black rounded-xl hover:bg-gray-50 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] group">
              <div className="w-10 h-10 md:w-12 md:h-12 border-3 border-black rounded-lg flex items-center justify-center bg-yellow-200 group-hover:rotate-6 transition-transform flex-shrink-0">
                <Plus className="w-5 h-5 md:w-6 md:h-6 text-black" strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <h4 className="font-black text-black text-base md:text-lg">Create New Project</h4>
                <p className="text-gray-600 text-xs md:text-sm font-medium">Add a new project to your portfolio</p>
              </div>
            </button>

            <button 
              onClick={() => navigate('/blogs/create')}
              className="flex items-center gap-3 md:gap-4 p-3 md:p-5 bg-white border-3 border-black rounded-xl hover:bg-gray-50 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] group">
              <div className="w-10 h-10 md:w-12 md:h-12 border-3 border-black rounded-lg flex items-center justify-center bg-blue-200 group-hover:rotate-6 transition-transform flex-shrink-0">
                <Edit className="w-5 h-5 md:w-6 md:h-6 text-black" strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <h4 className="font-black text-black text-base md:text-lg">Write New Blog</h4>
                <p className="text-gray-600 text-xs md:text-sm font-medium">Share your thoughts and ideas</p>
              </div>
            </button>

            <button 
              onClick={() => navigate('/documentation/create')}
              className="flex items-center gap-3 md:gap-4 p-3 md:p-5 bg-white border-3 border-black rounded-xl hover:bg-gray-50 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] group">
              <div className="w-10 h-10 md:w-12 md:h-12 border-3 border-black rounded-lg flex items-center justify-center bg-green-200 group-hover:rotate-6 transition-transform flex-shrink-0">
                <FileEdit className="w-5 h-5 md:w-6 md:h-6 text-black" strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <h4 className="font-black text-black text-base md:text-lg">Create New Documentation</h4>
                <p className="text-gray-600 text-xs md:text-sm font-medium">Document your knowledge</p>
              </div>
            </button>

            <button 
              onClick={() => navigate('/notes/create')}
              className="flex items-center gap-3 md:gap-4 p-3 md:p-5 bg-white border-3 border-black rounded-xl hover:bg-gray-50 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] group">
              <div className="w-10 h-10 md:w-12 md:h-12 border-3 border-black rounded-lg flex items-center justify-center bg-purple-200 group-hover:rotate-6 transition-transform flex-shrink-0">
                <Plus className="w-5 h-5 md:w-6 md:h-6 text-black" strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <h4 className="font-black text-black text-base md:text-lg">Create New Note</h4>
                <p className="text-gray-600 text-xs md:text-sm font-medium">Quick notes and reminders</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
