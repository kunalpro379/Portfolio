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
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [showCanvas, setShowCanvas] = useState(false);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'file' | 'folder'>('file');
  const [createName, setCreateName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadProject();
  }, [dsaId]);

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
    console.log('Building tree with project:', proj);
    console.log('Files:', proj.files);
    console.log('Folders:', proj.folders);
    
    const root: TreeNode[] = [];
    const folderMap = new Map<string, TreeNode>();

    // Add folders first
    if (proj.folders && proj.folders.length > 0) {
      proj.folders.forEach(folder => {
        const node: TreeNode = {
          type: 'folder',
          name: folder.name,
          path: folder.path,
          id: folder.folderId,
          children: []
        };
        folderMap.set(folder.path, node);

        // Check if this folder has a parent
        const pathParts = folder.path.split('/');
        if (pathParts.length > 1) {
          // Has parent folder
          const parentPath = pathParts.slice(0, -1).join('/');
          const parent = folderMap.get(parentPath);
          if (parent && parent.children) {
            parent.children.push(node);
          } else {
            // Parent not found yet, add to root
            root.push(node);
          }
        } else {
          // Root level folder
          root.push(node);
        }
      });
    }

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

        // Check if this file is in a folder
        const pathParts = file.path.split('/');
        if (pathParts.length > 1) {
          // File is in a folder
          const parentPath = pathParts.slice(0, -1).join('/');
          const parent = folderMap.get(parentPath);
          if (parent && parent.children) {
            parent.children.push(node);
          } else {
            // Parent folder not found, add to root
            root.push(node);
          }
        } else {
          // Root level file
          root.push(node);
        }
      });
    }

    console.log('Tree built:', root);
    console.log('Folder map:', folderMap);
    setTree(root);
    
    // Auto-expand all folders if there are any
    if (proj.folders && proj.folders.length > 0) {
      const allFolderPaths = new Set(proj.folders.map(f => f.path));
      setExpandedFolders(allFolderPaths);
    }
  };

  const handleFileClick = async (file: DSAFile) => {
    try {
      const { content } = await fetchDSAFileContent(dsaId!, file.fileId);
      setSelectedFile(file);
      setCode(content);
      setLanguage(file.language);
      setShowCanvas(false);
    } catch (err) {
      console.error('Error loading file:', err);
      alert('Failed to load file');
    }
  };

  const handleSave = async () => {
    if (!selectedFile) return;
    
    setSaving(true);
    try {
      await updateDSAFile(dsaId!, selectedFile.fileId, code, language);
      alert('Saved!');
    } catch (err) {
      console.error('Error saving:', err);
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleRun = () => {
    setRunning(true);
    setOutput('// Code execution not implemented yet\n// This would send code to a backend execution service');
    setTimeout(() => setRunning(false), 1000);
  };

  const handleSaveCanvas = async () => {
    if (!selectedFile || !excalidrawRef.current) return;

    try {
      // Export as PNG
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      canvas.toBlob(async (blob) => {
        if (blob) {
          await saveDSACanvas(dsaId!, selectedFile.fileId, blob);
          alert('Canvas saved!');
        }
      });
    } catch (err) {
      console.error('Error saving canvas:', err);
      alert('Failed to save canvas');
    }
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
        const result = await createDSAFolder(dsaId!, { name: createName, path: createName });
        console.log('Folder created:', result);
      } else {
        const lang = createName.endsWith('.cpp') ? 'cpp' : 
                     createName.endsWith('.java') ? 'java' :
                     createName.endsWith('.py') ? 'python' :
                     createName.endsWith('.js') ? 'javascript' : 'cpp';
        
        const result = await createDSAFile(dsaId!, { name: createName, path: createName, language: lang, content: '' });
        console.log('File created:', result);
      }
      
      setShowCreateModal(false);
      setCreateName('');
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

  const renderTree = (nodes: TreeNode[], depth = 0) => {
    return nodes.map(node => (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 px-3 py-2 hover:bg-purple-50 cursor-pointer rounded-lg transition-all ${
            selectedFile?.fileId === node.id ? 'bg-purple-100 border-2 border-purple-400 shadow-sm' : 'border-2 border-transparent'
          }`}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
          onClick={() => {
            if (node.type === 'folder') {
              toggleFolder(node.path);
            } else {
              const file = project?.files.find(f => f.fileId === node.id);
              if (file) handleFileClick(file);
            }
          }}
        >
          {node.type === 'folder' && (
            expandedFolders.has(node.path) ? 
              <ChevronDown size={16} className="text-gray-700" strokeWidth={2.5} /> : 
              <ChevronRight size={16} className="text-gray-700" strokeWidth={2.5} />
          )}
          {node.type === 'folder' ? (
            <Folder size={16} className="text-yellow-600" strokeWidth={2.5} />
          ) : (
            <File size={16} className="text-blue-600" strokeWidth={2.5} />
          )}
          <span className="text-sm text-gray-900 font-semibold flex-1">{node.name}</span>
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
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-green-400 hover:bg-green-500 border-3 border-black rounded-lg text-sm font-black flex items-center gap-2 disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <Save size={16} strokeWidth={2.5} />
              {saving ? 'Saving...' : 'Save'}
            </button>
            
            <button
              onClick={handleRun}
              disabled={running}
              className="px-5 py-2 bg-blue-400 hover:bg-blue-500 border-3 border-black rounded-lg text-sm font-black flex items-center gap-2 disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <Play size={16} strokeWidth={2.5} />
              {running ? 'Running...' : 'Run'}
            </button>
            
            <button
              onClick={() => setShowCanvas(!showCanvas)}
              className={`px-5 py-2 border-3 border-black rounded-lg text-sm font-black flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all ${
                showCanvas ? 'bg-purple-400 hover:bg-purple-500' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              <Palette size={16} strokeWidth={2.5} />
              Canvas
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
              <span className="text-sm font-black text-black uppercase tracking-wider">Files</span>
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
                  title="New File"
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
                </div>
                <span className="text-xs text-gray-600 font-medium">• Write code in main class only</span>
              </div>

              {/* Editor or Canvas */}
              <div className="flex-1 flex">
                {!showCanvas ? (
                  <div className="flex-1 border-4 border-black m-4 rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
                    <Editor
                      height="100%"
                      language={language}
                      value={code}
                      onChange={(value) => setCode(value || '')}
                      theme="vs-light"
                      options={{
                        minimap: { enabled: true },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
                        fontLigatures: true,
                        padding: { top: 16, bottom: 16 }
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex-1 m-4 border-4 border-black rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] relative">
                    <Excalidraw
                      theme="light"
                      excalidrawAPI={(api) => {
                        excalidrawRef.current = api;
                      }}
                    />
                    <button
                      onClick={handleSaveCanvas}
                      className="absolute bottom-6 right-6 px-6 py-3 bg-purple-400 text-black border-3 border-black rounded-xl font-black hover:bg-purple-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                      Save Canvas
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
