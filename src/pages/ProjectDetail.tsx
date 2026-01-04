import { useParams, useNavigate } from 'react-router-dom';
import { useCallback, useState, useEffect } from 'react';
import { Clock, Calendar, Github, ExternalLink, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import projectMetadata from '@/data/project.json';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [markdownContent, setMarkdownContent] = useState('');
  const [project, setProject] = useState<any>(null);

  const scrollToSection = useCallback((sectionId: string) => {
    navigate('/');
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }, [navigate]);

  useEffect(() => {
    // Load project metadata
    setProject(projectMetadata);

    // Fetch markdown content
    fetch('/src/data/project.md')
      .then(res => res.text())
      .then(text => setMarkdownContent(text))
      .catch(err => console.error('Error loading markdown:', err));
  }, [id]);

  if (!project) {
    return <div>Loading...</div>;
  }

  // Extract sections from markdown for navigation
  const sections = markdownContent
    .split('\n')
    .filter(line => line.startsWith('## '))
    .map(line => line.replace('## ', ''));

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 right-0 z-[1000]">
        <Navbar scrollToSection={scrollToSection} />
      </div>

      {/* Floating Back Button - Left (same line as navbar) */}
      <button
        onClick={() => navigate('/learnings?tab=projects')}
        className="hidden md:flex fixed left-6 top-4 md:top-6 z-[1001] items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md border-2 border-black rounded-full shadow-lg hover:bg-black hover:text-white transition-all group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold text-sm">Back</span>
      </button>

      {/* Floating Avatar - Right (same line as navbar) */}
      <div className="hidden md:flex fixed right-6 top-4 md:top-6 z-[1001] items-center gap-3 px-4 py-2 bg-white/90 backdrop-blur-md border-2 border-black rounded-full shadow-lg">
        <img
          src="/me.png"
          alt="Kunal Patil"
          className="w-10 h-10 rounded-full object-cover grayscale"
        />
        <span className="font-bold text-sm">Kunal Patil</span>
      </div>

      {/* Main Content - Add padding for fixed navbar */}
      <main className="max-w-7xl mx-auto px-6 py-12 pt-[120px] md:pt-[140px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar - Project Info - Fixed Position */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="fixed top-[140px] w-[calc((100vw-1280px)/2+256px)] max-w-[256px] space-y-6 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar pr-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags?.map((tech: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Links</h3>
                <div className="space-y-2">
                  {project.githubLink && (
                    <a
                      href={project.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
                    >
                      <Github size={16} />
                      <span>View Code</span>
                    </a>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Navigation</h3>
                <nav className="space-y-2">
                  {sections.map((section, idx) => (
                    <a
                      key={idx}
                      href={`#${section.toLowerCase().replace(/\s+/g, '-')}`}
                      className="block text-sm text-gray-600 hover:text-black py-1 border-l-2 border-transparent hover:border-black pl-3 transition-colors"
                    >
                      {section}
                    </a>
                  ))}
                </nav>
              </div>
            </div>
          </aside>

          {/* Project Content - Scrollable */}
          <article className="lg:col-span-9">
            {/* Category Badge */}
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                {project.topics?.[0] || 'Project'}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {project.title}
            </h1>

            {/* Tagline */}
            <p className="text-xl text-gray-600 mb-8">
              {project.tagline}
            </p>

            {/* Markdown Content */}
            <div className="markdown-content">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({node, children, ...props}) => {
                    const text = children?.toString() || '';
                    const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                    return <h1 id={id} className="text-4xl font-bold text-gray-900 mt-8 mb-6 scroll-mt-24" {...props}>{children}</h1>;
                  },
                  h2: ({node, children, ...props}) => {
                    const text = children?.toString() || '';
                    const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                    return <h2 id={id} className="text-3xl font-bold text-gray-900 mt-12 mb-6 pb-3 border-b border-gray-200 scroll-mt-24" {...props}>{children}</h2>;
                  },
                  h3: ({node, children, ...props}) => {
                    const text = children?.toString() || '';
                    const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                    return <h3 id={id} className="text-2xl font-bold text-gray-900 mt-8 mb-4 scroll-mt-24" {...props}>{children}</h3>;
                  },
                  p: ({node, ...props}) => <p className="text-gray-700 text-lg leading-relaxed mb-6" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc ml-6 my-6 space-y-2" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal ml-6 my-6 space-y-2" {...props} />,
                  li: ({node, ...props}) => <li className="text-gray-700 text-lg leading-relaxed" {...props} />,
                  a: ({node, ...props}) => <a className="text-blue-600 hover:underline" {...props} />,
                  img: ({node, ...props}) => <img className="rounded-xl shadow-lg my-8 w-full" {...props} />,
                  code: ({node, inline, ...props}: any) => 
                    inline 
                      ? <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono" {...props} />
                      : <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-6 text-sm font-mono" {...props} />,
                  pre: ({node, ...props}) => <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-6" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-6" {...props} />,
                  hr: ({node, ...props}) => <hr className="my-8 border-gray-300" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                }}
              >
                {markdownContent}
              </ReactMarkdown>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
