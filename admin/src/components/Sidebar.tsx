import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, FileText, BookOpen, StickyNote, Eye, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { logout } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/projects', icon: FolderOpen, label: 'Projects' },
    { to: '/blogs', icon: FileText, label: 'Blogs' },
    { to: '/documentation', icon: BookOpen, label: 'Documentation' },
    { to: '/notes', icon: StickyNote, label: 'Notes' },
    { to: '/views', icon: Eye, label: 'Views' },
  ];

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside className="w-64 bg-white border-r-4 border-black h-screen flex flex-col relative flex-shrink-0">
      {/* Decorative elements */}
      <div className="absolute top-20 right-0 w-8 h-8 border-2 border-black opacity-10 transform rotate-45"></div>
      <div className="absolute bottom-40 left-4 w-6 h-6 border-2 border-black rounded-full opacity-10"></div>

      {/* Logo Section */}
      <div className="p-6 border-b-4 border-black">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 border-3 border-black rounded-xl flex items-center justify-center bg-yellow-200 transform -rotate-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-2xl font-black">K</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                Kunal
              </h2>
              <p className="text-xs text-gray-600 font-bold">Admin Panel</p>
            </div>
          </div>
          
          {/* Close button for mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5 text-black" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl border-3 border-black font-bold transition-all ${
                isActive
                  ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]'
                  : 'bg-white text-black hover:bg-gray-50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]'
              }`
            }
          >
            <item.icon className="w-5 h-5" strokeWidth={2.5} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t-4 border-black">
        <button
          onClick={() => {
            logout();
            if (onClose) onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-3 border-black font-bold bg-red-100 hover:bg-red-200 text-black transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
        >
          <LogOut className="w-5 h-5" strokeWidth={2.5} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
