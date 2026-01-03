import { Home as HomeIcon, FolderKanban, Briefcase, BookOpen, Mail, User } from "lucide-react";

interface NavbarProps {
  scrollToSection: (sectionId: string) => void;
}

export default function Navbar({ scrollToSection }: NavbarProps) {
  const navItems = {
    home: "Home",
    contact: "Contact Me"
  };

  return (
    <div className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-[1000] w-auto max-w-[95%]">
      {/* Mobile Navbar - 3 Sections */}
      <div className="flex md:hidden gap-2 items-center">
        {/* Home */}
        <div onClick={() => scrollToSection('home')} className="flex flex-col items-center justify-center p-3 bg-white/90 backdrop-blur-md border-2 border-black rounded-md shadow-lg cursor-pointer active:scale-95">
          <HomeIcon size={18} className="mb-1" />
          <span className="text-[8px] font-bold uppercase">Home</span>
        </div>

        {/* Middle - Projects, Experience, Blogs */}
        <div className="flex gap-2 bg-white/90 backdrop-blur-md border-2 border-black rounded-md shadow-lg p-2">
          <div onClick={() => scrollToSection('projects')} className="flex flex-col items-center justify-center px-2 py-1 cursor-pointer rounded active:scale-95 active:bg-black/5">
            <FolderKanban size={18} className="mb-1" />
            <span className="text-[8px] font-bold uppercase">Projects</span>
          </div>
          <div onClick={() => scrollToSection('experience')} className="flex flex-col items-center justify-center px-2 py-1 cursor-pointer rounded active:scale-95 active:bg-black/5">
            <Briefcase size={18} className="mb-1" />
            <span className="text-[8px] font-bold uppercase">Experience</span>
          </div>
          <div onClick={() => scrollToSection('blogs')} className="flex flex-col items-center justify-center px-2 py-1 cursor-pointer rounded active:scale-95 active:bg-black/5">
            <BookOpen size={18} className="mb-1" />
            <span className="text-[8px] font-bold uppercase">Blogs</span>
          </div>
        </div>

        {/* Contact */}
        <div onClick={() => scrollToSection('contact')} className="flex flex-col items-center justify-center p-3 bg-white/90 backdrop-blur-md border-2 border-black rounded-md shadow-lg cursor-pointer active:scale-95">
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
              {navItems.home}
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
            <div onClick={() => scrollToSection('blogs')} className="flex flex-col items-center justify-center cursor-pointer group">
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
              {navItems.contact}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
