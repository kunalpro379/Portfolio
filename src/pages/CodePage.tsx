import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, FileText, Folder as FolderIcon, ChevronRight, ChevronDown, Menu, X, Code2 } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { API_ENDPOINTS } from '../config/api';
import PageShimmer from '../components/PageShimmer';

interface CodeFile {
  _id: string;
  fileId: string;
  filename: string;
  folderPath: string;
  content?: string;
  language: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

interface CodeFolder {
  _id: string;
  folderId: string;
  name: string;
  path: string;
  parentPath: string;
  createdAt: string;
  files: CodeFile[];
  subfolders?: CodeFolder[];
}

export default function CodePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const folderFromUrl = searchParams.get('folder');
  
  const [rootFolders, setRootFolders] = useState<CodeFolder[]>([]);
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Helper functions
  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const isTextFile = (filename: string) => {
    const textExtensions = ['txt', 'md', 'java', 'cpp', 'c', 'py', 'js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml', 'yaml', 'yml', 'sh', 'bash', 'php', 'rb', 'go', 'rs', 'cs'];
    return textExtensions.includes(getFileExtension(filename));
  };

  const getLanguageFromExtension = (filename: string) => {
    const ext = getFileExtension(filename);
    const languageMap: Record<string, string> = {
      'js': 'javascript', 'jsx': 'jsx', 'ts': 'typescript', 'tsx': 'tsx',
      'py': 'python', 'java': 'java', 'cpp': 'cpp', 'c': 'c', 'html': 'html',
      'css': 'css', 'json': 'json', 'xml': 'xml', 'yaml': 'yaml', 'yml': 'yaml',
      'sh': 'bash', 'bash': 'bash', 'md': 'markdown', 'txt': 'text', 'php': 'php',
      'rb': 'ruby', 'go': 'go', 'rs': 'rust', 'cs': 'csharp', 'sql': 'sql',
      'scss': 'scss', 'sass': 'sass', 'less': 'less', 'kt': 'kotlin', 'swift': 'swift'
    };
    return languageMap[ext] || 'text';
  };

  useEffect(() => {
    const fetchCodeStructure = async () => {
      try {
        setLoading(true);

        // Fetch root folders
        const foldersResponse = await fetch(`${API_ENDPOINTS.code}/folders?parentPath=`);
        if (!foldersResponse.ok) throw new Error('Failed to fetch code folders');
        const foldersData = await foldersResponse.json();

        // For each folder, fetch its files and subfolders recursively
        const fetchFolderContents = async (folder: CodeFolder): Promise<CodeFolder> => {
          // Fetch files in this folder
          const filesResponse = await fetch(`${API_ENDPOINTS.code}/files?folderPath=${folder.path}`);
          if (filesResponse.ok) {
            const filesData = await filesResponse.json();
            folder.files = filesData.files || [];
          } else {
            folder.files = [];
          }

          // Fetch subfolders
          const subfoldersResponse = await fetch(`${API_ENDPOINTS.code}/folders?parentPath=${folder.path}`);
          if (subfoldersResponse.ok) {
            const subfoldersData = await subfoldersResponse.json();
            if (subfoldersData.folders && subfoldersData.folders.length > 0) {
              folder.subfolders = await Promise.all(
                subfoldersData.folders.map((subfolder: CodeFolder) => fetchFolderContents(subfolder))
              );
            }
          }

          return folder;
        };

        const foldersWithContents = await Promise.all(
          foldersData.folders.map((folder: CodeFolder) => fetchFolderContents(folder))
        );

        setRootFolders(foldersWithContents);

        // Auto-expand folder from URL and select first file
        if (folderFromUrl) {
          const targetFolder = foldersWithContents.find(f => f.path === folderFromUrl);
          if (targetFolder) {
            setExpandedFolders(new Set([targetFolder.folderId]));
            if (targetFolder.files && targetFolder.files.length > 0) {
              loadFile(targetFolder.files[0], true);
            }
          }
        } else {
          // Find first file in any folder
          const findFirstFile = (folders: CodeFolder[]): CodeFile | null => {
            for (const folder of folders) {
              if (folder.files && folder.files.length > 0) {
                setExpandedFolders(new Set([folder.folderId]));
                return folder.files[0];
              }
              if (folder.subfolders) {
                const file = findFirstFile(folder.subfolders);
                if (file) return file;
              }
            }
            return null;
          };

          const firstFile = findFirstFile(foldersWithContents);
          if (firstFile) {
            loadFile(firstFile, true);
          }
        }
      } catch (err) {
        console.error('Error fetching code structure:', err);
        setError(err instanceof Error ? err.message : 'Failed to load code files');
      } finally {
        setLoading(false);
      }
    };

    fetchCodeStructure();
  }, [folderFromUrl]);

  const loadFile = async (file: CodeFile, isInitialLoad: boolean = false) => {
    try {
      console.log('Loading file:', file.filename, file.fileId);

      // Close sidebar on mobile after selecting file
      if (!isInitialLoad) {
        setSidebarOpen(false);
      }

      // For non-text files, just set the file directly
      if (!isTextFile(file.filename)) {
        console.log('Setting non-text file directly');
        setSelectedFile(file);
        return;
      }

      // For text files, fetch the content
      const response = await fetch(`${API_ENDPOINTS.code}/files/${file.fileId}/content`);
      if (!response.ok) throw new Error('Failed to load file content');
      const data = await response.json();
      console.log('File content loaded');
      setSelectedFile({ ...file, content: data.content });
    } catch (err) {
      console.error('Error loading file:', err);
      setSelectedFile(file);
    }
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

  const renderFolderTree = (folder: CodeFolder, level: number = 0) => {
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
          <FolderIcon size={14} strokeWidth={2.5} className="flex-shrink-0 text-orange-600" />
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
                  ? 'bg-orange-200 border-2 border-black'
                  : 'hover:bg-gray-100'
                  }`}
                style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}
              >
                <Code2 size={14} strokeWidth={2.5} className="flex-shrink-0 text-blue-600" />
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (loading) {
    return <PageShimmer />;
  }

  if (error || rootFolders.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4 font-bold">{error || 'No code files found'}</p>
          <button
            onClick={() => navigate('/learnings?tab=code')}
            className="px-6 py-3 bg-black text-white border-3 border-black rounded-xl font-bold hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            Back to Learnings
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
              onClick={() => navigate('/learnings?tab=code')}
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
              <span className="px-2 py-1 bg-orange-200 border-2 border-black rounded text-[10px] font-bold flex-shrink-0">
                {getFileExtension(selectedFile.filename).toUpperCase()}
              </span>
            </div>
          )}
          
          {selectedFile && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-gray-600 font-medium hidden sm:inline">
                {formatFileSize(selectedFile.size)}
              </span>
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
                <Code2 className="w-4 h-4 text-orange-600" strokeWidth={2.5} />
                <h3 className="font-black text-sm uppercase">Code Files</h3>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1 hover:bg-gray-100 rounded"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>
            {rootFolders.map(folder => renderFolderTree(folder))}
          </div>
        </div>

        {/* Main Content - Always looks like a code editor */}
        <div className="flex-1 overflow-hidden bg-[#1E1E1E] flex flex-col min-w-0">
          {/* Editor Header - Always visible */}
          <div className="bg-[#2D2D30] text-white px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-[#3E3E42] flex-shrink-0">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex gap-1 md:gap-1.5">
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500"></div>
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-500"></div>
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-xs md:text-sm font-bold text-[#CCCCCC]">
                {selectedFile ? getLanguageFromExtension(selectedFile.filename) : 'Code Editor'}
              </span>
            </div>
            
            {selectedFile && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#CCCCCC] font-medium hidden sm:inline">
                  {selectedFile.filename}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedFile.content || '');
                    alert('Copied to clipboard!');
                  }}
                  className="px-3 md:px-4 py-1.5 md:py-2 bg-[#0E639C] text-white rounded-md text-xs md:text-sm font-bold hover:bg-[#1177BB] transition-all"
                >
                  Copy
                </button>
              </div>
            )}
          </div>

          {/* Editor Content Area */}
          <div className="flex-1 overflow-hidden bg-[#1E1E1E]">
            {selectedFile && selectedFile.content ? (
              <div className="h-full">
                <SyntaxHighlighter
                  language={getLanguageFromExtension(selectedFile.filename)}
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: '1.5rem',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    background: '#1E1E1E',
                    border: 'none',
                    height: '100%',
                    overflow: 'auto'
                  }}
                  showLineNumbers={true}
                  lineNumberStyle={{
                    color: '#858585',
                    paddingRight: '1rem',
                    minWidth: '3rem',
                    userSelect: 'none'
                  }}
                  wrapLines={true}
                  wrapLongLines={true}
                >
                  {selectedFile.content}
                </SyntaxHighlighter>
              </div>
            ) : selectedFile && !selectedFile.content ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-[#2D2D30] border border-[#3E3E42] rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Code2 size={32} strokeWidth={2.5} className="text-[#CCCCCC] md:w-8 md:h-8" />
                  </div>
                  <p className="text-[#CCCCCC] mb-4 md:mb-6 font-medium text-sm md:text-base">Unable to load file content</p>
                  <p className="text-[#858585] text-xs md:text-sm">
                    File: {selectedFile.filename}
                  </p>
                </div>
              </div>
            ) : (
              /* Empty editor state - looks like VS Code when no file is open */
              <div className="h-full flex flex-col">
                {/* Tab area */}
                <div className="bg-[#2D2D30] border-b border-[#3E3E42] px-4 py-2">
                  <div className="text-[#858585] text-xs font-medium">
                    Welcome
                  </div>
                </div>
                
                {/* Main editor area */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <div className="w-24 h-24 bg-[#2D2D30] border border-[#3E3E42] rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Code2 size={48} strokeWidth={2} className="text-[#858585]" />
                    </div>
                    <h3 className="text-[#CCCCCC] text-xl font-semibold mb-3">Code Editor</h3>
                    <p className="text-[#858585] text-sm mb-6 leading-relaxed">
                      Select a file from the sidebar to start viewing code with syntax highlighting and line numbers.
                    </p>
                    <div className="space-y-2 text-xs text-[#858585]">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-[#569CD6] rounded-full"></div>
                        <span>Syntax highlighting for 100+ languages</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-[#4FC1FF] rounded-full"></div>
                        <span>Line numbers and code formatting</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-[#DCDCAA] rounded-full"></div>
                        <span>Copy to clipboard functionality</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status Bar - Always visible like VS Code */}
          <div className="bg-[#007ACC] px-2 md:px-4 py-2 flex items-center justify-between text-xs md:text-sm text-white flex-shrink-0">
            <div className="flex items-center gap-2 md:gap-6">
              {selectedFile ? (
                <>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Ln {selectedFile.content ? selectedFile.content.split('\n').length : 0}</span>
                    <span className="text-[#CCE7FF] hidden sm:inline">•</span>
                    <span className="font-medium hidden sm:inline">Col 1</span>
                  </div>
                  <span className="hidden md:inline">UTF-8</span>
                  <span className="hidden lg:inline">LF</span>
                  <span className="capitalize font-medium">{getLanguageFromExtension(selectedFile.filename)}</span>
                </>
              ) : (
                <>
                  <span>Ready</span>
                  <span className="hidden md:inline">UTF-8</span>
                  <span className="hidden lg:inline">LF</span>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2 md:gap-6">
              {selectedFile && (
                <>
                  <span className="hidden sm:inline">{selectedFile.content ? selectedFile.content.split('\n').length : 0} lines</span>
                  <span className="hidden md:inline">{selectedFile.content ? selectedFile.content.length : 0} chars</span>
                  <span className="hidden lg:inline">{selectedFile.size} bytes</span>
                </>
              )}
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full"></div>
                <span className="font-medium text-xs md:text-sm">Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}