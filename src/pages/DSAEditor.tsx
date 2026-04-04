import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Palette, Plus, FolderPlus, File, Folder, ChevronRight, ChevronDown, Save, X } from 'lucide-react';
import { Excalidraw } from '@excalidraw/excalidraw';
import Editor from '@monaco-editor/react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { fetchDSAProject, createDSAFolder, createDSAFile, fetchDSAFileContent, updateDSAFile, saveDSACanvas, type DSAProject, type DSAFile } from '@/services/dsaApi';

interface TreeNode {
  type: 'file' | 'folder';
  name: string;
  path: string;
  id: string;
  children?: TreeNode[];
  language?: string;
}

export default function DSAEditor() {
  const { dsaId } = useParams();
  const navigate = useNavigate();
  const excalidrawRef = useRef<any>(null);
  
  const [project, setProject] = useState<DSAProject | null>(null);
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<DSAFile | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null); // Track selected folder path
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [showCanvas, setShowCanvas] = useState(false);
  const [canvasData, setCanvasData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingFile, setLoadingFile] = useState(false);
  const [isCodeFullscreen, setIsCodeFullscreen] = useState(false);
  const [isCanvasFullscreen, setIsCanvasFullscreen] = useState(false);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'file' | 'folder'>('file');
  const [createName, setCreateName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadProject();
  }, [dsaId]);

  // Auto-save every 10 minutes
  useEffect(() => {
    if (!selectedFile) return;

    const autoSaveInterval = setInterval(() => {
      console.log('🔄 Auto-saving...');
      handleSave(true); // Pass true to indicate auto-save (no alert)
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(autoSaveInterval);
  }, [selectedFile, code, canvasData]);

  const loadProject = async () => {
    try {
      setLoading(true);
      console.log('Loading DSA project:', dsaId);
      const proj = await fetchDSAProject(dsaId!);
      console.log('Project loaded:', proj);
      setProject(proj);
      buildTree(proj);
    } catch (err) {
      console.error('Error loading project:', err);
      alert(`Failed to load project: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const buildTree = (proj: DSAProject) => {
    console.log('=== BUILDING TREE ===');
    console.log('Project:', proj.name);
    console.log('Files count:', proj.files?.length || 0);
    console.log('Folders count:', proj.folders?.length || 0);
    console.log('Files:', proj.files);
    console.log('Folders:', proj.folders);
    
    const root: TreeNode[] = [];
    const folderMap = new Map<string, TreeNode>();

    // Sort folders by path depth (parent folders first)
    const sortedFolders = (proj.folders || []).sort((a, b) => {
      const aDepth = a.path.split('/').length;
      const bDepth = b.path.split('/').length;
      return aDepth - bDepth;
    });

    console.log('Sorted folders:', sortedFolders);

    // Add folders first
    sortedFolders.forEach(folder => {
      const node: TreeNode = {
        type: 'folder',
        name: folder.name,
        path: folder.path,
        id: folder.folderId,
        children: []
      };
      
      console.log('Processing folder:', folder.name, 'path:', folder.path);
      folderMap.set(folder.path, node);

      // Check if this folder has a parent
      const pathParts = folder.path.split('/');
      if (pathParts.length > 1) {
        // Has parent folder
        const parentPath = pathParts.slice(0, -1).join('/');
        console.log('Looking for parent:', parentPath);
        const parent = folderMap.get(parentPath);
        if (parent && parent.children) {
          console.log('Found parent, adding to parent.children');
          parent.children.push(node);
        } else {
          // Parent not found yet, add to root
          console.log('Parent not found, adding to root');
          root.push(node);
        }
      } else {
        // Root level folder
        console.log('Root level folder, adding to root');
        root.push(node);
      }
    });

    console.log('Folder map:', folderMap);

    // Add files
    if (proj.files && proj.files.length > 0) {
      proj.files.forEach(file => {
        const node: TreeNode = {
          type: 'file',
          name: file.name,
          path: file.path,
          id: file.fileId,
          language: file.language
        };

        console.log('Processing file:', file.name, 'path:', file.path);

        // Check if this file is in a folder
        const pathParts = file.path.split('/');
        if (pathParts.length > 1) {
          // File is in a folder
          const parentPath = pathParts.slice(0, -1).join('/');
          console.log('File parent path:', parentPath);
          const parent = folderMap.get(parentPath);
          if (parent && parent.children) {
            console.log('Found parent folder, adding file to it');
            parent.children.push(node);
          } else {
            // Parent folder not found, add to root
            console.log('Parent folder not found, adding file to root');
            root.push(node);
          }
        } else {
          // Root level file
          console.log('Root level file');
          root.push(node);
        }
      });
    }

    console.log('Final tree structure:', root);
    console.log('Tree root nodes count:', root.length);
    setTree(root);
    
    // Auto-expand all folders if there are any
    if (proj.folders && proj.folders.length > 0) {
      const allFolderPaths = new Set(proj.folders.map(f => f.path));
      console.log('Auto-expanding folders:', allFolderPaths);
      setExpandedFolders(allFolderPaths);
    }
  };

  const handleFileClick = async (file: DSAFile) => {
    // Instantly set selected file and show loading
    setSelectedFile(file);
    setLoadingFile(true);
    setCanvasData(null); // Clear previous canvas data immediately
    
    try {
      console.log('=== LOADING FILE ===');
      console.log('File:', file.name, file.fileId);
      console.log('Canvas URL:', file.canvasAzureUrl);
      
      const { content } = await fetchDSAFileContent(dsaId!, file.fileId);
      setCode(content);
      
      // Map language to Monaco language ID
      const monacoLanguage = file.language === 'cpp' ? 'cpp' :
                            file.language === 'java' ? 'java' :
                            file.language === 'python' ? 'python' :
                            file.language === 'javascript' ? 'javascript' : 'cpp';
      setLanguage(monacoLanguage);
      setShowCanvas(false);
      
      // Load THIS FILE's canvas data if exists
      if (file.canvasAzureUrl) {
        try {
          console.log('Fetching canvas from:', file.canvasAzureUrl);
          const canvasResponse = await fetch(file.canvasAzureUrl);
          console.log('Canvas response status:', canvasResponse.status);
          
          if (canvasResponse.ok) {
            const canvasJson = await canvasResponse.json();
            console.log('✓ Canvas loaded successfully');
            console.log('Elements count:', canvasJson.elements?.length || 0);
            setCanvasData(canvasJson);
          } else {
            console.log('Canvas not found (404), initializing empty');
            setCanvasData({ elements: [], appState: {} });
          }
        } catch (err) {
          console.error('Error loading canvas:', err);
          console.log('Initializing empty canvas due to error');
          setCanvasData({ elements: [], appState: {} });
        }
      } else {
        console.log('No canvas URL, initializing empty canvas');
        setCanvasData({ elements: [], appState: {} });
      }
    } catch (err) {
      console.error('Error loading file:', err);
      alert('Failed to load file');
    } finally {
      setLoadingFile(false);
    }
  };

  const handleSave = async (isAutoSave = false) => {
    if (!selectedFile) {
      console.error('No file selected');
      return;
    }
    
    setSaving(true);
    try {
      console.log(isAutoSave ? '🔄 Auto-saving...' : '=== MANUAL SAVE ===');
      console.log('File:', selectedFile.name, selectedFile.fileId);
      console.log('Excalidraw ref exists:', !!excalidrawRef.current);
      
      // 1. Save code first
      await updateDSAFile(dsaId!, selectedFile.fileId, code, language);
      console.log('✓ Code saved');
      
      // 2. Save canvas - ALWAYS try to save, even if canvas view is hidden
      // The ref should still exist even when showCanvas is false
      if (excalidrawRef.current) {
        console.log('Getting canvas data from Excalidraw...');
        console.log('showCanvas state:', showCanvas);
        
        try {
          const elements = excalidrawRef.current.getSceneElements();
          const appState = excalidrawRef.current.getAppState();
          
          console.log('Canvas elements:', elements);
          console.log('Canvas elements count:', elements?.length || 0);
          
          if (!elements) {
            console.warn('No elements returned from Excalidraw');
          }
          
          const sceneData = {
            elements: elements || [],
            appState: {
              viewBackgroundColor: appState?.viewBackgroundColor || '#ffffff',
              currentItemStrokeColor: appState?.currentItemStrokeColor || '#000000',
              currentItemBackgroundColor: appState?.currentItemBackgroundColor || 'transparent',
              currentItemFillStyle: appState?.currentItemFillStyle || 'hachure',
              currentItemStrokeWidth: appState?.currentItemStrokeWidth || 1,
              currentItemRoughness: appState?.currentItemRoughness || 1,
              currentItemOpacity: appState?.currentItemOpacity || 100,
            }
          };

          console.log('Scene data prepared, elements:', sceneData.elements.length);

          // Convert to JSON blob
          const jsonBlob = new Blob([JSON.stringify(sceneData)], { type: 'application/json' });
          console.log('Blob created, size:', jsonBlob.size, 'bytes');
          
          // Save canvas to Azure for THIS specific file
          console.log('Calling saveDSACanvas API...');
          const canvasUrl = await saveDSACanvas(dsaId!, selectedFile.fileId, jsonBlob);
          console.log('✓ Canvas saved to Azure:', canvasUrl);
          
          // Update local state
          if (selectedFile) {
            selectedFile.canvasAzureUrl = canvasUrl;
            console.log('Updated selectedFile.canvasAzureUrl:', selectedFile.canvasAzureUrl);
          }
          // DON'T call setCanvasData here - it will re-render and clear the canvas
          // The canvas already has the data, we just saved it
        } catch (canvasError) {
          console.error('Error saving canvas:', canvasError);
          throw canvasError; // Re-throw to be caught by outer try-catch
        }
      } else {
        console.warn('⚠️ No canvas ref available - Excalidraw might not be mounted');
        console.log('showCanvas:', showCanvas);
        console.log('canvasData exists:', !!canvasData);
        console.log('selectedFile:', selectedFile?.name);
        
        // If we have canvasData but no ref, still try to save the existing data
        if (canvasData && canvasData.elements) {
          console.log('Attempting to save existing canvasData without ref...');
          const jsonBlob = new Blob([JSON.stringify(canvasData)], { type: 'application/json' });
          const canvasUrl = await saveDSACanvas(dsaId!, selectedFile.fileId, jsonBlob);
          console.log('✓ Saved existing canvas data to Azure:', canvasUrl);
          selectedFile.canvasAzureUrl = canvasUrl;
        }
      }
      
      setLastSaved(new Date());
      
      // Only show alert for manual saves
      if (!isAutoSave) {
        alert(`✓ Saved ${selectedFile.name}\n• Code saved\n• Canvas saved to Azure`);
      } else {
        console.log('✓ Auto-save completed at', new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('=== SAVE ERROR ===');
      console.error('Error:', err);
      console.error('Stack:', err instanceof Error ? err.stack : 'No stack');
      // Only show error alert for manual saves
      if (!isAutoSave) {
        alert(`Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } else {
        console.error('Auto-save failed:', err);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRun = () => {
    setRunning(true);
    setOutput('// Code execution not implemented yet\n// This would send code to a backend execution service');
    setTimeout(() => setRunning(false), 1000);
  };

  const handleCreateFolder = async () => {
    setCreateType('folder');
    setCreateName('');
    setShowCreateModal(true);
  };

  const handleCreateFile = async () => {
    setCreateType('file');
    setCreateName('');
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) return;

    setCreating(true);
    try {
      if (createType === 'folder') {
        // Create folder at root or inside selected folder
        const folderPath = selectedFolder ? `${selectedFolder}/${createName}` : createName;
        console.log('Creating folder with path:', folderPath);
        const result = await createDSAFolder(dsaId!, { name: createName, path: folderPath });
        console.log('Folder created:', result);
      } else {
        // Create file inside selected folder or at root
        const lang = createName.endsWith('.cpp') ? 'cpp' : 
                     createName.endsWith('.java') ? 'java' :
                     createName.endsWith('.py') ? 'python' :
                     createName.endsWith('.js') ? 'javascript' : 'cpp';
        
        const filePath = selectedFolder ? `${selectedFolder}/${createName}` : createName;
        console.log('Creating file with path:', filePath);
        
        const result = await createDSAFile(dsaId!, { 
          name: createName, 
          path: filePath, 
          language: lang, 
          content: '' 
        });
        console.log('File created:', result);
      }
      
      setShowCreateModal(false);
      setCreateName('');
      setSelectedFolder(null); // Clear folder selection after creating
      await loadProject();
    } catch (err) {
      console.error(`Error creating ${createType}:`, err);
      alert(`Failed to create ${createType}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setCreating(false);
    }
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFolderClick = (path: string) => {
    // Toggle selection
    if (selectedFolder === path) {
      setSelectedFolder(null); // Unselect
    } else {
      setSelectedFolder(path); // Select
    }
    // Also toggle expand/collapse
    toggleFolder(path);
  };

  const renderTree = (nodes: TreeNode[], depth = 0) => {
    return nodes.map(node => (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 px-3 py-2 cursor-pointer rounded-lg transition-all ${
            node.type === 'folder' && selectedFolder === node.path
              ? 'bg-yellow-100 border-2 border-yellow-500 shadow-sm'
              : selectedFile?.fileId === node.id 
              ? 'bg-purple-100 border-2 border-purple-400 shadow-sm' 
              : 'border-2 border-transparent hover:bg-purple-50'
          }`}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
          onClick={() => {
            if (node.type === 'folder') {
              handleFolderClick(node.path);
            } else {
              const file = project?.files.find(f => f.fileId === node.id);
              if (file) {
                setSelectedFolder(null); // Clear folder selection when file is selected
                handleFileClick(file);
              }
            }
          }}
        >
          {node.type === 'folder' && (
            expandedFolders.has(node.path) ? 
              <ChevronDown size={16} className="text-gray-700" strokeWidth={2.5} /> : 
              <ChevronRight size={16} className="text-gray-700" strokeWidth={2.5} />
          )}
          {node.type === 'folder' ? (
            <Folder size={16} className={selectedFolder === node.path ? "text-yellow-600" : "text-yellow-500"} strokeWidth={2.5} />
          ) : (
            <File size={16} className="text-blue-600" strokeWidth={2.5} />
          )}
          <span className={`text-sm flex-1 ${
            node.type === 'folder' && selectedFolder === node.path 
              ? 'text-gray-900 font-black' 
              : 'text-gray-900 font-semibold'
          }`}>
            {node.name}
          </span>
          {loadingFile && selectedFile?.fileId === node.id && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
          )}
        </div>
        {node.type === 'folder' && expandedFolders.has(node.path) && node.children && (
          <div>{renderTree(node.children, depth + 1)}</div>
        )}
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-700 font-bold">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center bg-white border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]">
          <div className="text-red-600 font-black text-xl mb-2">Project not found</div>
          <button
            onClick={() => navigate('/learnings?tab=code')}
            className="mt-4 px-6 py-2 bg-black text-white border-2 border-black rounded-lg font-bold hover:bg-gray-800 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Fullscreen Code Modal */}
      {isCodeFullscreen && selectedFile && (
        <div className="fixed inset-0 bg-black z-[9999] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b-2 border-gray-700">
            <div className="flex items-center gap-4">
              <h2 className="text-white font-bold text-lg">{selectedFile.name}</h2>
              <span className="text-gray-400 text-sm">• Fullscreen Mode</span>
            </div>
            <button
              onClick={() => setIsCodeFullscreen(false)}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-all"
            >
              Exit Fullscreen
            </button>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: true },
                fontSize: 16,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', 'Monaco', monospace",
                fontLigatures: true,
                padding: { top: 20, bottom: 20 },
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
                formatOnPaste: true,
                formatOnType: true,
                autoIndent: 'full',
                tabSize: 2,
                wordWrap: 'on',
                bracketPairColorization: { enabled: true },
                guides: {
                  bracketPairs: true,
                  indentation: true
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Fullscreen Canvas Modal */}
      {isCanvasFullscreen && selectedFile && canvasData && (
        <div className="fixed inset-0 bg-white z-[9999] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 bg-purple-500 border-b-4 border-black">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsCanvasFullscreen(false)}
                className="px-5 py-2 bg-black text-white border-3 border-black rounded-lg font-black hover:bg-gray-800 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                Exit Fullscreen
              </button>
            </div>
          </div>
          <div className="flex-1">
            <Excalidraw
              key={`canvas-fullscreen-${selectedFile.fileId}`}
              theme="light"
              initialData={canvasData}
              excalidrawAPI={(api) => {
                excalidrawRef.current = api;
              }}
            />
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white border-4 border-black rounded-2xl p-6 w-96 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-black">
                Create {createType === 'folder' ? 'Folder' : 'File'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} className="text-black" strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-black text-black mb-2 uppercase">
                  {createType === 'folder' ? 'Folder Name' : 'File Name'}
                </label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder={createType === 'folder' ? 'my-folder' : 'main.cpp'}
                  className="w-full px-4 py-3 border-3 border-black rounded-xl font-medium text-black focus:outline-none focus:ring-4 focus:ring-black/20"
                  autoFocus
                />
                {createType === 'file' && (
                  <p className="text-xs text-gray-600 mt-2 font-medium">
                    Supported: .cpp, .java, .py, .js
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 border-3 border-black rounded-xl font-bold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !createName.trim()}
                  className="flex-1 px-4 py-3 bg-green-400 border-3 border-black rounded-xl font-bold hover:bg-green-500 transition disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b-4 border-black shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/learnings?tab=code')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 border-2 border-black rounded-lg transition font-bold text-sm"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-black text-black">{project.name}</h1>
        </div>
        
        {selectedFile && (
          <div className="flex items-center gap-3">
            {lastSaved && (
              <span className="text-xs text-gray-600 font-medium">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
            
            {/* Debug: Show canvas URL */}
            {selectedFile.canvasAzureUrl && (
              <span className="text-xs text-blue-600 font-medium" title={selectedFile.canvasAzureUrl}>
                ✓ Canvas saved
              </span>
            )}
            
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-4 py-2 bg-white border-3 border-black rounded-lg text-sm font-bold text-black"
            >
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
            </select>
            
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="px-5 py-2 bg-green-400 hover:bg-green-500 border-3 border-black rounded-lg text-sm font-black flex items-center gap-2 disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <Save size={16} strokeWidth={2.5} />
              {saving ? 'Saving...' : 'Save All'}
            </button>
            
            <button
              onClick={handleRun}
              disabled={running}
              className="px-5 py-2 bg-blue-400 hover:bg-blue-500 border-3 border-black rounded-lg text-sm font-black flex items-center gap-2 disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <Play size={16} strokeWidth={2.5} />
              {running ? 'Running...' : 'Run'}
            </button>
            
            <div className="h-8 w-px bg-gray-300"></div>
            
            <button
              onClick={() => {
                setShowCanvas(!showCanvas);
                if (!showCanvas && !canvasData) {
                  // Initialize empty canvas
                  setCanvasData({ elements: [], appState: {} });
                }
              }}
              className={`px-5 py-2 border-3 border-black rounded-lg text-sm font-black flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all ${
                showCanvas ? 'bg-purple-400 hover:bg-purple-500' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              <Palette size={16} strokeWidth={2.5} />
              {showCanvas ? 'Show Code' : 'Show Canvas'}
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - File Tree */}
        <div className="w-72 bg-white border-r-4 border-black flex flex-col shadow-lg">
          <div className="p-4 border-b-3 border-black bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <span className="text-sm font-black text-black uppercase tracking-wider">Files</span>
                {selectedFolder && (
                  <div className="text-xs text-yellow-700 font-bold mt-1 flex items-center gap-1">
                    <Folder size={12} strokeWidth={2.5} />
                    Selected: {selectedFolder.split('/').pop()}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateFolder}
                  className="p-2 bg-white hover:bg-gray-50 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                  title="New Folder"
                >
                  <FolderPlus size={16} className="text-black" strokeWidth={2.5} />
                </button>
                <button
                  onClick={handleCreateFile}
                  className="p-2 bg-white hover:bg-gray-50 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                  title={selectedFolder ? `New File in ${selectedFolder.split('/').pop()}` : "New File"}
                >
                  <Plus size={16} className="text-black" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
            {/* Debug Info */}
            {project && (
              <div className="mb-3 p-2 bg-blue-50 border-2 border-blue-200 rounded-lg text-xs">
                <div className="font-bold text-blue-900 mb-1">Debug Info:</div>
                <div className="text-blue-800">Files: {project.files?.length || 0}</div>
                <div className="text-blue-800">Folders: {project.folders?.length || 0}</div>
                <div className="text-blue-800">Tree nodes: {tree.length}</div>
              </div>
            )}
            
            {tree.length === 0 && project?.files?.length === 0 && project?.folders?.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6">
                  <File size={32} className="mx-auto mb-3 text-gray-400" strokeWidth={2} />
                  <p className="text-sm text-gray-600 font-medium">No files yet. Create one!</p>
                </div>
              </div>
            ) : tree.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6">
                  <p className="text-sm text-yellow-800 font-medium">Files exist but tree is empty. Check console.</p>
                </div>
              </div>
            ) : (
              renderTree(tree)
            )}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedFile ? (
            <>
              {/* File Tab */}
              <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-50 border-b-3 border-black">
                <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400 border border-red-600"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-600"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400 border border-green-600"></div>
                  </div>
                  <span className="text-sm font-bold text-black">{selectedFile.name}</span>
                  {loadingFile && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
                  )}
                </div>
                <span className="text-xs text-gray-600 font-medium">• Write code in main class only</span>
              </div>

              {/* Loading Overlay */}
              {loadingFile && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mb-4"></div>
                    <p className="text-lg font-bold text-gray-800">Loading {selectedFile.name}...</p>
                  </div>
                </div>
              )}

              {/* Editor or Canvas */}
              <div className="flex-1 flex relative">
                {/* Code Editor - Hidden when canvas is shown */}
                <div className={`flex-1 border-4 border-black m-4 rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] ${showCanvas ? 'hidden' : 'block'}`}>
                  <Editor
                    height="100%"
                    language={language}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    theme="vs"
                    options={{
                      minimap: { enabled: true },
                      fontSize: 15,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      fontFamily: "'Consolas', 'Courier New', monospace",
                      fontWeight: '500',
                      letterSpacing: 0.5,
                      lineHeight: 22,
                      padding: { top: 16, bottom: 16 },
                      cursorBlinking: 'smooth',
                      cursorSmoothCaretAnimation: 'on',
                      smoothScrolling: true,
                      formatOnPaste: true,
                      formatOnType: true,
                      autoIndent: 'full',
                      tabSize: 4,
                      insertSpaces: true,
                      wordWrap: 'on',
                      bracketPairColorization: { enabled: true },
                      guides: {
                        bracketPairs: true,
                        indentation: true
                      },
                      suggest: {
                        showKeywords: true,
                        showSnippets: true
                      },
                      quickSuggestions: {
                        other: true,
                        comments: false,
                        strings: false
                      },
                      parameterHints: { enabled: true },
                      folding: true,
                      foldingStrategy: 'indentation',
                      showFoldingControls: 'always',
                      matchBrackets: 'always',
                      renderLineHighlight: 'all',
                      renderWhitespace: 'selection',
                      colorDecorators: true
                    }}
                  />
                  <button
                    onClick={() => setIsCodeFullscreen(!isCodeFullscreen)}
                    className="absolute top-4 right-4 p-2 bg-white border-2 border-black rounded-lg hover:bg-gray-100 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
                    title={isCodeFullscreen ? "Exit fullscreen" : "Fullscreen"}
                  >
                    {isCodeFullscreen ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Canvas - Hidden when code is shown */}
                {selectedFile && canvasData && (
                  <div className={`flex-1 m-4 border-4 border-black rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] relative ${showCanvas ? 'block' : 'hidden'}`}>
                    <Excalidraw
                      key={`canvas-${selectedFile.fileId}`}
                      theme="light"
                      initialData={canvasData}
                      excalidrawAPI={(api) => {
                        excalidrawRef.current = api;
                      }}
                    />
                    {/* Fullscreen Button */}
                    <button
                      onClick={() => setIsCanvasFullscreen(!isCanvasFullscreen)}
                      className="absolute top-4 right-4 p-3 bg-white border-3 border-black rounded-xl hover:bg-gray-100 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                      title={isCanvasFullscreen ? "Exit fullscreen" : "Fullscreen"}
                    >
                      {isCanvasFullscreen ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                        </svg>
                      )}
                    </button>
                  </div>
                )}

                {/* Output Panel (when running) */}
                {output && (
                  <div className="w-96 bg-gray-900 border-l-4 border-black p-6 overflow-auto">
                    <div className="text-sm font-black text-gray-400 mb-3 uppercase tracking-wider">Output</div>
                    <pre className="text-sm text-green-400 font-mono leading-relaxed">{output}</pre>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl border-3 border-black flex items-center justify-center mx-auto mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]">
                  <File size={48} className="text-purple-600" strokeWidth={2} />
                </div>
                <p className="text-lg font-bold text-gray-700">Select a file to start coding</p>
                <p className="text-sm text-gray-500 mt-2">Choose from the sidebar or create a new file</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
