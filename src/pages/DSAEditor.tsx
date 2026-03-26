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
    const root: TreeNode[] = [];
    const folderMap = new Map<string, TreeNode>();

    // Add folders
    proj.folders?.forEach(folder => {
      const node: TreeNode = {
        type: 'folder',
        name: folder.name,
        path: folder.path,
        id: folder.folderId,
        children: []
      };
      folderMap.set(folder.path, node);

      const parentPath = folder.path.split('/').slice(0, -1).join('/');
      if (parentPath) {
        const parent = folderMap.get(parentPath);
        if (parent) {
          parent.children!.push(node);
        }
      } else {
        root.push(node);
      }
    });

    // Add files
    proj.files?.forEach(file => {
      const node: TreeNode = {
        type: 'file',
        name: file.name,
        path: file.path,
        id: file.fileId,
        language: file.language
      };

      const parentPath = file.path.split('/').slice(0, -1).join('/');
      if (parentPath) {
        const parent = folderMap.get(parentPath);
        if (parent) {
          parent.children!.push(node);
        }
      } else {
        root.push(node);
      }
    });

    console.log('Tree built:', root);
    setTree(root);
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
          className={`flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 cursor-pointer rounded ${
            selectedFile?.fileId === node.id ? 'bg-gray-200 border-2 border-black' : ''
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
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
              <ChevronDown size={14} className="text-black" strokeWidth={2.5} /> : 
              <ChevronRight size={14} className="text-black" strokeWidth={2.5} />
          )}
          {node.type === 'folder' ? (
            <Folder size={14} className="text-yellow-600" strokeWidth={2.5} />
          ) : (
            <File size={14} className="text-blue-600" strokeWidth={2.5} />
          )}
          <span className="text-xs text-black font-medium flex-1">{node.name}</span>
        </div>
        {node.type === 'folder' && expandedFolders.has(node.path) && node.children && (
          <div>{renderTree(node.children, depth + 1)}</div>
        )}
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <LoadingSpinner />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-white">Project not found</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-black text-white">
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
                  className="w-full px-4 py-3 border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20"
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
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/learnings?tab=code')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-lg font-bold">{project.name}</h1>
        </div>
        
        {selectedFile && (
          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-1.5 bg-gray-800 border border-gray-600 rounded-lg text-sm font-medium"
            >
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
            </select>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save'}
            </button>
            
            <button
              onClick={handleRun}
              disabled={running}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <Play size={16} />
              {running ? 'Running...' : 'Run'}
            </button>
            
            <button
              onClick={() => setShowCanvas(!showCanvas)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 ${
                showCanvas ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <Palette size={16} />
              Canvas
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - File Tree */}
        <div className="w-64 bg-white border-r-4 border-black flex flex-col">
          <div className="p-3 border-b-3 border-black">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-black uppercase">Files</span>
              <div className="flex gap-1">
                <button
                  onClick={handleCreateFolder}
                  className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded border-2 border-black"
                  title="New Folder"
                >
                  <FolderPlus size={14} className="text-black" strokeWidth={2.5} />
                </button>
                <button
                  onClick={handleCreateFile}
                  className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded border-2 border-black"
                  title="New File"
                >
                  <Plus size={14} className="text-black" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {tree.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-xs font-medium">
                No files yet. Create one!
              </div>
            ) : (
              renderTree(tree)
            )}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {selectedFile ? (
            <>
              {/* File Tab */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 rounded-lg border border-gray-600">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                  <span className="text-xs text-gray-500">• Note: Write code in main class only</span>
                </div>
              </div>

              {/* Editor or Canvas */}
              <div className="flex-1 flex">
                {!showCanvas ? (
                  <Editor
                    height="100%"
                    language={language}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true
                    }}
                  />
                ) : (
                  <div className="flex-1 bg-white relative">
                    <Excalidraw
                      theme="light"
                      excalidrawAPI={(api) => {
                        excalidrawRef.current = api;
                      }}
                    />
                    <button
                      onClick={handleSaveCanvas}
                      className="absolute bottom-4 right-4 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 shadow-lg"
                    >
                      Save Canvas
                    </button>
                  </div>
                )}

                {/* Output Panel (when running) */}
                {output && (
                  <div className="w-96 bg-gray-900 border-l border-gray-700 p-4 overflow-auto">
                    <div className="text-xs font-bold text-gray-400 mb-2">OUTPUT</div>
                    <pre className="text-xs text-green-400 font-mono">{output}</pre>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <File size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-sm">Select a file to start coding</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
