import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, FolderOpen, Folder as FolderIcon, ChevronRight, ChevronDown, Menu, X } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import PageShimmer from '@/components/PageShimmer';

interface NoteFile {
  fileId: string;
  filename: string;
  folderPath: string;
  content?: string;
  uploadedAt: string;
  cloudinaryUrl: string;
  fileType: string;
  size: number;
}

interface Folder {
  folderId: string;
  name: string;
  path: string;
  parentPath: string;
  files: NoteFile[];
  subfolders?: Folder[];
}

export default function NotesDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rootFolder, setRootFolder] = useState<Folder | null>(null);
  const [selectedFile, setSelectedFile] = useState<NoteFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set([id || '']));
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Helper functions
  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const isPdfFile = (filename: string) => {
    return getFileExtension(filename) === 'pdf';
  };

  const isTextFile = (filename: string) => {
    const textExtensions = ['txt', 'md', 'java', 'cpp', 'c', 'py', 'js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml', 'yaml', 'yml', 'sh', 'bash'];
    return textExtensions.includes(getFileExtension(filename));
  };

  useEffect(() => {
    const fetchFolderTree = async () => {
      try {
        setLoading(true);

        // Fetch the root folder with all nested data
        const rootResponse = await fetch(`${API_ENDPOINTS.notes}/folders/${id}`);
        if (!rootResponse.ok) throw new Error('Failed to fetch notes');
        const rootData = await rootResponse.json();

        // Recursively fetch all subfolders
        const fetchSubfoldersRecursively = async (folder: Folder): Promise<Folder> => {
          if (folder.subfolders && folder.subfolders.length > 0) {
            const subfoldersWithData = await Promise.all(
              folder.subfolders.map(async (subfolder) => {
                const subResponse = await fetch(`${API_ENDPOINTS.notes}/folders/${subfolder.folderId}`);
                if (subResponse.ok) {
                  const subData = await subResponse.json();
                  return await fetchSubfoldersRecursively(subData.folder);
                }
                return subfolder;
              })
            );
            folder.subfolders = subfoldersWithData;
          }
          return folder;
        };

        const completeTree = await fetchSubfoldersRecursively(rootData.folder);
        setRootFolder(completeTree);

        // Helper function to find first PDF in folder tree
        const findFirstPdf = (folder: Folder): NoteFile | null => {
          // Check files in current folder
          if (folder.files && folder.files.length > 0) {
            const pdfFile = folder.files.find(file => isPdfFile(file.filename));
            if (pdfFile) return pdfFile;
            // If no PDF, return first file
            return folder.files[0];
          }
          // Check subfolders recursively
          if (folder.subfolders && folder.subfolders.length > 0) {
            for (const subfolder of folder.subfolders) {
              const pdf = findFirstPdf(subfolder);
              if (pdf) return pdf;
            }
          }
          return null;
        };

        // Select first PDF (or first file) on both mobile and desktop
        const firstFile = findFirstPdf(completeTree);
        if (firstFile) {
          loadFile(firstFile, true); // Pass true to indicate initial load
        }
      } catch (err) {
        console.error('Error fetching notes:', err);
        setError(err instanceof Error ? err.message : 'Failed to load notes');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchFolderTree();
  }, [id]);

  const loadFile = async (file: NoteFile, isInitialLoad: boolean = false) => {
    try {
      console.log('Loading file:', file.filename, file.fileId);

      // Close sidebar on mobile after selecting file
      if (!isInitialLoad) {
        setSidebarOpen(false);
      }

      // For PDFs and other non-text files, just set the file directly
      if (isPdfFile(file.filename) || !isTextFile(file.filename)) {
        console.log('Setting non-text file directly');
        setSelectedFile(file);
        return;
      }

      // For text files, fetch the content
      const response = await fetch(`${API_ENDPOINTS.notes}/files/${file.fileId}`);
      if (!response.ok) throw new Error('Failed to load file');
      const data = await response.json();
      console.log('File content loaded');
      setSelectedFile({ ...file, content: data.file.content });
    } catch (err) {
      console.error('Error loading file:', err);
      setSelectedFile(file);
    }
  };


  const getLanguageFromExtension = (filename: string) => {
    const ext = getFileExtension(filename);
    const languageMap: Record<string, string> = {
      'js': 'javascript', 'jsx': 'javascript', 'ts': 'typescript', 'tsx': 'typescript',
      'py': 'python', 'java': 'java', 'cpp': 'cpp', 'c': 'c', 'html': 'html',
      'css': 'css', 'json': 'json', 'xml': 'xml', 'yaml': 'yaml', 'yml': 'yaml',
      'sh': 'bash', 'bash': 'bash', 'md': 'markdown', 'txt': 'text'
    };
    return languageMap[ext] || 'text';
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const renderFolderTree = (folder: Folder, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.folderId);
    const hasChildren = (folder.subfolders && folder.subfolders.length > 0) || (folder.files && folder.files.length > 0);

    return (
      <div key={folder.folderId}>
        {/* Folder Header */}
        <button
          onClick={() => toggleFolder(folder.folderId)}
          className="w-full text-left flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-all"
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {hasChildren && (
            isExpanded ?
              <ChevronDown size={14} strokeWidth={2.5} className="flex-shrink-0" /> :
              <ChevronRight size={14} strokeWidth={2.5} className="flex-shrink-0" />
          )}
          {!hasChildren && <div className="w-3.5" />}
          <FolderIcon size={14} strokeWidth={2.5} className="flex-shrink-0 text-yellow-600" />
          <span className="text-sm font-bold truncate">{folder.name}</span>
        </button>

        {/* Folder Contents */}
        {isExpanded && (
          <div>
            {/* Files in this folder */}
            {folder.files && folder.files.map((file) => (
              <button
                key={file.fileId}
                onClick={() => loadFile(file)}
                className={`w-full text-left flex items-center gap-2 p-2 rounded-lg transition-all ${selectedFile?.fileId === file.fileId
                  ? 'bg-blue-200 border-2 border-black'
                  : 'hover:bg-gray-100'
                  }`}
                style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}
              >
                <FileText size={14} strokeWidth={2.5} className="flex-shrink-0" />
                <span className="text-sm font-medium truncate">{file.filename}</span>
              </button>
            ))}

            {/* Subfolders */}
            {folder.subfolders && folder.subfolders.map((subfolder) =>
              renderFolderTree(subfolder, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <PageShimmer />;
  }

  if (error || !rootFolder) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4 font-bold">{error || 'Notes not found'}</p>
          <button
            onClick={() => navigate('/learnings?tab=notes')}
            className="px-6 py-3 bg-black text-white border-3 border-black rounded-xl font-bold hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            Back to Notes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b-4 border-black p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg border-2 border-black"
            >
              {sidebarOpen ? <X size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={2.5} />}
            </button>
            
            <button
              onClick={() => navigate('/learnings?tab=notes')}
              className="flex items-center gap-2 text-gray-600 hover:text-black font-bold text-sm"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
              <span className="hidden sm:inline">Back</span>
            </button>
          </div>
          
          {selectedFile && (
            <div className="flex items-center gap-2 min-w-0 flex-1 justify-center">
              <h1 className="text-sm md:text-base font-black text-black truncate">
                {selectedFile.filename}
              </h1>
              <span className="px-2 py-1 bg-gray-200 border-2 border-black rounded text-[10px] font-bold flex-shrink-0">
                {getFileExtension(selectedFile.filename).toUpperCase()}
              </span>
            </div>
          )}
          
          {selectedFile && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {isPdfFile(selectedFile.filename) && (
                <button
                  onClick={() => {
                    const iframe = document.querySelector('iframe[title="' + selectedFile.filename + '"]') as HTMLIFrameElement;
                    if (iframe) {
                      iframe.requestFullscreen();
                    }
                  }}
                  className="p-2 bg-purple-500 text-white border-2 border-black rounded-lg hover:bg-purple-600 transition-all"
                  title="Full Screen"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
              )}
              <a
                href={selectedFile.cloudinaryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-black text-white border-2 border-black rounded-lg hover:bg-gray-800 transition-all"
                title="Download"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          fixed md:relative inset-y-0 left-0 z-50
          w-80 md:w-80 bg-white border-r-4 border-black
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          overflow-y-auto
        `}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" strokeWidth={2.5} />
                <h3 className="font-black text-sm uppercase">Files</h3>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1 hover:bg-gray-100 rounded"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>
            {renderFolderTree(rootFolder)}
          </div>
        </div>

        {/* Main Content - Visible on all screens */}
        <div className="flex-1 overflow-hidden bg-gray-50 flex flex-col min-w-0">
          {selectedFile ? (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Extended File Content */}
              <div className="flex-1 overflow-hidden min-h-0">
                {isPdfFile(selectedFile.filename) ? (
                  <>
                    {/* PDF Viewer - Full Height for all screens */}
                    <div className="h-full w-full">
                      <iframe 
                        src={selectedFile.cloudinaryUrl} 
                        className="w-full h-full" 
                        title={selectedFile.filename}
                        style={{ border: 'none' }}
                      />
                    </div>
                  </>
              ) : isTextFile(selectedFile.filename) ? (
                <div className="h-full flex flex-col">
                  {selectedFile.content ? (
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <div className="bg-black text-white px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b-4 border-black flex-shrink-0">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="flex gap-1 md:gap-1.5">
                            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500 border-2 border-white"></div>
                            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-500 border-2 border-white"></div>
                            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500 border-2 border-white"></div>
                          </div>
                          <span className="text-xs md:text-sm font-bold">
                            {getLanguageFromExtension(selectedFile.filename)}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedFile.content || '');
                            alert('Copied to clipboard!');
                          }}
                          className="px-3 md:px-4 py-1.5 md:py-2 bg-white text-black border-2 border-white rounded-lg text-xs md:text-sm font-bold hover:bg-gray-200 transition-all"
                        >
                          Copy
                        </button>
                      </div>
                      <div className="bg-gray-50 flex-1 overflow-auto">
                        <pre className="p-4 md:p-6">
                          <code className="text-xs md:text-sm font-mono leading-relaxed text-gray-900">{selectedFile.content}</code>
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 md:p-12 text-center flex-1 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 border-3 border-black rounded-xl flex items-center justify-center mx-auto mb-4">
                        <FileText size={32} strokeWidth={2.5} className="md:w-8 md:h-8" />
                      </div>
                      <p className="text-gray-600 mb-4 md:mb-6 font-bold text-sm md:text-base">Unable to preview</p>
                      <a href={selectedFile.cloudinaryUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-black text-white border-3 border-black rounded-xl hover:bg-gray-800 transition-all font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm md:text-base">
                        Open in new tab
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 md:p-16 text-center flex-1 flex flex-col items-center justify-center">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-purple-200 border-3 border-black rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                    <FileText size={40} strokeWidth={2.5} className="md:w-12 md:h-12" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-black mb-2">Cannot preview this file</h3>
                  <p className="text-gray-600 mb-6 md:mb-8 font-medium text-sm md:text-base">
                    File type: <span className="font-black text-black">{getFileExtension(selectedFile.filename).toUpperCase()}</span>
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                    <a href={selectedFile.cloudinaryUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-black text-white border-3 border-black rounded-xl hover:bg-gray-800 transition-all font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm md:text-base">
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open in new tab
                    </a>
                    <button onClick={() => { navigator.clipboard.writeText(selectedFile.cloudinaryUrl); alert('Link copied!'); }} className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-purple-200 text-black border-3 border-black rounded-xl hover:bg-purple-300 transition-all font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm md:text-base">
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Link
                    </button>
                  </div>
                </div>
              )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-32 h-32 bg-blue-200 border-4 border-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <FileText size={64} strokeWidth={2.5} />
                </div>
                <p className="text-gray-600 text-xl font-black">Select a file to view</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
