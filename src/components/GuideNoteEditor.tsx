import { useState, useRef } from 'react';
import { X, Save, Upload, Image as ImageIcon, FileText, Trash2, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ExcalidrawCanvas from './ExcalidrawCanvas';

interface Asset {
  assetId: string;
  filename: string;
  fileType: string;
  size: number;
  azureUrl: string;
  uploadedAt: string;
}

interface GuideNoteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; topic: string; content: string; canvasData: any }) => Promise<void>;
  initialData?: {
    noteId?: string;
    title: string;
    topic: string;
    content: string;
    canvasData?: any;
    assets?: Asset[];
  };
  noteId?: string;
}

export default function GuideNoteEditor({ isOpen, onClose, onSave, initialData, noteId }: GuideNoteEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [topic, setTopic] = useState(initialData?.topic || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [canvasData, setCanvasData] = useState(initialData?.canvasData || null);
  const [assets, setAssets] = useState<Asset[]>(initialData?.assets || []);
  const [showCanvas, setShowCanvas] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!title.trim() || !topic.trim()) {
      alert('Title and topic are required');
      return;
    }

    await onSave({
      title: title.trim(),
      topic: topic.trim(),
      content,
      canvasData
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !noteId) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/guide-notes/${noteId}/assets`, {
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
    if (!noteId || !confirm('Delete this asset?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/guide-notes/${noteId}/assets/${assetId}`, {
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white border-4 border-black rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-4 border-black bg-gradient-to-r from-yellow-100 to-amber-100">
          <h2 className="text-2xl font-black">
            {initialData?.noteId ? 'Edit Guide Note' : 'Create Guide Note'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/10 rounded-lg transition-all"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Title & Topic */}
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

          {/* Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={!noteId || uploading}
              className="px-4 py-2 bg-blue-500 text-white border-3 border-black rounded-lg font-bold hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Upload size={18} strokeWidth={2.5} />
              {uploading ? 'Uploading...' : 'Upload File'}
            </button>
            <button
              onClick={() => setShowCanvas(true)}
              className="px-4 py-2 bg-purple-500 text-white border-3 border-black rounded-lg font-bold hover:bg-purple-600 transition-all flex items-center gap-2"
            >
              <ImageIcon size={18} strokeWidth={2.5} />
              Draw Canvas
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 bg-gray-500 text-white border-3 border-black rounded-lg font-bold hover:bg-gray-600 transition-all flex items-center gap-2"
            >
              <FileText size={18} strokeWidth={2.5} />
              {showPreview ? 'Edit' : 'Preview'}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt,.md"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Assets List */}
          {assets.length > 0 && (
            <div className="bg-gray-50 border-3 border-black rounded-lg p-4">
              <h3 className="font-bold mb-2">Uploaded Assets</h3>
              <div className="space-y-2">
                {assets.map((asset) => (
                  <div key={asset.assetId} className="flex items-center justify-between bg-white p-2 rounded border-2 border-black">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText size={16} strokeWidth={2.5} />
                      <span className="text-sm font-medium truncate">{asset.filename}</span>
                      <span className="text-xs text-gray-500">({(asset.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={asset.azureUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Download size={16} strokeWidth={2.5} />
                      </a>
                      <button
                        onClick={() => handleDeleteAsset(asset.assetId)}
                        className="p-1 hover:bg-red-100 rounded text-red-600"
                      >
                        <Trash2 size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content Editor/Preview */}
          <div>
            <label className="block text-sm font-bold mb-2">Content (Markdown)</label>
            {showPreview ? (
              <div className="w-full min-h-[400px] p-4 border-3 border-black rounded-lg bg-white prose prose-sm max-w-none">
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
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your notes in markdown..."
                className="w-full min-h-[400px] p-4 border-3 border-black rounded-lg font-mono text-sm resize-y"
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t-4 border-black bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 border-3 border-black rounded-lg font-bold hover:bg-gray-300 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-black text-white border-3 border-black rounded-lg font-bold hover:bg-gray-800 transition-all flex items-center gap-2"
          >
            <Save size={18} strokeWidth={2.5} />
            Save Note
          </button>
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
                  <X size={24} strokeWidth={2.5} />
                </button>
              </div>
            </div>
            <div className="flex-1">
              <ExcalidrawCanvas
                canvasId={`guide-note-${noteId || 'temp'}`}
                onClose={() => setShowCanvas(false)}
                onSave={async (data) => { setCanvasData(data); }}
                initialData={canvasData}
                viewOnly={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
