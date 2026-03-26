import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Palette, Plus, FolderPlus, File, Folder, ChevronRight, ChevronDown, Trash2, Save } from 'lucide-react';
import { Excalidraw } from '@excalidraw/excalidraw';
import Editor from '@monaco-editor/react';
import { fetchDSAProject, createDSAFolder, createDSAFile, fetchDSAFileContent, updateDSAFile, saveDSACanvas, deleteDSAFile, deleteDSAFolder, type DSAProject, type DSAFile, type DSAFolder } from '@/services/dsaApi';

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

  useEffect(() => {
    loadProject();
  }, [dsaId]);

  const loadProject = async () => {
    try {
      const proj = await fetchDSAProject(dsaId!);
      setProject(proj);
      buildTree(proj);
    } catch (err) {
      console.error('Error loading project:', err);
      alert('Failed to load project');
    }
  };

  const buildTree = (proj: DSAProject) => {
    const root: TreeNode[] = [];
    const folderMap = new Map<string, TreeNode>();

    // Add folders
    proj.folders.forEach(folder => {
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
    proj.files.forEach(file => {
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
      const elements = excalidrawRef.current.getSceneElements();
      const appState = excalidrawRef.current.getAppState();
      
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
    const name = prompt('Enter folder name:');
    if (!name) return;

    try {
      await createDSAFolder(dsaId!, { name, path: name });
      await loadProject();
    } catch (err) {
      console.error('Error creating folder:', err);
      alert('Failed to create folder');
    }
  };

  const handleCreateFile = async () => {
    const name = prompt('Enter file name (e.g., main.cpp):');
    if (!name) return;

    const lang = name.endsWith('.cpp') ? 'cpp' : 
                 name.endsWith('.java') ? 'java' :
                 name.endsWith('.py') ? 'python' :
                 name.endsWith('.js') ? 'javascript' : 'cpp';

    try {
      await createDSAFile(dsaId!, { name, path: name, language: lang, content: '' });
      await loadProject();
    } catch (err) {
      console.error('Error creating file:', err);
      alert('Failed to create file');
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
          className={`flex items-center gap-2 px-2 py-1.5 hover:bg-gray-700 cursor-pointer rounded ${
            selectedFile?.fileId === node.id ? 'bg-gray-700' : ''
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
              <ChevronDown size={14} className="text-gray-400" /> : 
              <ChevronRight size={14} className="text-gray-400" />
          )}
          {node.type === 'folder' ? (
            <Folder size={14} className="text-yellow-400" />
          ) : (
            <File size={14} className="text-blue-400" />
          )}
          <span className="text-xs text-gray-200 flex-1">{node.name}</span>
        </div>
        {node.type === 'folder' && expandedFolders.has(node.path) && node.children && (
          <div>{renderTree(node.children, depth + 1)}</div>
        )}
      </div>
    ));
  };

  if (!project) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-black text-white">
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
        <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col">
          <div className="p-3 border-b border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Files</span>
              <div className="flex gap-1">
                <button
                  onClick={handleCreateFolder}
                  className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded border border-gray-600"
                  title="New Folder"
                >
                  <FolderPlus size={14} />
                </button>
                <button
                  onClick={handleCreateFile}
                  className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded border border-gray-600"
                  title="New File"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {tree.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-xs">
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
                  <div className="flex-1 bg-white">
                    <Excalidraw
                      ref={excalidrawRef}
                      theme="light"
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
