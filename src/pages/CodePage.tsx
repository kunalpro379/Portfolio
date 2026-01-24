import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Folder as FolderIcon, ChevronRight, ChevronDown, Menu, X, Code2, Github, File, ExternalLink } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';

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

interface GitHubRepo {
  _id: string;
  name: string;
  owner: string;
  fullName: string;
  description: string;
  url: string;
  defaultBranch: string;
  isPrivate: boolean;
  createdAt: string;
}

interface GitHubTreeItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  sha: string;
}

interface GitHubFileContent {
  content: string;
  encoding: string;
  size: number;
  name: string;
  path: string;
}

export default function CodePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const folderFromUrl = searchParams.get('folder');
  const repoFromUrl = searchParams.get('repo');
  const fileFromUrl = searchParams.get('file');
  const githubFileFromUrl = searchParams.get('githubFile');
  
  // State
  const [activeView, setActiveView] = useState<'local' | 'github'>('local');
  const [rootFolders, setRootFolders] = useState<CodeFolder[]>([]);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);
  const [selectedGithubFile, setSelectedGithubFile] = useState<GitHubFileContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // GitHub specific state
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [githubItems, setGithubItems] = useState<GitHubTreeItem[]>([]);
  const [githubPath, setGithubPath] = useState('');
  const [githubLoading, setGithubLoading] = useState(false);

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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Fetch functions
  const fetchLocalFolders = async () => {
    try {
      setLoading(true);
      const foldersResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.code}/folders?parentPath=`);
      if (!foldersResponse.ok) throw new Error('Failed to fetch code folders');
      
      const contentType = foldersResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      
      const foldersData = await foldersResponse.json();

      const fetchFolderContents = async (folder: CodeFolder): Promise<CodeFolder> => {
        const filesResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.code}/files?folderPath=${folder.path}`);
        if (filesResponse.ok) {
          const contentType = filesResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const filesData = await filesResponse.json();
            folder.files = filesData.files || [];
          } else {
            folder.files = [];
          }
        } else {
          folder.files = [];
        }

        const subfoldersResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.code}/folders?parentPath=${folder.path}`);
        if (subfoldersResponse.ok) {
          const contentType = subfoldersResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const subfoldersData = await subfoldersResponse.json();
            if (subfoldersData.folders && subfoldersData.folders.length > 0) {
              folder.subfolders = await Promise.all(
                subfoldersData.folders.map((subfolder: CodeFolder) => fetchFolderContents(subfolder))
              );
            }
          }
        }

        return folder;
      };

      const foldersWithContents = await Promise.all(
        foldersData.folders.map((folder: CodeFolder) => fetchFolderContents(folder))
      );

      setRootFolders(foldersWithContents);

      if (folderFromUrl) {
        const targetFolder = foldersWithContents.find(f => f.path === folderFromUrl);
        if (targetFolder) {
          setExpandedFolders(new Set([targetFolder.folderId]));
          if (targetFolder.files && targetFolder.files.length > 0) {
            loadFile(targetFolder.files[0], true);
          }
        }
      } else {
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

  const fetchGithubRepos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.github.repos}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await response.json();
      setGithubRepos(data.repos || []);
    } catch (error) {
      console.error('Error fetching GitHub repos:', error);
      setGithubRepos([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGithubTree = async () => {
    if (!selectedRepo) return;
    
    try {
      setGithubLoading(true);
      const url = `${API_BASE_URL}${API_ENDPOINTS.github.repoTree(selectedRepo._id, githubPath)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await response.json();
      setGithubItems(data.items || []);
    } catch (error) {
      console.error('Error fetching GitHub tree:', error);
      setGithubItems([]);
    } finally {
      setGithubLoading(false);
    }
  };

  const fetchGithubFile = async (path: string) => {
    if (!selectedRepo) return;
    
    try {
      setGithubLoading(true);
      const url = `${API_BASE_URL}${API_ENDPOINTS.github.repoFile(selectedRepo._id, path)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await response.json();
      setSelectedGithubFile(data.file);
      setSelectedFile(null);

      // Update URL with GitHub file parameter
      const newParams = new URLSearchParams(searchParams);
      if (repoFromUrl) {
        newParams.set('repo', repoFromUrl);
      }
      newParams.set('githubFile', path);
      setSearchParams(newParams);
    } catch (error) {
      console.error('Error fetching GitHub file:', error);
      alert('Failed to load file content');
    } finally {
      setGithubLoading(false);
    }
  };

  // Navigation functions
  const navigateGithubFolder = (path: string) => {
    setGithubPath(path);
    // Clear file parameter when navigating to folder
    const newParams = new URLSearchParams(searchParams);
    if (repoFromUrl) {
      newParams.set('repo', repoFromUrl);
    }
    newParams.delete('githubFile');
    setSearchParams(newParams);
  };

  const getGithubBreadcrumbs = () => {
    if (!githubPath) return [];
    return githubPath.split('/').filter(Boolean);
  };

  // Load functions
  const loadFile = async (file: CodeFile, isInitialLoad: boolean = false) => {
    try {
      setSelectedGithubFile(null);
      
      if (!isInitialLoad) {
        setSidebarOpen(false);
      }

      // Update URL with file parameter
      const newParams = new URLSearchParams(searchParams);
      if (folderFromUrl) {
        newParams.set('folder', folderFromUrl);
      }
      newParams.set('file', file.filename);
      setSearchParams(newParams);

      if (!isTextFile(file.filename)) {
        setSelectedFile(file);
        return;
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.code}/files/${file.fileId}/content`);
      if (!response.ok) throw new Error('Failed to load file content');
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await response.json();
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

  // Effects
  useEffect(() => {
    // If repo parameter is provided, fetch GitHub repos and load that specific repo
    if (repoFromUrl) {
      fetchGithubRepos().then(() => {
        // This will be handled in the second useEffect when githubRepos is updated
      });
    } else {
      // Load local folders for folder browsing
      fetchLocalFolders();
    }
  }, [folderFromUrl, repoFromUrl]);

  // Separate effect to handle repo selection after repos are loaded
  useEffect(() => {
    if (repoFromUrl && githubRepos.length > 0) {
      const repo = githubRepos.find(r => r._id === repoFromUrl);
      if (repo) {
        setSelectedRepo(repo);
      }
    }
  }, [repoFromUrl, githubRepos]);

  // Effect to auto-load files from URL parameters
  useEffect(() => {
    if (fileFromUrl && rootFolders.length > 0) {
      // Find and load local file
      const findFileInFolders = (folders: CodeFolder[]): CodeFile | null => {
        for (const folder of folders) {
          const file = folder.files?.find(f => f.filename === fileFromUrl);
          if (file) return file;
          if (folder.subfolders) {
            const foundFile = findFileInFolders(folder.subfolders);
            if (foundFile) return foundFile;
          }
        }
        return null;
      };

      const file = findFileInFolders(rootFolders);
      if (file) {
        loadFile(file, true);
      }
    }
  }, [fileFromUrl, rootFolders]);

  // Effect to auto-load GitHub files from URL parameters
  useEffect(() => {
    if (githubFileFromUrl && selectedRepo) {
      fetchGithubFile(githubFileFromUrl);
    }
  }, [githubFileFromUrl, selectedRepo]);

  useEffect(() => {
    if (selectedRepo) {
      fetchGithubTree();
    }
  }, [selectedRepo, githubPath]);

  // Render functions
  const renderFolderTree = (folder: CodeFolder, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.folderId);
    const hasChildren = (folder.subfolders && folder.subfolders.length > 0) || (folder.files && folder.files.length > 0);

    return (
      <div key={folder.folderId}>
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

        {isExpanded && (
          <div>
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

            {folder.subfolders && folder.subfolders.map((subfolder) =>
              renderFolderTree(subfolder, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 animate-spin">
            <svg className="w-32 h-32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path
                d="M4 12a8 8 0 0 1 8-8V2.5L14.5 5 12 7.5V6a6 6 0 0 0-6 6h-2z"
                className="text-black"
              />
              <path
                d="M20 12a8 8 0 0 1-8 8v1.5L9.5 19 12 16.5V18a6 6 0 0 0 6-6h2z"
                className="text-black"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4 font-bold">{error}</p>
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
          
          <div className="flex items-center gap-2 min-w-0 flex-1 justify-center">
            <h1 className="text-sm md:text-base font-black text-black truncate">
              {selectedFile ? selectedFile.filename : selectedGithubFile ? selectedGithubFile.name : 'Code Explorer'}
            </h1>
            {(selectedFile || selectedGithubFile) && (
              <span className="px-2 py-1 bg-orange-200 border-2 border-black rounded text-[10px] font-bold flex-shrink-0">
                {selectedFile ? getFileExtension(selectedFile.filename).toUpperCase() : 
                 selectedGithubFile ? getFileExtension(selectedGithubFile.name).toUpperCase() : ''}
              </span>
            )}
          </div>
          
          {(selectedFile || selectedGithubFile) && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-gray-600 font-medium hidden sm:inline">
                {selectedFile ? formatFileSize(selectedFile.size) : 
                 selectedGithubFile ? formatFileSize(selectedGithubFile.size) : ''}
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
                <h3 className="font-black text-sm uppercase">Code Explorer</h3>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1 hover:bg-gray-100 rounded"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>

            {/* Content - Show appropriate content based on URL params */}
            {repoFromUrl || selectedRepo ? (
              /* GitHub Repository Browser */
              <div>
                {selectedRepo ? (
                  <div className="space-y-3">
                    {/* Repository Header */}
                    <div className="flex items-center justify-between p-2 bg-gray-50 border-2 border-black rounded-lg">
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          onClick={() => {
                            setSelectedRepo(null);
                            setGithubPath('');
                            setGithubItems([]);
                            navigate('/learnings?tab=code');
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <ArrowLeft className="w-3 h-3" strokeWidth={2.5} />
                        </button>
                        <Github className="w-3 h-3 flex-shrink-0" strokeWidth={2.5} />
                        <span className="text-xs font-bold truncate">{selectedRepo.name}</span>
                      </div>
                      <a
                        href={selectedRepo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-gray-200 rounded"
                        title="Open on GitHub"
                      >
                        <ExternalLink className="w-3 h-3" strokeWidth={2.5} />
                      </a>
                    </div>

                    {/* GitHub Breadcrumbs */}
                    {githubPath && (
                      <div className="flex items-center gap-1 flex-wrap text-xs">
                        <button
                          onClick={() => setGithubPath('')}
                          className="px-2 py-1 bg-gray-100 border border-black rounded text-xs font-bold hover:bg-gray-200"
                        >
                          Root
                        </button>
                        {getGithubBreadcrumbs().map((part, index) => (
                          <div key={index} className="flex items-center gap-1">
                            <ChevronRight className="w-2 h-2" />
                            <button
                              onClick={() => {
                                const path = getGithubBreadcrumbs().slice(0, index + 1).join('/');
                                setGithubPath(path);
                              }}
                              className="px-2 py-1 bg-gray-100 border border-black rounded text-xs font-bold hover:bg-gray-200"
                            >
                              {part}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* GitHub Content */}
                    {githubLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p className="text-xs font-medium">Loading...</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {githubItems.map((item) => (
                          <button
                            key={item.path}
                            onClick={() => {
                              if (item.type === 'dir') {
                                navigateGithubFolder(item.path);
                              } else {
                                fetchGithubFile(item.path);
                              }
                            }}
                            className={`w-full text-left flex items-center gap-2 p-2 rounded-lg transition-all ${
                              selectedGithubFile?.path === item.path
                                ? 'bg-orange-200 border-2 border-black'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            {item.type === 'dir' ? (
                              <FolderIcon size={14} strokeWidth={2.5} className="flex-shrink-0 text-orange-600" />
                            ) : (
                              <File size={14} strokeWidth={2.5} className="flex-shrink-0 text-blue-600" />
                            )}
                            <span className="text-sm font-medium truncate">{item.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Loading GitHub repo */
                  <div className="text-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-black border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-xs font-medium">Loading repository...</p>
                  </div>
                )}
              </div>
            ) : (
              /* Local Files Browser */
              <div>
                {rootFolders.length === 0 ? (
                  <div className="text-center py-8">
                    <FolderIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" strokeWidth={2} />
                    <p className="text-xs font-bold text-gray-500">No local files found</p>
                  </div>
                ) : (
                  rootFolders.map(folder => renderFolderTree(folder))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Code Editor */}
        <div className="flex-1 overflow-hidden bg-[#1E1E1E] flex flex-col min-w-0">
          {/* Editor Header */}
          <div className="bg-[#2D2D30] text-white px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-[#3E3E42] flex-shrink-0">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex gap-1 md:gap-1.5">
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500"></div>
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-500"></div>
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-xs md:text-sm font-bold text-[#CCCCCC]">
                {selectedFile ? getLanguageFromExtension(selectedFile.filename) : 
                 selectedGithubFile ? getLanguageFromExtension(selectedGithubFile.name) : 
                 'Code Editor'}
              </span>
            </div>
            
            {(selectedFile || selectedGithubFile) && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#CCCCCC] font-medium hidden sm:inline">
                  {selectedFile ? selectedFile.filename : selectedGithubFile?.name}
                </span>
                <button
                  onClick={() => {
                    const content = selectedFile?.content || selectedGithubFile?.content || '';
                    navigator.clipboard.writeText(content);
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
            {(selectedFile && selectedFile.content) || (selectedGithubFile && selectedGithubFile.content) ? (
              <div className="h-full">
                <SyntaxHighlighter
                  language={selectedFile ? getLanguageFromExtension(selectedFile.filename) : getLanguageFromExtension(selectedGithubFile?.name || '')}
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
                  {selectedFile?.content || selectedGithubFile?.content || ''}
                </SyntaxHighlighter>
              </div>
            ) : (selectedFile && !selectedFile.content) || (selectedGithubFile && !selectedGithubFile.content) ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-[#2D2D30] border border-[#3E3E42] rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Code2 size={32} strokeWidth={2.5} className="text-[#CCCCCC] md:w-8 md:h-8" />
                  </div>
                  <p className="text-[#CCCCCC] mb-4 md:mb-6 font-medium text-sm md:text-base">Unable to load file content</p>
                  <p className="text-[#858585] text-xs md:text-sm">
                    File: {selectedFile?.filename || selectedGithubFile?.name}
                  </p>
                </div>
              </div>
            ) : (
              /* Empty editor state */
              <div className="h-full flex flex-col">
                <div className="bg-[#2D2D30] border-b border-[#3E3E42] px-4 py-2">
                  <div className="text-[#858585] text-xs font-medium">
                    Welcome
                  </div>
                </div>
                
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <div className="w-24 h-24 bg-[#2D2D30] border border-[#3E3E42] rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Code2 size={48} strokeWidth={2} className="text-[#858585]" />
                    </div>
                    <h3 className="text-[#CCCCCC] text-xl font-semibold mb-3">Code Explorer</h3>
                    <p className="text-[#858585] text-sm mb-6 leading-relaxed">
                      Select a file from the sidebar to start viewing code with syntax highlighting and line numbers.
                    </p>
                    <div className="space-y-2 text-xs text-[#858585]">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-[#569CD6] rounded-full"></div>
                        <span>Local files and GitHub repositories</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-[#4FC1FF] rounded-full"></div>
                        <span>Syntax highlighting for 100+ languages</span>
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

          {/* Status Bar */}
          <div className="bg-[#007ACC] px-2 md:px-4 py-2 flex items-center justify-between text-xs md:text-sm text-white flex-shrink-0">
            <div className="flex items-center gap-2 md:gap-6">
              {(selectedFile || selectedGithubFile) ? (
                <>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Ln {
                      selectedFile ? (selectedFile.content ? selectedFile.content.split('\n').length : 0) :
                      selectedGithubFile ? (selectedGithubFile.content ? selectedGithubFile.content.split('\n').length : 0) : 0
                    }</span>
                    <span className="text-[#CCE7FF] hidden sm:inline">•</span>
                    <span className="font-medium hidden sm:inline">Col 1</span>
                  </div>
                  <span className="hidden md:inline">UTF-8</span>
                  <span className="hidden lg:inline">LF</span>
                  <span className="capitalize font-medium">{
                    selectedFile ? getLanguageFromExtension(selectedFile.filename) :
                    selectedGithubFile ? getLanguageFromExtension(selectedGithubFile.name) : 'text'
                  }</span>
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
              {(selectedFile || selectedGithubFile) && (
                <>
                  <span className="hidden sm:inline">{
                    selectedFile ? (selectedFile.content ? selectedFile.content.split('\n').length : 0) :
                    selectedGithubFile ? (selectedGithubFile.content ? selectedGithubFile.content.split('\n').length : 0) : 0
                  } lines</span>
                  <span className="hidden md:inline">{
                    selectedFile ? (selectedFile.content ? selectedFile.content.length : 0) :
                    selectedGithubFile ? (selectedGithubFile.content ? selectedGithubFile.content.length : 0) : 0
                  } chars</span>
                  <span className="hidden lg:inline">{
                    selectedFile ? selectedFile.size :
                    selectedGithubFile ? selectedGithubFile.size : 0
                  } bytes</span>
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