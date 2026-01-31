import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, Upload, Trash2, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import config, { buildUrl } from '../config/config';

interface Link {
  name: string;
  url: string;
}

interface Asset {
  id: string;
  file: File | null;
  filename: string;
  assetName: string;
  preview?: string;
  uploading?: boolean;
  deleting?: boolean;
}

interface CardAsset {
  id: string;
  file: File | null;
  preview?: string;
  uploading?: boolean;
  deleting?: boolean;
}

export default function CreateProject() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'metadata' | 'markdown'>('metadata');
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [footer, setFooter] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [links, setLinks] = useState<Link[]>([{ name: '', url: '' }]);
  const [mdContent, setMdContent] = useState('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [cardAssets, setCardAssets] = useState<CardAsset[]>([]);
  const [featured, setFeatured] = useState(true);

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

  const addAsset = () => {
    const newAsset: Asset = {
      id: Math.random().toString(36).substr(2, 9),
      file: null,
      filename: '',
      assetName: '',
    };
    setAssets([...assets, newAsset]);
  };

  const removeAsset = (id: string) => {
    setAssets(assets.filter(asset => asset.id !== id));
  };

  const updateAsset = (id: string, field: keyof Asset, value: any) => {
    setAssets(assets.map(asset => 
      asset.id === id ? { ...asset, [field]: value } : asset
    ));
  };

  const handleFileChange = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      updateAsset(id, 'file', file);
      updateAsset(id, 'filename', file.name);
      updateAsset(id, 'preview', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const addCardAsset = () => {
    const newCardAsset: CardAsset = {
      id: Math.random().toString(36).substr(2, 9),
      file: null,
    };
    setCardAssets([...cardAssets, newCardAsset]);
  };

  const removeCardAsset = (id: string) => {
    setCardAssets(cardAssets.filter(asset => asset.id !== id));
  };

  const handleCardFileChange = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setCardAssets(cardAssets.map(asset => 
        asset.id === id ? { ...asset, file, preview: reader.result as string } : asset
      ));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!title) {
      alert('Title is required');
      return;
    }

    setLoading(true);
    try {
      // 1. Create project with metadata
      const projectData = {
        projectId,
        title,
        tagline,
        footer,
        description,
        tags: techStack.split(',').map(t => t.trim()).filter(t => t),
        links: links.filter(l => l.name && l.url),
        assets: [],
        cardasset: [],
        mdFiles: [],
        featured
      };

      const createResponse = await fetch(config.api.endpoints.projectCreate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create project');
      }

      // 2. Upload assets if any
      const assetsWithFiles = assets.filter(a => a.file);
      if (assetsWithFiles.length > 0) {
        const formData = new FormData();
        const assetNames: string[] = [];
        
        assetsWithFiles.forEach(asset => {
          if (asset.file) {
            formData.append('assets', asset.file);
            assetNames.push(asset.assetName);
          }
        });
        
        formData.append('assetNames', JSON.stringify(assetNames));

        await fetch(config.api.endpoints.projectAssets(projectId!), {
          method: 'POST',
          body: formData
        });
      }

      // 3. Upload card assets if any
      const cardAssetsWithFiles = cardAssets.filter(ca => ca.file);
      if (cardAssetsWithFiles.length > 0) {
        const formData = new FormData();
        
        cardAssetsWithFiles.forEach(cardAsset => {
          if (cardAsset.file) {
            formData.append('cardassets', cardAsset.file);
          }
        });

        await fetch(config.api.endpoints.projectCardAssets(projectId!), {
          method: 'POST',
          body: formData
        });
      }

      // 4. Save MD file if content exists
      if (mdContent) {
        const mdBlob = new Blob([mdContent], { type: 'text/markdown' });
        const mdFormData = new FormData();
        mdFormData.append('mdFile', mdBlob, `${projectId}.md`);

        await fetch(config.api.endpoints.projectMdFile(projectId!), {
          method: 'POST',
          body: mdFormData
        });
      }

      alert('Project created successfully!');
      navigate('/projects');
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-y-auto bg-gray-50">
      <div className="p-6">
        <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="bg-white border-4 border-black rounded-2xl p-6 mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-black mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                Create New Project
              </h1>
              <p className="text-gray-600 font-medium">
                Project ID: <span className="font-black text-black">{projectId}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/projects')}
                className="flex items-center gap-2 px-5 py-3 bg-white border-3 border-black rounded-xl font-bold hover:bg-gray-50 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
              >
                <X className="w-5 h-5" strokeWidth={2.5} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-black text-white border-3 border-black rounded-xl font-bold hover:bg-gray-800 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" strokeWidth={2.5} />
                {loading ? 'Saving...' : 'Save Project'}
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
                {/* Basic Info Card */}
                <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <h2 className="text-2xl font-black text-black mb-6" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                    Basic Information
                  </h2>
              
              <div className="space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
                    placeholder="Enter project title"
                  />
                </div>

                {/* Tagline */}
                <div>
                  <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
                    placeholder="Short catchy tagline"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] resize-none"
                    placeholder="Project description"
                  />
                </div>

                {/* Tech Stack */}
                <div>
                  <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">
                    Tech Stack
                  </label>
                  <input
                    type="text"
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value)}
                    className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
                    placeholder="React, Node.js, MongoDB (comma separated)"
                  />
                </div>

                {/* Footer */}
                <div>
                  <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">
                    Footer
                  </label>
                  <input
                    type="text"
                    value={footer}
                    onChange={(e) => setFooter(e.target.value)}
                    className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
                    placeholder="Footer text"
                  />
                </div>

                {/* Featured Toggle */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="w-6 h-6 border-3 border-black rounded cursor-pointer accent-black"
                    />
                    <span className="text-sm font-black text-black uppercase tracking-wide">
                      Show on Homepage (Featured)
                    </span>
                  </label>
                  <p className="text-xs text-gray-600 font-medium mt-1 ml-9">
                    Enable this to display the project on your portfolio homepage
                  </p>
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
                      className="flex items-center gap-2 px-4 py-2 bg-blue-200 border-3 border-black rounded-xl font-bold hover:bg-blue-300 transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
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
                            placeholder="Link name (e.g., GitHub)"
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
                <p className="text-sm text-gray-600 font-medium mt-3">
                  Tip: Reference assets using their asset name in markdown
                </p>
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
                <button
                  onClick={addAsset}
                  className="flex items-center gap-2 px-4 py-2 bg-green-200 border-3 border-black rounded-xl font-bold hover:bg-green-300 transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Upload className="w-4 h-4" strokeWidth={2.5} />
                  Add
                </button>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {assets.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">No assets yet<br/>Click 'Add' to upload</p>
                ) : (
                  assets.map((asset) => (
                    <div key={asset.id} className="border-3 border-black rounded-xl p-2 bg-gray-50 space-y-2">
                      {/* File Upload */}
                      <label className="block">
                        <div className="w-full p-2 bg-yellow-200 border-2 border-black rounded-lg text-center font-bold text-xs cursor-pointer hover:bg-yellow-300">
                          Choose File
                        </div>
                        <input
                          type="file"
                          onChange={(e) => e.target.files && handleFileChange(asset.id, e.target.files[0])}
                          className="hidden"
                          accept="image/*"
                        />
                      </label>

                      {/* Preview */}
                      {asset.preview && (
                        <img src={asset.preview} alt="Preview" className="w-full h-24 object-cover rounded border-2 border-black" />
                      )}

                      {/* Filename (read-only) */}
                      <div>
                        <label className="block text-xs font-black text-black mb-1 uppercase text-[10px]">Filename</label>
                        <input
                          type="text"
                          value={asset.filename}
                          readOnly
                          className="w-full px-2 py-1 bg-gray-200 border-2 border-black rounded-lg text-xs font-medium"
                        />
                      </div>

                      {/* Asset Name (editable) */}
                      <div>
                        <label className="block text-xs font-black text-black mb-1 uppercase text-[10px]">Asset Name *</label>
                        <input
                          type="text"
                          value={asset.assetName}
                          onChange={(e) => updateAsset(asset.id, 'assetName', e.target.value)}
                          className="w-full px-2 py-1 bg-white border-2 border-black rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-black/20"
                          placeholder="e.g., hero-image"
                        />
                        <p className="text-[10px] text-gray-600 mt-1">Use: {`{{${asset.assetName || 'name'}}}`}</p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeAsset(asset.id)}
                        className="w-full flex items-center justify-center gap-1 p-1.5 bg-red-100 border-2 border-black rounded-lg hover:bg-red-200 font-bold text-xs"
                      >
                        <Trash2 className="w-3 h-3" strokeWidth={2.5} />
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Card Assets */}
            <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  Card Assets
                </h2>
                <button
                  onClick={addCardAsset}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-200 border-3 border-black rounded-xl font-bold hover:bg-purple-300 transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Upload className="w-4 h-4" strokeWidth={2.5} />
                  Add
                </button>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {cardAssets.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">No card assets yet<br/>Click 'Add' to upload</p>
                ) : (
                  cardAssets.map((cardAsset) => (
                    <div key={cardAsset.id} className="border-3 border-black rounded-xl p-2 bg-gray-50 space-y-2">
                      {/* File Upload */}
                      <label className="block">
                        <div className="w-full p-2 bg-purple-200 border-2 border-black rounded-lg text-center font-bold text-xs cursor-pointer hover:bg-purple-300">
                          Choose Image
                        </div>
                        <input
                          type="file"
                          onChange={(e) => e.target.files && handleCardFileChange(cardAsset.id, e.target.files[0])}
                          className="hidden"
                          accept="image/*"
                        />
                      </label>

                      {/* Preview */}
                      {cardAsset.preview && (
                        <img src={cardAsset.preview} alt="Card" className="w-full h-24 object-cover rounded border-2 border-black" />
                      )}

                      {/* Remove Button */}
                      <button
                        onClick={() => removeCardAsset(cardAsset.id)}
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
    </div>
  );}