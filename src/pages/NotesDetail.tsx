import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, FolderOpen, Folder as FolderIcon, ChevronRight, ChevronDown } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

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

        // Select first file if available
        if (completeTree.files && completeTree.files.length > 0) {
          loadFile(completeTree.files[0]);
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

  const loadFile = async (file: NoteFile) => {
    try {
      console.log('Loading file:', file.filename, file.fileId);

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

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const isTextFile = (filename: string) => {
    const textExtensions = ['txt', 'md', 'java', 'cpp', 'c', 'py', 'js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml', 'yaml', 'yml', 'sh', 'bash'];
    return textExtensions.includes(getFileExtension(filename));
  };

  const isPdfFile = (filename: string) => {
    return getFileExtension(filename) === 'pdf';
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
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-2xl font-black">Loading...</div>
      </div>
    );
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
      <div className="bg-white border-b-4 border-black p-6">
        <div className="max-w-[1800px] mx-auto">
          <button
            onClick={() => navigate('/learnings?tab=notes')}
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-4 font-bold text-base"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
            Back to Notes
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-200 border-3 border-black rounded-lg">
              <FolderOpen className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                {rootFolder.name}
              </h1>
              <p className="text-sm text-gray-600 font-medium">{rootFolder.path}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Fixed Sidebar with Tree View */}
        <div className="w-80 bg-white border-r-4 border-black overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <FolderOpen className="w-4 h-4" strokeWidth={2.5} />
              <h3 className="font-black text-sm uppercase">Folder Tree</h3>
            </div>
            {renderFolderTree(rootFolder)}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {selectedFile ? (
            <div className="max-w-6xl mx-auto px-8 py-8">
              {/* File Header */}
              <div className="bg-white border-4 border-black rounded-xl p-6 mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 font-medium">
                  <FolderOpen size={14} strokeWidth={2.5} />
                  <span>{selectedFile.folderPath}</span>
                  <ChevronRight size={12} strokeWidth={2.5} />
                  <span className="text-black font-bold">{selectedFile.filename}</span>
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-black text-black mb-3" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                      {selectedFile.filename}
                    </h1>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="px-3 py-1 bg-gray-200 border-2 border-black rounded-lg font-bold">
                        {getFileExtension(selectedFile.filename).toUpperCase()}
                      </span>
                      <span className="font-medium text-gray-600">
                        {new Date(selectedFile.uploadedAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </span>
                      <span className="font-medium text-gray-600">{(selectedFile.size / 1024).toFixed(2)} KB</span>
                    </div>
                  </div>
                  <a
                    href={selectedFile.cloudinaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white border-3 border-black rounded-xl hover:bg-gray-800 transition-all font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>
                </div>
              </div>

              {/* File Content */}
              {isPdfFile(selectedFile.filename) ? (
                <div className="bg-white border-4 border-black rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <iframe src={selectedFile.cloudinaryUrl} className="w-full h-[900px]" title={selectedFile.filename} />
                </div>
              ) : isTextFile(selectedFile.filename) ? (
                <div className="bg-white border-4 border-black rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  {selectedFile.content ? (
                    <div>
                      <div className="bg-black text-white px-6 py-4 flex items-center justify-between border-b-4 border-black">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500 border-2 border-white"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white"></div>
                          </div>
                          <span className="text-sm font-bold">
                            {getLanguageFromExtension(selectedFile.filename)}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedFile.content || '');
                            alert('✓ Copied to clipboard!');
                          }}
                          className="px-4 py-2 bg-white text-black border-2 border-white rounded-lg text-sm font-bold hover:bg-gray-200 transition-all"
                        >
                          Copy Code
                        </button>
                      </div>
                      <div className="bg-gray-50">
                        <pre className="p-6 overflow-x-auto">
                          <code className="text-sm font-mono leading-relaxed text-gray-900">{selectedFile.content}</code>
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <div className="w-20 h-20 bg-gray-100 border-3 border-black rounded-xl flex items-center justify-center mx-auto mb-4">
                        <FileText size={32} strokeWidth={2.5} />
                      </div>
                      <p className="text-gray-600 mb-6 font-bold">Unable to preview</p>
                      <a href={selectedFile.cloudinaryUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white border-3 border-black rounded-xl hover:bg-gray-800 transition-all font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        Open in new tab
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white border-4 border-black rounded-xl p-16 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <div className="w-24 h-24 bg-purple-200 border-3 border-black rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <FileText size={48} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-black text-black mb-2">Cannot preview this file</h3>
                  <p className="text-gray-600 mb-8 font-medium">
                    File type: <span className="font-black text-black">{getFileExtension(selectedFile.filename).toUpperCase()}</span>
                  </p>
                  <div className="flex gap-4 justify-center">
                    <a href={selectedFile.cloudinaryUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white border-3 border-black rounded-xl hover:bg-gray-800 transition-all font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open in new tab
                    </a>
                    <button onClick={() => { navigator.clipboard.writeText(selectedFile.cloudinaryUrl); alert('✓ Link copied!'); }} className="inline-flex items-center gap-2 px-8 py-4 bg-purple-200 text-black border-3 border-black rounded-xl hover:bg-purple-300 transition-all font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Link
                    </button>
                  </div>
                </div>
              )}
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
