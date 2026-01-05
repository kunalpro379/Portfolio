import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, Upload, Trash2, Link as LinkIcon } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';

interface BlogLink {
  platform: string;
  url: string;
}

interface Asset {
  id: string;
  file: File | null;
  filename: string;
  assetName: string;
  preview?: string;
}

export default function CreateBlog() {
  const { blogId } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'metadata' | 'markdown'>('metadata');
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [subject, setSubject] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [tags, setTags] = useState('');
  const [datetime, setDatetime] = useState(new Date().toISOString().split('T')[0]);
  const [footer, setFooter] = useState('');
  const [blogLinks, setBlogLinks] = useState<BlogLink[]>([{ platform: '', url: '' }]);
  const [mdContent, setMdContent] = useState('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');

  const addBlogLink = () => {
    setBlogLinks([...blogLinks, { platform: '', url: '' }]);
  };

  const removeBlogLink = (index: number) => {
    setBlogLinks(blogLinks.filter((_, i) => i !== index));
  };

  const updateBlogLink = (index: number, field: 'platform' | 'url', value: string) => {
    const newLinks = [...blogLinks];
    newLinks[index][field] = value;
    setBlogLinks(newLinks);
  };

  const addAsset = () => {
    const newAsset: Asset = {
      id: Math.random().toString(36).substring(2, 11),
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

  const handleCoverChange = (file: File) => {
    setCoverImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPreview(reader.result as string);
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
      // 1. Create blog with metadata
      const blogData = {
        blogId,
        title,
        tagline,
        subject,
        shortDescription,
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
        datetime,
        footer,
        blogLinks: blogLinks.filter(l => l.platform && l.url),
        assets: [],
        mdFiles: [],
        coverImage: ''
      };

      const createResponse = await fetch('http://localhost:5000/api/blogs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blogData)
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create blog');
      }

      // 2. Upload cover image if any
      if (coverImage) {
        const formData = new FormData();
        formData.append('cover', coverImage);

        await fetch(`http://localhost:5000/api/blogs/${blogId}/cover`, {
          method: 'POST',
          body: formData
        });
      }

      // 3. Upload assets if any
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

        await fetch(`http://localhost:5000/api/blogs/${blogId}/assets`, {
          method: 'POST',
          body: formData
        });
      }

      // 4. Save MD file if content exists
      if (mdContent) {
        const mdBlob = new Blob([mdContent], { type: 'text/markdown' });
        const mdFormData = new FormData();
        mdFormData.append('mdFile', mdBlob, `${blogId}.md`);

        await fetch(`http://localhost:5000/api/blogs/${blogId}/md-file`, {
          method: 'POST',
          body: mdFormData
        });
      }

      alert('Blog created successfully!');
      navigate('/blogs');
    } catch (error) {
      console.error('Error saving blog:', error);
      alert('Failed to save blog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="bg-white border-4 border-black rounded-2xl p-4 md:p-6 mb-4 md:mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-black mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                Create New Blog
              </h1>
              <p className="text-sm md:text-base text-gray-600 font-medium">
                Blog ID: <span className="font-black text-black">{blogId}</span>
              </p>
            </div>
            <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
              <button
                onClick={() => navigate('/blogs')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-5 py-2 md:py-3 bg-white border-3 border-black rounded-xl font-bold hover:bg-gray-50 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm md:text-base"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-black text-white border-3 border-black rounded-xl font-bold hover:bg-gray-800 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 text-sm md:text-base"
              >
                <Save className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
                {loading ? 'Saving...' : 'Save Blog'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          {/* Left Section */}
          <div className="lg:col-span-9 space-y-4 md:space-y-6 order-1">
            {/* Tabs */}
            <div className="bg-white border-4 border-black rounded-2xl p-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('metadata')}
                  className={`flex-1 px-4 md:px-6 py-2 md:py-3 rounded-xl font-black uppercase tracking-wide transition-all border-3 border-black text-xs md:text-base ${
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
                <div className="bg-white border-4 border-black rounded-2xl p-4 md:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <h2 className="text-xl md:text-2xl font-black text-black mb-4 md:mb-6" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
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
                        placeholder="Enter blog title"
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">Subject</label>
                        <input
                          type="text"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                          placeholder="e.g., DevOps, React"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">Date</label>
                        <input
                          type="date"
                          value={datetime}
                          onChange={(e) => setDatetime(e.target.value)}
                          className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">Short Description</label>
                      <textarea
                        value={shortDescription}
                        onChange={(e) => setShortDescription(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] resize-none"
                        placeholder="Brief description for preview"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">Tags</label>
                      <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                        placeholder="AWS, VPC, Networking (comma separated)"
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

                {/* Blog Links Card */}
                <div className="bg-white border-4 border-black rounded-2xl p-4 md:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-3">
                    <h2 className="text-xl md:text-2xl font-black text-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                      Blog Links
                    </h2>
                    <button
                      onClick={addBlogLink}
                      className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-200 border-3 border-black rounded-xl font-bold hover:bg-blue-300 transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-sm md:text-base whitespace-nowrap"
                    >
                      <LinkIcon className="w-4 h-4" strokeWidth={2.5} />
                      Add Link
                    </button>
                  </div>

                  <div className="space-y-4">
                    {blogLinks.map((link, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-3 items-start">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                          <input
                            type="text"
                            value={link.platform}
                            onChange={(e) => updateBlogLink(index, 'platform', e.target.value)}
                            className="px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                            placeholder="Platform (e.g., Medium, Dev.to)"
                          />
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => updateBlogLink(index, 'url', e.target.value)}
                            className="px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                            placeholder="URL"
                          />
                        </div>
                        {blogLinks.length > 1 && (
                          <button
                            onClick={() => removeBlogLink(index)}
                            className="p-2 md:p-3 bg-red-100 border-3 border-black rounded-xl hover:bg-red-200 transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] w-full sm:w-auto"
                          >
                            <Trash2 className="w-5 h-5 md:w-6 md:h-6 text-black mx-auto" strokeWidth={2.5} />
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
              <div className="bg-white border-4 border-black rounded-2xl p-4 md:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-xl md:text-2xl font-black text-black mb-4 md:mb-6" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
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

          {/* Right Section - Assets */}
          <div className="lg:col-span-3 flex flex-col gap-4 md:gap-6 order-2">
            {/* Cover Image */}
            <div className="bg-white border-4 border-black rounded-2xl p-4 md:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xl md:text-2xl font-black text-black mb-3 md:mb-4" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                Cover Image
              </h2>
              
              <label className="block">
                <div className="w-full p-3 md:p-4 bg-purple-200 border-3 border-black rounded-xl text-center font-bold cursor-pointer hover:bg-purple-300 transition text-sm md:text-base">
                  Choose Cover
                </div>
                <input
                  type="file"
                  onChange={(e) => e.target.files && handleCoverChange(e.target.files[0])}
                  className="hidden"
                  accept="image/*"
                />
              </label>

              {coverPreview && (
                <div className="mt-4">
                  <img src={coverPreview} alt="Cover" className="w-full h-40 object-cover rounded border-3 border-black" />
                  <button
                    onClick={() => {
                      setCoverImage(null);
                      setCoverPreview('');
                    }}
                    className="w-full mt-2 p-2 bg-red-100 border-2 border-black rounded-lg hover:bg-red-200 font-bold text-sm"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Assets */}
            <div className="bg-white border-4 border-black rounded-2xl p-4 md:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex-1 flex flex-col">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-3">
                <h2 className="text-xl md:text-2xl font-black text-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  Assets
                </h2>
                <button
                  onClick={addAsset}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 bg-green-200 border-3 border-black rounded-xl font-bold hover:bg-green-300 transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-sm md:text-base whitespace-nowrap"
                >
                  <Upload className="w-4 h-4" strokeWidth={2.5} />
                  Add
                </button>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {assets.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">No assets yet</p>
                ) : (
                  assets.map((asset) => (
                    <div key={asset.id} className="border-3 border-black rounded-xl p-2 bg-gray-50 space-y-2">
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

                      {asset.preview && (
                        <img src={asset.preview} alt="Preview" className="w-full h-24 object-cover rounded border-2 border-black" />
                      )}

                      <div>
                        <label className="block text-xs font-black text-black mb-1 uppercase text-[10px]">Filename</label>
                        <input
                          type="text"
                          value={asset.filename}
                          readOnly
                          className="w-full px-2 py-1 bg-gray-200 border-2 border-black rounded-lg text-xs font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-black mb-1 uppercase text-[10px]">Asset Name *</label>
                        <input
                          type="text"
                          value={asset.assetName}
                          onChange={(e) => updateAsset(asset.id, 'assetName', e.target.value)}
                          className="w-full px-2 py-1 bg-white border-2 border-black rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-black/20"
                          placeholder="e.g., diagram-1"
                        />
                        <p className="text-[10px] text-gray-600 mt-1">Use: {`{{${asset.assetName || 'name'}}}`}</p>
                      </div>

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
          </div>
        </div>
      </div>
    </div>
  );
}
