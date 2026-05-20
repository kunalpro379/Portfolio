import { useState, useEffect } from 'react';
import { Code2, Folder, File, ExternalLink, ChevronRight, Github, ArrowLeft } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

interface CodeFolder {
  _id: string;
  folderId: string;
  name: string;
  path: string;
  parentPath: string;
  createdAt: string;
}

interface CodeFile {
  _id: string;
  fileId: string;
  filename: string;
  folderPath: string;
  content: string;
  language: string;
  size: number;
  createdAt: string;
  updatedAt: string;
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

export default function CodeSection() {
  const [folders, setFolders] = useState<CodeFolder[]>([]);
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);
  
  // GitHub integration state
  const [activeTab, setActiveTab] = useState<'local' | 'github'>('local');
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [githubItems, setGithubItems] = useState<GitHubTreeItem[]>([]);
  const [githubPath, setGithubPath] = useState('');
  const [selectedGithubFile, setSelectedGithubFile] = useState<GitHubFileContent | null>(null);
  const [githubLoading, setGithubLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'local') {
      fetchFolders();
      fetchFiles();
    } else {
      fetchGithubRepos();
    }
  }, [currentPath, activeTab]);

  useEffect(() => {
    if (selectedRepo) {
      fetchGithubTree();
    }
  }, [selectedRepo, githubPath]);

  const fetchFolders = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.code}/folders?parentPath=${currentPath}`);
      const data = await response.json();
      setFolders(data.folders || []);
    } catch (error) {
      console.error('Error fetching code folders:', error);
      setFolders([]);
    }
  };

  const fetchFiles = async () => {
    try {
      setLoading(true);
      if (!currentPath) {
        setFiles([]);
        return;
      }
      const response = await fetch(`${API_ENDPOINTS.code}/files?folderPath=${currentPath}`);
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Error fetching code files:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const viewFile = async (file: CodeFile) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.code}/files/${file.fileId}/content`);
      const data = await response.json();
      setSelectedFile({ ...file, content: data.content });
    } catch (error) {
      console.error('Error fetching file content:', error);
    }
  };

  // GitHub functions
  const fetchGithubRepos = async () => {
    try {
      setGithubLoading(true);
      console.log('Fetching GitHub repos from:', API_ENDPOINTS.github.repos);
      const response = await fetch(API_ENDPOINTS.github.repos);
      console.log('GitHub repos response:', response.status);
      const data = await response.json();
      console.log('GitHub repos data:', data);
      setGithubRepos(data.repos || []);
    } catch (error) {
      console.error('Error fetching GitHub repos:', error);
      setGithubRepos([]);
    } finally {
      setGithubLoading(false);
    }
  };

  const fetchGithubTree = async () => {
    if (!selectedRepo) return;
    
    try {
      setGithubLoading(true);
      const response = await fetch(API_ENDPOINTS.github.repoTree(selectedRepo._id, githubPath));
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
      const response = await fetch(API_ENDPOINTS.github.repoFile(selectedRepo._id, path));
      const data = await response.json();
      setSelectedGithubFile(data.file);
    } catch (error) {
      console.error('Error fetching GitHub file:', error);
      alert('Failed to load file content');
    } finally {
      setGithubLoading(false);
    }
  };

  const navigateGithubFolder = (path: string) => {
    setGithubPath(path);
  };

  const getGithubBreadcrumbs = () => {
    if (!githubPath) return [];
    return githubPath.split('/').filter(Boolean);
  };

  const getLanguageColor = (language: string): string => {
    const colorMap: { [key: string]: string } = {
      'javascript': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'typescript': 'bg-blue-100 text-blue-800 border-blue-300',
      'python': 'bg-green-100 text-green-800 border-green-300',
      'java': 'bg-orange-100 text-orange-800 border-orange-300',
      'cpp': 'bg-purple-100 text-purple-800 border-purple-300',
      'c': 'bg-gray-100 text-gray-800 border-gray-300',
      'html': 'bg-pink-100 text-pink-800 border-pink-300',
      'css': 'bg-blue-100 text-blue-800 border-blue-300',
      'json': 'bg-gray-100 text-gray-800 border-gray-300',
      'markdown': 'bg-slate-100 text-slate-800 border-slate-300'
    };
    return colorMap[language] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getLanguageFromExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'xml': 'xml',
      'md': 'markdown',
      'sql': 'sql',
      'sh': 'bash',
      'yml': 'yaml',
      'yaml': 'yaml'
    };
    return languageMap[ext || ''] || 'plaintext';
  };

  const getBreadcrumbs = () => {
    if (!currentPath) return [];
    return currentPath.split('/');
  };

  if (loading && activeTab === 'local' && currentPath) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <img src="/loading.gif" alt="Loading" className="w-10 h-10 object-contain" />
          <span className="ml-3 font-medium text-slate-700">Loading code files</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-900">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white/90 px-5 py-5 shadow-sm backdrop-blur md:px-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">My Files</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Code Repository
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
              Explore code folders, files, and GitHub repositories in a cleaner, more structured workspace.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Folders</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Files</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">GitHub</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 flex justify-start gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('local')}
          className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
            activeTab === 'local'
              ? 'border-slate-900 bg-slate-900 text-white'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Code2 className="w-4 h-4 inline mr-2" strokeWidth={2.5} />
          Local Files
        </button>
        <button
          onClick={() => setActiveTab('github')}
          className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
            activeTab === 'github'
              ? 'border-slate-900 bg-slate-900 text-white'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Github className="w-4 h-4 inline mr-2" strokeWidth={2.5} />
          GitHub Repos
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'local' ? (
        <>
          {/* Breadcrumbs */}
          {currentPath && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setCurrentPath('')}
                  className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
                >
                  Root
                </button>
                {getBreadcrumbs().map((part, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4" />
                    <button
                      onClick={() => {
                        const path = getBreadcrumbs().slice(0, index + 1).join('/');
                        setCurrentPath(path);
                      }}
                      className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
                    >
                      {part}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Folders */}
          {folders.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Folder className="w-5 h-5 text-slate-500" strokeWidth={2.5} />
                Folders
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {folders.map((folder) => (
                  <button
                    key={folder._id}
                    onClick={() => setCurrentPath(folder.path)}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition-colors hover:border-slate-300 hover:bg-white"
                  >
                    <Folder className="w-8 h-8 flex-shrink-0 text-slate-600" strokeWidth={2.5} />
                    <div className="text-left flex-1 min-w-0">
                      <h4 className="truncate text-sm font-semibold text-slate-900">{folder.name}</h4>
                      <p className="text-xs font-medium text-slate-500">
                        {new Date(folder.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          {files.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Code2 className="w-5 h-5 text-slate-500" strokeWidth={2.5} />
                Code Files ({files.length})
              </h3>
              <div className="space-y-3">
                {files.map((file) => (
                  <div
                    key={file._id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <File className="w-5 h-5 flex-shrink-0 text-slate-600" strokeWidth={2.5} />
                      <div className="flex-1 min-w-0">
                        <h4 className="truncate text-sm font-semibold text-slate-900">{file.filename}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${getLanguageColor(file.language)}`}>
                            {file.language}
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            {formatFileSize(file.size)}
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            {new Date(file.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => viewFile(file)}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-700 transition-colors hover:bg-slate-100"
                      title="View code"
                    >
                      <ExternalLink className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {folders.length === 0 && files.length === 0 && !loading && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
              <Code2 className="mx-auto mb-4 h-16 w-16 text-slate-300" strokeWidth={2} />
              <h3 className="mb-2 text-xl font-semibold text-slate-900">No Code Files Yet</h3>
              <p className="font-medium text-slate-500">
                {currentPath ? 'This folder is empty' : 'Start by creating some folders and uploading code files'}
              </p>
            </div>
          )}
        </>
      ) : (
        /* GitHub Tab Content */
        <div className="space-y-6">
          {selectedRepo ? (
            /* GitHub Repository Browser */
            <div className="space-y-4">
              {/* Repository Header */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedRepo(null)}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-700 transition-colors hover:bg-slate-100"
                    >
                      ←
                    </button>
                    <Github className="w-6 h-6" strokeWidth={2.5} />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{selectedRepo.fullName}</h3>
                      <p className="text-sm font-medium text-slate-500">{selectedRepo.description}</p>
                    </div>
                  </div>
                  <a
                    href={selectedRepo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-700 transition-colors hover:bg-slate-100"
                    title="Open on GitHub"
                  >
                    <ExternalLink className="w-4 h-4" strokeWidth={2.5} />
                  </a>
                </div>
              </div>

              {/* GitHub Breadcrumbs */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setGithubPath('')}
                    className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
                  >
                    Root
                  </button>
                  {getGithubBreadcrumbs().map((part, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4" />
                      <button
                        onClick={() => {
                          const path = getGithubBreadcrumbs().slice(0, index + 1).join('/');
                          setGithubPath(path);
                        }}
                        className="px-3 py-1 bg-gray-100 border-2 border-black rounded-lg font-bold text-sm hover:bg-gray-200 transition"
                      >
                        {part}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* GitHub Content */}
              {githubLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                  <img src="/loading.gif" alt="Loading" className="w-12 h-12 object-contain mx-auto mb-4" />
                  <p className="font-semibold text-slate-900">Loading repository content</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  {githubItems.length === 0 ? (
                    <div className="text-center py-8">
                      <Folder className="mx-auto mb-4 h-12 w-12 text-slate-300" strokeWidth={2} />
                      <p className="font-medium text-slate-500">This folder is empty</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {githubItems.map((item) => (
                        <div
                          key={item.path}
                          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 transition-colors hover:border-slate-300 hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {item.type === 'dir' ? (
                              <Folder className="w-5 h-5 flex-shrink-0 text-slate-600" strokeWidth={2.5} />
                            ) : (
                              <File className="w-5 h-5 flex-shrink-0 text-slate-600" strokeWidth={2.5} />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="truncate text-sm font-semibold text-slate-900">{item.name}</h4>
                              {item.type === 'file' && (
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${getLanguageColor(getLanguageFromExtension(item.name))}`}>
                                    {getLanguageFromExtension(item.name)}
                                  </span>
                                  {item.size && (
                                    <span className="text-xs font-medium text-slate-500">
                                      {formatFileSize(item.size)}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (item.type === 'dir') {
                                navigateGithubFolder(item.path);
                              } else {
                                fetchGithubFile(item.path);
                              }
                            }}
                            className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-700 transition-colors hover:bg-slate-100"
                            title={item.type === 'dir' ? 'Open folder' : 'View file'}
                          >
                            {item.type === 'dir' ? (
                              <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                            ) : (
                              <ExternalLink className="w-4 h-4" strokeWidth={2.5} />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* GitHub Repository List */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Github className="w-6 h-6" strokeWidth={2.5} />
                  <h3 className="text-xl font-semibold text-slate-900">GitHub Repositories</h3>
                </div>
              </div>

              {githubLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                  <img src="/loading.gif" alt="Loading" className="w-10 h-10 object-contain mx-auto mb-4" />
                  <p className="font-semibold text-slate-900">Loading repositories</p>
                </div>
              ) : githubRepos.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                  <Github className="mx-auto mb-4 h-12 w-12 text-slate-300" strokeWidth={2} />
                  <h4 className="mb-2 text-lg font-semibold text-slate-900">No GitHub Repositories</h4>
                  <p className="font-medium text-slate-500">Repositories will be added by the admin</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {githubRepos.map((repo) => (
                    <div
                      key={repo._id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Github className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
                            <h4 className="truncate font-semibold text-slate-900">{repo.fullName}</h4>
                            {repo.isPrivate && (
                              <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                                Private
                              </span>
                            )}
                          </div>
                          {repo.description && (
                            <p className="mb-2 text-sm font-medium text-slate-500">{repo.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span>Branch: {repo.defaultBranch}</span>
                            <span>Added: {new Date(repo.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => setSelectedRepo(repo)}
                            className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-700 transition-colors hover:bg-slate-100"
                            title="Browse Repository"
                          >
                            <Folder className="w-4 h-4" strokeWidth={2.5} />
                          </button>
                          <a
                            href={repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-700 transition-colors hover:bg-slate-100"
                            title="Open on GitHub"
                          >
                            <ExternalLink className="w-4 h-4" strokeWidth={2.5} />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* File Viewer Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{selectedFile.filename}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${getLanguageColor(selectedFile.language)}`}>
                    {selectedFile.language}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {formatFileSize(selectedFile.size)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-700 transition-colors hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto bg-slate-950 p-4">
              <pre className="overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm font-mono text-emerald-300">
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* GitHub File Viewer Modal */}
      {selectedGithubFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{selectedGithubFile.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${getLanguageColor(getLanguageFromExtension(selectedGithubFile.name))}`}>
                    {getLanguageFromExtension(selectedGithubFile.name)}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {formatFileSize(selectedGithubFile.size)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedGithubFile(null)}
                className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-700 transition-colors hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* File Content */}
            <div className="flex-1 overflow-auto bg-slate-950 p-4">
              {githubLoading ? (
                <div className="flex items-center justify-center py-12">
                  <img src="/loading.gif" alt="Loading" className="w-10 h-10 object-contain" />
                  <span className="ml-3 font-semibold text-slate-900">Loading file content</span>
                </div>
              ) : (
                <pre className="overflow-auto whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm font-mono text-emerald-300">
                  <code>{selectedGithubFile.content}</code>
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}