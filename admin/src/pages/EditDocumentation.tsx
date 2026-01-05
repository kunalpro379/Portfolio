import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';

export default function EditDocumentation() {
  const navigate = useNavigate();
  const { docId } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [assets, setAssets] = useState<Array<{ name: string; url: string }>>([]);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    tags: '',
    date: '',
    time: '',
    content: '',
    isPublic: false,
    assets: {} as Record<string, string> // assetName -> url mapping
  });

  useEffect(() => {
    fetchDoc();
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

      // Convert assets object to array for display
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

  const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        // Prompt for asset name
        const assetName = prompt(`Enter a name for "${file.name}" (use this as {{name}} in markdown):`,
          file.name.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '_')
        );

        if (!assetName) {
          continue; // Skip if user cancels
        }

        // Check if name already exists
        if (formData.assets[assetName]) {
          alert(`Asset name "${assetName}" already exists! Please use a different name.`);
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

          // Add to assets list
          setAssets(prev => [...prev, { name: assetName, url: data.url }]);

          // Add to formData assets mapping
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

  const insertAsset = (name: string) => {
    const placeholder = `![Alt text]({{${name}}})`;
    setFormData({ ...formData, content: formData.content + '\n' + placeholder + '\n' });
  };

  const deleteAsset = async (name: string) => {
    if (!confirm(`Delete asset "${name}"?`)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/documentation/asset/${docId}/${name}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Remove from local state
        setAssets(prev => prev.filter(asset => asset.name !== name));
        const newAssets = { ...formData.assets };
        delete newAssets[name];
        setFormData({ ...formData, assets: newAssets });
        alert('Asset deleted successfully');
      } else {
        alert('Failed to delete asset');
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
      alert('Error deleting asset');
    }
  };

  // Process content for preview - replace {{assetName}} with actual URLs
  const previewContent = (() => {
    let processedContent = formData.content;
    Object.entries(formData.assets).forEach(([name, url]) => {
      const placeholder = new RegExp(`\\(\\{\\{${name}\\}\\}\\)`, 'g');
      processedContent = processedContent.replace(placeholder, `(${url})`);
    });
    return processedContent;
  })();

  const handleEditorChange = (val: string | undefined) => {
    setFormData({ ...formData, content: val || '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.subject || !formData.content) {
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h1 className="text-2xl md:text-4xl font-black text-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              Edit Document
            </h1>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-blue-200 border-3 border-black rounded-xl font-bold hover:bg-blue-300 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 text-sm md:text-base"
            >
              <Save className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Split Layout - Stack on mobile */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side - Form */}
        <div className="w-full lg:w-[400px] max-h-[50vh] lg:max-h-none border-b-4 lg:border-b-0 lg:border-r-4 border-black bg-white p-4 md:p-6 overflow-y-auto">
          <div className="space-y-4 md:space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                placeholder="e.g., React Hooks Guide"
                required
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase">
                Subject *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                placeholder="e.g., React, JavaScript"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] resize-none"
                placeholder="Brief description..."
                rows={3}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                placeholder="e.g., react, hooks, tutorial"
              />
              <p className="text-xs text-gray-500 mt-1">Comma-separated tags</p>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-black text-black mb-2 uppercase">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-black mb-2 uppercase">
                  Time
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>
            </div>

            {/* Public Toggle */}
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
                  <p className="text-sm text-gray-600">Allow public viewing</p>
                </div>
              </label>
            </div>

            {/* Assets */}
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase">
                Assets
              </label>
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
                  <p className="text-xs font-bold text-gray-600 uppercase">Uploaded Assets:</p>
                  <div className="space-y-2">
                    {assets.map((asset, index) => (
                      <div
                        key={index}
                        className="relative group border-3 border-black rounded-lg overflow-hidden hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition bg-white"
                      >
                        <div className="flex items-center gap-3 p-3">
                          <img src={asset.url} alt={asset.name} className="w-16 h-16 object-cover rounded border-2 border-black" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-black truncate">
                              {`{{${asset.name}}}`}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{asset.url.split('/').pop()}</p>
                          </div>
                          <button
                            onClick={() => insertAsset(asset.name)}
                            className="p-2 hover:bg-gray-100 rounded transition"
                            title="Insert into content"
                          >
                            <ImageIcon className="w-5 h-5 text-gray-400 group-hover:text-black transition" strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={() => deleteAsset(asset.name)}
                            className="p-2 hover:bg-red-100 rounded transition"
                            title="Delete asset"
                          >
                            <Trash2 className="w-5 h-5 text-gray-400 hover:text-red-600 transition" strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Markdown Editor */}
        <div className="flex-1 overflow-hidden">
          <MDEditor
            value={previewContent}
            onChange={(val) => {
              // Reverse the replacement when editing
              let originalContent = val || '';
              Object.entries(formData.assets).forEach(([name, url]) => {
                const markdownImage = new RegExp(`!\\[${name}\\]\\(${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g');
                originalContent = originalContent.replace(markdownImage, `{{${name}}}`);
              });
              setFormData({ ...formData, content: originalContent });
            }}
            height="100%"
            preview="live"
            hideToolbar={false}
          />
        </div>
      </div>
    </div>
  );
}
