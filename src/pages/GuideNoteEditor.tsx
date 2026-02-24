import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Image as ImageIcon, Trash2, FileText, Plus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ExcalidrawCanvas from '@/components/ExcalidrawCanvas';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  fetchGuideById,
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
  const { guideId, titleId, mode } = useParams<{ guideId: string; titleId: string; mode?: string }>();
  const isViewMode = mode === 'view';

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

  useEffect(() => {
    if (guideId && titleId) {
      loadGuideAndTitle();
    }
  }, [guideId, titleId]);

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
      console.error('Error loading guide:', err);
      alert('Failed to load guide');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedDoc) {
      alert('No document selected');
      return;
    }

    try {
      setSaving(true);
      await updateDocument(guideId!, titleId!, selectedDoc.documentId, { content });
      alert('Document saved successfully!');
      await loadGuideAndTitle();
    } catch (err) {
      console.error('Error saving document:', err);
      alert('Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const doc = await uploadAttachment(guideId!, titleId!, file);
        
        const markdownLink = file.type.startsWith('image/') 
          ? `![${file.name}](${doc.azureUrl})`
          : `[${file.name}](${doc.azureUrl})`;
        
        setContent(prev => prev + '\n\n' + markdownLink);
      }
      await loadGuideAndTitle();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Delete this document?')) return;

    try {
      await deleteDocument(guideId!, titleId!, documentId);
      await loadGuideAndTitle();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete document');
    }
  };

  const handleCreateMarkdown = async () => {
    try {
      const name = prompt('Enter markdown file name:');
      if (!name) return;
      
      await createMarkdownDocument(guideId!, titleId!, { name, content: '' });
      await loadGuideAndTitle();
    } catch (error) {
      console.error('Error creating markdown:', error);
      alert('Failed to create markdown document');
    }
  };

  const handleCreateDiagram = async () => {
    try {
      const name = prompt('Enter diagram name:');
      if (!name) return;
      
      await createDiagramDocument(guideId!, titleId!, { name, content: '' });
      await loadGuideAndTitle();
      setActiveView('diagram');
    } catch (error) {
      console.error('Error creating diagram:', error);
      alert('Failed to create diagram');
    }
  };

  const handleSaveDiagram = async (data: any) => {
    const diagramDoc = documents.find(d => d.type === 'diagram');
    if (!diagramDoc) return;

    try {
      await updateDocument(guideId!, titleId!, diagramDoc.documentId, { 
        content: JSON.stringify(data) 
      });
      setCanvasData(data);
    } catch (error) {
      console.error('Error saving diagram:', error);
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
    return (
      <ExcalidrawCanvas
        canvasId={`guide-${guideId}-title-${titleId}`}
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

  // VIEW MODE - Clean interface with just content
  if (isViewMode) {
    return (
      <div className="h-screen bg-white flex flex-col overflow-hidden">
        {/* Simple Header */}
        <div className="bg-white border-b-2 border-gray-200 px-6 py-3 flex-shrink-0">
          <button
            onClick={() => navigate('/learnings?tab=guide')}
            className="flex items-center gap-2 text-gray-600 hover:text-black font-medium text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Learnings
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-64 bg-white border-r-2 border-gray-200 flex flex-col overflow-hidden flex-shrink-0">
            {/* Guide Info Card */}
            <div className="p-4 border-b-2 border-gray-200">
              <div className="bg-white border-2 border-black rounded-xl p-4">
                <h2 className="text-lg font-black text-black mb-2">
                  {guide?.name || 'Guide'}
                </h2>
                {title && (
                  <>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {guide?.topic && (
                        <span className="px-2 py-0.5 bg-blue-100 border border-black rounded text-xs font-bold">
                          {guide.topic}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 font-medium">
                      Date: {new Date().toISOString().split('T')[0]}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Markdown Files */}
            <div className="border-b-2 border-gray-200">
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                <FileText size={14} strokeWidth={2.5} />
                <span className="font-black text-xs uppercase tracking-wider">Markdown</span>
              </div>
              <div className="p-2">
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
                      }}
                      className={`px-3 py-2 mb-1 rounded cursor-pointer transition-all ${
                        selectedDoc?.documentId === doc.documentId
                          ? 'bg-gray-200 border border-gray-400'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-sm font-medium">{doc.name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Diagrams */}
            <div className="border-b-2 border-gray-200">
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                <ImageIcon size={14} strokeWidth={2.5} />
                <span className="font-black text-xs uppercase tracking-wider">Diagrams</span>
              </div>
              <div className="p-2">
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
                            console.error('Error parsing diagram:', e);
                          }
                        }
                        setShowDiagramCanvas(true);
                      }}
                      className="px-3 py-2 mb-1 bg-white rounded cursor-pointer hover:bg-gray-50 transition-all"
                    >
                      <span className="text-sm font-medium">{doc.name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Attachments */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                <Upload size={14} strokeWidth={2.5} />
                <span className="font-black text-xs uppercase tracking-wider">Attachments</span>
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
                        className="block px-2 py-1.5 bg-white rounded text-xs font-medium hover:bg-gray-50 transition-all"
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
              <div className="max-w-4xl mx-auto p-8">
                {/* Document Header */}
                <div className="mb-8 pb-4 border-b-2 border-gray-200">
                  <h1 className="text-3xl font-black text-black mb-2">
                    {selectedDoc.name.replace('.md', '')}
                  </h1>
                </div>

                {/* Rendered Markdown */}
                <div className="prose prose-lg max-w-none">
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
                    {content || '*No content*'}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText size={48} className="mx-auto mb-4 text-gray-300" strokeWidth={1.5} />
                  <p className="text-gray-500 font-medium">Select a document to view</p>
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
      
      {/* Header */}
      <div className="bg-white border-b-4 border-black p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/learnings/guide/${guideId}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-black font-bold text-sm transition-all"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
              Back to Guide
            </button>
            <h1 className="text-2xl font-black text-black">
              {title?.name || 'Edit Document'}
            </h1>
            {isViewMode && (
              <span className="px-3 py-1 bg-blue-100 border-2 border-black rounded-lg text-xs font-black">
                VIEW ONLY
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
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
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r-4 border-black flex flex-col overflow-hidden">
          <div className="p-3 border-b-2 border-gray-200">
            {!isViewMode && (
              <button 
                onClick={handleCreateMarkdown}
                className="w-full px-4 py-2 bg-green-100 border-2 border-black rounded-lg font-bold text-sm hover:bg-green-200 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={16} strokeWidth={2.5} />
                New File
              </button>
            )}
          </div>

          {/* Markdown Files */}
          <div className="border-b-2 border-gray-200">
            <div className="p-3 bg-gray-50 border-b-2 border-gray-200">
              <div className="flex items-center gap-2">
                <FileText size={16} strokeWidth={2.5} />
                <span className="font-black text-xs uppercase tracking-wider">Markdown</span>
              </div>
            </div>
            <div className="p-2 max-h-40 overflow-y-auto">
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
                    }}
                    className={`px-3 py-2 mb-1 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                      selectedDoc?.documentId === doc.documentId
                        ? 'bg-blue-50 border-2 border-blue-300'
                        : 'bg-gray-50 border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-sm font-bold truncate flex-1">{doc.name}</span>
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
          <div className="border-b-2 border-gray-200">
            <div className="p-3 bg-gray-50 border-b-2 border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon size={16} strokeWidth={2.5} />
                <span className="font-black text-xs uppercase tracking-wider">Diagrams</span>
              </div>
              {!isViewMode && (
                <button
                  onClick={handleCreateDiagram}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Plus size={16} strokeWidth={2.5} />
                </button>
              )}
            </div>
            <div className="p-2">
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
                          console.error('Error parsing diagram:', e);
                        }
                      }
                      setShowDiagramCanvas(true);
                    }}
                    className="px-3 py-2 mb-1 bg-purple-50 border-2 border-purple-300 rounded-lg flex items-center justify-between cursor-pointer hover:bg-purple-100 transition-all"
                  >
                    <span className="text-sm font-bold truncate flex-1">{doc.name}</span>
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
            <div className="p-3 bg-gray-50 border-b-2 border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload size={16} strokeWidth={2.5} />
                <span className="font-black text-xs uppercase tracking-wider">Attachments</span>
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
                        className="text-xs font-medium truncate flex-1 hover:text-blue-600"
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

        {/* Editor Area */}
        <div className="flex-1 flex overflow-hidden">
          {activeView === 'markdown' ? (
            <>
              <div className="w-1/2 border-r border-gray-700 overflow-y-auto bg-gray-900">
                <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
                  <span className="text-white font-bold text-sm">
                    {selectedDoc?.name || 'No file selected'}
                  </span>
                  {!isViewMode && selectedDoc && (
                    <button 
                      onClick={handleSave}
                      disabled={saving}
                      className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save File'}
                    </button>
                  )}
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="# Start writing your markdown here..."
                  className="w-full h-full p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none focus:outline-none"
                  disabled={isViewMode}
                  style={{ minHeight: 'calc(100vh - 120px)' }}
                />
              </div>

              <div className="w-1/2 overflow-y-auto bg-gray-800 p-6">
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
            <div className="flex-1 flex items-center justify-center bg-gray-100">
              <button
                onClick={() => setShowDiagramCanvas(true)}
                className="px-8 py-4 bg-black text-white border-3 border-black rounded-xl font-bold hover:bg-gray-800 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                Open Diagram Editor
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
