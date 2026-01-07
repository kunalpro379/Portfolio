import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Upload, Image as ImageIcon, Trash2, FileText, Pen, Plus, Folder, X, Menu } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import { Excalidraw } from '@excalidraw/excalidraw';

type TabType = 'markdown' | 'diagram';
type FileType = 'markdown' | 'diagram' | 'attachment';

interface DocFile {
  fileId: string;
  name: string;
  type: FileType;
  azurePath: string;
  azureUrl: string;
  createdAt: string;
  content?: any;
}

export default function EditDocumentation() {
  const navigate = useNavigate();
  const { docId } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const excalidrawRef = useRef<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('markdown');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [assets, setAssets] = useState<Array<{ name: string; url: string }>>([]);
  const [files, setFiles] = useState<DocFile[]>([]);
  const [currentFile, setCurrentFile] = useState<DocFile | null>(null);
  const [currentContent, setCurrentContent] = useState('');
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<'markdown' | 'diagram'>('markdown');
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    tags: '',
    date: '',
    time: '',
    isPublic: false,
    assets: {} as Record<string, string>
  });

  useEffect(() => {
    fetchDoc();
  }, [docId]);

  const fetchDoc = async () => {
    try {
      const response = await fetch(`http://api.kunalpatil.me/api/documentation/${docId}`);
      const data = await response.json();

      setFormData({
        title: data.doc.title,
        subject: data.doc.subject,
        description: data.doc.description || '',
        tags: data.doc.tags ? data.doc.tags.join(', ') : '',
        date: data.doc.date || '',
        time: data.doc.time || '',
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

      // Fetch files
      await fetchFiles();
    } catch (error) {
      console.error('Error fetching documentation:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch(`http://api.kunalpatil.me/api/documentation/${docId}/files`);
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const loadFile = async (file: DocFile) => {
    try {
      console.log('=== Loading file:', file.name, file.fileId);
      
      // Save current file before switching (silently)
      if (currentFile && currentFile.fileId !== file.fileId) {
        console.log('Auto-saving current file before switch:', currentFile.name);
        await saveCurrentFile(false);
      }

      const response = await fetch(`http://api.kunalpatil.me/api/documentation/${docId}/files/${file.fileId}`);

      if (!response.ok) {
        throw new Error(`Failed to load file: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Loaded file data:', data.file.name, 'Type:', data.file.type);

      if (!data.file) {
        throw new Error('File data not found');
      }

      setCurrentFile(data.file);

      // Handle content based on type
      if (file.type === 'diagram') {
        console.log('Loading diagram with elements:', data.file.content?.elements?.length || 0);
        setCurrentContent(''); // Diagrams don't use text content
        setActiveTab('diagram');
        // Content will be loaded when Excalidraw mounts via excalidrawAPI
      } else {
        console.log('Loading markdown content length:', data.file.content?.length || 0);
        // Markdown or other text files
        setCurrentContent(data.file.content || '');
        setActiveTab('markdown');
      }
    } catch (error) {
      console.error('Error loading file:', error);
      alert(`Error loading file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const createNewFile = async () => {
    if (!newFileName.trim()) {
      alert('Please enter a file name');
      return;
    }

    try {
      const response = await fetch(`http://api.kunalpatil.me/api/documentation/${docId}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFileName,
          type: newFileType,
          content: newFileType === 'markdown' ? '' : {}
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFiles([...files, data.file]);
        setShowNewFileModal(false);
        setNewFileName('');
        loadFile(data.file);
      }
    } catch (error) {
      console.error('Error creating file:', error);
      alert('Error creating file');
    }
  };

  const saveCurrentFile = async (showAlert = true) => {
    if (!currentFile) return;

    try {
      let content: any = currentContent;

      console.log('Saving file:', currentFile.name, currentFile.fileId);
      console.log('Current content type:', currentFile.type);

      if (currentFile.type === 'diagram' && excalidrawRef.current) {
        const elements = excalidrawRef.current.getSceneElements();
        const appState = excalidrawRef.current.getAppState();
        console.log('Saving diagram with elements:', elements.length);
        // Remove collaborators from appState before saving
        const { collaborators, ...cleanAppState } = appState;
        content = { elements, appState: cleanAppState };
      } else {
        console.log('Saving markdown content length:', currentContent.length);
      }

      const response = await fetch(`http://api.kunalpatil.me/api/documentation/${docId}/files/${currentFile.fileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      if (response.ok) {
        console.log('File saved successfully:', currentFile.name);
        if (showAlert) {
          alert('File saved successfully!');
        }
      }
    } catch (error) {
      console.error('Error saving file:', error);
      if (showAlert) {
        alert('Error saving file');
      }
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!confirm('Delete this file?')) return;

    try {
      const response = await fetch(`http://api.kunalpatil.me/api/documentation/${docId}/files/${fileId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setFiles(files.filter(f => f.fileId !== fileId));
        if (currentFile?.fileId === fileId) {
          setCurrentFile(null);
          setCurrentContent('');
        }
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleMarkdownClick = async () => {
    let indexMd = files.find(f => f.name === 'index.md' && f.type === 'markdown');

    if (!indexMd) {
      // Create index.md if it doesn't exist
      try {
        const response = await fetch(`http://api.kunalpatil.me/api/documentation/${docId}/files`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'index.md',
            type: 'markdown',
            content: '# Welcome\n\nStart writing your documentation here...'
          })
        });

        if (response.ok) {
          const data = await response.json();
          indexMd = data.file;
          setFiles([...files, data.file]);
        }
      } catch (error) {
        console.error('Error creating index.md:', error);
        alert('Error creating markdown file');
        return;
      }
    }

    if (indexMd) {
      loadFile(indexMd);
    }
  };

  const handleDiagramClick = async () => {
    let indexDiagram = files.find(f => f.name === 'index.diagram' && f.type === 'diagram');

    if (!indexDiagram) {
      // Create index.diagram if it doesn't exist
      try {
        const response = await fetch(`http://api.kunalpatil.me/api/documentation/${docId}/files`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'index.diagram',
            type: 'diagram',
            content: { elements: [], appState: {} }
          })
        });

        if (response.ok) {
          const data = await response.json();
          indexDiagram = data.file;
          setFiles([...files, data.file]);
        }
      } catch (error) {
        console.error('Error creating index.diagram:', error);
        alert('Error creating diagram file');
        return;
      }
    }

    if (indexDiagram) {
      loadFile(indexDiagram);
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

        const uploadFormData = new FormData();
        uploadFormData.append('asset', file);

        const response = await fetch('http://api.kunalpatil.me/api/documentation/upload-asset', {
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

      alert('Assets uploaded successfully!');
    } catch (error) {
      console.error('Error uploading assets:', error);
      alert('Error uploading assets');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadFiles = e.target.files;
    if (!uploadFiles || uploadFiles.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(uploadFiles)) {
        const uploadFormData = new FormData();
        uploadFormData.append('attachment', file);

        const response = await fetch(`http://api.kunalpatil.me/api/documentation/${docId}/attachments`, {
          method: 'POST',
          body: uploadFormData
        });

        if (response.ok) {
          const data = await response.json();
          setFiles([...files, data.file]);
        }
      }

      alert('Attachments uploaded successfully!');
    } catch (error) {
      console.error('Error uploading attachments:', error);
      alert('Error uploading attachments');
    } finally {
      setUploading(false);
      if (attachmentInputRef.current) {
        attachmentInputRef.current.value = '';
      }
    }
  };

  const insertAsset = (name: string) => {
    const placeholder = `![${name}]({{${name}}})`;
    setCurrentContent(currentContent + '\n' + placeholder + '\n');
  };

  const deleteAsset = async (name: string) => {
    if (!confirm(`Delete asset "${name}"?`)) return;

    try {
      const response = await fetch(`http://api.kunalpatil.me/api/documentation/asset/${docId}/${name}`, {
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
    // Ensure currentContent is a string
    if (typeof currentContent !== 'string') {
      return '';
    }

    let processedContent = currentContent;
    Object.entries(formData.assets).forEach(([name, url]) => {
      const placeholder = new RegExp(`\\(\\{\\{${name}\\}\\}\\)`, 'g');
      processedContent = processedContent.replace(placeholder, `(${url})`);
    });
    return processedContent;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);

    try {
      // Save metadata
      const response = await fetch(`http://api.kunalpatil.me/api/documentation/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        alert('Failed to update documentation');
        setSaving(false);
        return;
      }

      // Save current file
      if (currentFile) {
        await saveCurrentFile();
      }

      alert('Documentation saved successfully!');
      navigate('/documentation');
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

  const markdownFiles = files.filter(f => f.type === 'markdown');
  const diagramFiles = files.filter(f => f.type === 'diagram');
  const attachmentFiles = files.filter(f => f.type === 'attachment');

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-4 border-black p-4 md:p-6">
        <div className="max-w-[1800px] mx-auto">
          <button
            onClick={() => navigate('/documentation')}
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-3 md:mb-4 font-bold text-sm md:text-base"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
            Back to Documentation
          </button>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-6 h-6" strokeWidth={2.5} />
              </button>

              <h1 className="text-2xl md:text-4xl font-black text-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                Edit Document
              </h1>
            </div>

            {/* Tabs in Center - Hidden on mobile */}
            <div className="hidden md:flex flex-1 items-center justify-center">
              <div className="flex gap-1 bg-gray-200 p-1 rounded-xl border-3 border-black">
                <button
                  onClick={handleMarkdownClick}
                  className={`px-6 py-2 rounded-lg font-bold text-sm transition ${currentFile?.name === 'index.md' && currentFile?.type === 'markdown'
                    ? 'bg-white border-2 border-black shadow-sm'
                    : 'bg-transparent hover:bg-white/50'
                    }`}
                >
                  Markdown
                </button>
                <button
                  onClick={handleDiagramClick}
                  className={`px-6 py-2 rounded-lg font-bold text-sm transition ${currentFile?.name === 'index.diagram' && currentFile?.type === 'diagram'
                    ? 'bg-white border-2 border-black shadow-sm'
                    : 'bg-transparent hover:bg-white/50'
                    }`}
                >
                  Diagram
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-blue-200 border-3 border-black rounded-xl font-bold hover:bg-blue-300 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 text-sm md:text-base"
            >
              <Save className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
              {saving ? 'Saving...' : 'Save All'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout - Mobile: column with scroll, Desktop: row */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden relative">
        {/* File Sidebar - Desktop always visible, Mobile as overlay */}
        <div className={`${showMobileSidebar ? 'fixed inset-y-0 left-0 z-40' : 'hidden'} lg:block w-64 bg-white border-r-4 border-black overflow-y-auto`}>
          <div className="p-4 space-y-4">
            {/* New File Button */}
            <button
              onClick={() => setShowNewFileModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-200 border-3 border-black rounded-lg font-bold hover:bg-green-300 transition"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              New File
            </button>

            {/* Markdown Files */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" strokeWidth={2.5} />
                <h3 className="font-black text-sm uppercase">Markdown</h3>
              </div>
              <div className="space-y-1">
                {markdownFiles.map(file => (
                  <div
                    key={file.fileId}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer ${currentFile?.fileId === file.fileId ? 'bg-blue-100 border-2 border-black' : 'hover:bg-gray-100'
                      }`}
                    onClick={() => loadFile(file)}
                  >
                    <span className="text-sm font-medium truncate">{file.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFile(file.fileId);
                      }}
                      className="p-1 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {markdownFiles.length === 0 && (
                  <p className="text-xs text-gray-500 p-2">No markdown files</p>
                )}
              </div>
            </div>

            {/* Diagram Files */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Pen className="w-4 h-4" strokeWidth={2.5} />
                <h3 className="font-black text-sm uppercase">Diagrams</h3>
              </div>
              <div className="space-y-1">
                {diagramFiles.map(file => (
                  <div
                    key={file.fileId}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer ${currentFile?.fileId === file.fileId ? 'bg-green-100 border-2 border-black' : 'hover:bg-gray-100'
                      }`}
                    onClick={() => loadFile(file)}
                  >
                    <span className="text-sm font-medium truncate">{file.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFile(file.fileId);
                      }}
                      className="p-1 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {diagramFiles.length === 0 && (
                  <p className="text-xs text-gray-500 p-2">No diagram files</p>
                )}
              </div>
            </div>

            {/* Attachments */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4" strokeWidth={2.5} />
                  <h3 className="font-black text-sm uppercase">Attachments</h3>
                </div>
                <input
                  ref={attachmentInputRef}
                  type="file"
                  multiple
                  onChange={handleAttachmentUpload}
                  className="hidden"
                />
                <button
                  onClick={() => attachmentInputRef.current?.click()}
                  className="p-1 hover:bg-purple-100 rounded"
                  title="Upload attachment"
                >
                  <Upload className="w-3 h-3" strokeWidth={2.5} />
                </button>
              </div>
              <div className="space-y-1">
                {attachmentFiles.map(file => (
                  <div
                    key={file.fileId}
                    className="flex items-center justify-between p-2 rounded hover:bg-gray-100"
                  >
                    <a
                      href={file.azureUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium truncate flex-1 hover:text-blue-600"
                    >
                      {file.name}
                    </a>
                    <button
                      onClick={() => deleteFile(file.fileId)}
                      className="p-1 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {attachmentFiles.length === 0 && (
                  <p className="text-xs text-gray-500 p-2">No attachments</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Backdrop */}
        {showMobileSidebar && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setShowMobileSidebar(false)}
          />
        )}

        {/* Middle - Form - Desktop: sidebar, Mobile: auto height */}
        <div className="w-full lg:w-[400px] lg:border-r-4 border-black bg-white p-6 lg:overflow-y-auto">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-black mb-2 uppercase">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-black mb-2 uppercase">Subject *</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-black mb-2 uppercase">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-black mb-2 uppercase">Tags</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-3 border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-black mb-2 uppercase">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 border-3 border-black rounded-xl font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-black mb-2 uppercase">Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-3 border-3 border-black rounded-xl font-medium"
                />
              </div>
            </div>

            <div className="bg-yellow-100 border-3 border-black rounded-xl p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="w-6 h-6"
                />
                <span className="font-black uppercase">Make Public</span>
              </label>
            </div>

            {/* Assets */}
            <div>
              <label className="block text-sm font-black mb-2 uppercase">Assets</label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleAssetUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-200 border-3 border-black rounded-xl font-bold hover:bg-purple-300 transition"
              >
                <Upload className="w-5 h-5" strokeWidth={2.5} />
                {uploading ? 'Uploading...' : 'Upload Assets'}
              </button>

              {assets.length > 0 && (
                <div className="mt-4 space-y-2">
                  {assets.map((asset, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border-3 border-black rounded-lg bg-white">
                      <img src={asset.url} alt={asset.name} className="w-16 h-16 object-cover rounded border-2 border-black" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{`{{${asset.name}}}`}</p>
                      </div>
                      <button onClick={() => insertAsset(asset.name)} className="p-2 hover:bg-gray-100 rounded">
                        <ImageIcon className="w-5 h-5" strokeWidth={2.5} />
                      </button>
                      <button onClick={() => deleteAsset(asset.name)} className="p-2 hover:bg-red-100 rounded">
                        <Trash2 className="w-5 h-5" strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right - Editor - Mobile: min height, Desktop: flex */}
        <div className="w-full lg:flex-1 flex flex-col min-h-[500px] lg:min-h-0 lg:overflow-hidden">
          {currentFile ? (
            <>
              <div className="flex items-center justify-between p-4 bg-white border-b-4 border-black">
                <h2 className="font-black text-lg">{currentFile.name}</h2>
                <button
                  onClick={saveCurrentFile}
                  className="px-4 py-2 bg-blue-200 border-3 border-black rounded-lg font-bold hover:bg-blue-300 transition"
                >
                  Save File
                </button>
              </div>

              <div className="flex-1 overflow-hidden">
                {activeTab === 'markdown' && (
                  <MDEditor
                    value={previewContent}
                    onChange={(val) => setCurrentContent(val || '')}
                    height="100%"
                    preview="live"
                  />
                )}

                {activeTab === 'diagram' && (
                  <div className="w-full h-full">
                    {/* Desktop - Show Excalidraw */}
                    <div className="hidden lg:block w-full h-full">
                      <Excalidraw
                        key={currentFile?.fileId}
                        excalidrawAPI={(api) => {
                          excalidrawRef.current = api;
                          if (currentFile?.content && currentFile.content.elements) {
                            setTimeout(() => {
                              api.updateScene({
                                elements: currentFile.content.elements,
                                appState: {
                                  ...currentFile.content.appState,
                                  collaborators: []
                                }
                              });
                            }, 100);
                          }
                        }}
                        theme="light"
                        UIOptions={{
                          canvasActions: {
                            loadScene: false,
                          },
                        }}
                        initialData={{
                          elements: [],
                          appState: {
                            collaborators: []
                          }
                        }}
                        viewModeEnabled={false}
                      />
                    </div>

                    {/* Mobile/Tablet - Show Warning */}
                    <div className="lg:hidden flex items-center justify-center h-full bg-gray-50 p-8">
                      <div className="max-w-md text-center">
                        <div className="text-6xl mb-4">🖥️</div>
                        <h2 className="text-2xl font-black mb-3">Desktop Only Feature</h2>
                        <p className="text-gray-600 font-medium">
                          The diagram editor is only available on desktop screens (1024px and above) for the best experience.
                        </p>
                        <p className="text-gray-500 text-sm mt-4">
                          Please switch to a larger screen to edit diagrams.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-lg">Select a file or create a new one</p>
            </div>
          )}
        </div>
      </div>

      {/* New File Modal */}
      {showNewFileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white border-4 border-black rounded-2xl p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black">Create New File</h3>
              <button onClick={() => setShowNewFileModal(false)}>
                <X className="w-6 h-6" strokeWidth={2.5} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-black mb-2">File Name</label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="w-full px-4 py-2 border-3 border-black rounded-lg"
                  placeholder="e.g., README, Architecture"
                />
              </div>

              <div>
                <label className="block text-sm font-black mb-2">File Type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewFileType('markdown')}
                    className={`flex-1 px-4 py-2 border-3 border-black rounded-lg font-bold ${newFileType === 'markdown' ? 'bg-blue-200' : 'bg-white hover:bg-gray-100'
                      }`}
                  >
                    Markdown
                  </button>
                  <button
                    onClick={() => setNewFileType('diagram')}
                    className={`flex-1 px-4 py-2 border-3 border-black rounded-lg font-bold ${newFileType === 'diagram' ? 'bg-green-200' : 'bg-white hover:bg-gray-100'
                      }`}
                  >
                    Diagram
                  </button>
                </div>
              </div>

              <button
                onClick={createNewFile}
                className="w-full px-4 py-3 bg-green-200 border-3 border-black rounded-xl font-bold hover:bg-green-300 transition"
              >
                Create File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
