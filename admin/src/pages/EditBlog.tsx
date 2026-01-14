import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, Upload, Trash2, Link as LinkIcon } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import config from '../config/config';

interface BlogLink {
  platform: string;
  url: string;
}

interface Asset {
  name: string;
  url: string;
  filename: string;
}

export default function EditBlog() {
  const { blogId } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'metadata' | 'markdown'>('metadata');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [subject, setSubject] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [tags, setTags] = useState('');
  const [datetime, setDatetime] = useState('');
  const [footer, setFooter] = useState('');
  const [blogLinks, setBlogLinks] = useState<BlogLink[]>([{ platform: '', url: '' }]);
  const [mdContent, setMdContent] = useState('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [coverImage, setCoverImage] = useState('');

  useEffect(() => {
    fetchBlog();
  }, [blogId]);

  const fetchBlog = async () => {
    try {
      const response = await fetch(`${config.api.baseUrl}/api/blogs/${blogId}`);
      const data = await response.json();
      const blog = data.blog;

      setTitle(blog.title || '');
      setTagline(blog.tagline || '');
      setSubject(blog.subject || '');
      setShortDescription(blog.shortDescription || '');
      setTags(blog.tags?.join(', ') || '');
      setDatetime(blog.datetime ? new Date(blog.datetime).toISOString().split('T')[0] : '');
      setFooter(blog.footer || '');
      setBlogLinks(blog.blogLinks?.length > 0 ? blog.blogLinks : [{ platform: '', url: '' }]);
      setAssets(blog.assets || []);
      setCoverImage(blog.coverImage || '');

      // Fetch MD content if exists
      if (blog.mdFiles && blog.mdFiles.length > 0) {
        const mdResponse = await fetch(`${config.api.baseUrl}/api/blogs/${blogId}/md-content`);
        const mdData = await mdResponse.json();
        if (mdData.exists) {
          setMdContent(mdData.content);
        }
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSave = async () => {
    setUploading(true);
    try {
      // Update blog metadata
      const updateData = {
        title,
        tagline,
        subject,
        shortDescription,
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
        datetime,
        footer,
        blogLinks: blogLinks.filter(l => l.platform && l.url)
      };

      await fetch(`${config.api.baseUrl}/api/blogs/${blogId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      // Save MD file if content exists
      if (mdContent) {
        let processedContent = mdContent;
        assets.forEach(asset => {
          if (typeof asset !== 'string' && asset.name) {
            const escapedName = asset.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const placeholder = new RegExp(`\\{\\{${escapedName}\\}\\}`, 'g');
            processedContent = processedContent.replace(placeholder, asset.url);
          }
        });

        const mdBlob = new Blob([processedContent], { type: 'text/markdown' });
        const mdFormData = new FormData();
        mdFormData.append('mdFile', mdBlob, `${blogId}.md`);

        await fetch(`${config.api.baseUrl}/api/blogs/${blogId}/md-file`, {
          method: 'POST',
          body: mdFormData
        });
      }

      alert('Blog updated successfully!');
      navigate('/blogs');
    } catch (error) {
      console.error('Error saving blog:', error);
      alert('Failed to save blog');
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

      const response = await fetch(`${config.api.baseUrl}/api/blogs/${blogId}/assets`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setAssets(data.blog.assets);
      }
    } catch (error) {
      console.error('Error uploading assets:', error);
    } finally {
      setUploading(false);
    }
  };

  const uploadCover = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('cover', file);

      const response = await fetch(`${config.api.baseUrl}/api/blogs/${blogId}/cover`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setCoverImage(data.url);
      }
    } catch (error) {
      console.error('Error uploading cover:', error);
    } finally {
      setUploading(false);
    }
  };

  const deleteAsset = async (index: number) => {
    if (!confirm('Delete this asset?')) return;

    try {
      const response = await fetch(`${config.api.baseUrl}/api/blogs/${blogId}/assets/${index}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const data = await response.json();
        setAssets(data.blog.assets);
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  };

  const updateAssetName = async (index: number, newName: string) => {
    try {
      const response = await fetch(`${config.api.baseUrl}/api/blogs/${blogId}/assets/${index}/name`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });

      if (response.ok) {
        const data = await response.json();
        setAssets(data.blog.assets);
      }
    } catch (error) {
      console.error('Error updating asset name:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-2xl font-black">Loading blog...</p>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto bg-gray-50">
      <div className="p-4 md:p-6">
        {uploading && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-blue-500 text-white text-center py-3 font-bold">
            Uploading... Please wait
          </div>
        )}

        <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="bg-white border-4 border-black rounded-2xl p-4 md:p-6 mb-4 md:mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-black mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                Edit Blog
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
                disabled={uploading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-black text-white border-3 border-black rounded-xl font-bold hover:bg-gray-800 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 text-sm md:text-base"
              >
                <Save className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
                Save Changes
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
                  className={`flex-1 px-4 md:px-6 py-2 md:py-3 rounded-xl font-black uppercase tracking-wide transition-all border-3 border-black text-xs md:text-base ${
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
                            placeholder="Platform"
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
                <div className="mt-4 p-4 bg-yellow-50 border-3 border-black rounded-xl">
                  <p className="text-sm font-black text-black mb-2 uppercase">How to use assets:</p>
                  <ol className="text-sm text-gray-700 space-y-1 ml-4 list-decimal">
                    <li>Upload assets in the right panel</li>
                    <li>Give each asset a unique name (e.g., "diagram-1")</li>
                    <li>Use {`{{asset-name}}`} in markdown: {`![Alt]({{diagram-1}})`}</li>
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

          {/* Right Section - Assets */}
          <div className="lg:col-span-3 flex flex-col gap-4 md:gap-6 order-2">
            {/* Cover Image */}
            <div className="bg-white border-4 border-black rounded-2xl p-4 md:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xl md:text-2xl font-black text-black mb-3 md:mb-4" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                Cover Image
              </h2>
              
              <label className="block">
                <div className="w-full p-3 md:p-4 bg-purple-200 border-3 border-black rounded-xl text-center font-bold cursor-pointer hover:bg-purple-300 transition text-sm md:text-base">
                  {coverImage ? 'Change Cover' : 'Upload Cover'}
                </div>
                <input
                  type="file"
                  onChange={(e) => e.target.files && uploadCover(e.target.files[0])}
                  className="hidden"
                  accept="image/*"
                />
              </label>

              {coverImage && (
                <div className="mt-4">
                  <img src={coverImage} alt="Cover" className="w-full h-40 object-cover rounded border-3 border-black" />
                </div>
              )}
            </div>

            {/* Assets */}
            <div className="bg-white border-4 border-black rounded-2xl p-4 md:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex-1 flex flex-col">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-3">
                <h2 className="text-xl md:text-2xl font-black text-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  Assets
                </h2>
                <label className="flex items-center gap-2 px-3 md:px-4 py-2 bg-green-200 border-3 border-black rounded-xl font-bold hover:bg-green-300 transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-sm md:text-base whitespace-nowrap">
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
                    const assetUrl = typeof asset === 'string' ? asset : asset.url;
                    const assetName = typeof asset === 'string' ? '' : asset.name;
                    const assetFilename = typeof asset === 'string' ? '' : asset.filename;

                    return (
                      <div key={index} className="border-3 border-black rounded-xl p-2 bg-gray-50 space-y-2">
                        <img src={assetUrl} alt="Asset" className="w-full h-24 object-cover rounded border-2 border-black" />
                        
                        <div>
                          <label className="block text-xs font-black text-black mb-1 uppercase text-[10px]">Filename</label>
                          <input
                            type="text"
                            value={assetFilename}
                            readOnly
                            className="w-full px-2 py-1 bg-gray-200 border-2 border-black rounded-lg text-xs font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-black text-black mb-1 uppercase text-[10px]">Asset Name *</label>
                          <input
                            type="text"
                            value={assetName}
                            onChange={(e) => updateAssetName(index, e.target.value)}
                            className="w-full px-2 py-1 bg-white border-2 border-black rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-black/20"
                            placeholder="e.g., diagram-1"
                          />
                          <p className="text-[10px] text-gray-600 mt-1">Use: {`{{${assetName || 'name'}}}`}</p>
                        </div>

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
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
