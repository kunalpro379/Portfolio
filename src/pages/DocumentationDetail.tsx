import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, FileText, Link as LinkIcon, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { API_ENDPOINTS } from '@/config/api';

interface Documentation {
  docId: string;
  title: string;
  subject: string;
  description: string;
  tags: string[];
  date: string;
  time: string;
  content: string;
  isPublic: boolean;
  assets?: Record<string, string>;
  files?: Array<{
    fileId: string;
    name: string;
    type: string;
    azureUrl: string;
  }>;
}

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function DocumentationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<Documentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<any>(null);
  const [diagramData, setDiagramData] = useState<any>(null);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_ENDPOINTS.documentation}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch documentation');
        const data = await response.json();
        
        // Fetch all files
        const filesResponse = await fetch(`${API_ENDPOINTS.documentation}/${id}/files`);
        const filesData = await filesResponse.json();
        
        // Process content to replace asset placeholders
        let processedContent = data.doc.content;
        if (data.doc.assets) {
          Object.entries(data.doc.assets).forEach(([name, url]) => {
            const placeholder = new RegExp(`\\{\\{${name}\\}\\}`, 'g');
            processedContent = processedContent.replace(placeholder, url as string);
          });
        }
        
        setDoc({ 
          ...data.doc, 
          content: processedContent,
          files: filesData.files || []
        });
      } catch (err) {
        console.error('Error fetching documentation:', err);
        setError(err instanceof Error ? err.message : 'Failed to load documentation');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDoc();
  }, [id]);

  // Extract headings from markdown content
  const headings = useMemo(() => {
    const content = selectedFileContent || doc?.content || '';
    if (!content) return [];
    
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const matches = [...content.matchAll(headingRegex)];
    
    return matches.map((match, index) => ({
      id: `heading-${index}`,
      text: match[2],
      level: match[1].length
    }));
  }, [selectedFileContent, doc?.content]);

  // Derived values
  const attachments = doc?.files?.filter(f => f.type === 'attachment') || [];
  const markdownFiles = doc?.files?.filter(f => f.type === 'markdown') || [];
  const diagramFiles = doc?.files?.filter(f => f.type === 'diagram') || [];
  const currentContent = selectedFileContent || doc?.content || '';

  // Set default file on load - MUST be before any conditional returns
  useEffect(() => {
    if (doc && !selectedFile && markdownFiles.length > 0) {
      const indexMd = markdownFiles.find(f => f.name === 'index.md');
      if (indexMd) {
        loadFile(indexMd);
      } else if (markdownFiles.length > 0) {
        loadFile(markdownFiles[0]);
      }
    } else if (doc && !selectedFile && doc.content) {
      setSelectedFileContent(doc.content);
    }
  }, [doc, selectedFile, markdownFiles]);

  // Load file content
  const loadFile = async (file: any) => {
    setSelectedFile(file);
    setDiagramData(null);
    
    if (file.type === 'markdown') {
      try {
        const response = await fetch(`${API_ENDPOINTS.documentation}/${id}/files/${file.fileId}`);
        const data = await response.json();
        
        // Process content to replace asset placeholders
        let processedContent = data.file.content || '';
        if (doc?.assets) {
          Object.entries(doc.assets).forEach(([name, url]) => {
            const placeholder = new RegExp(`\\{\\{${name}\\}\\}`, 'g');
            processedContent = processedContent.replace(placeholder, url as string);
          });
        }
        
        setSelectedFileContent(processedContent);
      } catch (err) {
        console.error('Error loading file:', err);
        setSelectedFileContent('');
      }
    } else if (file.type === 'diagram') {
      // For diagrams, load Excalidraw data
      try {
        const response = await fetch(`${API_ENDPOINTS.documentation}/${id}/files/${file.fileId}`);
        const data = await response.json();
        setDiagramData(data.file.content);
        setSelectedFileContent(null);
      } catch (err) {
        console.error('Error loading diagram:', err);
        setDiagramData(null);
      }
    }
  };

  // Scroll to section
  const scrollToSection = (headingId: string) => {
    const element = document.getElementById(headingId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(headingId);
    }
  };

  // Custom markdown components to add IDs to headings
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

  if (error || !doc) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4 font-bold">{error || 'Documentation not found'}</p>
          <button
            onClick={() => navigate('/learnings?tab=documentation')}
            className="px-6 py-3 bg-black text-white border-3 border-black rounded-xl font-bold hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            Back to Documentation
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
            onClick={() => navigate('/learnings?tab=documentation')}
            className="flex items-center gap-2 text-gray-600 hover:text-black font-bold text-base"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
            Back to Documentation
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Fixed Sidebar */}
        <div className="w-80 bg-white border-r-4 border-black overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Document Info */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-blue-100 border-2 border-black rounded-lg text-xs font-bold">
                  {doc.subject}
                </span>
                {doc.isPublic && (
                  <span className="px-3 py-1 bg-green-100 border-2 border-black rounded-lg text-xs font-bold">
                    Public
                  </span>
                )}
              </div>
              
              <h2 className="text-xl font-black text-black mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                {doc.title}
              </h2>
              
              {doc.description && (
                <p className="text-sm text-gray-700 mb-3 font-medium">{doc.description}</p>
              )}
              
              <div className="flex flex-col gap-2 text-xs text-gray-600 font-medium">
                {doc.date && (
                  <div className="flex items-center gap-1">
                    <Calendar size={12} strokeWidth={2.5} />
                    <span>{doc.date}</span>
                  </div>
                )}
                {doc.time && (
                  <div className="flex items-center gap-1">
                    <Clock size={12} strokeWidth={2.5} />
                    <span>{doc.time}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t-2 border-black"></div>

            {/* Markdown Files */}
            {markdownFiles.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4" strokeWidth={2.5} />
                  <h3 className="font-black text-sm uppercase">Markdown Files</h3>
                </div>
                <div className="space-y-1">
                  {markdownFiles.map((file) => (
                    <button
                      key={file.fileId}
                      onClick={() => loadFile(file)}
                      className={`w-full text-left p-2 rounded-lg transition-all text-sm font-medium hover:bg-gray-100 ${
                        selectedFile?.fileId === file.fileId ? 'bg-blue-100 border-2 border-black' : ''
                      }`}
                    >
                      📄 {file.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Diagram Files */}
            {diagramFiles.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4" strokeWidth={2.5} />
                  <h3 className="font-black text-sm uppercase">Diagrams</h3>
                </div>
                <div className="space-y-1">
                  {diagramFiles.map((file) => (
                    <button
                      key={file.fileId}
                      onClick={() => loadFile(file)}
                      className={`w-full text-left p-2 rounded-lg transition-all text-sm font-medium hover:bg-gray-100 ${
                        selectedFile?.fileId === file.fileId ? 'bg-green-100 border-2 border-black' : ''
                      }`}
                    >
                      ✏️ {file.name}
                    </button>
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
                        activeSection === heading.id ? 'bg-yellow-100 border-2 border-black' : ''
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
            {doc.tags && doc.tags.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <LinkIcon className="w-4 h-4" strokeWidth={2.5} />
                  <h3 className="font-black text-sm uppercase">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {doc.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 text-xs bg-gray-100 border-2 border-black rounded-lg font-bold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments */}
            {attachments.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Download className="w-4 h-4" strokeWidth={2.5} />
                  <h3 className="font-black text-sm uppercase">Attachments</h3>
                </div>
                <div className="space-y-2">
                  {attachments.map((file) => (
                    <a
                      key={file.fileId}
                      href={file.azureUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-purple-100 border-2 border-black rounded-lg hover:bg-purple-200 transition-all"
                    >
                      <FileText size={16} strokeWidth={2.5} />
                      <span className="text-sm font-bold truncate flex-1">{file.name}</span>
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
            {selectedFile && selectedFile.type === 'diagram' && diagramData ? (
              <div className="bg-white border-4 border-black rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="bg-black text-white px-6 py-3 border-b-4 border-black">
                  <h2 className="text-xl font-black">✏️ {selectedFile.name}</h2>
                </div>
                <div className="h-[800px] p-8">
                  <div className="bg-gray-100 border-2 border-black rounded-xl p-8 h-full flex items-center justify-center">
                    <div className="text-center">
                      <FileText size={64} strokeWidth={2.5} className="mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-700 font-bold text-lg mb-2">Excalidraw Diagram</p>
                      <p className="text-sm text-gray-600 font-medium mb-4">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">Install package to view:</p>
                      <code className="text-xs bg-black text-white px-3 py-1 rounded mt-2 inline-block font-mono">
                        npm install @excalidraw/excalidraw
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <article className="bg-white border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={components}
                >
                  {currentContent}
                </ReactMarkdown>
              </article>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
