import { useState, useEffect } from 'react';
import { Code2, Folder, File, ExternalLink, ChevronRight } from 'lucide-react';

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

export default function CodeSection() {
  const [folders, setFolders] = useState<CodeFolder[]>([]);
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);

  useEffect(() => {
    fetchFolders();
    fetchFiles();
  }, [currentPath]);

  const fetchFolders = async () => {
    try {
      const response = await fetch(`https://api.kunalpatil.me/api/code/folders?parentPath=${currentPath}`);
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
      const response = await fetch(`https://api.kunalpatil.me/api/code/files?folderPath=${currentPath}`);
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
      const response = await fetch(`https://api.kunalpatil.me/api/code/files/${file.fileId}/content`);
      const data = await response.json();
      setSelectedFile({ ...file, content: data.content });
    } catch (error) {
      console.error('Error fetching file content:', error);
    }
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

  const getBreadcrumbs = () => {
    if (!currentPath) return [];
    return currentPath.split('/');
  };

  if (loading && currentPath) {
    return (
      <div className="bg-white border-2 border-black rounded-xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-3 border-black border-t-transparent rounded-full"></div>
          <span className="ml-3 font-bold text-black">Loading code files...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl lg:text-4xl font-black text-black mb-4" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
          Code Repository
        </h2>
        <p className="text-gray-600 font-medium max-w-2xl mx-auto">
          Explore my code projects and snippets organized in a clean directory structure
        </p>
      </div>

      {/* Breadcrumbs */}
      {currentPath && (
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
      )}

      {/* Folders */}
      {folders.length > 0 && (
        <div className="bg-white border-2 border-black rounded-xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-xl font-black text-black mb-4 flex items-center gap-2">
            <Folder className="w-6 h-6" strokeWidth={2.5} />
            Folders
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders.map((folder) => (
              <button
                key={folder._id}
                onClick={() => setCurrentPath(folder.path)}
                className="flex items-center gap-3 p-4 bg-yellow-50 border-2 border-black rounded-lg hover:bg-yellow-100 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px]"
              >
                <Folder className="w-8 h-8 text-black flex-shrink-0" strokeWidth={2.5} />
                <div className="text-left flex-1 min-w-0">
                  <h4 className="font-black text-black text-sm truncate">{folder.name}</h4>
                  <p className="text-xs text-gray-600 font-medium">
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
        <div className="bg-white border-2 border-black rounded-xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-xl font-black text-black mb-4 flex items-center gap-2">
            <Code2 className="w-6 h-6" strokeWidth={2.5} />
            Code Files ({files.length})
          </h3>
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file._id}
                className="flex items-center justify-between p-4 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <File className="w-5 h-5 text-black flex-shrink-0" strokeWidth={2.5} />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-black text-sm truncate">{file.filename}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 text-xs font-bold border-2 rounded ${getLanguageColor(file.language)}`}>
                        {file.language}
                      </span>
                      <span className="text-xs text-gray-600 font-medium">
                        {formatFileSize(file.size)}
                      </span>
                      <span className="text-xs text-gray-600 font-medium">
                        {new Date(file.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => viewFile(file)}
                  className="p-2 bg-blue-100 border-2 border-black rounded-lg hover:bg-blue-200 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px]"
                  title="View code"
                >
                  <ExternalLink className="w-4 h-4 text-black" strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {folders.length === 0 && files.length === 0 && !loading && (
        <div className="bg-white border-2 border-black rounded-xl p-12 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Code2 className="w-16 h-16 text-gray-400 mx-auto mb-4" strokeWidth={2} />
          <h3 className="text-xl font-black text-black mb-2">No Code Files Yet</h3>
          <p className="text-gray-600 font-medium">
            {currentPath ? 'This folder is empty' : 'Start by creating some folders and uploading code files'}
          </p>
        </div>
      )}

      {/* File Viewer Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-black rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b-2 border-black">
              <div>
                <h3 className="text-lg font-black text-black">{selectedFile.filename}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 text-xs font-bold border-2 rounded ${getLanguageColor(selectedFile.language)}`}>
                    {selectedFile.language}
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

            {/* Code Content */}
            <div className="flex-1 overflow-auto p-4">
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg border-2 border-black text-sm font-mono overflow-auto">
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}