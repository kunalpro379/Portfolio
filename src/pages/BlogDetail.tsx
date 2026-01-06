import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, ExternalLink, FileText, Link as LinkIcon, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { API_ENDPOINTS } from '@/config/api';

interface Blog {
  blogId: string;
  title: string;
  slug: string;
  tagline: string;
  subject: string;
  shortDescription: string;
  content: string;
  tags: string[];
  datetime: string;
  footer: string;
  coverImage: string;
  blogLinks: Array<{ name: string; url: string }>;
}

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_ENDPOINTS.blogs}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch blog');
        const data = await response.json();
        setBlog(data.blog);
      } catch (err) {
        console.error('Error fetching blog:', err);
        setError(err instanceof Error ? err.message : 'Failed to load blog');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBlog();
  }, [id]);

  // Extract headings from markdown content
  const headings = useMemo(() => {
    if (!blog?.content) return [];
    
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const matches = [...blog.content.matchAll(headingRegex)];
    
    return matches.map((match, index) => ({
      id: `heading-${index}`,
      text: match[2],
      level: match[1].length
    }));
  }, [blog?.content]);

  // Scroll to section
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
      return <h2 id={id} className="text-2xl font-black text-black mb-3 mt-6" {...props}>{children}</h2>;
    },
    h3: ({ children, ...props }: any) => {
      const index = headings.findIndex(h => h.text === children);
      const id = index >= 0 ? headings[index].id : '';
      return <h3 id={id} className="text-xl font-black text-black mb-2 mt-4" {...props}>{children}</h3>;
    },
    p: ({ children, ...props }: any) => <p className="text-gray-800 mb-4 leading-relaxed font-medium" {...props}>{children}</p>,
    ul: ({ children, ...props }: any) => <ul className="list-disc list-inside mb-4 space-y-2" {...props}>{children}</ul>,
    ol: ({ children, ...props }: any) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props}>{children}</ol>,
    li: ({ children, ...props }: any) => <li className="text-gray-800 font-medium" {...props}>{children}</li>,
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
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-2xl font-black">Loading...</div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4 font-bold">{error || 'Blog not found'}</p>
          <button
            onClick={() => navigate('/learnings?tab=blogs')}
            className="px-6 py-3 bg-black text-white border-3 border-black rounded-xl font-bold hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b-4 border-black p-6">
        <div className="max-w-[1800px] mx-auto">
          <button
            onClick={() => navigate('/learnings?tab=blogs')}
            className="flex items-center gap-2 text-gray-600 hover:text-black font-bold text-base"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
            Back to Blogs
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Fixed Sidebar */}
        <div className="w-80 bg-white border-r-4 border-black overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Blog Info */}
            <div>
              <div className="mb-3">
                <span className="px-3 py-1 bg-pink-100 border-2 border-black rounded-lg text-xs font-bold">
                  {blog.subject}
                </span>
              </div>
              
              <h2 className="text-xl font-black text-black mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                {blog.title}
              </h2>
              
              {blog.tagline && (
                <p className="text-sm text-gray-700 mb-3 font-medium">{blog.tagline}</p>
              )}
              
              <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                <Calendar size={12} strokeWidth={2.5} />
                <span>
                  {new Date(blog.datetime).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            <div className="border-t-2 border-black"></div>
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
                        activeSection === heading.id ? 'bg-pink-100 border-2 border-black' : ''
                      }`}
                      style={{ paddingLeft: `${heading.level * 12}px` }}
                    >
                      {heading.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4" strokeWidth={2.5} />
                  <h3 className="font-black text-sm uppercase">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 text-xs bg-gray-100 border-2 border-black rounded-lg font-bold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* External Links */}
            {blog.blogLinks && blog.blogLinks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <LinkIcon className="w-4 h-4" strokeWidth={2.5} />
                  <h3 className="font-black text-sm uppercase">External Links</h3>
                </div>
                <div className="space-y-2">
                  {blog.blogLinks.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-blue-100 border-2 border-black rounded-lg hover:bg-blue-200 transition-all"
                    >
                      <ExternalLink size={16} strokeWidth={2.5} />
                      <span className="text-sm font-bold truncate flex-1">{link.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-4xl mx-auto px-8 py-8">
            {/* Cover Image */}
            {blog.coverImage && (
              <div className="mb-8 rounded-2xl overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <img
                  src={blog.coverImage}
                  alt={blog.title}
                  className="w-full h-[400px] object-cover"
                />
              </div>
            )}

            {/* Content */}
            <article className="bg-white border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={components}
              >
                {blog.content}
              </ReactMarkdown>

              {/* Footer */}
              {blog.footer && (
                <footer className="border-t-4 border-black pt-6 mt-8">
                  <p className="text-gray-700 font-medium">{blog.footer}</p>
                </footer>
              )}
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
