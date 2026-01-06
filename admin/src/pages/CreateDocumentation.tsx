import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Upload, Image as ImageIcon, Trash2, Plus, FileText, Pencil, X } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import { Excalidraw } from '@excalidraw/excalidraw';

interface FileItem {
  id: string;
  name: string;
  type: 'markdown' | 'diagram';
  content: string;
}

interface ExcalidrawElement {
  type: string;
  [key: string]: any;
}

export default function CreateDocumentation() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [assets, setAssets] = useState<Array<{ name: string; url: string }>>([]);
  const [activeTab, setActiveTab] = useState<'document' | 'draw'>('document');
  const [files, setFiles] = useState<FileItem[]>([
    { id: '1', name: 'index', type: 'markdown', content: '# New Document\n\nStart writing...' },
    { id: '2', name: 'index', type: 'diagram', content: '{"type":"excalidraw","version":2,"source":"","elements":[],"appState":{"gridSize":null,"viewBackgroundColor":"#ffffff"}}' }
  ]);
  const [selectedFile, setSelectedFile] = useState<FileItem>(files[0]);
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    tags: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    content: '',
    isPublic: false,
    assets: {} as Record<string, string>
  });

  useEffect(() => {
    setSelectedFile(files.find(f => f.type === (activeTab === 'document' ? 'markdown' : 'diagram')) || files[0]);
  }, [activeTab]);

  const handleCreateNewFile = () => {
    const fileName = prompt('Enter file name:');
    if (!fileName) return;

    const type = activeTab === 'document' ? 'markdown' : 'diagram';
    const defaultContent = type === 'markdown' 
      ? '# New Document\n\nStart writing...' 
      : '{"type":"excalidraw","version":2,"source":"","elements":[],"appState":{"gridSize":null,"viewBackgroundColor":"#ffffff"}}';
    
    const newFile: FileItem = {
      id: Date.now().toString(),
      name: fileName,
      type,
      content: defaultContent
    };

    setFiles(prev => [...prev, newFile]);
    setSelectedFile(newFile);
  };

  const handleDeleteFile = (file: FileItem) => {
    if (file.name === 'index') {
      alert('Cannot delete index file');
      return;
    }

    if (!confirm(`Delete "${file.name}"?`)) return;

    setFiles(prev => prev.filter(f => f.id !== file.id));
    if (selectedFile?.id === file.id) {
      const nextFile = files.find(f => f.id !== file.id);
      if (nextFile) setSelectedFile(nextFile);
    }
  };

  const updateFileContent = (content: string) => {
    setFiles(prev => prev.map(f => 
      f.id === selectedFile.id ? { ...f, content } : f
    ));
    setSelectedFile(prev => prev ? { ...prev, content } : prev);
  };

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
    
    updateFileContent(JSON.stringify(excalidrawData));
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
    updateFileContent(selectedFile.content + '\n' + placeholder + '\n');
  };

  const deleteAsset = (name: string) => {
    if (!confirm(`Delete asset "${name}"?`)) return;

    setAssets(prev => prev.filter(asset => asset.name !== name));
    const newAssets = { ...formData.assets };
    delete newAssets[name];
    setFormData({ ...formData, assets: newAssets });
  };

  const previewContent = (() => {
    let processedContent = selectedFile.content;
    Object.entries(formData.assets).forEach(([name, url]) => {
      const placeholder = new RegExp(`\\(\\{\\{${name}\\}\\}\\)`, 'g');
      processedContent = processedContent.replace(placeholder, `(${url})`);
    });
    return processedContent;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.subject) {
      alert('Please fill in title and subject');
      return;
    }

    setLoading(true);

    try {
      // First create the documentation
      const response = await fetch('http://localhost:5000/api/documentation/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          content: files.find(f => f.type === 'markdown' && f.name === 'index')?.content || ''
        })
      });

      if (response.ok) {
        const data = await response.json();
        const docId = data.doc.docId;

        // Create all files
        for (const file of files) {
          await fetch(`http://localhost:5000/api/documentation/${docId}/files`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: file.name,
              type: file.type,
              content: file.content
            })
          });
        }

        navigate('/documentation');
      } else {
        alert('Failed to create documentation');
      }
    } catch (error) {
      console.error('Error creating documentation:', error);
      alert('Error creating documentation');
    } finally {
      setLoading(false);
    }
  };

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
              Create New Document
            </h1>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-green-200 border-3 border-black rounded-xl font-bold hover:bg-green-300 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
            >
              <Save className="w-5 h-5" strokeWidth={2.5} />
              {loading ? 'Creating...' : 'Create Document'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b-4 border-black px-4">
        <div className="max-w-[1800px] mx-auto flex gap-2">
          <button
            onClick={() => setActiveTab('document')}
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
            onClick={() => setActiveTab('draw')}
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
                key={file.id}
                className={`group flex items-center justify-between p-3 border-2 border-black rounded-lg cursor-pointer transition ${
                  selectedFile?.id === file.id
                    ? 'bg-yellow-200'
                    : 'bg-white hover:bg-gray-50'
                }`}
                onClick={() => setSelectedFile(file)}
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
                  onChange={(val) => updateFileContent(val || '')}
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
                    return selectedFile.content ? JSON.parse(selectedFile.content) : undefined;
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
