import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import { User, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Header */}
        <header className="bg-white border-b-4 border-black h-14 lg:h-20 flex items-center justify-between px-3 lg:px-8 flex-shrink-0">
          {/* Left side - Menu button only on mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden flex items-center justify-center w-10 h-10 bg-white border-3 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px]"
          >
            <Menu className="w-5 h-5 text-black" strokeWidth={2.5} />
          </button>

          {/* Desktop Logo - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="w-8 h-8 border-3 border-black rounded-lg flex items-center justify-center bg-yellow-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-lg font-black">K</span>
            </div>
            <span className="text-lg font-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>Admin</span>
            {window.location.hostname === 'localhost' && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full border border-green-300">
                DEV
              </span>
            )}
          </div>

          {/* User Info - Right side - Compact on mobile */}
          <div className="flex items-center gap-1.5 lg:gap-3 px-2.5 lg:px-5 py-1.5 lg:py-2 bg-white border-3 border-black rounded-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <User className="w-3.5 h-3.5 lg:w-5 lg:h-5 text-black" strokeWidth={2.5} />
            <span className="font-bold text-black text-xs lg:text-base whitespace-nowrap">{user?.username}</span>
          </div>
        </header>

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
