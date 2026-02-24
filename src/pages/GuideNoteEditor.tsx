import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Image as ImageIcon, Trash2, Eye, FileText, Plus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ExcalidrawCanvas from '@/components/ExcalidrawCanvas';
import {
  fetchGuideNoteById,
  createGuideNote,
  updateGuideNote
} from '@/services/guideNotesApi';
import { API_BASE_URL } from '@/config/api';

export default function GuideNoteEditorPage() {
  const navigate = useNavigate();
  const { noteId } = useParams<{ noteId: string }>();
  const isEditMode = !!noteId;

  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [canvasData, setCanvasData] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeView, setActiveView] = useState<'markdown' | 'diagram'>('markdown');
  const [uploading, setUploading] = useState(false);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(noteId || null);
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (isEditMode && noteId) {
      loadNote(noteId);
    }
  }, [noteId, isEditMode]);

  const loadNote = async (id: string) => {
    try {
      setLoading(true);
      const note = await fetchGuideNoteById(id);
      setTitle(note.title);
      setTopic(note.topic);
      setContent(note.content);
      setCanvasData(note.canvasData);
      setAssets(note.assets || []);
      setCurrentNoteId(note.noteId);
    } catch (err) {
      console.error('Error loading note:', err);
      alert('Failed to load note');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !topic.trim()) {
      alert('Title and topic are required');
      return;
    }

    try {
      setSaving(true);
      if (isEditMode && noteId) {
        await updateGuideNote(noteId, {
          title: title.trim(),
          topic: topic.trim(),
          content,
          canvasData
        });
        alert('Guide note updated successfully!');
      } else {
        const newNote = await createGuideNote({
          title: title.trim(),
          topic: topic.trim(),
          content,
          canvasData
        });
        setCurrentNoteId(newNote.noteId);
        alert('Guide note created successfully!');
        navigate(`/learnings/guide/${newNote.noteId}`, { replace: true });
      }
    } catch (err) {
      console.error('Error saving note:', err);
      alert('Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !currentNoteId) {
      alert('Please save the note first before uploading files');
      return;
    }

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/api/guide-notes/${currentNoteId}/assets`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) throw new Error('Upload failed');

        const data = await response.json();
        setAssets(prev => [...prev, data.asset]);

        const markdownLink = file.type.startsWith('image/') 
          ? `![${file.name}](${data.asset.azureUrl})`
          : `[${file.name}](${data.asset.azureUrl})`;
        
        setContent(prev => prev + '\n\n' + markdownLink);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!currentNoteId || !confirm('Delete this asset?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/guide-notes/${currentNoteId}/assets/${assetId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Delete failed');

      setAssets(prev => prev.filter(a => a.assetId !== assetId));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete asset');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
          <p className="text-gray-700 font-bold">Loading guide note...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b-4 border-black p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/learnings?tab=notes')}
              className="flex items-center gap-2 text-gray-600 hover:text-black font-bold text-sm transition-all"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
              Back to Documentation
            </button>
            <h1 className="text-2xl font-black text-black">Edit Document</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center border-3 border-black rounded-lg overflow-hidden">
              <button
                onClick={() => setActiveView('markdown')}
                className={`px-4 py-2 font-bold text-sm transition-all ${
                  activeView === 'markdown'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                Markdown
              </button>
              <button
                onClick={() => setActiveView('diagram')}
                className={`px-4 py-2 font-bold text-sm transition-all border-l-3 border-black ${
                  activeView === 'diagram'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                Diagram
              </button>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-black text-white border-3 border-black rounded-lg font-bold hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              <Save size={18} strokeWidth={2.5} />
              Save All
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r-4 border-black flex flex-col overflow-hidden">
          <div className="p-3 border-b-2 border-gray-200">
            <button className="w-full px-4 py-2 bg-green-100 border-2 border-black rounded-lg font-bold text-sm hover:bg-green-200 transition-all flex items-center justify-center gap-2">
              <Plus size={16} strokeWidth={2.5} />
              New File
            </button>
          </div>

          <div className="border-b-2 border-gray-200">
            <div className="p-3 bg-gray-50 border-b-2 border-gray-200">
              <div className="flex items-center gap-2">
                <FileText size={16} strokeWidth={2.5} />
                <span className="font-black text-xs uppercase tracking-wider">Markdown</span>
              </div>
            </div>
            <div className="p-2">
              <div className="px-3 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg flex items-center justify-between">
                <span className="text-sm font-bold">index.md</span>
                <Eye size={14} strokeWidth={2.5} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="border-b-2 border-gray-200">
            <div className="p-3 bg-gray-50 border-b-2 border-gray-200">
              <div className="flex items-center gap-2">
                <ImageIcon size={16} strokeWidth={2.5} />
                <span className="font-black text-xs uppercase tracking-wider">Diagrams</span>
              </div>
            </div>
            <div className="p-2">
              {canvasData ? (
                <div className="px-3 py-2 bg-purple-50 border-2 border-purple-300 rounded-lg flex items-center justify-between">
                  <span className="text-sm font-bold">index.diagram</span>
                  <Eye size={14} strokeWidth={2.5} className="text-purple-600" />
                </div>
              ) : (
                <button
                  onClick={() => setActiveView('diagram')}
                  className="w-full px-3 py-2 bg-gray-100 border-2 border-dashed border-gray-400 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-200 transition-all"
                >
                  + Add Diagram
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-3 bg-gray-50 border-b-2 border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload size={16} strokeWidth={2.5} />
                <span className="font-black text-xs uppercase tracking-wider">Attachments</span>
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={!currentNoteId || uploading}
                />
                <Plus size={16} strokeWidth={2.5} className="text-blue-600 hover:text-blue-800" />
              </label>
            </div>
            <div className="p-2">
              {assets.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">No attachments</p>
              ) : (
                <div className="space-y-1">
                  {assets.map((asset) => (
                    <div
                      key={asset.assetId}
                      className="px-2 py-1.5 bg-gray-50 border border-gray-300 rounded flex items-center justify-between hover:bg-gray-100 transition-all"
                    >
                      <span className="text-xs font-medium truncate flex-1">{asset.filename}</span>
                      <button
                        onClick={() => handleDeleteAsset(asset.assetId)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Form */}
          <div className="w-1/2 border-r-4 border-black bg-white overflow-y-auto">
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-black mb-2 uppercase tracking-wider">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="TSQL guide"
                  className="w-full px-4 py-3 border-3 border-black rounded-lg font-bold text-lg focus:outline-none focus:ring-4 focus:ring-yellow-300"
                />
              </div>

              <div>
                <label className="block text-sm font-black mb-2 uppercase tracking-wider">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="TSQL"
                  className="w-full px-4 py-3 border-3 border-black rounded-lg font-bold focus:outline-none focus:ring-4 focus:ring-yellow-300"
                />
              </div>

              <div>
                <label className="block text-sm font-black mb-2 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter detailed description..."
                  rows={4}
                  className="w-full px-4 py-3 border-3 border-black rounded-lg font-medium focus:outline-none focus:ring-4 focus:ring-yellow-300 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-black mb-2 uppercase tracking-wider">
                  Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="TSQL, Databases"
                  className="w-full px-4 py-3 border-3 border-black rounded-lg font-medium focus:outline-none focus:ring-4 focus:ring-yellow-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-black mb-2 uppercase tracking-wider">
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border-3 border-black rounded-lg font-bold focus:outline-none focus:ring-4 focus:ring-yellow-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black mb-2 uppercase tracking-wider">
                    Time
                  </label>
                  <input
                    type="time"
                    className="w-full px-4 py-3 border-3 border-black rounded-lg font-bold focus:outline-none focus:ring-4 focus:ring-yellow-300"
                  />
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border-3 border-black rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-5 h-5 border-2 border-black rounded"
                  />
                  <span className="font-black text-sm uppercase tracking-wider">Make Public</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-black mb-2 uppercase tracking-wider">
                  Assets
                </label>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={!currentNoteId || uploading}
                  />
                  <div className={`w-full px-4 py-3 bg-purple-100 border-3 border-black rounded-lg font-bold text-center hover:bg-purple-200 transition-all flex items-center justify-center gap-2 ${(!currentNoteId || uploading) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <Upload size={18} strokeWidth={2.5} />
                    {uploading ? 'Uploading...' : 'Upload Assets'}
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Panel - Editor/Preview */}
          <div className="w-1/2 bg-gray-900 overflow-hidden flex flex-col">
            {activeView === 'markdown' ? (
              <>
                <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
                  <span className="text-white font-bold text-sm">index.md</span>
                  <button 
                    onClick={handleSave}
                    className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-all"
                  >
                    Save File
                  </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                  <div className="w-1/2 border-r border-gray-700 overflow-y-auto">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="# Complete T-SQL Guide

## Introduction to T-SQL

T-SQL (Transact-SQL) is Microsoft's extension of SQL..."
                      className="w-full h-full p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none focus:outline-none"
                      style={{ minHeight: '100%' }}
                    />
                  </div>

                  <div className="w-1/2 overflow-y-auto bg-gray-800 p-6">
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {content || '*Start writing your guide...*'}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1">
                <ExcalidrawCanvas
                  canvasId={`guide-note-${currentNoteId || 'temp'}`}
                  onClose={() => setActiveView('markdown')}
                  onSave={async (data) => { setCanvasData(data); }}
                  initialData={canvasData}
                  viewOnly={false}
                  isPublic={false}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
