import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Image as ImageIcon, Trash2, Download, Eye } from 'lucide-react';
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
  const [content, setContent] = useState('');
  const [canvasData, setCanvasData] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(noteId || null);

  // Load existing note if in edit mode
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
        // Redirect to edit mode with the new note ID
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

        // Insert markdown link at cursor position
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

  const insertCanvasImage = () => {
    if (!canvasData) return;
    const canvasMarkdown = `\n\n![Canvas Drawing](canvas:embedded)\n\n`;
    setContent(prev => prev + canvasMarkdown);
    setShowCanvas(false);
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
    <div className="min-h-screen bg-gray-100">
      {/* Background */}
      <div 
        className="fixed inset-0 z-0 opacity-30"
        style={{
          backgroundImage: 'url(/page14.png)',
          backgroundSize: 'auto',
          backgroundPosition: 'top left',
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Header */}
      <div className="bg-gray-50/80 backdrop-blur-sm border-b-4 border-black p-4 md:p-6 z-50 shadow-lg relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/learnings?tab=notes')}
              className="flex items-center gap-2 text-gray-600 hover:text-black font-bold text-sm md:text-base transition-all hover:gap-3"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
              Back to Notes
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white border-3 border-black rounded-lg font-bold hover:bg-gray-600 transition-all"
              >
                <Eye size={18} strokeWidth={2.5} />
                <span className="hidden sm:inline">{showPreview ? 'Edit' : 'Preview'}</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white border-3 border-black rounded-lg font-bold hover:bg-gray-800 transition-all disabled:opacity-50"
              >
                <Save size={18} strokeWidth={2.5} />
                <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            {isEditMode ? 'Edit Guide Note' : 'Create Guide Note'}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-6">
        <div className="bg-white border-4 border-black rounded-2xl shadow-2xl overflow-hidden">
          {/* Title & Topic */}
          <div className="p-6 border-b-4 border-black bg-gradient-to-r from-yellow-50 to-amber-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter note title"
                  className="w-full px-4 py-2 border-3 border-black rounded-lg font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Topic *</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., React, AWS, System Design"
                  className="w-full px-4 py-2 border-3 border-black rounded-lg font-medium"
                />
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="p-4 border-b-4 border-black bg-gray-50 flex items-center gap-2 flex-wrap">
            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt,.md"
                onChange={handleFileUpload}
                className="hidden"
                disabled={!currentNoteId || uploading}
              />
              <div className={`px-4 py-2 bg-blue-500 text-white border-3 border-black rounded-lg font-bold hover:bg-blue-600 transition-all flex items-center gap-2 ${(!currentNoteId || uploading) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Upload size={18} strokeWidth={2.5} />
                {uploading ? 'Uploading...' : 'Upload File'}
              </div>
            </label>
            <button
              onClick={() => setShowCanvas(true)}
              className="px-4 py-2 bg-purple-500 text-white border-3 border-black rounded-lg font-bold hover:bg-purple-600 transition-all flex items-center gap-2"
            >
              <ImageIcon size={18} strokeWidth={2.5} />
              Draw Canvas
            </button>
            {!currentNoteId && (
              <p className="text-xs text-gray-600 font-medium ml-2">
                💡 Save the note first to upload files
              </p>
            )}
          </div>

          {/* Assets List */}
          {assets.length > 0 && (
            <div className="p-4 border-b-4 border-black bg-blue-50">
              <h3 className="font-bold mb-2 text-sm">Uploaded Assets ({assets.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {assets.map((asset) => (
                  <div key={asset.assetId} className="flex items-center justify-between bg-white p-2 rounded border-2 border-black">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xs font-medium truncate">{asset.filename}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <a
                        href={asset.azureUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Download size={14} strokeWidth={2.5} />
                      </a>
                      <button
                        onClick={() => handleDeleteAsset(asset.assetId)}
                        className="p-1 hover:bg-red-100 rounded text-red-600"
                      >
                        <Trash2 size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content Editor/Preview */}
          <div className="p-6">
            {showPreview ? (
              <div className="prose prose-sm max-w-none min-h-[500px]">
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
                  {content || '*No content yet. Start writing in edit mode.*'}
                </ReactMarkdown>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-bold mb-2">Content (Markdown)</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your notes in markdown...

# Heading 1
## Heading 2

**Bold text**
*Italic text*

- List item 1
- List item 2

```javascript
const code = 'example';
```"
                  className="w-full min-h-[500px] p-4 border-3 border-black rounded-lg font-mono text-sm resize-y"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Canvas Modal */}
      {showCanvas && (
        <div className="fixed inset-0 bg-black/80 z-[300] flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b-4 border-black">
              <h3 className="text-xl font-black">Draw on Canvas</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={insertCanvasImage}
                  className="px-4 py-2 bg-green-500 text-white border-3 border-black rounded-lg font-bold hover:bg-green-600 transition-all"
                >
                  Insert to Note
                </button>
                <button
                  onClick={() => setShowCanvas(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <ArrowLeft size={24} strokeWidth={2.5} />
                </button>
              </div>
            </div>
            <div className="flex-1">
              <ExcalidrawCanvas
                canvasId={`guide-note-${currentNoteId || 'temp'}`}
                onClose={() => setShowCanvas(false)}
                onSave={async (data) => { setCanvasData(data); }}
                initialData={canvasData}
                viewOnly={false}
                isPublic={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
