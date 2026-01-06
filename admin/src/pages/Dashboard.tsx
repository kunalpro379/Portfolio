import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, FolderOpen, Eye, BookOpen, StickyNote, Plus, Edit, FileEdit } from 'lucide-react';

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

  useEffect(() => {
    fetchStats();
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
