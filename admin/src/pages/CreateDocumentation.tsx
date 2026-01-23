import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Upload, Image as ImageIcon, Trash2, FileText, Pen, Plus, X, Menu, Maximize2, Minimize2, Minus, Square } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import config, { buildUrl } from '../config/config';
import { Excalidraw } from '@excalidraw/excalidraw';

type TabType = 'markdown' | 'diagram';

interface TempFile {
  id: string;
  name: string;
  type: 'markdown' | 'diagram';
  content: any;
}

export default function CreateDocumentation() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const excalidrawRef = useRef<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('markdown');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [assets, setAssets] = useState<Array<{ name: string; url: string }>>([]);
  const [attachments, setAttachments] = useState<Array<{ fileId: string; name: string; url: string }>>([]);
  const [files, setFiles] = useState<TempFile[]>([
    { id: 'index-md', name: 'index.md', type: 'markdown', content: '# Welcome\n\nStart writing your documentation here...' },
    { id: 'index-diagram', name: 'index.diagram', type: 'diagram', content: { elements: [], appState: {} } }
  ]);
  const [currentFile, setCurrentFile] = useState<TempFile>(files[0]);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<'markdown' | 'diagram'>('markdown');
  const [isFullscreen, setIsFullscreen] = useState(false);
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

  const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadFiles = e.target.files;
    if (!uploadFiles || uploadFiles.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(uploadFiles)) {
        const assetName = prompt(`Enter a name for "${file.name}":`,
          file.name.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '_')
        );

        if (!assetName) continue;

        const uploadFormData = new FormData();
        uploadFormData.append('asset', file);

        const response = await fetch(config.api.endpoints.docUploadAsset, {
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

    setUploadingAttachment(true);

    try {
      // First create the document to get docId
      if (!formData.title || !formData.subject) {
        alert('Please fill in Title and Subject before uploading attachments');
        setUploadingAttachment(false);
        return;
      }

      // Create a temporary doc if not exists
      let tempDocId = (window as any).tempDocId;
      if (!tempDocId) {
        const indexMd = files.find(f => f.name === 'index.md');
        const markdownContent = indexMd?.content || '';

        const response = await fetch(config.api.endpoints.docCreate, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            content: markdownContent
          })
        });

        if (!response.ok) {
          throw new Error('Failed to create document');
        }

        const data = await response.json();
        tempDocId = data.doc.docId;
        (window as any).tempDocId = tempDocId;
      }

      for (const file of Array.from(uploadFiles)) {
        await uploadAttachmentChunked(tempDocId, file);
      }

      alert('Attachments uploaded successfully!');
    } catch (error) {
      console.error('Error uploading attachments:', error);
      alert('Error uploading attachments');
    } finally {
      setUploadingAttachment(false);
      if (attachmentInputRef.current) {
        attachmentInputRef.current.value = '';
      }
    }
  };

  const uploadAttachmentChunked = async (docId: string, file: File) => {
    const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB chunks (Vercel WAF limit is ~4-5MB for multipart/form-data)
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const MAX_PARALLEL_UPLOADS = 3; // Upload 3 chunks in parallel

    // Initialize upload
    const initResponse = await fetch(config.api.endpoints.docAttachmentsInit(docId!), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type
      })
    });

    if (!initResponse.ok) throw new Error('Failed to initialize upload');
    const { fileId, blobPath } = await initResponse.json();

    const blockIds: string[] = new Array(totalChunks);

    // Upload chunks in parallel batches
    const uploadChunk = async (i: number) => {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const chunkFormData = new FormData();
      chunkFormData.append('chunk', chunk);
      chunkFormData.append('fileId', fileId);
      chunkFormData.append('blobPath', blobPath);
      chunkFormData.append('chunkIndex', i.toString());
      chunkFormData.append('totalChunks', totalChunks.toString());
      chunkFormData.append('fileName', file.name);
      chunkFormData.append('mimeType', file.type);

      const chunkResponse = await fetch(config.api.endpoints.docAttachmentsChunk(docId!), {
        method: 'POST',
        body: chunkFormData
      });

      if (!chunkResponse.ok) throw new Error(`Failed to upload chunk ${i + 1}`);
      const chunkData = await chunkResponse.json();
      blockIds[i] = chunkData.blockId;
    };

    // Upload chunks in parallel batches
    for (let i = 0; i < totalChunks; i += MAX_PARALLEL_UPLOADS) {
      const batch = [];
      for (let j = 0; j < MAX_PARALLEL_UPLOADS && i + j < totalChunks; j++) {
        batch.push(uploadChunk(i + j));
      }
      await Promise.all(batch);
    }

    // Complete upload
    const completeResponse = await fetch(config.api.endpoints.docAttachmentsComplete(docId!), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileId,
        blobPath,
        fileName: file.name,
        mimeType: file.type,
        totalChunks,
        blockIds
      })
    });

    if (!completeResponse.ok) throw new Error('Failed to complete upload');
    const completeData = await completeResponse.json();
    
    setAttachments(prev => [...prev, {
      fileId: completeData.file.fileId,
      name: completeData.file.name,
      url: completeData.file.azureUrl
    }]);
  };

  const deleteAttachment = (fileId: string) => {
    setAttachments(prev => prev.filter(att => att.fileId !== fileId));
  };

  const insertAsset = (name: string) => {
    const placeholder = `![${name}]({{${name}}})`;
    if (currentFile.type === 'markdown') {
      const updatedContent = currentFile.content + '\n' + placeholder + '\n';
      updateFileContent(currentFile.id, updatedContent);
    }
  };

  const deleteAsset = (name: string) => {
    setAssets(prev => prev.filter(asset => asset.name !== name));
    const newAssets = { ...formData.assets };
    delete newAssets[name];
    setFormData({ ...formData, assets: newAssets });
  };

  const loadFile = (file: TempFile) => {
    // Save current diagram state before switching
    if (currentFile.type === 'diagram' && excalidrawRef.current) {
      const elements = excalidrawRef.current.getSceneElements();
      const appState = excalidrawRef.current.getAppState();
      const { collaborators, ...cleanAppState } = appState;
      updateFileContent(currentFile.id, { elements, appState: cleanAppState });
    }

    setCurrentFile(file);
    if (file.type === 'markdown') {
      setActiveTab('markdown');
    } else {
      setActiveTab('diagram');
    }
  };

  const updateFileContent = (fileId: string, content: any) => {
    setFiles(files.map(f => f.id === fileId ? { ...f, content } : f));
    if (currentFile.id === fileId) {
      setCurrentFile({ ...currentFile, content });
    }
  };

  const createNewFile = () => {
    if (!newFileName.trim()) {
      alert('Please enter a file name');
      return;
    }

    const newFile: TempFile = {
      id: `file-${Date.now()}`,
      name: newFileName,
      type: newFileType,
      content: newFileType === 'markdown' ? '' : { elements: [], appState: {} }
    };

    setFiles([...files, newFile]);
    setShowNewFileModal(false);
    setNewFileName('');
    loadFile(newFile);
  };

  const deleteFile = (fileId: string) => {
    if (!confirm('Delete this file?')) return;

    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);

    if (currentFile.id === fileId && updatedFiles.length > 0) {
      loadFile(updatedFiles[0]);
    }
  };

  const handleMarkdownClick = () => {
    const indexMd = files.find(f => f.name === 'index.md');
    if (indexMd) loadFile(indexMd);
  };

  const handleDiagramClick = () => {
    const indexDiagram = files.find(f => f.name === 'index.diagram');
    if (indexDiagram) loadFile(indexDiagram);
  };

  const previewContent = (() => {
    if (currentFile.type !== 'markdown') return '';
    let processedContent = currentFile.content;
    Object.entries(formData.assets).forEach(([name, url]) => {
      const placeholder = new RegExp(`\\(\\{\\{${name}\\}\\}\\)`, 'g');
      processedContent = processedContent.replace(placeholder, `(${url})`);
    });
    return processedContent;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.subject) {
      alert('Title and Subject are required');
      return;
    }

    setSaving(true);

    try {
      // Save current diagram state
      if (currentFile.type === 'diagram' && excalidrawRef.current) {
        const elements = excalidrawRef.current.getSceneElements();
        const appState = excalidrawRef.current.getAppState();
        const { collaborators, ...cleanAppState } = appState;
        updateFileContent(currentFile.id, { elements, appState: cleanAppState });
      }

      // Get index.md content
      const indexMd = files.find(f => f.name === 'index.md');
      const markdownContent = indexMd?.content || '';

      // Create documentation
      const response = await fetch(config.api.endpoints.docCreate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          content: markdownContent
        })
      });

      if (!response.ok) {
        alert('Failed to create documentation');
        setSaving(false);
        return;
      }

      const data = await response.json();
      const docId = data.doc.docId;

      // Update all files
      for (const file of files) {
        const serverFile = data.doc.files?.find((f: any) => f.name === file.name);
        if (serverFile) {
          await fetch(config.api.endpoints.docFileById(docId!, serverFile.fileId), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: file.content })
          });
        } else {
          // Create new file
          await fetch(config.api.endpoints.docFiles(docId!), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: file.name,
              type: file.type,
              content: file.content
            })
          });
        }
      }

      alert('Documentation created successfully!');
      navigate('/documentation');
    } catch (error) {
      console.error('Error creating documentation:', error);
      alert('Error creating documentation');
    } finally {
      setSaving(false);
    }
  };

  const markdownFiles = files.filter(f => f.type === 'markdown');
  const diagramFiles = files.filter(f => f.type === 'diagram');

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className={`bg-white border-b-4 border-black p-4 md:p-6 ${isFullscreen ? 'hidden' : ''}`}>
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
                Create Document
              </h1>
            </div>

            {/* Tabs in Center - Hidden on mobile */}
            <div className="hidden md:flex flex-1 items-center justify-center">
              <div className="flex gap-1 bg-gray-200 p-1 rounded-xl border-3 border-black">
                <button
                  onClick={handleMarkdownClick}
                  className={`px-6 py-2 rounded-lg font-bold text-sm transition ${currentFile.name === 'index.md'
                    ? 'bg-white border-2 border-black shadow-sm'
                    : 'bg-transparent hover:bg-white/50'
                    }`}
                >
                  Markdown
                </button>
                <button
                  onClick={handleDiagramClick}
                  className={`px-6 py-2 rounded-lg font-bold text-sm transition ${currentFile.name === 'index.diagram'
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
              className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-green-200 border-3 border-black rounded-xl font-bold hover:bg-green-300 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 text-sm md:text-base"
            >
              <Save className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
              {saving ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout - Mobile: column with scroll, Desktop: row */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden relative">
        {/* File Sidebar - Desktop always visible, Mobile as overlay */}
        <div className={`${showMobileSidebar ? 'fixed inset-y-0 left-0 z-40' : 'hidden'} ${isFullscreen ? 'hidden' : 'lg:block'} w-64 bg-white border-r-4 border-black overflow-y-auto`}>
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
                    key={file.id}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer ${currentFile.id === file.id ? 'bg-blue-100 border-2 border-black' : 'hover:bg-gray-100'
                      }`}
                    onClick={() => loadFile(file)}
                  >
                    <span className="text-sm font-medium truncate">{file.name}</span>
                    {file.name !== 'index.md' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFile(file.id);
                        }}
                        className="p-1 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
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
                    key={file.id}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer ${currentFile.id === file.id ? 'bg-green-100 border-2 border-black' : 'hover:bg-gray-100'
                      }`}
                    onClick={() => loadFile(file)}
                  >
                    <span className="text-sm font-medium truncate">{file.name}</span>
                    {file.name !== 'index.diagram' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFile(file.id);
                        }}
                        className="p-1 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
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
        <div className={`w-full lg:w-[350px] lg:border-r-4 border-black bg-white p-6 lg:overflow-y-auto ${isFullscreen ? 'hidden' : ''}`}>
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
                placeholder="Comma separated"
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

            {/* Attachments */}
            <div>
              <label className="block text-sm font-black mb-2 uppercase">Attachments</label>
              <input
                ref={attachmentInputRef}
                type="file"
                multiple
                onChange={handleAttachmentUpload}
                className="hidden"
              />
              <button
                onClick={() => attachmentInputRef.current?.click()}
                disabled={uploadingAttachment}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-200 border-3 border-black rounded-xl font-bold hover:bg-orange-300 transition"
              >
                <Upload className="w-5 h-5" strokeWidth={2.5} />
                {uploadingAttachment ? 'Uploading...' : 'Upload Attachments'}
              </button>

              {attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {attachments.map((attachment) => (
                    <div key={attachment.fileId} className="flex items-center gap-3 p-3 border-3 border-black rounded-lg bg-white">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{attachment.name}</p>
                      </div>
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        <Download className="w-5 h-5" strokeWidth={2.5} />
                      </a>
                      <button onClick={() => deleteAttachment(attachment.fileId)} className="p-2 hover:bg-red-100 rounded">
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
        <div className={`w-full lg:flex-1 flex flex-col min-h-[500px] lg:min-h-0 lg:overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
          {/* Fullscreen Controls */}
          {isFullscreen && activeTab === 'diagram' && (
            <div className="absolute top-0 right-0 z-50 flex items-center gap-2 p-2 bg-white/90 backdrop-blur-sm border-b border-l border-black rounded-bl-lg">
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 hover:bg-gray-100 rounded transition"
                title="Exit Fullscreen"
              >
                <Minimize2 className="w-5 h-5" strokeWidth={2.5} />
              </button>
              <button
                className="p-2 hover:bg-gray-100 rounded transition"
                title="Minimize"
              >
                <Minus className="w-5 h-5" strokeWidth={2.5} />
              </button>
              <button
                className="p-2 hover:bg-gray-100 rounded transition"
                title="Maximize"
              >
                <Square className="w-5 h-5" strokeWidth={2.5} />
              </button>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 hover:bg-red-100 rounded transition"
                title="Close"
              >
                <X className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>
          )}
          
          <div className="flex-1 lg:overflow-hidden">
            {activeTab === 'markdown' && (
              <MDEditor
                value={previewContent}
                onChange={(val) => updateFileContent(currentFile.id, val || '')}
                height="100%"
                preview="live"
              />
            )}

            {activeTab === 'diagram' && (
              <div className="w-full h-full relative">
                {/* Fullscreen Button */}
                {!isFullscreen && (
                  <button
                    onClick={() => setIsFullscreen(true)}
                    className="absolute top-4 right-4 z-10 p-3 bg-white border-3 border-black rounded-lg font-bold hover:bg-gray-100 transition shadow-lg"
                    title="Fullscreen"
                  >
                    <Maximize2 className="w-5 h-5" strokeWidth={2.5} />
                  </button>
                )}
                
                {/* Desktop - Show Excalidraw */}
                <div className="hidden lg:block w-full h-full">
                  <Excalidraw
                    key={currentFile.id}
                    excalidrawAPI={(api) => {
                      excalidrawRef.current = api;
                      if (currentFile.content?.elements) {
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
                    <div className="text-6xl mb-4">Desktop</div>
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
