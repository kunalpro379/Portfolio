import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Image as ImageIcon, Trash2, FileText, Plus, Youtube } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ExcalidrawCanvas from '@/components/ExcalidrawCanvas';
import LoadingSpinner from '@/components/LoadingSpinner';
import YouTubeTranscriptModal from '@/components/YouTubeTranscriptModal';
import {
  fetchGuideById,
  fetchGuideBySlug,
  createMarkdownDocument,
  createDiagramDocument,
  updateDocument,
  uploadAttachment,
  deleteDocument,
  type Guide,
  type Document
} from '@/services/guideNotesApi';

export default function GuideNoteEditorPage() {
  const navigate = useNavigate();
  const params = useParams<{ guideId?: string; titleId?: string; mode?: string; guideSlug?: string; titleSlug?: string }>();
  
  // Determine if we're using slug-based URL (view mode) or ID-based URL (edit mode)
  const isSlugBased = !!(params.guideSlug && params.titleSlug);
  const isViewMode = isSlugBased || params.mode === 'view';
  
  const guideId = params.guideId;
  const titleId = params.titleId;

  const [guide, setGuide] = useState<Guide | null>(null);
  const [title, setTitle] = useState<any>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [content, setContent] = useState('');
  const [canvasData, setCanvasData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeView, setActiveView] = useState<'markdown' | 'diagram'>('markdown');
  const [uploading, setUploading] = useState(false);
  const [showDiagramCanvas, setShowDiagramCanvas] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);

  // Markdown formatting helpers
  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    
    setContent(newText);
    
    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertHeading = (level: number) => {
    const prefix = '#'.repeat(level) + ' ';
    insertMarkdown(prefix);
  };

  const insertList = (ordered: boolean) => {
    const prefix = ordered ? '1. ' : '- ';
    insertMarkdown(prefix);
  };

  const insertLink = () => {
    insertMarkdown('[', '](url)');
  };

  const insertImage = () => {
    insertMarkdown('![alt text](', ')');
  };

  const insertCode = () => {
    insertMarkdown('`', '`');
  };

  const insertCodeBlock = () => {
    insertMarkdown('```\n', '\n```');
  };

  useEffect(() => {
    if (isSlugBased && params.guideSlug && params.titleSlug) {
      loadGuideBySlug();
    } else if (guideId && titleId) {
      loadGuideAndTitle();
    }
  }, [guideId, titleId, params.guideSlug, params.titleSlug]);

  const loadGuideBySlug = async () => {
    try {
      setLoading(true);
      const { guide: fetchedGuide, title: fetchedTitle } = await fetchGuideBySlug(params.guideSlug!, params.titleSlug!);
      setGuide(fetchedGuide);
      setTitle(fetchedTitle);
      setDocuments(fetchedTitle.documents);
      
      // Load first markdown document
      const firstMd = fetchedTitle.documents.find(d => d.type === 'markdown');
      if (firstMd) {
        setContent(firstMd.content);
        setSelectedDoc(firstMd);
      }
      
      // Load first diagram
      const firstDiagram = fetchedTitle.documents.find(d => d.type === 'diagram');
      if (firstDiagram && firstDiagram.content) {
        try {
          setCanvasData(JSON.parse(firstDiagram.content));
        } catch (e) {
          // Silently handle diagram parsing errors
        }
      }
    } catch (err) {
      // Silently redirect to guides page if not found
      navigate('/learnings?tab=guide');
    } finally {
      setLoading(false);
    }
  };

  const loadGuideAndTitle = async () => {
    try {
      setLoading(true);
      const fetchedGuide = await fetchGuideById(guideId!);
      setGuide(fetchedGuide);
      
      const foundTitle = fetchedGuide.titles.find(t => t.titleId === titleId);
      if (foundTitle) {
        setTitle(foundTitle);
        setDocuments(foundTitle.documents);
        
        // Load first markdown document
        const firstMd = foundTitle.documents.find(d => d.type === 'markdown');
        if (firstMd) {
          setContent(firstMd.content);
          setSelectedDoc(firstMd);
        }
        
        // Load first diagram
        const firstDiagram = foundTitle.documents.find(d => d.type === 'diagram');
        if (firstDiagram && firstDiagram.content) {
          try {
            setCanvasData(JSON.parse(firstDiagram.content));
          } catch (e) {
            console.error('Error parsing diagram data:', e);
          }
        }
      }
    } catch (err) {
      // Silently handle error and show alert
      alert('Failed to load guide');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedDoc || !guide || !title) {
      alert('No document selected');
      return;
    }

    try {
      setSaving(true);
      await updateDocument(guide.guideId, title.titleId, selectedDoc.documentId, { content });
      alert('Document saved successfully!');
      if (isSlugBased) {
        await loadGuideBySlug();
      } else {
        await loadGuideAndTitle();
      }
    } catch (err) {
      // Silently handle error
      alert('Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !guide || !title) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const doc = await uploadAttachment(guide.guideId, title.titleId, file);
        
        const markdownLink = file.type.startsWith('image/') 
          ? `![${file.name}](${doc.azureUrl})`
          : `[${file.name}](${doc.azureUrl})`;
        
        setContent(prev => prev + '\n\n' + markdownLink);
      }
      if (isSlugBased) {
        await loadGuideBySlug();
      } else {
        await loadGuideAndTitle();
      }
    } catch (error) {
      // Silently handle error
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Delete this document?') || !guide || !title) return;

    try {
      await deleteDocument(guide.guideId, title.titleId, documentId);
      if (isSlugBased) {
        await loadGuideBySlug();
      } else {
        await loadGuideAndTitle();
      }
    } catch (error) {
      // Silently handle error
      alert('Failed to delete document');
    }
  };

  const handleCreateMarkdown = async () => {
    if (!guide || !title) return;
    
    try {
      const name = prompt('Enter markdown file name:');
      if (!name) return;
      
      await createMarkdownDocument(guide.guideId, title.titleId, { name, content: '' });
      if (isSlugBased) {
        await loadGuideBySlug();
      } else {
        await loadGuideAndTitle();
      }
    } catch (error) {
      // Silently handle error
      alert('Failed to create markdown document');
    }
  };

  const handleCreateDiagram = async () => {
    if (!guide || !title) return;
    
    try {
      const name = prompt('Enter diagram name:');
      if (!name) return;
      
      await createDiagramDocument(guide.guideId, title.titleId, { name, content: '' });
      if (isSlugBased) {
        await loadGuideBySlug();
      } else {
        await loadGuideAndTitle();
      }
      setActiveView('diagram');
    } catch (error) {
      // Silently handle error
      alert('Failed to create diagram');
    }
  };

  const handleSaveDiagram = async (data: any) => {
    if (!guide || !title) return;
    
    const diagramDoc = documents.find(d => d.type === 'diagram');
    if (!diagramDoc) return;

    try {
      await updateDocument(guide.guideId, title.titleId, diagramDoc.documentId, { 
        content: JSON.stringify(data) 
      });
      setCanvasData(data);
    } catch (error) {
      // Silently handle error
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (showDiagramCanvas) {
    const canvasId = guide && title ? `guide-${guide.guideId}-title-${title.titleId}` : 'guide-diagram';
    return (
      <ExcalidrawCanvas
        canvasId={canvasId}
        onClose={() => setShowDiagramCanvas(false)}
        onSave={handleSaveDiagram}
        initialData={canvasData}
        viewOnly={isViewMode}
        isPublic={false}
      />
    );
  }

  const markdownDocs = documents.filter(d => d.type === 'markdown');
  const diagramDocs = documents.filter(d => d.type === 'diagram');
  const attachmentDocs = documents.filter(d => d.type === 'attachment');

// VIEW MODE - Clean read-only interface with mobile sidebar
  if (isViewMode) {
    return (
      <div className="min-h-screen flex flex-col relative">
        {/* Animated Background - Same as Learnings Page */}
        {/* Static Background Image for Mobile */}
        <div className="fixed inset-0 z-0 md:hidden">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: 'url(/back11.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              filter: 'grayscale(100%)',
              opacity: 0.45
            }}
          />
        </div>

        {/* Animated Background Images - Desktop Only */}
        <div className="fixed inset-0 z-0 hidden md:block">
          <style>{`
            @keyframes backgroundSlideshow {
              0% { opacity: 0; }
              8% { opacity: 0.55; }
              16% { opacity: 0; }
              100% { opacity: 0; }
            }
            
            .bg-slide {
              position: absolute;
              inset: 0;
              background-size: cover;
              background-position: center;
              background-repeat: no-repeat;
              filter: grayscale(100%);
              opacity: 0;
            }
            
            .bg-slide-1 { animation: backgroundSlideshow 104s ease-in-out infinite 0s; background-image: url(/back1.png); }
            .bg-slide-2 { animation: backgroundSlideshow 104s ease-in-out infinite 8s; background-image: url(/back2.png); }
            .bg-slide-3 { animation: backgroundSlideshow 104s ease-in-out infinite 16s; background-image: url(/back3.png); }
            .bg-slide-4 { animation: backgroundSlideshow 104s ease-in-out infinite 24s; background-image: url(/back4.png); }
            .bg-slide-5 { animation: backgroundSlideshow 104s ease-in-out infinite 32s; background-image: url(/back5.png); }
            .bg-slide-6 { animation: backgroundSlideshow 104s ease-in-out infinite 40s; background-image: url(/back6.png); }
            .bg-slide-7 { animation: backgroundSlideshow 104s ease-in-out infinite 48s; background-image: url(/back7.png); }
            .bg-slide-8 { animation: backgroundSlideshow 104s ease-in-out infinite 56s; background-image: url(/back8.png); }
            .bg-slide-9 { animation: backgroundSlideshow 104s ease-in-out infinite 64s; background-image: url(/back9.png); }
            .bg-slide-10 { animation: backgroundSlideshow 104s ease-in-out infinite 72s; background-image: url(/back10.png); }
            .bg-slide-11 { animation: backgroundSlideshow 104s ease-in-out infinite 80s; background-image: url(/back11.png); }
            .bg-slide-12 { animation: backgroundSlideshow 104s ease-in-out infinite 88s; background-image: url(/back12.png); }
            .bg-slide-13 { animation: backgroundSlideshow 104s ease-in-out infinite 96s; background-image: url(/back13.png); }
          `}</style>
          <div className="bg-slide bg-slide-1" />
          <div className="bg-slide bg-slide-2" />
          <div className="bg-slide bg-slide-3" />
          <div className="bg-slide bg-slide-4" />
          <div className="bg-slide bg-slide-5" />
          <div className="bg-slide bg-slide-6" />
          <div className="bg-slide bg-slide-7" />
          <div className="bg-slide bg-slide-8" />
          <div className="bg-slide bg-slide-9" />
          <div className="bg-slide bg-slide-10" />
          <div className="bg-slide bg-slide-11" />
          <div className="bg-slide bg-slide-12" />
          <div className="bg-slide bg-slide-13" />
        </div>
        
        {/* Beautiful Gradient Background - Top to Bottom */}
        <div
          className="fixed inset-0 z-[1]"
          style={{
            background: 'linear-gradient(to bottom, rgba(243, 232, 255, 0.6) 0%, rgba(219, 234, 254, 0.6) 16.67%, rgba(220, 252, 231, 0.6) 33.33%, rgba(254, 252, 232, 0.6) 50%, rgba(255, 237, 213, 0.6) 66.67%, rgba(254, 226, 226, 0.6) 83.33%, rgba(254, 226, 226, 0.5) 100%)'
          }}
        />

        {/* Background Texture Pattern on Top */}
        <div className="fixed inset-0 z-[2] opacity-20 mix-blend-multiply" style={{ backgroundImage: 'url(/page7.png)', backgroundRepeat: 'repeat', filter: 'grayscale(100%) brightness(0)' }} />
        
        {/* Simple Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-3 py-2 md:px-6 md:py-3 flex-shrink-0 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => navigate('/learnings?tab=guide')}
            className="flex items-center gap-1 text-gray-600 hover:text-black font-medium text-xs md:text-sm transition-all"
          >
            <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Back to Learnings</span>
          </button>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="md:hidden p-1.5 bg-black text-white rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden relative z-[3]">
          {/* Mobile Sidebar Overlay */}
          {showMobileSidebar && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setShowMobileSidebar(false)}
            />
          )}

          {/* Left Sidebar - Hidden on mobile by default */}
          <div className={`${
            showMobileSidebar ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 fixed md:relative z-50 md:z-0 w-72 md:w-72 h-full bg-white border-r border-gray-200 flex flex-col overflow-hidden flex-shrink-0 transition-transform duration-300`}>
            {/* Guide Info Card */}
            <div className="p-3 md:p-4 border-b border-gray-200 flex-shrink-0">
              <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-black rounded-xl p-3 md:p-4 shadow-sm">
                <h2 className="text-base md:text-lg font-black text-black mb-2 line-clamp-2">
                  {title?.name || 'Guide'}
                </h2>
                {guide && (
                  <>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {guide.topic && (
                        <span className="px-2 py-0.5 bg-blue-500 text-white border border-black rounded text-[10px] md:text-xs font-bold uppercase">
                          {guide.topic}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] md:text-xs text-gray-600 font-medium">
                      Date: {new Date().toISOString().split('T')[0]}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Markdown Files */}
            <div className="border-b border-gray-200 flex-shrink-0">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                <FileText size={14} strokeWidth={2.5} className="text-gray-700" />
                <span className="font-black text-[10px] md:text-xs uppercase tracking-wider text-gray-700">Markdown</span>
              </div>
              <div className="p-2 max-h-40 md:max-h-48 overflow-y-auto">
                {markdownDocs.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-2">No documents</p>
                ) : (
                  markdownDocs.map((doc) => (
                    <div
                      key={doc.documentId}
                      onClick={() => {
                        setSelectedDoc(doc);
                        setContent(doc.content);
                        setActiveView('markdown');
                        setShowMobileSidebar(false);
                      }}
                      className={`px-2 md:px-3 py-1.5 md:py-2 mb-1 rounded-lg cursor-pointer transition-all text-xs md:text-sm ${
                        selectedDoc?.documentId === doc.documentId
                          ? 'bg-blue-100 border-2 border-blue-400 font-bold text-blue-900'
                          : 'bg-white hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      <span className="line-clamp-1">{doc.name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Diagrams */}
            <div className="border-b border-gray-200 flex-shrink-0">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                <ImageIcon size={14} strokeWidth={2.5} className="text-purple-600" />
                <span className="font-black text-[10px] md:text-xs uppercase tracking-wider text-gray-700">Diagrams</span>
              </div>
              <div className="p-2 max-h-32 md:max-h-40 overflow-y-auto">
                {diagramDocs.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-2">No diagrams</p>
                ) : (
                  diagramDocs.map((doc) => (
                    <div
                      key={doc.documentId}
                      onClick={() => {
                        if (doc.content) {
                          try {
                            setCanvasData(JSON.parse(doc.content));
                          } catch (e) {
                            // Silently handle diagram parsing errors
                          }
                        }
                        setShowDiagramCanvas(true);
                        setShowMobileSidebar(false);
                      }}
                      className="px-2 md:px-3 py-1.5 md:py-2 mb-1 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-all border border-purple-300 text-xs md:text-sm"
                    >
                      <span className="font-medium line-clamp-1">{doc.name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Attachments */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                <Upload size={14} strokeWidth={2.5} className="text-green-600" />
                <span className="font-black text-[10px] md:text-xs uppercase tracking-wider text-gray-700">Attachments</span>
              </div>
              <div className="p-2">
                {attachmentDocs.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">No attachments</p>
                ) : (
                  <div className="space-y-1">
                    {attachmentDocs.map((doc) => (
                      <a
                        key={doc.documentId}
                        href={doc.azureUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-2 py-1.5 bg-white rounded-lg text-[10px] md:text-xs font-medium hover:bg-gray-50 transition-all border border-gray-300 line-clamp-1"
                        onClick={() => setShowMobileSidebar(false)}
                      >
                        {doc.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 overflow-y-auto bg-white">
            {selectedDoc ? (
              <div className="w-full mx-auto px-3 py-4 md:px-8 md:py-8">
                {/* Document Header - Mobile Optimized */}
                <div className="mb-4 md:mb-8 pb-3 md:pb-4 border-b border-gray-200">
                  <h1 className="text-xl md:text-3xl font-black text-black mb-1 md:mb-2 break-words">
                    {selectedDoc.name.replace('.md', '')}
                  </h1>
                </div>

                {/* Rendered Markdown - Mobile Optimized */}
                <div className="prose prose-sm md:prose-lg max-w-none prose-headings:font-black prose-headings:text-black prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-black prose-strong:font-bold prose-code:text-sm prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-img:rounded-lg prose-img:shadow-md">
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{
                              margin: 0,
                              borderRadius: '0.5rem',
                              fontSize: '0.875rem',
                              padding: '1rem'
                            }}
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {content || '*No content*'}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full p-8">
                <div className="text-center">
                  <FileText size={48} className="mx-auto mb-4 text-gray-300" strokeWidth={1.5} />
                  <p className="text-gray-500 font-medium text-sm md:text-base">Select a document to view</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  // EDIT MODE - Full editor interface

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Upload Progress Bar */}
      {uploading && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="h-1 bg-gray-200">
            <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse" 
                 style={{ 
                   width: '100%',
                   animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                 }} 
            />
          </div>
          <div className="bg-black text-white px-4 py-2 text-center text-sm font-bold">
            Uploading files...
          </div>
        </div>
      )}
      
      {/* Header - Mobile Responsive */}
      <div className="bg-white border-b-2 md:border-b-4 border-black px-3 py-2 md:p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
            <button
              onClick={() => guide ? navigate(`/learnings/guide/${guide.guideId}`) : navigate('/learnings?tab=guide')}
              className="flex items-center gap-1 md:gap-2 text-gray-600 hover:text-black font-bold text-xs md:text-sm transition-all flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
              <span className="hidden sm:inline">Back</span>
            </button>
            <h1 className="text-base md:text-2xl font-black text-black truncate">
              {title?.name || 'Edit'}
            </h1>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="md:hidden p-1.5 bg-black text-white rounded-lg ml-2 flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Desktop Controls */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center border-3 border-black rounded-lg overflow-hidden">
              <button
                onClick={() => setActiveView('markdown')}
                className={`px-4 py-2 font-bold text-sm transition-all ${
                  activeView === 'markdown'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                Markdown
              </button>
              <button
                onClick={() => setActiveView('diagram')}
                className={`px-4 py-2 font-bold text-sm transition-all border-l-3 border-black ${
                  activeView === 'diagram'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                Diagram
              </button>
            </div>
            {!isViewMode && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-black text-white border-3 border-black rounded-lg font-bold hover:bg-gray-800 transition-all disabled:opacity-50"
              >
                <Save size={18} strokeWidth={2.5} />
                Save All
              </button>
            )}
          </div>
        </div>
        
        {/* Mobile View Tabs */}
        <div className="md:hidden flex items-center gap-2 mt-2">
          <div className="flex items-center border-2 border-black rounded-lg overflow-hidden flex-1">
            <button
              onClick={() => setActiveView('markdown')}
              className={`flex-1 px-3 py-1.5 font-bold text-xs transition-all ${
                activeView === 'markdown'
                  ? 'bg-black text-white'
                  : 'bg-white text-black'
              }`}
            >
              Markdown
            </button>
            <button
              onClick={() => setActiveView('diagram')}
              className={`flex-1 px-3 py-1.5 font-bold text-xs transition-all border-l-2 border-black ${
                activeView === 'diagram'
                  ? 'bg-black text-white'
                  : 'bg-white text-black'
              }`}
            >
              Diagram
            </button>
          </div>
          {!isViewMode && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 bg-black text-white border-2 border-black rounded-lg font-bold text-xs disabled:opacity-50 flex-shrink-0"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {showMobileSidebar && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setShowMobileSidebar(false)}
          />
        )}

        {/* Sidebar - Responsive */}
        <div className={`${
          showMobileSidebar ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:relative z-50 md:z-0 w-72 md:w-64 h-full bg-white border-r-2 md:border-r-4 border-black flex flex-col overflow-hidden transition-transform duration-300`}>
          <div className="p-2 md:p-3 border-b-2 border-gray-200 flex-shrink-0 space-y-2">
            {!isViewMode && (
              <>
                <button 
                  onClick={() => {
                    handleCreateMarkdown();
                    setShowMobileSidebar(false);
                  }}
                  className="w-full px-3 md:px-4 py-2 bg-green-100 border-2 border-black rounded-lg font-bold text-xs md:text-sm hover:bg-green-200 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  New File
                </button>
                <button 
                  onClick={() => {
                    setShowYouTubeModal(true);
                    setShowMobileSidebar(false);
                  }}
                  className="w-full px-3 md:px-4 py-2 bg-red-100 border-2 border-black rounded-lg font-bold text-xs md:text-sm hover:bg-red-200 transition-all flex items-center justify-center gap-2"
                >
                  <Youtube size={16} strokeWidth={2.5} />
                  YouTube Video
                </button>
              </>
            )}
          </div>

          {/* Markdown Files */}
          <div className="border-b-2 border-gray-200 flex-shrink-0">
            <div className="p-2 md:p-3 bg-gray-50 border-b-2 border-gray-200">
              <div className="flex items-center gap-2">
                <FileText size={14} strokeWidth={2.5} />
                <span className="font-black text-[10px] md:text-xs uppercase tracking-wider">Markdown</span>
              </div>
            </div>
            <div className="p-2 max-h-32 md:max-h-40 overflow-y-auto">
              {markdownDocs.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-2">No markdown files</p>
              ) : (
                markdownDocs.map((doc) => (
                  <div
                    key={doc.documentId}
                    onClick={() => {
                      setSelectedDoc(doc);
                      setContent(doc.content);
                      setActiveView('markdown');
                      setShowMobileSidebar(false);
                    }}
                    className={`px-2 md:px-3 py-1.5 md:py-2 mb-1 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                      selectedDoc?.documentId === doc.documentId
                        ? 'bg-blue-50 border-2 border-blue-300'
                        : 'bg-gray-50 border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xs md:text-sm font-bold truncate flex-1">{doc.name}</span>
                    {!isViewMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDocument(doc.documentId);
                        }}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={12} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Diagrams */}
          <div className="border-b-2 border-gray-200 flex-shrink-0">
            <div className="p-2 md:p-3 bg-gray-50 border-b-2 border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon size={14} strokeWidth={2.5} />
                <span className="font-black text-[10px] md:text-xs uppercase tracking-wider">Diagrams</span>
              </div>
              {!isViewMode && (
                <button
                  onClick={() => {
                    handleCreateDiagram();
                    setShowMobileSidebar(false);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Plus size={16} strokeWidth={2.5} />
                </button>
              )}
            </div>
            <div className="p-2 max-h-32 md:max-h-40 overflow-y-auto">
              {diagramDocs.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-2">No diagrams</p>
              ) : (
                diagramDocs.map((doc) => (
                  <div
                    key={doc.documentId}
                    onClick={() => {
                      if (doc.content) {
                        try {
                          setCanvasData(JSON.parse(doc.content));
                        } catch (e) {
                          // Silently handle diagram parsing errors
                        }
                      }
                      setShowDiagramCanvas(true);
                      setShowMobileSidebar(false);
                    }}
                    className="px-2 md:px-3 py-1.5 md:py-2 mb-1 bg-purple-50 border-2 border-purple-300 rounded-lg flex items-center justify-between cursor-pointer hover:bg-purple-100 transition-all"
                  >
                    <span className="text-xs md:text-sm font-bold truncate flex-1">{doc.name}</span>
                    {!isViewMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDocument(doc.documentId);
                        }}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={12} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Attachments */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2 md:p-3 bg-gray-50 border-b-2 border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload size={14} strokeWidth={2.5} />
                <span className="font-black text-[10px] md:text-xs uppercase tracking-wider">Attachments</span>
              </div>
              {!isViewMode && (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <Plus size={16} strokeWidth={2.5} className="text-blue-600 hover:text-blue-800" />
                </label>
              )}
            </div>
            <div className="p-2">
              {attachmentDocs.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">No attachments</p>
              ) : (
                <div className="space-y-1">
                  {attachmentDocs.map((doc) => (
                    <div
                      key={doc.documentId}
                      className="px-2 py-1.5 bg-gray-50 border border-gray-300 rounded flex items-center justify-between hover:bg-gray-100 transition-all"
                    >
                      <a 
                        href={doc.azureUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] md:text-xs font-medium truncate flex-1 hover:text-blue-600"
                        onClick={() => setShowMobileSidebar(false)}
                      >
                        {doc.name}
                      </a>
                      {!isViewMode && (
                        <button
                          onClick={() => handleDeleteDocument(doc.documentId)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={12} strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Editor Area - Mobile: Full width editor only, Desktop: Split view */}
        <div className="flex-1 flex overflow-hidden">
          {activeView === 'markdown' ? (
            <>
              {/* Editor - Full width on mobile */}
              <div className="w-full md:w-1/2 border-r border-gray-700 overflow-hidden bg-gray-900 flex flex-col">
                {/* Editor Header */}
                <div className="bg-gray-800 border-b border-gray-700 px-3 md:px-4 py-2 flex items-center justify-between flex-shrink-0">
                  <span className="text-white font-bold text-xs md:text-sm truncate">
                    {selectedDoc?.name || 'No file selected'}
                  </span>
                  {!isViewMode && selectedDoc && (
                    <button 
                      onClick={handleSave}
                      disabled={saving}
                      className="px-2 md:px-3 py-1 bg-blue-600 text-white text-[10px] md:text-xs font-bold rounded hover:bg-blue-700 transition-all disabled:opacity-50 ml-2"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  )}
                </div>

                {/* Markdown Toolbar */}
                {!isViewMode && selectedDoc && (
                  <div className="bg-gray-800 border-b border-gray-700 px-2 md:px-3 py-2 flex items-center gap-1 md:gap-2 overflow-x-auto flex-shrink-0">
                    {/* Headings */}
                    <div className="flex items-center gap-1 border-r border-gray-600 pr-2">
                      <button
                        onClick={() => insertHeading(1)}
                        className="p-1.5 md:p-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs md:text-sm font-bold transition-all"
                        title="Heading 1"
                      >
                        H1
                      </button>
                      <button
                        onClick={() => insertHeading(2)}
                        className="p-1.5 md:p-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs md:text-sm font-bold transition-all"
                        title="Heading 2"
                      >
                        H2
                      </button>
                      <button
                        onClick={() => insertHeading(3)}
                        className="p-1.5 md:p-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs md:text-sm font-bold transition-all"
                        title="Heading 3"
                      >
                        H3
                      </button>
                    </div>

                    {/* Text Formatting */}
                    <div className="flex items-center gap-1 border-r border-gray-600 pr-2">
                      <button
                        onClick={() => insertMarkdown('**', '**')}
                        className="p-1.5 md:p-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-bold transition-all"
                        title="Bold"
                      >
                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 5a1 1 0 011-1h5.5a3.5 3.5 0 110 7H4v3a1 1 0 11-2 0V5zm3 5h4.5a1.5 1.5 0 000-3H6v3z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => insertMarkdown('*', '*')}
                        className="p-1.5 md:p-2 bg-gray-700 hover:bg-gray-600 text-white rounded italic transition-all"
                        title="Italic"
                      >
                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9.5L7 14H9a1 1 0 110 2H7a1 1 0 110-2h.5L10 4H9a1 1 0 01-1-1z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => insertMarkdown('~~', '~~')}
                        className="p-1.5 md:p-2 bg-gray-700 hover:bg-gray-600 text-white rounded line-through transition-all text-xs md:text-sm"
                        title="Strikethrough"
                      >
                        S
                      </button>
                    </div>

                    {/* Lists */}
                    <div className="flex items-center gap-1 border-r border-gray-600 pr-2">
                      <button
                        onClick={() => insertList(false)}
                        className="p-1.5 md:p-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-all"
                        title="Bullet List"
                      >
                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => insertList(true)}
                        className="p-1.5 md:p-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-all text-xs md:text-sm font-bold"
                        title="Numbered List"
                      >
                        1.
                      </button>
                    </div>

                    {/* Links & Images */}
                    <div className="flex items-center gap-1 border-r border-gray-600 pr-2">
                      <button
                        onClick={insertLink}
                        className="p-1.5 md:p-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-all"
                        title="Insert Link"
                      >
                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                        </svg>
                      </button>
                      <button
                        onClick={insertImage}
                        className="p-1.5 md:p-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-all"
                        title="Insert Image"
                      >
                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                      </button>
                    </div>

                    {/* Code */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={insertCode}
                        className="p-1.5 md:p-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-all"
                        title="Inline Code"
                      >
                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                        </svg>
                      </button>
                      <button
                        onClick={insertCodeBlock}
                        className="p-1.5 md:p-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-all text-xs md:text-sm font-mono"
                        title="Code Block"
                      >
                        {'</>'}
                      </button>
                      <button
                        onClick={() => insertMarkdown('> ')}
                        className="p-1.5 md:p-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-all text-xs md:text-sm font-bold"
                        title="Quote"
                      >
                        "
                      </button>
                    </div>
                  </div>
                )}

                {/* Textarea */}
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="# Start writing your markdown here..."
                  className="flex-1 w-full p-3 md:p-4 bg-gray-900 text-gray-100 font-mono text-xs md:text-sm resize-none focus:outline-none overflow-y-auto"
                  disabled={isViewMode}
                />
              </div>

              {/* Preview - Hidden on mobile, shown on desktop */}
              <div className="hidden md:block md:w-1/2 overflow-y-auto bg-gray-800 p-6">
                <div className="prose prose-invert prose-sm max-w-none text-white">
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {content || '*Start writing to see preview...*'}
                  </ReactMarkdown>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-100 p-4">
              <button
                onClick={() => setShowDiagramCanvas(true)}
                className="px-6 md:px-8 py-3 md:py-4 bg-black text-white border-2 md:border-3 border-black rounded-xl font-bold hover:bg-gray-800 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm md:text-base"
              >
                Open Diagram Editor
              </button>
            </div>
          )}
        </div>
      </div>

      {/* YouTube Transcript Modal */}
      {guide && title && (
        <YouTubeTranscriptModal
          isOpen={showYouTubeModal}
          onClose={() => setShowYouTubeModal(false)}
          guideId={guide.guideId}
          titleId={title.titleId}
          onSuccess={() => {
            if (isSlugBased) {
              loadGuideBySlug();
            } else {
              loadGuideAndTitle();
            }
          }}
        />
      )}
    </div>
  );
}
