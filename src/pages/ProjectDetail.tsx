import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { Github, ExternalLink, ArrowLeft, FileText, Tag, Link as LinkIcon, Image as ImageIcon, Menu, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { API_ENDPOINTS } from '@/config/api';
import PageShimmer from '@/components/PageShimmer';

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [markdownContent, setMarkdownContent] = useState('');
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
        setError('No project ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const projectResponse = await fetch(`${API_ENDPOINTS.projects}/${id}`);
        if (!projectResponse.ok) {
          throw new Error('Project not found');
        }
        const projectData = await projectResponse.json();
        setProject(projectData.project);

        if (projectData.project.mdFiles && projectData.project.mdFiles.length > 0) {
          try {
            const mdResponse = await fetch(`${API_ENDPOINTS.projects}/${id}/md-content`);
            const mdData = await mdResponse.json();
            if (mdData.exists && mdData.content) {
              setMarkdownContent(mdData.content);
            }
          } catch (mdError) {
            console.error('Error loading markdown:', mdError);
          }
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // Extract headings from markdown
  const headings = useMemo(() => {
    if (!markdownContent) return [];
    
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const matches = [...markdownContent.matchAll(headingRegex)];
    
    return matches.map((match, index) => ({
      id: `heading-${index}`,
      text: match[2],
      level: match[1].length
    }));
  }, [markdownContent]);

  const scrollToSection = (headingId: string) => {
    const element = document.getElementById(headingId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(headingId);
    }
  };

  // Custom markdown components
  const components = {
    h1: ({ children, ...props }: any) => {
      const index = headings.findIndex(h => h.text === children);
      const id = index >= 0 ? headings[index].id : '';
      return <h1 id={id} className="text-3xl font-black text-black mb-4 mt-8" {...props}>{children}</h1>;
    },
    h2: ({ children, ...props }: any) => {
      const index = headings.findIndex(h => h.text === children);
      const id = index >= 0 ? headings[index].id : '';
      return <h2 id={id} className="text-2xl font-black text-black mb-3 mt-6 pb-3 border-b-4 border-black" {...props}>{children}</h2>;
    },
    h3: ({ children, ...props }: any) => {
      const index = headings.findIndex(h => h.text === children);
      const id = index >= 0 ? headings[index].id : '';
      return <h3 id={id} className="text-xl font-black text-black mb-2 mt-4" {...props}>{children}</h3>;
    },
    p: ({ children, ...props }: any) => <p className="text-gray-800 mb-4 leading-relaxed font-medium text-lg" {...props}>{children}</p>,
    ul: ({ children, ...props }: any) => <ul className="list-disc list-inside mb-4 space-y-2" {...props}>{children}</ul>,
    ol: ({ children, ...props }: any) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props}>{children}</ol>,
    li: ({ children, ...props }: any) => <li className="text-gray-800 font-medium text-lg" {...props}>{children}</li>,
    code: ({ inline, children, ...props }: any) => 
      inline ? (
        <code className="px-2 py-1 bg-gray-100 border-2 border-black rounded text-sm font-mono" {...props}>{children}</code>
      ) : (
        <code className="block p-4 bg-gray-900 text-white rounded-xl border-3 border-black overflow-x-auto font-mono text-sm" {...props}>{children}</code>
      ),
    pre: ({ children, ...props }: any) => <pre className="mb-4 rounded-xl overflow-hidden border-3 border-black" {...props}>{children}</pre>,
    img: ({ src, alt, ...props }: any) => (
      <img src={src} alt={alt} className="w-full rounded-xl border-4 border-black my-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" {...props} />
    ),
    a: ({ href, children, ...props }: any) => (
      <a href={href} className="text-blue-600 font-bold underline hover:text-blue-800" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
    ),
    blockquote: ({ children, ...props }: any) => (
      <blockquote className="border-l-4 border-black pl-4 italic text-gray-700 my-6 bg-gray-50 p-4 rounded-r-xl" {...props}>{children}</blockquote>
    ),
    strong: ({ children, ...props }: any) => <strong className="font-black text-black" {...props}>{children}</strong>,
  };

  if (loading) {
    return <PageShimmer />;
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4 font-bold">{error || 'Project not found'}</p>
          <button
            onClick={() => navigate('/learnings?tab=projects')}
            className="px-6 py-3 bg-black text-white border-3 border-black rounded-xl font-bold hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b-4 border-black p-4 md:p-6">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/learnings?tab=projects')}
            className="flex items-center gap-2 text-gray-600 hover:text-black font-bold text-base"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
            <span className="hidden sm:inline">Back to Projects</span>
          </button>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 bg-black text-white rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Fixed Sidebar */}
        <div className={`
          w-80 bg-white border-r-4 border-black overflow-y-auto
          md:relative absolute inset-y-0 left-0 z-50
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="p-4 space-y-6">
            {/* Project Info */}
            <div className="bg-blue-50 border-3 border-black rounded-xl p-4">
              <div className="mb-3">
                <span className="px-3 py-1 bg-green-100 border-2 border-black rounded-lg text-sm font-bold">
                  {project.tags?.[0] || 'Project'}
                </span>
              </div>
              
              <h1 className="text-2xl font-black text-black mb-3">
                {project.title}
              </h1>
              
              {project.tagline && (
                <p className="text-sm text-gray-700 font-medium">{project.tagline}</p>
              )}
            </div>

            {/* Tech Stack */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4" strokeWidth={2.5} />
                <h3 className="font-black text-sm uppercase">Tech Stack</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.tags?.map((tech: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-xs bg-gray-100 border-2 border-black rounded-lg font-bold"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Links */}
            {project.links && project.links.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <LinkIcon className="w-4 h-4" strokeWidth={2.5} />
                  <h3 className="font-black text-sm uppercase">Links</h3>
                </div>
                <div className="space-y-2">
                  {project.links.map((link: any, idx: number) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-blue-100 border-2 border-black rounded-lg hover:bg-blue-200 transition-all"
                    >
                      {link.name.toLowerCase().includes('github') ? (
                        <Github size={16} strokeWidth={2.5} />
                      ) : (
                        <ExternalLink size={16} strokeWidth={2.5} />
                      )}
                      <span className="text-sm font-bold truncate flex-1">{link.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Table of Contents */}
            {headings.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4" strokeWidth={2.5} />
                  <h3 className="font-black text-sm uppercase">Table of Contents</h3>
                </div>
                <div className="space-y-1">
                  {headings.map((heading) => (
                    <button
                      key={heading.id}
                      onClick={() => scrollToSection(heading.id)}
                      className={`w-full text-left p-2 rounded-lg transition-all text-sm font-medium hover:bg-gray-100 ${
                        activeSection === heading.id ? 'bg-green-100 border-2 border-black' : ''
                      }`}
                      style={{ paddingLeft: `${heading.level * 12}px` }}
                    >
                      {heading.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Project Assets */}
            {project.assets && project.assets.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon className="w-4 h-4" strokeWidth={2.5} />
                  <h3 className="font-black text-sm uppercase">Assets</h3>
                </div>
                <div className="space-y-2">
                  {project.assets.slice(0, 3).map((asset: any, idx: number) => (
                    <div key={idx} className="border-2 border-black rounded-lg overflow-hidden">
                      <img
                        src={asset.url || asset}
                        alt={asset.name || `Asset ${idx + 1}`}
                        className="w-full h-24 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="w-full px-4 md:px-8 py-4 md:py-8">
            {/* Project Info - Mobile Only */}
            <div className="md:hidden mb-6 bg-blue-50 border-3 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="mb-3">
                <span className="px-3 py-1 bg-green-100 border-2 border-black rounded-lg text-sm font-bold">
                  {project.tags?.[0] || 'Project'}
                </span>
              </div>
              
              <h1 className="text-2xl font-black text-black mb-3">
                {project.title}
              </h1>
              
              {project.tagline && (
                <p className="text-sm text-gray-700 font-medium">{project.tagline}</p>
              )}
            </div>

            <div className="border-t-4 border-black mb-6 md:hidden"></div>

            {/* Description */}
            {project.description && (
              <div className="mb-8 p-4 md:p-6">
                <h3 className="text-xl font-black text-black mb-3">About This Project</h3>
                <p className="text-gray-800 leading-relaxed font-medium text-lg">{project.description}</p>
              </div>
            )}

            {/* Markdown Content */}
            {markdownContent ? (
              <article className="p-4 md:p-8">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={components}
                >
                  {markdownContent}
                </ReactMarkdown>
              </article>
            ) : (
              <div className="p-8 md:p-12 text-center">
                <FileText size={64} strokeWidth={2.5} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 font-bold">No detailed documentation available for this project yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
