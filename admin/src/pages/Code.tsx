import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderPlus, FilePlus, Folder, File, Trash2, Edit3, ChevronRight, Code2, Github, Upload } from 'lucide-react';
import config from '../config/config';
import GitHubRepoManager from '../components/GitHubRepoManager';
import GitHubRepoBrowser from '../components/GitHubRepoBrowser';

interface FolderType {
  _id: string;
  folderId: string;
  name: string;
  path: string;
  parentPath: string;
  createdAt: string;
}

interface CodeFileType {
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

export default function Code() {
  const navigate = useNavigate();
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [files, setFiles] = useState<CodeFileType[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showCreateFileModal, setShowCreateFileModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [loading, setLoading] = useState(false);
  
  // GitHub integration state
  const [activeTab, setActiveTab] = useState<'local' | 'github'>('local');
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [showPushModal, setShowPushModal] = useState(false);
  const [selectedRepoForPush, setSelectedRepoForPush] = useState<GitHubRepo | null>(null);
  const [commitMessage, setCommitMessage] = useState('Update code from admin panel');

  useEffect(() => {
    fetchFolders();
    fetchFiles();
    fetchGithubRepos();
  }, [currentPath]);

  const fetchFolders = async () => {
    try {
      const response = await fetch(config.api.endpoints.codeFolders(currentPath), {
        credentials: 'include'
      });
      const data = await response.json();
      setFolders(data.folders || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const fetchFiles = async () => {
    try {
      if (!currentPath) {
        setFiles([]);
        return;
      }
      const response = await fetch(config.api.endpoints.codeFiles(currentPath), {
        credentials: 'include'
      });
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const fetchGithubRepos = async () => {
    try {
      const response = await fetch(config.api.endpoints.githubRepos, {
        credentials: 'include'
      });
      const data = await response.json();
      setGithubRepos(data.repos || []);
    } catch (error) {
      console.error('Error fetching GitHub repos:', error);
    }
  };

  const createFolder = async () => {
    if (!newFolderName) return;

    setLoading(true);
    try {
      const response = await fetch(config.api.endpoints.codeCreateFolder, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newFolderName,
          parentPath: currentPath
        })
      });

      if (response.ok) {
        setNewFolderName('');
        setShowCreateFolderModal(false);
        fetchFolders();
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    } finally {
      setLoading(false);
    }
  };

  const createFile = async () => {
    if (!newFileName || !currentPath) return;

    setLoading(true);
    try {
      const response = await fetch(config.api.endpoints.codeCreateFile, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          filename: newFileName,
          folderPath: currentPath,
          content: '',
          language: getLanguageFromExtension(newFileName)
        })
      });

      if (response.ok) {
        setNewFileName('');
        setShowCreateFileModal(false);
        fetchFiles();
      }
    } catch (error) {
      console.error('Error creating file:', error);
    } finally {
      setLoading(false);
    }
  };

  const editFile = async (file: CodeFileType) => {
    // Navigate to dedicated editor page with fileId
    navigate(`/code/${file.fileId}`);
  };

  const deleteFile = async (fileId: string) => {
    if (!confirm('Delete this file?')) return;

    try {
      const response = await fetch(config.api.endpoints.codeFileById(fileId), {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchFiles();
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const deleteFolder = async (folderId: string) => {
    if (!confirm('Delete this folder and all its contents?')) return;

    try {
      const response = await fetch(config.api.endpoints.codeFolderById(folderId), {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchFolders();
        if (currentPath) {
          setCurrentPath('');
        }
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const navigateToFolder = (path: string) => {
    setCurrentPath(path);
  };

  const getBreadcrumbs = () => {
    if (!currentPath) return [];
    return currentPath.split('/');
  };

  const handleRepoSelect = (repo: GitHubRepo) => {
    setSelectedRepo(repo);
  };

  const handleBackToRepos = () => {
    setSelectedRepo(null);
  };

  const pushCodeToGithub = async () => {
    if (!selectedRepoForPush || !currentPath) return;

    setLoading(true);
    try {
      const response = await fetch(config.api.endpoints.githubRepoPushCode(selectedRepoForPush._id), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          folderPath: currentPath,
          commitMessage
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`Successfully pushed ${data.filesCount} files to ${selectedRepoForPush.fullName}!`);
        setShowPushModal(false);
        setCommitMessage('Update code from admin panel');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error pushing to GitHub:', error);
      alert('Failed to push code to GitHub');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6 lg:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-black mb-1 lg:mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              Code Editor
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium">Create and edit code files with syntax highlighting</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('local')}
            className={`px-4 py-2 border-2 border-black rounded-lg font-bold text-sm transition ${
              activeTab === 'local'
                ? 'bg-blue-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            <Code2 className="w-4 h-4 inline mr-2" strokeWidth={2.5} />
            Local Files
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`px-4 py-2 border-2 border-black rounded-lg font-bold text-sm transition ${
              activeTab === 'github'
                ? 'bg-blue-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            <Github className="w-4 h-4 inline mr-2" strokeWidth={2.5} />
            GitHub Repos
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'local' ? (
          <>
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 md:gap-3 mb-3 sm:mb-4 md:mb-5 lg:mb-6">
              <button
                onClick={() => setShowCreateFolderModal(true)}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 bg-blue-200 border-2 lg:border-3 border-black rounded-lg lg:rounded-xl font-bold text-xs sm:text-sm lg:text-base hover:bg-blue-300 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] lg:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] lg:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:hover:translate-x-[-1px] sm:hover:translate-y-[-1px] lg:hover:translate-x-[-2px] lg:hover:translate-y-[-2px]"
              >
                <FolderPlus className="w-4 h-4 lg:w-5 lg:h-5" strokeWidth={2.5} />
                <span className="whitespace-nowrap">New Folder</span>
              </button>
              {currentPath && (
                <button
                  onClick={() => setShowCreateFileModal(true)}
                  className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 bg-green-200 border-2 lg:border-3 border-black rounded-lg lg:rounded-xl font-bold text-xs sm:text-sm lg:text-base hover:bg-green-300 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] lg:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] lg:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:hover:translate-x-[-1px] sm:hover:translate-y-[-1px] lg:hover:translate-x-[-2px] lg:hover:translate-y-[-2px]"
                >
                  <FilePlus className="w-4 h-4 lg:w-5 lg:h-5" strokeWidth={2.5} />
                  <span className="whitespace-nowrap">New File</span>
                </button>
              )}
              {currentPath && files.length > 0 && githubRepos.length > 0 && (
                <button
                  onClick={() => setShowPushModal(true)}
                  className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 bg-purple-200 border-2 lg:border-3 border-black rounded-lg lg:rounded-xl font-bold text-xs sm:text-sm lg:text-base hover:bg-purple-300 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] lg:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] lg:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:hover:translate-x-[-1px] sm:hover:translate-y-[-1px] lg:hover:translate-x-[-2px] lg:hover:translate-y-[-2px]"
                >
                  <Upload className="w-4 h-4 lg:w-5 lg:h-5" strokeWidth={2.5} />
                  <span className="whitespace-nowrap">Push to GitHub</span>
                </button>
              )}
            </div>

            {/* Breadcrumbs */}
            {currentPath && (
              <div className="bg-white border-2 sm:border-3 lg:border-3 border-black rounded-lg lg:rounded-xl p-2.5 sm:p-3 lg:p-4 mb-3 sm:mb-4 md:mb-5 lg:mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] lg:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 flex-wrap">
                  <button
                    onClick={() => setCurrentPath('')}
                    className="px-2 sm:px-2.5 lg:px-3 py-0.5 sm:py-1 bg-gray-100 border-2 border-black rounded-md lg:rounded-lg font-bold text-[10px] sm:text-xs lg:text-sm hover:bg-gray-200 transition"
                  >
                    Root
                  </button>
                  {getBreadcrumbs().map((part, index) => (
                    <div key={index} className="flex items-center gap-1 sm:gap-1.5 lg:gap-2">
                      <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4" />
                      <button
                        onClick={() => {
                          const path = getBreadcrumbs().slice(0, index + 1).join('/');
                          setCurrentPath(path);
                        }}
                        className="px-2 sm:px-2.5 lg:px-3 py-0.5 sm:py-1 bg-gray-100 border-2 border-black rounded-md lg:rounded-lg font-bold text-[10px] sm:text-xs lg:text-sm hover:bg-gray-200 transition break-all max-w-[120px] sm:max-w-none truncate"
                      >
                        {part}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-12 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {/* Folders Section */}
              <div className="col-span-12">
                <div className="bg-white border-2 sm:border-3 lg:border-4 border-black rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] lg:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-black mb-3 sm:mb-4 lg:mb-6" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                    Folders
                  </h2>

                  {folders.length === 0 ? (
                    <div className="text-center py-6 sm:py-8 lg:py-12 border-2 lg:border-3 border-dashed border-black rounded-lg lg:rounded-xl">
                      <Folder className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400 mx-auto mb-2 lg:mb-3" strokeWidth={2} />
                      <p className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium">No folders here</p>
                      <p className="text-[10px] sm:text-xs lg:text-sm text-gray-500 mt-1">Create a new folder to get started</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                      {folders.map((folder) => (
                        <div
                          key={folder._id}
                          className="bg-yellow-50 border-2 lg:border-3 border-black rounded-lg lg:rounded-xl p-2.5 sm:p-3 lg:p-4 hover:bg-yellow-100 transition cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] lg:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] sm:hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] lg:hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] sm:hover:translate-x-[-1px] sm:hover:translate-y-[-1px] lg:hover:translate-x-[-2px] lg:hover:translate-y-[-2px]"
                        >
                          <div className="flex items-start justify-between gap-1.5 sm:gap-2">
                            <div
                              onClick={() => navigateToFolder(folder.path)}
                              className="flex-1 min-w-0"
                            >
                              <Folder className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-black mb-1 sm:mb-1.5 lg:mb-2" strokeWidth={2.5} />
                              <h3 className="font-black text-black text-xs sm:text-sm lg:text-base break-words line-clamp-2">{folder.name}</h3>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteFolder(folder.folderId);
                              }}
                              className="p-1 sm:p-1.5 lg:p-2 bg-red-100 border-2 border-black rounded-md lg:rounded-lg hover:bg-red-200 transition flex-shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-black" strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Files Section */}
              {currentPath && (
                <div className="col-span-12">
                  <div className="bg-white border-2 sm:border-3 lg:border-4 border-black rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] lg:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-black mb-3 sm:mb-4 lg:mb-6" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                      Code Files ({files.length})
                    </h2>

                    {files.length === 0 ? (
                      <div className="text-center py-6 sm:py-8 lg:py-12 border-2 lg:border-3 border-dashed border-black rounded-lg lg:rounded-xl">
                        <Code2 className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400 mx-auto mb-2 lg:mb-3" strokeWidth={2} />
                        <p className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium">No code files in this folder</p>
                        <p className="text-[10px] sm:text-xs lg:text-sm text-gray-500 mt-1">Create a new file to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-2 sm:space-y-2.5 lg:space-y-3">
                        {files.map((file) => (
                          <div
                            key={file._id}
                            className="flex items-center justify-between p-3 sm:p-3 lg:p-4 bg-white border-2 lg:border-3 border-black rounded-lg lg:rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] lg:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] sm:hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] lg:hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] sm:hover:translate-x-[-1px] sm:hover:translate-y-[-1px] lg:hover:translate-x-[-2px] lg:hover:translate-y-[-2px] transition gap-2 sm:gap-3"
                          >
                            <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 flex-1 min-w-0 overflow-hidden">
                              <File className="w-5 h-5 sm:w-5 sm:h-5 lg:w-5 lg:h-5 text-black flex-shrink-0" strokeWidth={2.5} />
                              <div className="flex-1 min-w-0 overflow-hidden">
                                <p className="font-bold text-black text-sm sm:text-sm lg:text-base truncate w-full">{file.filename}</p>
                                <p className="text-xs sm:text-xs lg:text-sm text-gray-600 font-medium mt-0.5">
                                  {file.language} • {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 justify-end flex-shrink-0">
                              <button
                                onClick={() => editFile(file)}
                                className="p-2 sm:p-2 bg-blue-100 border-2 border-black rounded-md lg:rounded-lg hover:bg-blue-200 transition active:translate-x-[1px] active:translate-y-[1px]"
                                title="Edit file"
                              >
                                <Edit3 className="w-4 h-4 sm:w-4 sm:h-4 text-black" strokeWidth={2.5} />
                              </button>
                              <button
                                onClick={() => deleteFile(file.fileId)}
                                className="p-2 sm:p-2 bg-red-100 border-2 border-black rounded-md lg:rounded-lg hover:bg-red-200 transition active:translate-x-[1px] active:translate-y-[1px]"
                                title="Delete file"
                              >
                                <Trash2 className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-black" strokeWidth={2.5} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* GitHub Tab Content */
          <div className="space-y-6">
            {selectedRepo ? (
              <GitHubRepoBrowser repo={selectedRepo} onBack={handleBackToRepos} />
            ) : (
              <GitHubRepoManager onRepoSelect={handleRepoSelect} />
            )}
          </div>
        )}

        {/* Create Folder Modal */}
        {showCreateFolderModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white border-2 sm:border-3 lg:border-4 border-black rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-8 max-w-md w-full mx-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] lg:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-black mb-3 sm:mb-4 lg:mb-6" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                Create New Folder
              </h2>

              <div className="space-y-2.5 sm:space-y-3 lg:space-y-4 mb-4 sm:mb-5 lg:mb-6">
                <div>
                  <label className="block text-[10px] sm:text-xs lg:text-sm font-black text-black mb-1.5 sm:mb-2 uppercase">
                    Folder Name *
                  </label>
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full px-3 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 bg-white border-2 lg:border-3 border-black rounded-lg lg:rounded-xl text-xs sm:text-sm lg:text-base font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] lg:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    placeholder="e.g., components"
                  />
                </div>

                {currentPath && (
                  <div className="p-2 sm:p-2.5 lg:p-3 bg-blue-50 border-2 border-black rounded-md lg:rounded-lg">
                    <p className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-700">
                      Creating in: <span className="font-black text-black break-all">{currentPath}</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
                <button
                  onClick={() => setShowCreateFolderModal(false)}
                  className="flex-1 px-4 py-2 sm:py-2.5 lg:py-3 bg-white border-2 lg:border-3 border-black rounded-lg lg:rounded-xl font-bold text-xs sm:text-sm lg:text-base hover:bg-gray-50 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] lg:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  Cancel
                </button>
                <button
                  onClick={createFolder}
                  disabled={loading || !newFolderName}
                  className="flex-1 px-4 py-2 sm:py-2.5 lg:py-3 bg-black text-white border-2 lg:border-3 border-black rounded-lg lg:rounded-xl font-bold text-xs sm:text-sm lg:text-base hover:bg-gray-800 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] lg:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create File Modal */}
        {showCreateFileModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white border-2 sm:border-3 lg:border-4 border-black rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-8 max-w-md w-full mx-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] lg:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-black mb-3 sm:mb-4 lg:mb-6" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                Create New File
              </h2>

              <div className="space-y-2.5 sm:space-y-3 lg:space-y-4 mb-4 sm:mb-5 lg:mb-6">
                <div>
                  <label className="block text-[10px] sm:text-xs lg:text-sm font-black text-black mb-1.5 sm:mb-2 uppercase">
                    File Name *
                  </label>
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="w-full px-3 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 bg-white border-2 lg:border-3 border-black rounded-lg lg:rounded-xl text-xs sm:text-sm lg:text-base font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] lg:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    placeholder="e.g., index.js, style.css, main.py"
                  />
                </div>

                <div className="p-2 sm:p-2.5 lg:p-3 bg-blue-50 border-2 border-black rounded-md lg:rounded-lg">
                  <p className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-700">
                    Creating in: <span className="font-black text-black break-all">{currentPath}</span>
                  </p>
                  {newFileName && (
                    <p className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-700 mt-1">
                      Language: <span className="font-black text-black">{getLanguageFromExtension(newFileName)}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
                <button
                  onClick={() => setShowCreateFileModal(false)}
                  className="flex-1 px-4 py-2 sm:py-2.5 lg:py-3 bg-white border-2 lg:border-3 border-black rounded-lg lg:rounded-xl font-bold text-xs sm:text-sm lg:text-base hover:bg-gray-50 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] lg:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  Cancel
                </button>
                <button
                  onClick={createFile}
                  disabled={loading || !newFileName}
                  className="flex-1 px-4 py-2 sm:py-2.5 lg:py-3 bg-black text-white border-2 lg:border-3 border-black rounded-lg lg:rounded-xl font-bold text-xs sm:text-sm lg:text-base hover:bg-gray-800 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] lg:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Push to GitHub Modal */}
        {showPushModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white border-2 sm:border-3 lg:border-4 border-black rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-8 max-w-md w-full mx-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] lg:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-black mb-3 sm:mb-4 lg:mb-6" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                Push Code to GitHub
              </h2>

              <div className="space-y-2.5 sm:space-y-3 lg:space-y-4 mb-4 sm:mb-5 lg:mb-6">
                <div>
                  <label className="block text-[10px] sm:text-xs lg:text-sm font-black text-black mb-1.5 sm:mb-2 uppercase">
                    Select Repository *
                  </label>
                  <select
                    value={selectedRepoForPush?._id || ''}
                    onChange={(e) => {
                      const repo = githubRepos.find(r => r._id === e.target.value);
                      setSelectedRepoForPush(repo || null);
                    }}
                    className="w-full px-3 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 bg-white border-2 lg:border-3 border-black rounded-lg lg:rounded-xl text-xs sm:text-sm lg:text-base font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] lg:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <option value="">Choose a repository...</option>
                    {githubRepos.map((repo) => (
                      <option key={repo._id} value={repo._id}>
                        {repo.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs lg:text-sm font-black text-black mb-1.5 sm:mb-2 uppercase">
                    Commit Message *
                  </label>
                  <input
                    type="text"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    className="w-full px-3 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 bg-white border-2 lg:border-3 border-black rounded-lg lg:rounded-xl text-xs sm:text-sm lg:text-base font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] lg:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    placeholder="Update code from admin panel"
                  />
                </div>

                <div className="p-2 sm:p-2.5 lg:p-3 bg-purple-50 border-2 border-black rounded-md lg:rounded-lg">
                  <p className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-700">
                    Pushing from: <span className="font-black text-black break-all">{currentPath}</span>
                  </p>
                  <p className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-700 mt-1">
                    Files to push: <span className="font-black text-black">{files.length}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
                <button
                  onClick={() => setShowPushModal(false)}
                  className="flex-1 px-4 py-2 sm:py-2.5 lg:py-3 bg-white border-2 lg:border-3 border-black rounded-lg lg:rounded-xl font-bold text-xs sm:text-sm lg:text-base hover:bg-gray-50 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] lg:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  Cancel
                </button>
                <button
                  onClick={pushCodeToGithub}
                  disabled={loading || !selectedRepoForPush || !commitMessage}
                  className="flex-1 px-4 py-2 sm:py-2.5 lg:py-3 bg-purple-600 text-white border-2 lg:border-3 border-black rounded-lg lg:rounded-xl font-bold text-xs sm:text-sm lg:text-base hover:bg-purple-700 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] lg:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Pushing...' : 'Push to GitHub'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}