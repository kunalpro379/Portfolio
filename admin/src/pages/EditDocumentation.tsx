import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Upload, Image as ImageIcon, Trash2, Plus, FileText, Pencil, X } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import { Excalidraw } from '@excalidraw/excalidraw';

interface FileItem {
  fileId: string;
  name: string;
  type: 'markdown' | 'diagram';
  azurePath: string;
  azureUrl: string;
  createdAt: Date;
}

interface ExcalidrawElement {
  type: string;
  [key: string]: any;
}

export default function EditDocumentation() {
  const navigate = useNavigate();
  const { docId } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [assets, setAssets] = useState<Array<{ name: string; url: string }>>([]);
  const [activeTab, setActiveTab] = useState<'document' | 'draw'>('document');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    tags: '',
    date: '',
    time: '',
    content: '',
    isPublic: false,
    assets: {} as Record<string, string>
  });

  useEffect(() => {
    fetchDoc();
    fetchFiles();
  }, [docId]);

  const fetchDoc = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/documentation/${docId}`);
      const data = await response.json();

      setFormData({
        title: data.doc.title,
        subject: data.doc.subject,
        description: data.doc.description || '',
        tags: data.doc.tags ? data.doc.tags.join(', ') : '',
        date: data.doc.date || '',
        time: data.doc.time || '',
        content: data.doc.content,
        isPublic: data.doc.isPublic,
        assets: data.doc.assets || {}
      });

      if (data.doc.assets) {
        const assetArray = Object.entries(data.doc.assets).map(([name, url]) => ({
          name,
          url: url as string
        }));
        setAssets(assetArray);
      }
    } catch (error) {
      console.error('Error fetching documentation:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      console.log('Fetching files for docId:', docId);
      const response = await fetch(`http://localhost:5000/api/documentation/${docId}/files`);
      
      if (!response.ok) {
        console.error('Failed to fetch files:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('Error data:', errorData);
        return;
      }
      
      const data = await response.json();
      console.log('Fetched files:', data.files);
      
      let filesList = data.files || [];
      
      // Clean up file names (remove extensions if present)
      filesList = filesList.map((f: FileItem) => ({
        ...f,
        name: f.name.replace(/\.(md|excalidraw)$/, '')
      }));
      
      // Create default index files if they don't exist
      const hasMarkdownIndex = filesList.some((f: FileItem) => f.name === 'index' && f.type === 'markdown');
      const hasDiagramIndex = filesList.some((f: FileItem) => f.name === 'index' && f.type === 'diagram');
      
      console.log('Has markdown index:', hasMarkdownIndex, 'Has diagram index:', hasDiagramIndex);
      
      if (!hasMarkdownIndex) {
        console.log('Creating markdown index file');
        const newFile = await createFile('index', 'markdown');
        if (newFile) {
          filesList.push(newFile);
        }
      }
      if (!hasDiagramIndex) {
        console.log('Creating diagram index file');
        const newFile = await createFile('index', 'diagram');
        if (newFile) {
          filesList.push(newFile);
        }
      }
      
      console.log('Final files list:', filesList);
      setFiles(filesList);
      
      // Select the first markdown file by default
      const defaultFile = filesList.find((f: FileItem) => f.type === 'markdown');
      if (defaultFile) {
        console.log('Loading default file:', defaultFile);
        loadFile(defaultFile);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const createFile = async (name: string, type: 'markdown' | 'diagram') => {
    try {
      // Strip extension if present
      const cleanName = name.replace(/\.(md|excalidraw)$/, '');
      
      console.log('Creating file with clean name:', cleanName, 'type:', type);
      
      const response = await fetch(`http://localhost:5000/api/documentation/${docId}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, type })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('File created:', data.file);
        return data.file;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to create file:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error creating file:', error);
    }
  };

  const loadFile = async (file: FileItem) => {
    try {
      const response = await fetch(`http://localhost:5000/api/documentation/${docId}/files/${file.fileId}`);
      const data = await response.json();
      
      setSelectedFile(file);
      setFileContent(data.file.content || '');
      setActiveTab(file.type === 'markdown' ? 'document' : 'draw');
    } catch (error) {
      console.error('Error loading file:', error);
    }
  };

  const saveFileContent = async () => {
    if (!selectedFile) return;

    try {
      await fetch(`http://localhost:5000/api/documentation/${docId}/files/${selectedFile.fileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: fileContent })
      });
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  // Auto-save on content change
  useEffect(() => {
    if (selectedFile && fileContent) {
      const timer = setTimeout(() => {
        saveFileContent();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [fileContent, selectedFile]);

  const handleExcalidrawChange = (elements: readonly ExcalidrawElement[], appState: any) => {
    if (!excalidrawAPI) return;
    
    const excalidrawData = {
      type: 'excalidraw',
      version: 2,
      source: '',
      elements: elements,
      appState: {
        viewBackgroundColor: appState.viewBackgroundColor || '#ffffff',
        gridSize: appState.gridSize || null
      }
    };
    
    setFileContent(JSON.stringify(excalidrawData));
  };

  const handleCreateNewFile = async () => {
    const fileName = prompt('Enter file name:');
    if (!fileName) return;

    const type = activeTab === 'document' ? 'markdown' : 'diagram';
    const newFile = await createFile(fileName, type);
    
    if (newFile) {
      setFiles(prev => [...prev, newFile]);
      loadFile(newFile);
    }
  };

  const handleDeleteFile = async (file: FileItem) => {
    if (file.name === 'index') {
      alert('Cannot delete index file');
      return;
    }

    if (!confirm(`Delete "${file.name}"?`)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/documentation/${docId}/files/${file.fileId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setFiles(prev => prev.filter(f => f.fileId !== file.fileId));
        if (selectedFile?.fileId === file.fileId) {
          const nextFile = files.find(f => f.fileId !== file.fileId);
          if (nextFile) loadFile(nextFile);
        }
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const assetName = prompt(`Enter a name for "${file.name}":`,
          file.name.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '_')
        );

        if (!assetName) continue;

        if (formData.assets[assetName]) {
          alert(`Asset name "${assetName}" already exists!`);
          continue;
        }

        const uploadFormData = new FormData();
        uploadFormData.append('asset', file);

        const response = await fetch('http://localhost:5000/api/documentation/upload-asset', {
          method: 'POST',
          body: uploadFormData
        });

        if (response.ok) {
          const data = await response.json();
          setAssets(prev => [...prev, { name: assetName, url: data.url }]);
          setFormData(prev => ({
            ...prev,
            assets: { ...prev.assets, [assetName]: data.url }
          }));
        }
      }
    } catch (error) {
      console.error('Error uploading assets:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const insertAsset = (name: string) => {
    const placeholder = `![Alt text]({{${name}}})`;
    setFileContent(fileContent + '\n' + placeholder + '\n');
  };

  const deleteAsset = async (name: string) => {
    if (!confirm(`Delete asset "${name}"?`)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/documentation/asset/${docId}/${name}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setAssets(prev => prev.filter(asset => asset.name !== name));
        const newAssets = { ...formData.assets };
        delete newAssets[name];
        setFormData({ ...formData, assets: newAssets });
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  };

  const previewContent = (() => {
    let processedContent = fileContent;
    Object.entries(formData.assets).forEach(([name, url]) => {
      const placeholder = new RegExp(`\\(\\{\\{${name}\\}\\}\\)`, 'g');
      processedContent = processedContent.replace(placeholder, `(${url})`);
    });
    return processedContent;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.subject) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`http://localhost:5000/api/documentation/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        navigate('/documentation');
      } else {
        alert('Failed to update documentation');
      }
    } catch (error) {
      console.error('Error updating documentation:', error);
      alert('Error updating documentation');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl font-black">Loading...</div>
      </div>
    );
  }

  const currentFiles = files.filter(f => f.type === (activeTab === 'document' ? 'markdown' : 'diagram'));

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-4 border-black p-4">
        <div className="max-w-[1800px] mx-auto">
          <button
            onClick={() => navigate('/documentation')}
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-3 font-bold"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
            Back to Documentation
          </button>
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-3xl font-black text-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              Edit Document
            </h1>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-200 border-3 border-black rounded-xl font-bold hover:bg-blue-300 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
            >
              <Save className="w-5 h-5" strokeWidth={2.5} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b-4 border-black px-4">
        <div className="max-w-[1800px] mx-auto flex gap-2">
          <button
            onClick={() => {
              setActiveTab('document');
              const mdFile = files.find(f => f.type === 'markdown' && f.name === 'index') || files.find(f => f.type === 'markdown');
              if (mdFile) loadFile(mdFile);
            }}
            className={`px-6 py-3 font-bold border-3 border-black rounded-t-xl transition ${
              activeTab === 'document' 
                ? 'bg-yellow-200 -mb-1' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <FileText className="w-5 h-5 inline mr-2" strokeWidth={2.5} />
            Document
          </button>
          <button
            onClick={() => {
              setActiveTab('draw');
              const drawFile = files.find(f => f.type === 'diagram' && f.name === 'index') || files.find(f => f.type === 'diagram');
              if (drawFile) loadFile(drawFile);
            }}
            className={`px-6 py-3 font-bold border-3 border-black rounded-t-xl transition ${
              activeTab === 'draw' 
                ? 'bg-yellow-200 -mb-1' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Pencil className="w-5 h-5 inline mr-2" strokeWidth={2.5} />
            Draw
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Sidebar */}
        <div className="w-64 bg-white border-r-4 border-black p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-sm uppercase">Files</h3>
            <button
              onClick={handleCreateNewFile}
              className="p-2 bg-green-200 border-2 border-black rounded-lg hover:bg-green-300 transition"
              title="Create new file"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
          
          <div className="space-y-2">
            {currentFiles.map(file => (
              <div
                key={file.fileId}
                className={`group flex items-center justify-between p-3 border-2 border-black rounded-lg cursor-pointer transition ${
                  selectedFile?.fileId === file.fileId
                    ? 'bg-yellow-200'
                    : 'bg-white hover:bg-gray-50'
                }`}
                onClick={() => loadFile(file)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileText className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
                  <span className="font-bold text-sm truncate">
                    {file.name}{activeTab === 'document' ? '.md' : '.excalidraw'}
                  </span>
                </div>
                {file.name !== 'index' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(file);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition"
                  >
                    <X className="w-4 h-4 text-red-600" strokeWidth={2.5} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'document' ? (
            <div className="flex-1 flex overflow-hidden">
              {/* Left Side - Form */}
              <div className="w-[400px] border-r-4 border-black bg-white p-6 overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-black text-black mb-2 uppercase">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-black text-black mb-2 uppercase">Subject *</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-black text-black mb-2 uppercase">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] resize-none"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-black text-black mb-2 uppercase">Tags</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    />
                  </div>

                  <div className="bg-yellow-100 border-3 border-black rounded-xl p-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPublic}
                        onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                        className="w-6 h-6 border-3 border-black rounded-lg"
                      />
                      <div>
                        <span className="font-black text-black uppercase">Make Public</span>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-black mb-2 uppercase">Assets</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleAssetUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-200 border-3 border-black rounded-xl font-bold hover:bg-purple-300 transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
                    >
                      <Upload className="w-5 h-5" strokeWidth={2.5} />
                      {uploading ? 'Uploading...' : 'Upload Assets'}
                    </button>

                    {assets.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {assets.map((asset, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 border-3 border-black rounded-lg bg-white">
                            <img src={asset.url} alt={asset.name} className="w-12 h-12 object-cover rounded border-2 border-black" />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm truncate">{`{{${asset.name}}}`}</p>
                            </div>
                            <button onClick={() => insertAsset(asset.name)} className="p-2 hover:bg-gray-100 rounded">
                              <ImageIcon className="w-4 h-4" strokeWidth={2.5} />
                            </button>
                            <button onClick={() => deleteAsset(asset.name)} className="p-2 hover:bg-red-100 rounded">
                              <Trash2 className="w-4 h-4 text-red-600" strokeWidth={2.5} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side - Markdown Editor */}
              <div className="flex-1 overflow-hidden">
                <MDEditor
                  value={previewContent}
                  onChange={(val) => setFileContent(val || '')}
                  height="100%"
                  preview="live"
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-white" style={{ height: '100%', width: '100%' }}>
              <Excalidraw
                excalidrawAPI={(api) => setExcalidrawAPI(api)}
                initialData={(() => {
                  try {
                    return fileContent ? JSON.parse(fileContent) : undefined;
                  } catch {
                    return undefined;
                  }
                })()}
                onChange={handleExcalidrawChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
