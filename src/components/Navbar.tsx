import { Home as HomeIcon, FolderKanban, Briefcase, BookOpen, Mail, User, FileText, Book, FolderOpen } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

interface NavbarProps {
  scrollToSection: (sectionId: string) => void;
}

export default function Navbar({ scrollToSection }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isLearningsPage = location.pathname.startsWith('/learnings') || location.pathname.startsWith('/projects/');
  
  // Get active tab from URL
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'blogs';

  const learningsNavItems = [
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'documentation', label: 'Documentation', icon: Book },
    { id: 'blogs', label: 'Blogs', icon: BookOpen },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
  ];

  const handleLearningsNav = (tabId: string) => {
    navigate(`/learnings?tab=${tabId}`);
  };

  const handleContactNav = () => {
    navigate('/');
    setTimeout(() => {
      const element = document.getElementById('contact');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  if (isLearningsPage) {
    return (
      <div className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-[1000] w-auto max-w-[95%]">
        {/* Mobile Navbar - No Contact button */}
        <div className="flex md:hidden gap-2 items-center">
          <div onClick={() => navigate('/')} className="flex flex-col items-center justify-center p-3 bg-white/90 backdrop-blur-md border-2 border-black rounded-md shadow-lg cursor-pointer active:scale-95 min-w-[70px]">
            <HomeIcon size={18} className="mb-1" />
            <span className="text-[8px] font-bold uppercase">Home</span>
          </div>

          <div className="flex gap-2 bg-white/90 backdrop-blur-md border-2 border-black rounded-md shadow-lg p-2">
            {learningsNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <div 
                  key={item.id} 
                  onClick={() => handleLearningsNav(item.id)} 
                  className={`flex flex-col items-center justify-center px-2 py-1 cursor-pointer rounded active:scale-95 min-w-[60px] transition-colors ${
                    isActive ? 'bg-gray-200' : 'active:bg-black/5'
                  }`}
                >
                  <Icon size={18} className="mb-1" />
                  <span className="text-[8px] font-bold uppercase">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop Navbar */}
        <div className="hidden md:flex gap-4 items-center">
          <div className="bg-white/90 backdrop-blur-2xl border-2 border-black rounded-lg shadow-lg px-6 py-4">
            <div onClick={() => navigate('/')} className="flex flex-col items-center justify-center cursor-pointer group">
              <HomeIcon size={24} className="mb-2 text-black/70 group-hover:text-sky-500 transition-colors" />
              <span className="text-xs font-bold uppercase tracking-wider text-black/70 group-hover:text-black transition-colors">
                Home
              </span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-2xl border-2 border-black rounded-lg shadow-lg px-6 py-4">
            <div className="flex gap-8 items-center">
              {learningsNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <div 
                    key={item.id} 
                    onClick={() => handleLearningsNav(item.id)} 
                    className={`flex flex-col items-center justify-center cursor-pointer group px-4 py-2 rounded-lg transition-colors ${
                      isActive ? 'bg-gray-200' : ''
                    }`}
                  >
                    <Icon size={24} className="mb-2 text-black/70 group-hover:text-sky-500 transition-colors" />
                    <span className="text-xs font-bold uppercase tracking-wider text-black/70 group-hover:text-black transition-colors">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-2xl border-2 border-black rounded-lg shadow-lg px-6 py-4">
            <div onClick={handleContactNav} className="flex flex-col items-center justify-center cursor-pointer group">
              <Mail size={24} className="mb-2 text-black/70 group-hover:text-sky-500 transition-colors" />
              <span className="text-xs font-bold uppercase tracking-wider text-black/70 group-hover:text-black transition-colors">
                Contact
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-[1000] w-auto max-w-[95%] will-change-auto">
      {/* Mobile Navbar - 3 Sections */}
      <div className="flex md:hidden gap-2 items-center">
        {/* Home */}
        <div onClick={() => scrollToSection('home')} className="flex flex-col items-center justify-center p-3 bg-white/90 backdrop-blur-md border-2 border-black rounded-md shadow-lg cursor-pointer active:scale-95 min-w-[70px]">
          <HomeIcon size={18} className="mb-1" />
          <span className="text-[8px] font-bold uppercase">Home</span>
        </div>

        {/* Middle - Projects, Experience, Blogs */}
        <div className="flex gap-2 bg-white/90 backdrop-blur-md border-2 border-black rounded-md shadow-lg p-2">
          <div onClick={() => scrollToSection('projects')} className="flex flex-col items-center justify-center px-2 py-1 cursor-pointer rounded active:scale-95 active:bg-black/5 min-w-[60px]">
            <FolderKanban size={18} className="mb-1" />
            <span className="text-[8px] font-bold uppercase">Projects</span>
          </div>
          <div onClick={() => scrollToSection('experience')} className="flex flex-col items-center justify-center px-2 py-1 cursor-pointer rounded active:scale-95 active:bg-black/5 min-w-[60px]">
            <Briefcase size={18} className="mb-1" />
            <span className="text-[8px] font-bold uppercase">Experience</span>
          </div>
          <div onClick={() => navigate('/learnings?tab=blogs')} className="flex flex-col items-center justify-center px-2 py-1 cursor-pointer rounded active:scale-95 active:bg-black/5 min-w-[60px]">
            <BookOpen size={18} className="mb-1" />
            <span className="text-[8px] font-bold uppercase">Blogs</span>
          </div>
        </div>

        {/* Contact */}
        <div onClick={() => scrollToSection('contact')} className="flex flex-col items-center justify-center p-3 bg-white/90 backdrop-blur-md border-2 border-black rounded-md shadow-lg cursor-pointer active:scale-95 min-w-[70px]">
          <Mail size={18} className="mb-1" />
          <span className="text-[8px] font-bold uppercase">Contact</span>
        </div>
      </div>

      {/* Desktop Navbar - Three Separate Sections */}
      <div className="hidden md:flex gap-4 items-center">
        {/* Home Section */}
        <div className="bg-white/90 backdrop-blur-2xl border-2 border-black rounded-lg shadow-lg px-6 py-4">
          <div onClick={() => scrollToSection('home')} className="flex flex-col items-center justify-center cursor-pointer group">
            <HomeIcon size={24} className="mb-2 text-black/70 group-hover:text-sky-500 transition-colors" />
            <span className="text-xs font-bold uppercase tracking-wider text-black/70 group-hover:text-black transition-colors">
              Home
            </span>
          </div>
        </div>

        {/* Middle Section - About, Projects, Experience, Blogs */}
        <div className="bg-white/90 backdrop-blur-2xl border-2 border-black rounded-lg shadow-lg px-6 py-4">
          <div className="flex gap-8 items-center">
            <div onClick={() => scrollToSection('about')} className="flex flex-col items-center justify-center cursor-pointer group">
              <User size={24} className="mb-2 text-black/70 group-hover:text-sky-500 transition-colors" />
              <span className="text-xs font-bold uppercase tracking-wider text-black/70 group-hover:text-black transition-colors">
                About
              </span>
            </div>
            <div onClick={() => scrollToSection('projects')} className="flex flex-col items-center justify-center cursor-pointer group">
              <FolderKanban size={24} className="mb-2 text-black/70 group-hover:text-sky-500 transition-colors" />
              <span className="text-xs font-bold uppercase tracking-wider text-black/70 group-hover:text-black transition-colors">
                Projects
              </span>
            </div>
            <div onClick={() => scrollToSection('experience')} className="flex flex-col items-center justify-center cursor-pointer group">
              <Briefcase size={24} className="mb-2 text-black/70 group-hover:text-sky-500 transition-colors" />
              <span className="text-xs font-bold uppercase tracking-wider text-black/70 group-hover:text-black transition-colors">
                Experience
              </span>
            </div>
            <div onClick={() => navigate('/learnings?tab=blogs')} className="flex flex-col items-center justify-center cursor-pointer group">
              <BookOpen size={24} className="mb-2 text-black/70 group-hover:text-sky-500 transition-colors" />
              <span className="text-xs font-bold uppercase tracking-wider text-black/70 group-hover:text-black transition-colors">
                Blogs
              </span>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white/90 backdrop-blur-2xl border-2 border-black rounded-lg shadow-lg px-6 py-4">
          <div onClick={() => scrollToSection('contact')} className="flex flex-col items-center justify-center cursor-pointer group">
            <Mail size={24} className="mb-2 text-black/70 group-hover:text-sky-500 transition-colors" />
            <span className="text-xs font-bold uppercase tracking-wider text-black/70 group-hover:text-black transition-colors">
              Contact
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
