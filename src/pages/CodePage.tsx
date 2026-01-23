import { useState, useEffect } from 'react';
import { Folder, File, Code2, Eye, Search, Filter, ChevronRight, ArrowLeft } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import CodeViewer from '../components/CodeViewer';

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
  language: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

export default function CodePage() {
  const [folders, setFolders] = useState<CodeFolder[]>([]);
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [viewingFile, setViewingFile] = useState<CodeFile | null>(null);

  useEffect(() => {
    fetchFolders();
    fetchFiles();
  }, [currentPath]);

  const fetchFolders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_ENDPOINTS.code}/folders?parentPath=${currentPath}`);
      const data = await response.json();
      setFolders(data.folders || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      if (!currentPath) {
        setFiles([]);
        return;
      }
      const response = await fetch(`${API_ENDPOINTS.code}/files?folderPath=${currentPath}`);
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const navigateToFolder = (path: string) => {
    setCurrentPath(path);
  };

  const navigateBack = () => {
    const pathParts = currentPath.split('/');
    pathParts.pop();
    setCurrentPath(pathParts.join('/'));
  };

  const getBreadcrumbs = () => {
    if (!currentPath) return [];
    return currentPath.split('/').filter(part => part);
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

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = !selectedLanguage || file.language === selectedLanguage;
    return matchesSearch && matchesLanguage;
  });

  const uniqueLanguages = [...new Set(files.map(file => file.language))];

  if (viewingFile) {
    return (
      <CodeViewer
        file={viewingFile}
        onClose={() => setViewingFile(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Code2 className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black text-gray-900">Code Repository</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore my code files and projects with syntax highlighting and organized folder structure
          </p>
        </div>

        {/* Navigation */}
        {currentPath && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 mb-6 shadow-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setCurrentPath('')}
                className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-lg font-medium text-sm hover:bg-gray-200 transition"
              >
                Root
              </button>
              {getBreadcrumbs().map((part, index) => (
                <div key={index} className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <button
                    onClick={() => {
                      const path = getBreadcrumbs().slice(0, index + 1).join('/');
                      setCurrentPath(path);
                    }}
                    className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-lg font-medium text-sm hover:bg-gray-200 transition"
                  >
                    {part}
                  </button>
                </div>
              ))}
              {currentPath && (
                <button
                  onClick={navigateBack}
                  className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 border border-blue-300 rounded-lg font-medium text-sm hover:bg-blue-200 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}
            </div>
          </div>
        )}

        {/* Search and Filter */}
        {currentPath && files.length > 0 && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="pl-10 pr-8 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition bg-white"
                >
                  <option value="">All Languages</option>
                  {uniqueLanguages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Folders */}
            {folders.length > 0 && (
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Folder className="w-6 h-6 text-blue-500" />
                  Folders
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {folders.map((folder) => (
                    <button
                      key={folder._id}
                      onClick={() => navigateToFolder(folder.path)}
                      className="flex items-center gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-blue-100 hover:border-blue-300 transition group"
                    >
                      <Folder className="w-8 h-8 text-blue-500 group-hover:text-blue-600" />
                      <div className="text-left">
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-900">{folder.name}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(folder.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Files */}
            {currentPath && (
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <File className="w-6 h-6 text-green-500" />
                  Code Files ({filteredFiles.length})
                </h2>
                
                {filteredFiles.length === 0 ? (
                  <div className="text-center py-12">
                    <Code2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      {files.length === 0 ? 'No code files in this folder' : 'No files match your search'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredFiles.map((file) => (
                      <div
                        key={file._id}
                        className="flex items-center justify-between p-4 bg-gray-50 border-2 border-gray-200 rounded-xl hover:bg-gray-100 hover:border-gray-300 transition group"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <File className="w-6 h-6 text-green-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 truncate">{file.filename}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className={`px-2 py-1 text-xs font-bold border rounded ${getLanguageColor(file.language)}`}>
                                {file.language}
                              </span>
                              <span className="text-sm text-gray-600">{formatFileSize(file.size)}</span>
                              <span className="text-sm text-gray-500">
                                {new Date(file.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewingFile(file)}
                            className="p-2 bg-blue-100 text-blue-600 border-2 border-blue-300 rounded-lg hover:bg-blue-200 transition"
                            title="View file"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!currentPath && folders.length === 0 && (
              <div className="text-center py-16">
                <Code2 className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Code Folders Yet</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Code folders will appear here once they are created in the admin panel.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}