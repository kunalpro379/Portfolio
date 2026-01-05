import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, Upload, Trash2, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';

interface Link {
  name: string;
  url: string;
}

interface Asset {
  name: string;
  url: string;
  filename: string;
}

export default function EditProject() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'metadata' | 'markdown'>('metadata');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Project data
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [footer, setFooter] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [links, setLinks] = useState<Link[]>([{ name: '', url: '' }]);
  const [mdContent, setMdContent] = useState('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [cardAssets, setCardAssets] = useState<string[]>([]);

  // Compute preview markdown with replaced asset URLs
  const getPreviewMarkdown = () => {
    let preview = mdContent;
    assets.forEach(asset => {
      if (typeof asset !== 'string' && asset.name && asset.url) {
        // Escape special regex characters in asset name
        const escapedName = asset.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const placeholder = new RegExp(`\\{\\{${escapedName}\\}\\}`, 'g');
        preview = preview.replace(placeholder, asset.url);
      }
    });
    return preview;
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}`);
      const data = await response.json();
      const project = data.project;

      setTitle(project.title || '');
      setTagline(project.tagline || '');
      setFooter(project.footer || '');
      setDescription(project.description || '');
      setTechStack(project.tags?.join(', ') || '');
      setLinks(project.links?.length > 0 ? project.links : [{ name: '', url: '' }]);
      setAssets(project.assets || []);
      setCardAssets(project.cardasset || []);

      // Fetch MD content if exists
      if (project.mdFiles && project.mdFiles.length > 0) {
        const mdResponse = await fetch(`http://localhost:5000/api/projects/${projectId}/md-content`);
        const mdData = await mdResponse.json();
        if (mdData.exists) {
          setMdContent(mdData.content);
        }
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLink = () => {
    setLinks([...links, { name: '', url: '' }]);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: 'name' | 'url', value: string) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const handleSave = async () => {
    setUploading(true);
    try {
      // Update project metadata
      const updateData = {
        title,
        tagline,
        footer,
        description,
        tags: techStack.split(',').map(t => t.trim()).filter(t => t),
        links: links.filter(l => l.name && l.url)
      };

      await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      // Save MD file if content exists
      if (mdContent) {
        // Replace asset placeholders with actual URLs
        let processedContent = mdContent;
        assets.forEach(asset => {
          if (typeof asset !== 'string' && asset.name) {
            // Escape special regex characters in asset name
            const escapedName = asset.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // Replace {{asset-name}} with just the URL
            const placeholder = new RegExp(`\\{\\{${escapedName}\\}\\}`, 'g');
            processedContent = processedContent.replace(placeholder, asset.url);
          }
        });

        const mdBlob = new Blob([processedContent], { type: 'text/markdown' });
        const mdFormData = new FormData();
        mdFormData.append('mdFile', mdBlob, `${projectId}.md`);

        await fetch(`http://localhost:5000/api/projects/${projectId}/md-file`, {
          method: 'POST',
          body: mdFormData
        });
      }

      alert('Project updated successfully!');
      navigate('/projects');
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project');
    } finally {
      setUploading(false);
    }
  };

  const uploadAssets = async (files: FileList) => {
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('assets', file);
      });

      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/assets`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setAssets(data.project.assets);
      }
    } catch (error) {
      console.error('Error uploading assets:', error);
    } finally {
      setUploading(false);
    }
  };

  const uploadCardAssets = async (files: FileList) => {
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('cardassets', file);
      });

      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/cardassets`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setCardAssets(data.project.cardasset);
      }
    } catch (error) {
      console.error('Error uploading card assets:', error);
    } finally {
      setUploading(false);
    }
  };

  const deleteAsset = async (index: number) => {
    if (!confirm('Delete this asset?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/assets/${index}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const data = await response.json();
        setAssets(data.project.assets);
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  };

  const updateAssetName = async (index: number, newName: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/assets/${index}/name`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });

      if (response.ok) {
        const data = await response.json();
        setAssets(data.project.assets);
      }
    } catch (error) {
      console.error('Error updating asset name:', error);
    }
  };

  const deleteCardAsset = async (index: number) => {
    if (!confirm('Delete this card asset?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/cardassets/${index}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const data = await response.json();
        setCardAssets(data.project.cardasset);
      }
    } catch (error) {
      console.error('Error deleting card asset:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-2xl font-black">Loading project...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {uploading && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-500 text-white text-center py-3 font-bold">
          Uploading... Please wait
        </div>
      )}

      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="bg-white border-4 border-black rounded-2xl p-6 mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-black mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                Edit Project
              </h1>
              <p className="text-gray-600 font-medium">
                Project ID: <span className="font-black text-black">{projectId}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/projects')}
                className="flex items-center gap-2 px-5 py-3 bg-white border-3 border-black rounded-xl font-bold hover:bg-gray-50 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <X className="w-5 h-5" strokeWidth={2.5} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={uploading}
                className="flex items-center gap-2 px-6 py-3 bg-black text-white border-3 border-black rounded-xl font-bold hover:bg-gray-800 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
              >
                <Save className="w-5 h-5" strokeWidth={2.5} />
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Section */}
          <div className="col-span-9 space-y-6">
            {/* Tabs */}
            <div className="bg-white border-4 border-black rounded-2xl p-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('metadata')}
                  className={`flex-1 px-6 py-3 rounded-xl font-black uppercase tracking-wide transition-all border-3 border-black ${
                    activeTab === 'metadata'
                      ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]'
                      : 'bg-white text-black hover:bg-gray-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  METADATA
                </button>
                <button
                  onClick={() => setActiveTab('markdown')}
                  className={`flex-1 px-6 py-3 rounded-xl font-black uppercase tracking-wide transition-all border-3 border-black ${
                    activeTab === 'markdown'
                      ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]'
                      : 'bg-white text-black hover:bg-gray-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  MARKDOWN
                </button>
              </div>
            </div>

            {/* Metadata Tab */}
            {activeTab === 'metadata' && (
              <>
                {/* Basic Info Card - Same as CreateProject */}
                <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <h2 className="text-2xl font-black text-black mb-6" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                    Basic Information
                  </h2>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">Title *</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                        placeholder="Enter project title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">Tagline</label>
                      <input
                        type="text"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                        placeholder="Short catchy tagline"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] resize-none"
                        placeholder="Project description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">Tech Stack</label>
                      <input
                        type="text"
                        value={techStack}
                        onChange={(e) => setTechStack(e.target.value)}
                        className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                        placeholder="React, Node.js, MongoDB (comma separated)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">Footer</label>
                      <input
                        type="text"
                        value={footer}
                        onChange={(e) => setFooter(e.target.value)}
                        className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                        placeholder="Footer text"
                      />
                    </div>
                  </div>
                </div>

                {/* Links Card */}
                <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                      Links
                    </h2>
                    <button
                      onClick={addLink}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-200 border-3 border-black rounded-xl font-bold hover:bg-blue-300 transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <LinkIcon className="w-4 h-4" strokeWidth={2.5} />
                      Add Link
                    </button>
                  </div>

                  <div className="space-y-4">
                    {links.map((link, index) => (
                      <div key={index} className="flex gap-3 items-start">
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={link.name}
                            onChange={(e) => updateLink(index, 'name', e.target.value)}
                            className="px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                            placeholder="Link name"
                          />
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => updateLink(index, 'url', e.target.value)}
                            className="px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                            placeholder="URL"
                          />
                        </div>
                        {links.length > 1 && (
                          <button
                            onClick={() => removeLink(index)}
                            className="p-3 bg-red-100 border-3 border-black rounded-xl hover:bg-red-200 transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                          >
                            <Trash2 className="w-5 h-5 text-black" strokeWidth={2.5} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Markdown Tab */}
            {activeTab === 'markdown' && (
              <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-2xl font-black text-black mb-6" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  Content Editor
                </h2>
                <div className="border-3 border-black rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <MDEditor
                    value={mdContent}
                    onChange={(val) => setMdContent(val || '')}
                    height={600}
                    preview="live"
                  />
                </div>
                <div className="mt-4 p-4 bg-yellow-50 border-3 border-black rounded-xl">
                  <p className="text-sm font-black text-black mb-2 uppercase">How to use assets:</p>
                  <ol className="text-sm text-gray-700 space-y-1 ml-4 list-decimal">
                    <li>Upload assets in the right panel</li>
                    <li>Give each asset a unique name (e.g., "hero-image")</li>
                    <li>Use {`{{asset-name}}`} in markdown: {`![Alt]({{hero-image}})`}</li>
                    <li>Placeholders will be replaced with actual URLs when you save</li>
                  </ol>
                  {assets.length > 0 && (
                    <div className="mt-3 pt-3 border-t-2 border-black">
                      <p className="text-xs font-black text-black mb-2">Available Assets:</p>
                      <div className="flex flex-wrap gap-2">
                        {assets.map((asset, idx) => {
                          const assetName = typeof asset === 'string' ? '' : asset.name;
                          return assetName ? (
                            <code key={idx} className="px-2 py-1 bg-white border-2 border-black rounded text-xs font-mono">
                              {`{{${assetName}}}`}
                            </code>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Section - Assets (25%) */}
          <div className="col-span-3 flex flex-col gap-6">
            {/* Assets */}
            <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  Assets
                </h2>
                <label className="flex items-center gap-2 px-4 py-2 bg-green-200 border-3 border-black rounded-xl font-bold hover:bg-green-300 transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer">
                  <Upload className="w-4 h-4" strokeWidth={2.5} />
                  Add
                  <input
                    type="file"
                    multiple
                    onChange={(e) => e.target.files && uploadAssets(e.target.files)}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {assets.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">No assets yet</p>
                ) : (
                  assets.map((asset, index) => {
                    // Handle both old format (string) and new format (object)
                    const assetUrl = typeof asset === 'string' ? asset : asset.url;
                    const assetName = typeof asset === 'string' ? '' : asset.name;
                    const assetFilename = typeof asset === 'string' ? '' : asset.filename;

                    return (
                      <div key={index} className="border-3 border-black rounded-xl p-2 bg-gray-50 space-y-2">
                        {/* Image Preview */}
                        <img src={assetUrl} alt="Asset" className="w-full h-24 object-cover rounded border-2 border-black" />
                        
                        {/* Filename (read-only) */}
                        <div>
                          <label className="block text-xs font-black text-black mb-1 uppercase text-[10px]">Filename</label>
                          <input
                            type="text"
                            value={assetFilename}
                            readOnly
                            className="w-full px-2 py-1 bg-gray-200 border-2 border-black rounded-lg text-xs font-medium"
                          />
                        </div>

                        {/* Asset Name (editable) */}
                        <div>
                          <label className="block text-xs font-black text-black mb-1 uppercase text-[10px]">Asset Name *</label>
                          <input
                            type="text"
                            value={assetName}
                            onChange={(e) => updateAssetName(index, e.target.value)}
                            className="w-full px-2 py-1 bg-white border-2 border-black rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-black/20"
                            placeholder="e.g., hero-image"
                          />
                          <p className="text-[10px] text-gray-600 mt-1">Use: {`{{${assetName || 'name'}}}`}</p>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => deleteAsset(index)}
                          className="w-full flex items-center justify-center gap-1 p-1.5 bg-red-100 border-2 border-black rounded-lg hover:bg-red-200 font-bold text-xs"
                        >
                          <Trash2 className="w-3 h-3" strokeWidth={2.5} />
                          Delete
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Card Assets */}
            <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  Card Assets
                </h2>
                <label className="flex items-center gap-2 px-4 py-2 bg-purple-200 border-3 border-black rounded-xl font-bold hover:bg-purple-300 transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer">
                  <Upload className="w-4 h-4" strokeWidth={2.5} />
                  Add
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && uploadCardAssets(e.target.files)}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {cardAssets.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">No card assets yet</p>
                ) : (
                  cardAssets.map((url, index) => (
                    <div key={index} className="border-3 border-black rounded-xl p-2 bg-gray-50">
                      <img src={url} alt="Card" className="w-full h-24 object-cover rounded border-2 border-black mb-2" />
                      <button
                        onClick={() => deleteCardAsset(index)}
                        className="w-full p-1.5 bg-red-100 border-2 border-black rounded-lg hover:bg-red-200 font-bold text-xs"
                      >
                        <Trash2 className="w-3 h-3 inline mr-1" strokeWidth={2.5} />
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
