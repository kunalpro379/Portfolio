import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Folder, File, X, Save, Trash2, ChevronRight, ChevronDown, Menu } from 'lucide-react';
import Editor from '@monaco-editor/react';
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
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'sql', label: 'SQL' },
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
  const [outputMinimized, setOutputMinimized] = useState(false);
  
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
      setOutputMinimized(false); // Ensure output is visible
      setOutput('Saving file...\n');

      // First, save the current file
      await handleSaveFile(true);
      
      // Wait a moment for blob storage to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setOutput('Running code...\n');

      // Get the language-specific endpoint and request format
      const languageEndpoints: Record<string, { url: string; bodyKey: string }> = {
        java: { 
          url: 'https://portfolio-coding379-c3egfsfuagefb3bv.centralindia-01.azurewebsites.net/api/RunJavaCode',
          bodyKey: 'blob_url'
        },
        python: { 
          url: 'https://pyenv.azurewebsites.net/api/runPythonFromBlob',
          bodyKey: 'url'
        },
        javascript: { 
          url: 'https://nodejsenv.azurewebsites.net/api/runJsFromBlob',
          bodyKey: 'url'
        },
        cpp: { 
          url: 'https://cpp-env.ambitioussky-ca288612.southindia.azurecontainerapps.io/api/run',
          bodyKey: 'blob_url'
        },
        c: { 
          url: 'https://cpp-env.ambitioussky-ca288612.southindia.azurecontainerapps.io/api/run',
          bodyKey: 'blob_url'
        },
        sql: { 
          url: 'https://sqldp379.azurewebsites.net/api/httpTriggerSQL',
          bodyKey: 'query'
        },
      };

      const language = selectedFolder.language || 'java';
      const endpointConfig = languageEndpoints[language];

      if (!endpointConfig) {
        setOutput(`Error: Language ${language} is not supported for execution`);
        return;
      }

      // Fetch the updated file metadata to get the correct blob URL
      const fileMetadataResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.code}/files/${selectedFile.fileId}`);
      if (!fileMetadataResponse.ok) {
        throw new Error('Failed to fetch file metadata');
      }
      
      const fileMetadata = await fileMetadataResponse.json();
      const blobUrl = fileMetadata.file.blobUrl;

      console.log('Running code with blob URL:', blobUrl);
      console.log('Language:', language);
      console.log('Endpoint:', endpointConfig.url);

      // For SQL, send the code content directly as query
      let requestBody: any;
      if (language === 'sql') {
        requestBody = { [endpointConfig.bodyKey]: fileContent };
      } else {
        requestBody = { [endpointConfig.bodyKey]: blobUrl };
      }

      // Call the Azure Function
      const response = await fetch(endpointConfig.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Handle different response formats
      let outputText = '';
      if (language === 'sql') {
        // SQL returns { rows: [...], rowCount: number }
        outputText = JSON.stringify(result, null, 2);
      } else if (language === 'cpp' || language === 'c') {
        // C/C++ returns { success: boolean, output: string }
        outputText = result.output || result.error || 'No output';
      } else {
        // Python, JavaScript, Java return plain text or { output: string }
        outputText = result.output || result.error || result || 'No output';
      }
      
      setOutput(outputText);

      // Save output to MongoDB
      await fetch(`${API_BASE_URL}${API_ENDPOINTS.code}/files/${selectedFile.fileId}/output`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ output: outputText }),
      });

    } catch (error) {
      // Handle CORS and network errors gracefully
      let errorMessage = 'Failed to run code';
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = 'Error: Unable to connect to code execution service.\nThis may be due to CORS configuration or network issues.\nPlease contact the administrator.';
      } else if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      }
      
      setOutput(errorMessage);
    } finally {
      setIsRunning(false);
    }
  };

  // Delete file
  const handleDeleteFile = async (file: CodeFile, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!window.confirm(`Delete ${file.filename}?`)) return;

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
      python: 'py', javascript: 'js', java: 'java',
      cpp: 'cpp', c: 'c', sql: 'sql',
    };
    return extMap[language] || 'txt';
  };

  const getMonacoLanguage = (language: string) => {
    const langMap: Record<string, string> = {
      python: 'python',
      javascript: 'javascript',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      sql: 'sql',
    };
    return langMap[language.toLowerCase()] || 'plaintext';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-black border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-stone-900">
      {/* Header - Black with White Text */}
      <div className="bg-black border-b border-white/10 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg border border-white/20 text-white"
            >
              {sidebarOpen ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
            </button>
            
            <button
              onClick={() => navigate('/learnings?tab=code')}
              className="flex items-center gap-2 text-stone-400 hover:text-white font-semibold text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              Back
            </button>
            
            {selectedFolder && (
              <div className="hidden sm:flex items-center gap-2 ml-4">
                <div className="w-px h-6 bg-white/20"></div>
                <span className="text-sm font-semibold text-white">{selectedFolder.name}</span>
                {selectedFolder.language && (
                  <span className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs font-semibold text-white">
                    {selectedFolder.language.toUpperCase()}
                  </span>
                )}
              </div>
            )}
          </div>

          <h1 className="text-lg font-bold text-white">Code Editor</h1>

          <button
            onClick={() => setShowCreateFolderModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-stone-100 text-black border border-white rounded-lg font-semibold text-sm transition-all"
          >
            <Plus size={16} strokeWidth={2} />
            <span className="hidden sm:inline">New Folder</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/70 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - White/Cream with Black Buttons */}
        <div className={`
          fixed md:relative inset-y-0 left-0 z-50
          w-80 bg-stone-50 border-r-2 border-stone-200
          transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          overflow-y-auto flex flex-col
          scrollbar-hide
        `}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}>
          <style>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <div className="p-4 border-b-2 border-stone-200 flex items-center justify-between">
            <h3 className="font-bold text-sm uppercase text-black tracking-wider">Files</h3>
            {selectedFolder && (
              <button
                onClick={() => setShowCreateFileModal(true)}
                className="p-1.5 bg-black hover:bg-stone-800 text-white border border-black rounded-lg transition-colors"
                title="New File"
              >
                <Plus size={14} strokeWidth={2} />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}>
            <style>{`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {folders.length === 0 ? (
              <div className="text-center py-8">
                <Folder className="w-12 h-12 text-stone-400 mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-xs font-semibold text-stone-600">No folders yet</p>
                <button
                  onClick={() => setShowCreateFolderModal(true)}
                  className="mt-3 px-4 py-2 bg-black hover:bg-stone-800 text-white border border-black rounded-lg font-semibold text-xs transition-all"
                >
                  Create Folder
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                {/* Show current folder info if viewing a specific folder */}
                {selectedFolder && folderFromUrl && (
                  <div className="mb-4 p-3 bg-stone-100 border-2 border-stone-300 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Folder className="w-4 h-4 text-black" strokeWidth={2} />
                      <span className="text-sm font-semibold text-black">{selectedFolder.name}</span>
                    </div>
                    {selectedFolder.description && (
                      <p className="text-xs text-stone-600 font-medium">{selectedFolder.description}</p>
                    )}
                  </div>
                )}
                
                {/* Show subfolders if any */}
                {folders[0]?.subfolders && folders[0].subfolders.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-bold text-stone-500 uppercase mb-2 px-2">Folders</p>
                    {folders[0].subfolders.map((subfolder) => {
                      const isExpanded = expandedFolders.has(subfolder.folderId);
                      return (
                        <div key={subfolder.folderId}>
                          <button
                            onClick={() => toggleFolder(subfolder.folderId)}
                            className="w-full text-left flex items-center gap-2 p-2 hover:bg-stone-200 rounded-lg transition-all text-black"
                          >
                            {isExpanded ? (
                              <ChevronDown size={14} strokeWidth={2} className="text-black" />
                            ) : (
                              <ChevronRight size={14} strokeWidth={2} className="text-black" />
                            )}
                            <Folder size={14} strokeWidth={2} className="text-black" />
                            <span className="text-sm font-semibold truncate">{subfolder.name}</span>
                          </button>
                          
                          {isExpanded && subfolder.files && (
                            <div className="ml-6 mt-1 space-y-1">
                              {subfolder.files.map((file) => (
                                <div key={file.fileId} className="flex items-center gap-1">
                                  <button
                                    onClick={() => loadFile(file)}
                                    className={`flex-1 text-left flex items-center gap-2 p-2 rounded-lg transition-all ${
                                      selectedFile?.fileId === file.fileId
                                        ? 'bg-black text-white border-2 border-black'
                                        : 'hover:bg-stone-200 text-black'
                                    }`}
                                  >
                                    <File size={14} strokeWidth={2} className={selectedFile?.fileId === file.fileId ? 'text-white' : 'text-black'} />
                                    <span className="text-sm font-medium truncate">{file.filename}</span>
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteFile(file, e)}
                                    className="p-1 hover:bg-red-100 rounded text-red-600"
                                    title="Delete file"
                                  >
                                    <Trash2 size={12} strokeWidth={2} />
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
                        <p className="text-xs font-bold text-stone-500 uppercase mb-2 px-2">Files</p>
                        {folder.files.map((file) => (
                          <div key={file.fileId} className="flex items-center gap-1">
                            <button
                              onClick={() => loadFile(file)}
                              className={`flex-1 text-left flex items-center gap-2 p-2 rounded-lg transition-all ${
                                selectedFile?.fileId === file.fileId
                                  ? 'bg-black text-white border-2 border-black'
                                  : 'hover:bg-stone-200 text-black'
                              }`}
                            >
                              <File size={14} strokeWidth={2} className={selectedFile?.fileId === file.fileId ? 'text-white' : 'text-black'} />
                              <span className="text-sm font-medium truncate">{file.filename}</span>
                            </button>
                            <button
                              onClick={(e) => handleDeleteFile(file, e)}
                              className="p-1 hover:bg-red-100 rounded text-red-600"
                              title="Delete file"
                            >
                              <Trash2 size={12} strokeWidth={2} />
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

        {/* Editor - Dark Theme with White/Black Only */}
        <div className="flex-1 flex flex-col bg-stone-900 overflow-hidden">
          {/* Editor Header */}
          <div className="bg-black text-white px-6 py-4 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-sm font-semibold text-white">
                {selectedFile ? selectedFile.filename : 'No file selected'}
              </span>
              {selectedFolder && (
                <span className="text-xs text-stone-400 font-medium">
                  • Note: Write code in main class only
                </span>
              )}
            </div>

            {selectedFile && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSaveFile(false)}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                >
                  <Save size={16} strokeWidth={2} />
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-stone-100 text-black border border-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                >
                  {isRunning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
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
          <div className={`${showOutput && !outputMinimized ? 'flex-1' : 'flex-1'} overflow-hidden bg-stone-900`}>
            {selectedFile ? (
              <Editor
                height="100%"
                language={getMonacoLanguage(selectedFile.language || selectedFolder?.language || 'javascript')}
                value={fileContent}
                onChange={(value) => setFileContent(value || '')}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  lineHeight: 24,
                  minimap: { enabled: true },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                  formatOnPaste: true,
                  formatOnType: true,
                  autoIndent: 'full',
                  bracketPairColorization: { enabled: true },
                  guides: {
                    bracketPairs: true,
                    indentation: true,
                  },
                  smoothScrolling: true,
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  renderLineHighlight: 'all',
                  lineNumbers: 'on',
                  glyphMargin: true,
                  folding: true,
                  lineDecorationsWidth: 10,
                  lineNumbersMinChars: 3,
                  renderWhitespace: 'selection',
                  scrollbar: {
                    vertical: 'hidden',
                    horizontal: 'hidden',
                    verticalScrollbarSize: 0,
                    horizontalScrollbarSize: 0,
                  },
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-stone-400">
                <div className="text-center">
                  <File className="w-16 h-16 mx-auto mb-4 opacity-50 text-white/20" strokeWidth={1.5} />
                  <p className="text-lg font-semibold mb-2 text-white">No file selected</p>
                  <p className="text-sm opacity-75">Select a file from the sidebar or create a new one</p>
                </div>
              </div>
            )}
          </div>

          {/* Output Panel */}
          {showOutput && (
            <div className={`${outputMinimized ? 'h-12' : 'h-64'} border-t border-white/10 bg-stone-900 flex flex-col transition-all duration-300`}>
              <div className="bg-black px-4 py-2 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOutputMinimized(!outputMinimized)}
                    className="text-white hover:text-stone-300 transition-colors"
                    title={outputMinimized ? "Maximize" : "Minimize"}
                  >
                    {outputMinimized ? (
                      <ChevronDown size={16} strokeWidth={2} />
                    ) : (
                      <ChevronRight size={16} strokeWidth={2} className="rotate-90" />
                    )}
                  </button>
                  <span className="text-sm font-semibold text-white">Output</span>
                </div>
                <button
                  onClick={() => setShowOutput(false)}
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  <X size={16} strokeWidth={2} />
                </button>
              </div>
              {!outputMinimized && (
                <div className="flex-1 overflow-auto p-4 bg-stone-950 scrollbar-hide"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}>
                  <style>{`
                    .scrollbar-hide::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                  <pre className="text-stone-200 font-mono text-sm whitespace-pre-wrap">
                    {output || 'No output yet. Click "Run" to execute your code.'}
                  </pre>
                </div>
              )}
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
