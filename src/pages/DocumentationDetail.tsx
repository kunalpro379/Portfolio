import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Pen, Folder, Menu, Download } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import { Excalidraw } from '@excalidraw/excalidraw';

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
    const [files, setFiles] = useState<DocFile[]>([]);
    const [currentFile, setCurrentFile] = useState<DocFile | null>(null);
    const [currentContent, setCurrentContent] = useState('');
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
            const response = await fetch(`https://api.kunalpatil.me/api/documentation/${docId}`);
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
            const response = await fetch(`https://api.kunalpatil.me/api/documentation/${docId}/files`);
            const data = await response.json();
            setFiles(data.files || []);
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };

    const loadFile = async (file: DocFile) => {
        try {
            console.log('Loading file:', file.name, file.fileId);
            const response = await fetch(`https://api.kunalpatil.me/api/documentation/${docId}/files/${file.fileId}`);

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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-2xl font-black">Loading...</div>
            </div>
        );
    }

    const markdownFiles = files.filter(f => f.type === 'markdown');
    const diagramFiles = files.filter(f => f.type === 'diagram');
    const attachmentFiles = files.filter(f => f.type === 'attachment');

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b-4 border-black p-4 md:p-6">
                <div className="max-w-[1800px] mx-auto">
                    <button
                        onClick={() => navigate('/learnings?tab=documentation')}
                        className="flex items-center gap-2 text-gray-600 hover:text-black font-bold text-sm md:text-base"
                    >
                        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
                        Back to Learnings
                    </button>
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden relative">
                {/* File Sidebar */}
                <div className={`${showMobileSidebar ? 'fixed inset-y-0 left-0 z-40' : 'hidden'} lg:block w-80 bg-white border-r-4 border-black overflow-y-auto`}>
                    <div className="p-4 space-y-6">
                        {/* Document Info */}
                        <div className="bg-blue-50 border-3 border-black rounded-xl p-4">
                            <h2 className="text-2xl font-black mb-3">{formData.title}</h2>

                            {formData.subject && (
                                <div className="mb-3">
                                    <span className="px-3 py-1 bg-blue-200 border-2 border-black rounded-lg text-sm font-bold">
                                        {formData.subject}
                                    </span>
                                </div>
                            )}

                            {formData.description && (
                                <p className="text-sm text-gray-700 mb-3 font-medium">{formData.description}</p>
                            )}

                            {formData.tags && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {formData.tags.split(',').map((tag, i) => (
                                        <span key={i} className="px-2 py-1 text-xs bg-gray-100 border-2 border-black rounded font-bold">
                                            {tag.trim()}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {(formData.date || formData.time) && (
                                <div className="text-xs text-gray-600 font-medium space-y-1">
                                    {formData.date && <div>Date: {formData.date}</div>}
                                    {formData.time && <div>Time: {formData.time}</div>}
                                </div>
                            )}
                        </div>

                        {/* Markdown Files */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4" strokeWidth={2.5} />
                                <h3 className="font-black text-sm uppercase">Markdown</h3>
                            </div>
                            <div className="space-y-1">
                                {markdownFiles.map(file => (
                                    <div
                                        key={file.fileId}
                                        className={`flex items-center justify-between p-2 rounded cursor-pointer ${currentFile?.fileId === file.fileId ? 'bg-blue-100 border-2 border-black' : 'hover:bg-gray-100'
                                            }`}
                                        onClick={() => loadFile(file)}
                                    >
                                        <span className="text-sm font-medium truncate">{file.name}</span>
                                    </div>
                                ))}
                                {markdownFiles.length === 0 && (
                                    <p className="text-xs text-gray-500 p-2">No markdown files</p>
                                )}
                            </div>
                        </div>

                        {/* Diagram Files */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Pen className="w-4 h-4" strokeWidth={2.5} />
                                <h3 className="font-black text-sm uppercase">Diagrams</h3>
                            </div>
                            <div className="space-y-1">
                                {diagramFiles.map(file => (
                                    <div
                                        key={file.fileId}
                                        className={`flex items-center justify-between p-2 rounded cursor-pointer ${currentFile?.fileId === file.fileId ? 'bg-green-100 border-2 border-black' : 'hover:bg-gray-100'
                                            }`}
                                        onClick={() => loadFile(file)}
                                    >
                                        <span className="text-sm font-medium truncate">{file.name}</span>
                                    </div>
                                ))}
                                {diagramFiles.length === 0 && (
                                    <p className="text-xs text-gray-500 p-2">No diagram files</p>
                                )}
                            </div>
                        </div>

                        {/* Attachments */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Folder className="w-4 h-4" strokeWidth={2.5} />
                                <h3 className="font-black text-sm uppercase">Attachments</h3>
                            </div>
                            <div className="space-y-1">
                                {attachmentFiles.map(file => (
                                    <a
                                        key={file.fileId}
                                        href={file.azureUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-2 rounded hover:bg-gray-100 group"
                                    >
                                        <span className="text-sm font-medium truncate flex-1">{file.name}</span>
                                        <Download className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" strokeWidth={2.5} />
                                    </a>
                                ))}
                                {attachmentFiles.length === 0 && (
                                    <p className="text-xs text-gray-500 p-2">No attachments</p>
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
                <div className="w-full lg:flex-1 flex flex-col min-h-[500px] lg:min-h-0 lg:overflow-hidden">
                    {currentFile ? (
                        <>
                            <div className="flex items-center justify-between p-4 bg-white border-b-4 border-black">
                                <h2 className="font-black text-lg">{currentFile.name}</h2>
                            </div>

                            <div className="flex-1 overflow-hidden">
                                {activeTab === 'markdown' && (
                                    <div className="w-full h-full overflow-auto p-6 bg-white" data-color-mode="light">
                                        <MDEditor.Markdown
                                            source={previewContent}
                                            style={{ padding: '20px', background: 'white' }}
                                        />
                                    </div>
                                )}

                                {activeTab === 'diagram' && (
                                    <div className="w-full h-full">
                                        <div className="hidden lg:block w-full h-full">
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
                                                                    collaborators: [],
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
                                                        collaborators: [],
                                                        viewModeEnabled: true
                                                    }
                                                }}
                                                viewModeEnabled={true}
                                            />
                                        </div>

                                        <div className="lg:hidden flex items-center justify-center h-full bg-gray-50 p-8">
                                            <div className="max-w-md text-center">
                                                <div className="text-6xl mb-4">Desktop</div>
                                                <h2 className="text-2xl font-black mb-3">Desktop Only Feature</h2>
                                                <p className="text-gray-600 font-medium">
                                                    The diagram viewer is only available on desktop screens.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-400 text-lg">Select a file to view</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
