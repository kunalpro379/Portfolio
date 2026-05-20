import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Pen, Folder, Menu, Download, X, Maximize2, Minimize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Excalidraw } from '@excalidraw/excalidraw';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';
import PageShimmer from '@/components/PageShimmer';
import LoadingSpinner from '@/components/LoadingSpinner';

type TabType = 'markdown' | 'diagram';
type FileType = 'markdown' | 'diagram' | 'attachment';

interface DocFile {
    fileId: string;
    name: string;
    type: FileType;
    azurePath: string;
    azureUrl: string;
    createdAt: string;
    content?: any;
}

export default function DocumentationDetail() {
    const navigate = useNavigate();
    const { docId } = useParams();
    const excalidrawRef = useRef<any>(null);
    const [activeTab, setActiveTab] = useState<TabType>('markdown');
    const [loading, setLoading] = useState(true);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [files, setFiles] = useState<DocFile[]>([]);
    const [currentFile, setCurrentFile] = useState<DocFile | null>(null);
    const [currentContent, setCurrentContent] = useState('');
    const [loadingFile, setLoadingFile] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        subject: '',
        description: '',
        tags: '',
        date: '',
        time: '',
        assets: {} as Record<string, string>
    });

    useEffect(() => {
        fetchDoc();
    }, [docId]);

    const fetchDoc = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.documentation}/${docId}`);
            const data = await response.json();

            setFormData({
                title: data.doc.title,
                subject: data.doc.subject,
                description: data.doc.description || '',
                tags: data.doc.tags ? data.doc.tags.join(', ') : '',
                date: data.doc.date || '',
                time: data.doc.time || '',
                assets: data.doc.assets || {}
            });

            await fetchFiles();
        } catch (error) {
            console.error('Error fetching documentation:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFiles = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.documentation}/${docId}/files`);
            const data = await response.json();
            const fetchedFiles = data.files || [];
            setFiles(fetchedFiles);
            
            // Auto-load index.md by default
            const indexMd = fetchedFiles.find((f: DocFile) => f.name === 'index.md' && f.type === 'markdown');
            if (indexMd) {
                loadFile(indexMd);
            }
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };

    const loadFile = async (file: DocFile) => {
        try {
            console.log('Loading file:', file.name, file.fileId);
            
            // Show loading state
            setLoadingFile(true);
            
            // Close sidebar on mobile when file is selected
            if (window.innerWidth < 1024) {
                setShowMobileSidebar(false);
            }
            
            const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.documentation}/${docId}/files/${file.fileId}`);

            if (!response.ok) {
                throw new Error(`Failed to load file: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Loaded file data:', data.file);

            if (!data.file) {
                throw new Error('File data not found');
            }

            setCurrentFile(data.file);

            if (file.type === 'diagram') {
                setCurrentContent('');
                setActiveTab('diagram');
                console.log('Set diagram content:', data.file.content);
            } else {
                setCurrentContent(data.file.content || '');
                setActiveTab('markdown');
                console.log('Set markdown content:', data.file.content);
            }
        } catch (error) {
            console.error('Error loading file:', error);
            alert(`Error loading file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoadingFile(false);
        }
    };

    const handleMarkdownClick = async () => {
        let indexMd = files.find(f => f.name === 'index.md' && f.type === 'markdown');

        if (!indexMd) {
            alert('No markdown file found');
            return;
        }

        if (indexMd) {
            loadFile(indexMd);
        }
    };

    const handleDiagramClick = async () => {
        let indexDiagram = files.find(f => f.name === 'index.diagram' && f.type === 'diagram');

        if (!indexDiagram) {
            alert('No diagram file found');
            return;
        }

        if (indexDiagram) {
            loadFile(indexDiagram);
        }
    };

    const previewContent = (() => {
        if (typeof currentContent !== 'string') {
            return '';
        }

        let processedContent = currentContent;
        Object.entries(formData.assets).forEach(([name, url]) => {
            const placeholder = new RegExp(`\\(\\{\\{${name}\\}\\}\\)`, 'g');
            processedContent = processedContent.replace(placeholder, `(${url})`);
        });
        return processedContent;
    })();

    const markdownComponents = {
        h1: ({ children, ...props }: any) => <h1 className="text-4xl font-bold text-slate-900 mb-4 mt-10 leading-tight" {...props}>{children}</h1>,
        h2: ({ children, ...props }: any) => <h2 className="text-3xl font-semibold text-slate-900 mb-3 mt-8 leading-snug" {...props}>{children}</h2>,
        h3: ({ children, ...props }: any) => <h3 className="text-2xl font-semibold text-slate-900 mb-2 mt-6" {...props}>{children}</h3>,
        p: ({ children, ...props }: any) => <p className="text-slate-800 mb-5 leading-8 text-[1.05rem]" {...props}>{children}</p>,
        ul: ({ children, ...props }: any) => <ul className="list-disc list-inside mb-5 space-y-2 text-slate-800" {...props}>{children}</ul>,
        ol: ({ children, ...props }: any) => <ol className="list-decimal list-inside mb-5 space-y-2 text-slate-800" {...props}>{children}</ol>,
        li: ({ children, ...props }: any) => <li className="text-slate-800 leading-7" {...props}>{children}</li>,
        code: ({ inline, children, ...props }: any) =>
            inline ? (
                <code className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-[0.95rem] font-mono" {...props}>{children}</code>
            ) : (
                <code className="block p-4 bg-slate-950 text-slate-100 rounded-xl border border-slate-700 overflow-x-auto font-mono text-sm" {...props}>{children}</code>
            ),
        pre: ({ children, ...props }: any) => <pre className="mb-6 rounded-xl overflow-hidden" {...props}>{children}</pre>,
        a: ({ href, children, ...props }: any) => (
            <a href={href} className="text-blue-700 underline underline-offset-2 hover:text-blue-900" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
        ),
        img: ({ src, alt, ...props }: any) => (
            <img src={src} alt={alt} className="max-w-3xl w-full rounded-xl border-2 border-slate-300 my-6" {...props} />
        ),
    };

    if (loading) {
        return <PageShimmer />;
    }

    const markdownFiles = files.filter(f => f.type === 'markdown');
    const diagramFiles = files.filter(f => f.type === 'diagram');
    const attachmentFiles = files.filter(f => f.type === 'attachment');

    return (
        <>
            {/* Mobile-specific styles for Excalidraw */}
            <style>{`
                .excalidraw-wrapper {
                    width: 100% !important;
                    height: 100% !important;
                    position: relative !important;
                }
                .excalidraw-container {
                    width: 100% !important;
                    height: 100% !important;
                }
                @media (max-width: 1024px) {
                    .excalidraw-wrapper {
                        touch-action: none !important;
                    }
                }
            `}</style>
            <div className="h-screen flex flex-col bg-slate-100 text-slate-900">
                {/* Header - Fixed on mobile */}
                <div className={`bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 md:px-6 md:py-4 sticky top-0 z-50 lg:relative shadow-sm ${isFullscreen ? 'hidden' : ''}`}>
                <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-3">
                    <button
                        onClick={() => navigate('/learnings?tab=documentation')}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold text-sm md:text-base transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
                        <span className="hidden sm:inline">Back to Learnings</span>
                    </button>
                    
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                        className="lg:hidden p-2 bg-slate-900 text-white rounded-lg border border-slate-900 shadow-sm"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden relative">
                {/* File Sidebar */}
                <div className={`
                    w-full lg:w-80 bg-white border-r border-slate-200 overflow-y-auto shadow-[6px_0_24px_rgba(15,23,42,0.06)]
                    lg:relative fixed inset-0 z-40
                    transform transition-transform duration-300 ease-in-out
                    ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>
                    {/* Close Button - Mobile Only */}
                    <div className="lg:hidden sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-10">
                        <h3 className="font-bold text-lg text-slate-900">Files</h3>
                        <button
                            onClick={() => setShowMobileSidebar(false)}
                            className="p-2 bg-slate-900 text-white rounded-lg border border-slate-900 shadow-sm"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="p-4 space-y-5">
                        {/* Document Info */}
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
                            <h2 className="text-xl font-semibold tracking-tight text-slate-900 mb-3 leading-tight">{formData.title}</h2>

                            {formData.subject && (
                                <div className="mb-3">
                                    <span className="inline-flex px-3 py-1 bg-slate-200 text-slate-800 border border-slate-300 rounded-full text-xs font-semibold uppercase tracking-wide">
                                        {formData.subject}
                                    </span>
                                </div>
                            )}

                            {formData.description && (
                                <p className="text-sm text-slate-600 mb-3 leading-6">{formData.description}</p>
                            )}

                            {formData.tags && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {formData.tags.split(',').map((tag, i) => (
                                        <span key={i} className="px-2.5 py-1 text-[11px] bg-white border border-slate-200 text-slate-600 rounded-full font-medium">
                                            {tag.trim()}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {(formData.date || formData.time) && (
                                <div className="text-xs text-slate-500 space-y-1">
                                    {formData.date && <div>Date: {formData.date}</div>}
                                    {formData.time && <div>Time: {formData.time}</div>}
                                </div>
                            )}
                        </div>

                        {/* Markdown Files */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-slate-600" strokeWidth={2.5} />
                                <h3 className="font-semibold text-xs uppercase tracking-[0.18em] text-slate-500">Markdown</h3>
                            </div>
                            <div className="space-y-1">
                                {markdownFiles.map(file => (
                                    <div
                                        key={file.fileId}
                                        className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer border transition-colors ${currentFile?.fileId === file.fileId ? 'bg-slate-900 border-slate-900 text-white shadow-sm' : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-700'
                                            }`}
                                        onClick={() => loadFile(file)}
                                    >
                                        <span className="text-sm font-medium truncate">{file.name}</span>
                                    </div>
                                ))}
                                {markdownFiles.length === 0 && (
                                    <p className="text-xs text-slate-500 p-2">No markdown files</p>
                                )}
                            </div>
                        </div>

                        {/* Diagram Files */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Pen className="w-4 h-4 text-slate-600" strokeWidth={2.5} />
                                <h3 className="font-semibold text-xs uppercase tracking-[0.18em] text-slate-500">Diagrams</h3>
                            </div>
                            <div className="space-y-1">
                                {diagramFiles.map(file => (
                                    <div
                                        key={file.fileId}
                                        className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer border transition-colors ${currentFile?.fileId === file.fileId ? 'bg-slate-900 border-slate-900 text-white shadow-sm' : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-700'
                                            }`}
                                        onClick={() => loadFile(file)}
                                    >
                                        <span className="text-sm font-medium truncate">{file.name}</span>
                                    </div>
                                ))}
                                {diagramFiles.length === 0 && (
                                    <p className="text-xs text-slate-500 p-2">No diagram files</p>
                                )}
                            </div>
                        </div>

                        {/* Attachments */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Folder className="w-4 h-4 text-slate-600" strokeWidth={2.5} />
                                <h3 className="font-semibold text-xs uppercase tracking-[0.18em] text-slate-500">Attachments</h3>
                            </div>
                            <div className="space-y-1">
                                {attachmentFiles.map(file => (
                                    <a
                                        key={file.fileId}
                                        href={file.azureUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between px-3 py-2 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-50 group text-slate-700 transition-colors"
                                    >
                                        <span className="text-sm font-medium truncate flex-1">{file.name}</span>
                                        <Download className="w-4 h-4 opacity-0 group-hover:opacity-100 transition text-slate-500" strokeWidth={2.5} />
                                    </a>
                                ))}
                                {attachmentFiles.length === 0 && (
                                    <p className="text-xs text-slate-500 p-2">No attachments</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Sidebar Backdrop */}
                {showMobileSidebar && (
                    <div
                        className="lg:hidden fixed inset-0 bg-black/50 z-30"
                        onClick={() => setShowMobileSidebar(false)}
                    />
                )}

                {/* Content Area */}
                <div className="w-full lg:flex-1 flex flex-col flex-1 lg:min-h-0 lg:overflow-hidden min-h-0">
                    {/* Title and Subject - Mobile Only */}
                    <div className="lg:hidden bg-white border-b border-slate-200 p-4 shadow-sm">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
                            <h2 className="text-xl font-semibold tracking-tight text-slate-900 mb-3">{formData.title}</h2>

                            {formData.subject && (
                                <div className="mb-3">
                                    <span className="inline-flex px-3 py-1 bg-slate-200 text-slate-800 border border-slate-300 rounded-full text-xs font-semibold uppercase tracking-wide">
                                        {formData.subject}
                                    </span>
                                </div>
                            )}

                            {formData.description && (
                                <p className="text-sm text-slate-600 mb-3 leading-6">{formData.description}</p>
                            )}

                            {formData.tags && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {formData.tags.split(',').map((tag, i) => (
                                        <span key={i} className="px-2.5 py-1 text-[11px] bg-white border border-slate-200 text-slate-600 rounded-full font-medium">
                                            {tag.trim()}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {(formData.date || formData.time) && (
                                <div className="text-xs text-slate-500 space-y-1">
                                    {formData.date && <div>Date: {formData.date}</div>}
                                    {formData.time && <div>Time: {formData.time}</div>}
                                </div>
                            )}
                        </div>
                    </div>

                    {currentFile ? (
                        <>
                            {isFullscreen ? (
                                // Fullscreen mode
                                <div className="fixed inset-0 z-50 bg-white flex flex-col">
                                    <div className="flex items-center justify-between p-4 bg-white border-b-4 border-black">
                                        <h2 className="font-black text-lg">{currentFile.name}</h2>
                                        <button
                                            onClick={() => setIsFullscreen(false)}
                                            className="p-2 bg-black text-white rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                        >
                                            <Minimize2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="flex-1 relative min-h-0">
                                        <div className="absolute inset-0 w-full h-full touch-none">
                                            <div className="w-full h-full" style={{ touchAction: 'none' }}>
                                                <Excalidraw
                                                    key={currentFile?.fileId}
                                                    excalidrawAPI={(api) => {
                                                        excalidrawRef.current = api;
                                                        if (currentFile?.content && currentFile.content.elements) {
                                                            setTimeout(() => {
                                                                api.updateScene({
                                                                    elements: currentFile.content.elements,
                                                                    appState: {
                                                                        ...currentFile.content.appState,
                                                                        collaborators: new Map(),
                                                                        viewModeEnabled: true
                                                                    }
                                                                });
                                                            }, 100);
                                                        }
                                                    }}
                                                    theme="light"
                                                    initialData={{
                                                        elements: [],
                                                        appState: {
                                                            collaborators: new Map(),
                                                            viewModeEnabled: true
                                                        }
                                                    }}
                                                    viewModeEnabled={true}
                                                    UIOptions={{
                                                        canvasActions: {
                                                            saveToActiveFile: false,
                                                            loadScene: false,
                                                            export: false,
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Normal mode
                                <>
                                    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
                                        <h2 className="font-semibold text-base md:text-lg truncate flex-1 mr-2 text-slate-900">{currentFile.name}</h2>
                                        {/* Fullscreen button for diagrams - available on all screens */}
                                        {activeTab === 'diagram' && (
                                            <button
                                                onClick={() => setIsFullscreen(true)}
                                                className="p-2 bg-slate-900 text-white rounded-lg border border-slate-900 shadow-sm hover:bg-slate-800 transition-colors flex-shrink-0"
                                                aria-label="Enter fullscreen"
                                            >
                                                <Maximize2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex-1 overflow-hidden relative min-h-0">
                                        {loadingFile ? (
                                            <div className="w-full h-full flex items-center justify-center bg-white">
                                                <LoadingSpinner size="xl" />
                                            </div>
                                        ) : (
                                            <>
                                                {activeTab === 'markdown' && (
                                                    <div className="reader-markdown w-full h-full overflow-auto px-5 py-6 md:px-8 md:py-10 bg-white" data-color-mode="light">
                                                        <ReactMarkdown
                                                            remarkPlugins={[remarkGfm, remarkMath]}
                                                            rehypePlugins={[rehypeKatex]}
                                                            components={markdownComponents}
                                                        >
                                                            {previewContent}
                                                        </ReactMarkdown>
                                                    </div>
                                                )}

                                                {activeTab === 'diagram' && (
                                                    <div className="absolute inset-0 w-full h-full touch-none">
                                                        <div className="w-full h-full" style={{ touchAction: 'none' }}>
                                                            <Excalidraw
                                                                key={currentFile?.fileId}
                                                                excalidrawAPI={(api) => {
                                                                    excalidrawRef.current = api;
                                                                    if (currentFile?.content && currentFile.content.elements) {
                                                                        setTimeout(() => {
                                                                            api.updateScene({
                                                                                elements: currentFile.content.elements,
                                                                                appState: {
                                                                                    ...currentFile.content.appState,
                                                                                    collaborators: new Map(),
                                                                                    viewModeEnabled: true
                                                                                }
                                                                            });
                                                                        }, 100);
                                                                    }
                                                                }}
                                                                theme="light"
                                                                initialData={{
                                                                    elements: [],
                                                                    appState: {
                                                                        collaborators: new Map(),
                                                                        viewModeEnabled: true
                                                                    }
                                                                }}
                                                                viewModeEnabled={true}
                                                                UIOptions={{
                                                                    canvasActions: {
                                                                        saveToActiveFile: false,
                                                                        loadScene: false,
                                                                        export: false,
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-400 text-lg">Select a file to view</p>
                        </div>
                    )}
                </div>
            </div>
            </div>
        </>
    );
}
