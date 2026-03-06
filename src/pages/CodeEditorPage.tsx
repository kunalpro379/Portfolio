import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Folder, File, X, Save, Trash2, ChevronRight, ChevronDown, Menu } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';

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

interface CodeFolder {
  _id: string;
  folderId: string;
  name: string;
  path: string;
  parentPath: string;
  description?: string;
  language?: string;
  createdAt: string;
  files: CodeFile[];
  subfolders?: CodeFolder[];
}

const LANGUAGES = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
];

export default function CodeEditorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const folderFromUrl = searchParams.get('folder');

  // State
  const [folders, setFolders] = useState<CodeFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<CodeFolder | null>(null);
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  
  // Modals
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showCreateFileModal, setShowCreateFileModal] = useState(false);
  
  // Form state
  const [folderName, setFolderName] = useState('');
  const [folderDescription, setFolderDescription] = useState('');
  const [folderLanguage, setFolderLanguage] = useState('javascript');
  const [fileName, setFileName] = useState('');
  const [fileLanguage, setFileLanguage] = useState('javascript');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch folders
  const fetchFolders = async () => {
    try {
      setLoading(true);
      
      // If folderFromUrl is provided, fetch only that folder's contents
      if (folderFromUrl) {
        // Fetch the specific folder
        const folderResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.code}/folders?parentPath=`);
        if (!folderResponse.ok) throw new Error('Failed to fetch folders');
        
        const foldersData = await folderResponse.json();
        const targetFolder = foldersData.folders.find((f: CodeFolder) => f.path === folderFromUrl);
        
        if (targetFolder) {
          // Fetch files in this folder
          const filesResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.code}/files?folderPath=${targetFolder.path}`);
          if (filesResponse.ok) {
            const filesData = await filesResponse.json();
            targetFolder.files = filesData.files || [];
          } else {
            targetFolder.files = [];
          }
          
          // Fetch subfolders in this folder
          const subfoldersResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.code}/folders?parentPath=${targetFolder.path}`);
          if (subfoldersResponse.ok) {
            const subfoldersData = await subfoldersResponse.json();
            targetFolder.subfolders = subfoldersData.folders || [];
            
            // Fetch files for each subfolder
            for (const subfolder of targetFolder.subfolders) {
              const subFilesResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.code}/files?folderPath=${subfolder.path}`);
              if (subFilesResponse.ok) {
                const subFilesData = await subFilesResponse.json();
                subfolder.files = subFilesData.files || [];
              } else {
                subfolder.files = [];
              }
            }
          }
          
          setSelectedFolder(targetFolder);
          setFolders([targetFolder]);
          setExpandedFolders(new Set([targetFolder.folderId]));
          
          // Auto-select first file if available
          if (targetFolder.files && targetFolder.files.length > 0) {
            loadFile(targetFolder.files[0]);
          }
        }
      } else {
        // Fetch all root folders (original behavior)
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.code}/folders?parentPath=`);
        if (!response.ok) throw new Error('Failed to fetch folders');
        
        const data = await response.json();
        const foldersWithContents = await Promise.all(
          data.folders.map(async (folder: CodeFolder) => {
            const filesResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.code}/files?folderPath=${folder.path}`);
            if (filesResponse.ok) {
              const filesData = await filesResponse.json();
              folder.files = filesData.files || [];
            } else {
              folder.files = [];
            }
            return folder;
          })
        );
        
        setFolders(foldersWithContents);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  // Auto-save every 5 seconds
  useEffect(() => {
    if (!selectedFile || !fileContent) return;

    const autoSaveInterval = setInterval(async () => {
      try {
        await handleSaveFile(true); // Silent save
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 5000); // 5 seconds

    return () => clearInterval(autoSaveInterval);
  }, [selectedFile, fileContent]);

  // Load file content
  const loadFile = async (file: CodeFile) => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.code}/files/${file.fileId}/content`);
      if (!response.ok) throw new Error('Failed to load file');
      
      const data = await response.json();
      setSelectedFile(file);
      setFileContent(data.content || '');
      setSidebarOpen(false);
    } catch (error) {
      console.error('Error loading file:', error);
      alert('Failed to load file');
    }
  };

  // Create folder
  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      alert('Please enter a folder name');
      return;
    }

    try {
      const timestamp = new Date().toISOString();
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.code}/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: folderName,
          description: folderDescription,
          language: folderLanguage,
          parentPath: '',
          createdAt: timestamp,
        }),
      });

      if (!response.ok) throw new Error('Failed to create folder');

      setShowCreateFolderModal(false);
      setFolderName('');
      setFolderDescription('');
      setFolderLanguage('javascript');
      fetchFolders();
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Failed to create folder');
    }
  };

  // Create file
  const handleCreateFile = async () => {
    if (!fileName.trim()) {
      alert('Please enter a file name');
      return;
    }

    if (!selectedFolder) {
      alert('Please select a folder first');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.code}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: fileName,
          folderPath: selectedFolder.path,
          content: '',
          language: fileLanguage,
        }),
      });

      if (!response.ok) throw new Error('Failed to create file');

      const data = await response.json();
      setShowCreateFileModal(false);
      setFileName('');
      setFileLanguage('javascript');
      fetchFolders();
      
      // Load the new file
      if (data.file) {
        loadFile(data.file);
      }
    } catch (error) {
      console.error('Error creating file:', error);
      alert('Failed to create file');
    }
  };

  // Save file
  const handleSaveFile = async (silent: boolean = false) => {
    if (!selectedFile) return;

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.code}/files/${selectedFile.fileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: fileContent }),
      });

      if (!response.ok) throw new Error('Failed to save file');

      if (!silent) {
        alert('File saved successfully!');
      }
    } catch (error) {
      console.error('Error saving file:', error);
      if (!silent) {
        alert('Failed to save file');
      }
    } finally {
      setSaving(false);
    }
  };

  // Run code
  const handleRunCode = async () => {
    if (!selectedFolder || !selectedFile) {
      alert('Please select a file to run');
      return;
    }

    try {
      setIsRunning(true);
      setShowOutput(true);
      setOutput('Running code...\n');

      // First, save the current file
      await handleSaveFile(true);

      // Get the language-specific endpoint
      const languageEndpoints: Record<string, string> = {
        java: 'https://portfolio-coding379-c3egfsfuagefb3bv.centralindia-01.azurewebsites.net/api/RunJavaCode',
        python: 'https://portfolio-coding379-c3egfsfuagefb3bv.centralindia-01.azurewebsites.net/api/RunPythonCode',
        javascript: 'https://portfolio-coding379-c3egfsfuagefb3bv.centralindia-01.azurewebsites.net/api/RunJavaScriptCode',
        cpp: 'https://portfolio-coding379-c3egfsfuagefb3bv.centralindia-01.azurewebsites.net/api/RunCppCode',
        c: 'https://portfolio-coding379-c3egfsfuagefb3bv.centralindia-01.azurewebsites.net/api/RunCCode',
      };

      const language = selectedFolder.language || 'java';
      const endpoint = languageEndpoints[language];

      if (!endpoint) {
        setOutput(`Error: Language ${language} is not supported for execution`);
        return;
      }

      // Construct blob URL
      const blobUrl = `https://notesportfolio.blob.core.windows.net/code/${selectedFolder.path}/${selectedFile.filename}`;

      // Call the Azure Function
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blob_url: blobUrl }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const outputText = result.output || result.error || 'No output';
      
      setOutput(outputText);

      // Save output to MongoDB
      await fetch(`${API_BASE_URL}${API_ENDPOINTS.code}/files/${selectedFile.fileId}/output`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ output: outputText }),
      });

    } catch (error) {
      console.error('Error running code:', error);
      setOutput(`Error: ${error instanceof Error ? error.message : 'Failed to run code'}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Delete file
  const handleDeleteFile = async (file: CodeFile, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm(`Delete ${file.filename}?`)) return;

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.code}/files/${file.fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete file');

      if (selectedFile?.fileId === file.fileId) {
        setSelectedFile(null);
        setFileContent('');
      }
      
      fetchFolders();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
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

  const getFileExtension = (language: string) => {
    const extMap: Record<string, string> = {
      python: 'py', javascript: 'js', typescript: 'ts', java: 'java',
      cpp: 'cpp', c: 'c', rust: 'rs', go: 'go',
    };
    return extMap[language] || 'txt';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-black border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b-4 border-black p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
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
              Back
            </button>
            
            {selectedFolder && (
              <div className="hidden sm:flex items-center gap-2 ml-4">
                <div className="w-px h-6 bg-gray-300"></div>
                <span className="text-sm font-bold text-gray-900">{selectedFolder.name}</span>
                {selectedFolder.language && (
                  <span className="px-2 py-1 bg-orange-100 border-2 border-black rounded text-xs font-bold">
                    {selectedFolder.language.toUpperCase()}
                  </span>
                )}
              </div>
            )}
          </div>

          <h1 className="text-lg font-black">Code Editor</h1>

          <button
            onClick={() => setShowCreateFolderModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-400 text-white border-3 border-black rounded-xl font-bold hover:bg-orange-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span className="hidden sm:inline">New Folder</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
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
          w-80 bg-white border-r-4 border-black
          transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          overflow-y-auto flex flex-col
        `}>
          <div className="p-4 border-b-2 border-black flex items-center justify-between">
            <h3 className="font-black text-sm uppercase">Files</h3>
            {selectedFolder && (
              <button
                onClick={() => setShowCreateFileModal(true)}
                className="p-1.5 bg-blue-400 text-white border-2 border-black rounded-lg hover:bg-blue-500"
                title="New File"
              >
                <Plus size={14} strokeWidth={2.5} />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {folders.length === 0 ? (
              <div className="text-center py-8">
                <Folder className="w-12 h-12 text-gray-400 mx-auto mb-2" strokeWidth={2} />
                <p className="text-xs font-bold text-gray-500">No folders yet</p>
                <button
                  onClick={() => setShowCreateFolderModal(true)}
                  className="mt-3 px-4 py-2 bg-orange-400 text-white border-2 border-black rounded-lg font-bold text-xs"
                >
                  Create Folder
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                {/* Show current folder info if viewing a specific folder */}
                {selectedFolder && folderFromUrl && (
                  <div className="mb-4 p-3 bg-orange-50 border-2 border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Folder className="w-4 h-4 text-orange-600" strokeWidth={2.5} />
                      <span className="text-sm font-bold text-gray-900">{selectedFolder.name}</span>
                    </div>
                    {selectedFolder.description && (
                      <p className="text-xs text-gray-600 font-medium">{selectedFolder.description}</p>
                    )}
                  </div>
                )}
                
                {/* Show subfolders if any */}
                {folders[0]?.subfolders && folders[0].subfolders.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2 px-2">Folders</p>
                    {folders[0].subfolders.map((subfolder) => {
                      const isExpanded = expandedFolders.has(subfolder.folderId);
                      return (
                        <div key={subfolder.folderId}>
                          <button
                            onClick={() => toggleFolder(subfolder.folderId)}
                            className="w-full text-left flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-all"
                          >
                            {isExpanded ? (
                              <ChevronDown size={14} strokeWidth={2.5} />
                            ) : (
                              <ChevronRight size={14} strokeWidth={2.5} />
                            )}
                            <Folder size={14} strokeWidth={2.5} className="text-orange-600" />
                            <span className="text-sm font-bold truncate">{subfolder.name}</span>
                          </button>
                          
                          {isExpanded && subfolder.files && (
                            <div className="ml-6 mt-1 space-y-1">
                              {subfolder.files.map((file) => (
                                <div key={file.fileId} className="flex items-center gap-1">
                                  <button
                                    onClick={() => loadFile(file)}
                                    className={`flex-1 text-left flex items-center gap-2 p-2 rounded-lg transition-all ${
                                      selectedFile?.fileId === file.fileId
                                        ? 'bg-blue-200 border-2 border-black'
                                        : 'hover:bg-gray-100'
                                    }`}
                                  >
                                    <File size={14} strokeWidth={2.5} className="text-blue-600" />
                                    <span className="text-sm font-medium truncate">{file.filename}</span>
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteFile(file, e)}
                                    className="p-1 hover:bg-red-100 rounded"
                                    title="Delete file"
                                  >
                                    <Trash2 size={12} strokeWidth={2.5} className="text-red-600" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Show files in current folder */}
                {folders.map((folder) => (
                  <div key={folder.folderId}>
                    {folder.files && folder.files.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase mb-2 px-2">Files</p>
                        {folder.files.map((file) => (
                          <div key={file.fileId} className="flex items-center gap-1">
                            <button
                              onClick={() => loadFile(file)}
                              className={`flex-1 text-left flex items-center gap-2 p-2 rounded-lg transition-all ${
                                selectedFile?.fileId === file.fileId
                                  ? 'bg-blue-200 border-2 border-black'
                                  : 'hover:bg-gray-100'
                              }`}
                            >
                              <File size={14} strokeWidth={2.5} className="text-blue-600" />
                              <span className="text-sm font-medium truncate">{file.filename}</span>
                            </button>
                            <button
                              onClick={(e) => handleDeleteFile(file, e)}
                              className="p-1 hover:bg-red-100 rounded"
                              title="Delete file"
                            >
                              <Trash2 size={12} strokeWidth={2.5} className="text-red-600" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col bg-[#1E1E1E] overflow-hidden">
          {/* Editor Header */}
          <div className="bg-[#2D2D30] text-white px-6 py-4 flex items-center justify-between border-b border-[#3E3E42]">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-sm font-bold text-[#CCCCCC]">
                {selectedFile ? selectedFile.filename : 'No file selected'}
              </span>
              {selectedFolder && (
                <span className="text-xs text-[#858585] font-medium">
                  • Note: Write code in main class only
                </span>
              )}
            </div>

            {selectedFile && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSaveFile(false)}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0E639C] text-white rounded-md text-sm font-bold hover:bg-[#1177BB] transition-all disabled:opacity-50"
                >
                  <Save size={16} strokeWidth={2.5} />
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-bold hover:bg-green-700 transition-all disabled:opacity-50"
                >
                  {isRunning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Running...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                      </svg>
                      Run
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Editor Content */}
          <div className={`${showOutput ? 'flex-1' : 'flex-1'} overflow-auto`}>
            {selectedFile ? (
              <textarea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                className="w-full h-full p-6 bg-[#1E1E1E] text-[#D4D4D4] font-mono text-sm resize-none focus:outline-none"
                style={{ fontFamily: 'Consolas, Monaco, "Courier New", monospace', lineHeight: '1.6' }}
                placeholder="Start coding..."
              />
            ) : (
              <div className="flex items-center justify-center h-full text-[#CCCCCC]">
                <div className="text-center">
                  <File className="w-16 h-16 mx-auto mb-4 opacity-50" strokeWidth={1.5} />
                  <p className="text-lg font-bold mb-2">No file selected</p>
                  <p className="text-sm opacity-75">Select a file from the sidebar or create a new one</p>
                </div>
              </div>
            )}
          </div>

          {/* Output Panel */}
          {showOutput && (
            <div className="h-64 border-t border-[#3E3E42] bg-[#1E1E1E] flex flex-col">
              <div className="bg-[#2D2D30] px-4 py-2 flex items-center justify-between border-b border-[#3E3E42]">
                <span className="text-sm font-bold text-[#CCCCCC]">Output</span>
                <button
                  onClick={() => setShowOutput(false)}
                  className="text-[#CCCCCC] hover:text-white transition-colors"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <pre className="text-[#D4D4D4] font-mono text-sm whitespace-pre-wrap">
                  {output || 'No output yet. Click "Run" to execute your code.'}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white border-4 border-black rounded-2xl p-6 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-black mb-4">Create New Folder</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Folder Name *</label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="w-full px-4 py-2 border-3 border-black rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="my-project"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Description</label>
                <textarea
                  value={folderDescription}
                  onChange={(e) => setFolderDescription(e.target.value)}
                  className="w-full px-4 py-2 border-3 border-black rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                  rows={3}
                  placeholder="Optional description..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Primary Language</label>
                <select
                  value={folderLanguage}
                  onChange={(e) => setFolderLanguage(e.target.value)}
                  className="w-full px-4 py-2 border-3 border-black rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateFolderModal(false);
                  setFolderName('');
                  setFolderDescription('');
                  setFolderLanguage('javascript');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 border-3 border-black rounded-lg font-bold hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="flex-1 px-4 py-2 bg-orange-400 text-white border-3 border-black rounded-lg font-bold hover:bg-orange-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create File Modal */}
      {showCreateFileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white border-4 border-black rounded-2xl p-6 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-black mb-4">Create New File</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">File Name *</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full px-4 py-2 border-3 border-black rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder={`main.${getFileExtension(fileLanguage)}`}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Language</label>
                <select
                  value={fileLanguage}
                  onChange={(e) => setFileLanguage(e.target.value)}
                  className="w-full px-4 py-2 border-3 border-black rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateFileModal(false);
                  setFileName('');
                  setFileLanguage('javascript');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 border-3 border-black rounded-lg font-bold hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFile}
                className="flex-1 px-4 py-2 bg-blue-400 text-white border-3 border-black rounded-lg font-bold hover:bg-blue-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
