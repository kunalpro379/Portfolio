import React, { useState, useEffect } from 'react';
import { Github, Folder, File, ChevronRight, ArrowLeft, ExternalLink, Download } from 'lucide-react';
import config, { buildUrl } from '../config/config';

interface GitHubRepo {
  _id: string;
  name: string;
  owner: string;
  fullName: string;
  description: string;
  url: string;
  defaultBranch: string;
  isPrivate: boolean;
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

interface GitHubRepoBrowserProps {
  repo: GitHubRepo;
  onBack: () => void;
}

export default function GitHubRepoBrowser({ repo, onBack }: GitHubRepoBrowserProps) {
  const [currentPath, setCurrentPath] = useState('');
  const [items, setItems] = useState<GitHubTreeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<GitHubFileContent | null>(null);
  const [fileLoading, setFileLoading] = useState(false);

  useEffect(() => {
    fetchTree();
  }, [currentPath]);

  const fetchTree = async () => {
    setLoading(true);
    try {
      const response = await fetch(buildUrl(config.api.endpoints.githubRepoTree(repo._id, currentPath)), {
        credentials: 'include'
      });
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Error fetching tree:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFile = async (path: string) => {
    setFileLoading(true);
    try {
      const response = await fetch(buildUrl(config.api.endpoints.githubRepoFile(repo._id, path)), {
        credentials: 'include'
      });
      const data = await response.json();
      setSelectedFile(data.file);
    } catch (error) {
      console.error('Error fetching file:', error);
      alert('Failed to load file content');
    } finally {
      setFileLoading(false);
    }
  };

  const navigateToFolder = (path: string) => {
    setCurrentPath(path);
  };

  const navigateUp = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    pathParts.pop();
    setCurrentPath(pathParts.join('/'));
  };

  const getBreadcrumbs = () => {
    if (!currentPath) return [];
    return currentPath.split('/').filter(Boolean);
  };

  const getFileLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const langMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'yml': 'yaml',
      'yaml': 'yaml',
      'xml': 'xml',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'sh': 'bash',
    };
    return langMap[ext || ''] || 'text';
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 bg-gray-100 border-2 border-black rounded-lg hover:bg-gray-200 transition"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
            </button>
            <Github className="w-6 h-6" strokeWidth={2.5} />
            <div>
              <h3 className="text-lg font-black text-black">{repo.fullName}</h3>
              <p className="text-sm text-gray-600 font-medium">{repo.description}</p>
            </div>
          </div>
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-blue-100 border-2 border-black rounded-lg hover:bg-blue-200 transition"
            title="Open on GitHub"
          >
            <ExternalLink className="w-4 h-4" strokeWidth={2.5} />
          </a>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setCurrentPath('')}
            className="px-3 py-1 bg-gray-100 border-2 border-black rounded-lg font-bold text-sm hover:bg-gray-200 transition"
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
                className="px-3 py-1 bg-gray-100 border-2 border-black rounded-lg font-bold text-sm hover:bg-gray-200 transition"
              >
                {part}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white border-2 border-black rounded-xl p-8 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="animate-spin w-8 h-8 border-3 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="font-bold text-black">Loading repository content...</p>
        </div>
      ) : (
        <div className="bg-white border-2 border-black rounded-xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" strokeWidth={2} />
              <p className="text-gray-600 font-medium">This folder is empty</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.path}
                  className="flex items-center justify-between p-3 border-2 border-black rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {item.type === 'dir' ? (
                      <Folder className="w-5 h-5 text-blue-600 flex-shrink-0" strokeWidth={2.5} />
                    ) : (
                      <File className="w-5 h-5 text-gray-600 flex-shrink-0" strokeWidth={2.5} />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-black text-sm truncate">{item.name}</h4>
                      {item.type === 'file' && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 text-xs font-bold border-2 rounded ${getLanguageColor(getFileLanguage(item.name))}`}>
                            {getFileLanguage(item.name)}
                          </span>
                          {item.size && (
                            <span className="text-xs text-gray-600 font-medium">
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
                        navigateToFolder(item.path);
                      } else {
                        fetchFile(item.path);
                      }
                    }}
                    className="p-2 bg-blue-100 border-2 border-black rounded-lg hover:bg-blue-200 transition"
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

      {/* File Viewer Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-black rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b-2 border-black">
              <div>
                <h3 className="text-lg font-black text-black">{selectedFile.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 text-xs font-bold border-2 rounded ${getLanguageColor(getFileLanguage(selectedFile.name))}`}>
                    {getFileLanguage(selectedFile.name)}
                  </span>
                  <span className="text-xs text-gray-600 font-medium">
                    {formatFileSize(selectedFile.size)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="p-2 bg-red-100 border-2 border-black rounded-lg hover:bg-red-200 transition"
              >
                ✕
              </button>
            </div>

            {/* File Content */}
            <div className="flex-1 overflow-auto p-4">
              {fileLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-3 border-black border-t-transparent rounded-full"></div>
                  <span className="ml-3 font-bold text-black">Loading file content...</span>
                </div>
              ) : (
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg border-2 border-black text-sm font-mono overflow-auto whitespace-pre-wrap">
                  <code>{selectedFile.content}</code>
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}