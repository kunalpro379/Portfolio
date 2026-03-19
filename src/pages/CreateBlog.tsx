import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, Upload, Trash2, Link as LinkIcon } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

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

const blogEndpoints = {
  create: `${API_BASE_URL}${API_ENDPOINTS.blogs}/create`,
  cover: (id: string) => `${API_BASE_URL}${API_ENDPOINTS.blogs}/${id}/cover`,
  assets: (id: string) => `${API_BASE_URL}${API_ENDPOINTS.blogs}/${id}/assets`,
  mdFile: (id: string) => `${API_BASE_URL}${API_ENDPOINTS.blogs}/${id}/md-file`
};

const sectionClass =
  'rounded-2xl border border-black/20 bg-white/85 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.12)]';

const inputClass =
  'w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm font-medium text-black placeholder:text-black/45 focus:border-black focus:outline-none';

export default function CreateBlog() {
  const { blogId: routeBlogId } = useParams();
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
  const [createdBlogId, setCreatedBlogId] = useState<string | null>(routeBlogId || null);

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

  const updateAsset = (id: string, field: keyof Asset, value: string | File | null) => {
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
      const blogData = {
        blogId: routeBlogId,
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

      const createResponse = await fetch(blogEndpoints.create, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blogData)
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create blog');
      }

      const createResult = await createResponse.json();
      const savedBlogId = createResult?.blog?.blogId || routeBlogId;

      if (!savedBlogId) {
        throw new Error('Blog ID was not returned by server');
      }

      setCreatedBlogId(savedBlogId);

      if (coverImage) {
        const formData = new FormData();
        formData.append('cover', coverImage);

        await fetch(blogEndpoints.cover(savedBlogId), {
          method: 'POST',
          body: formData
        });
      }

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

        await fetch(blogEndpoints.assets(savedBlogId), {
          method: 'POST',
          body: formData
        });
      }

      if (mdContent) {
        const mdBlob = new Blob([mdContent], { type: 'text/markdown' });
        const mdFormData = new FormData();
        mdFormData.append('mdFile', mdBlob, `${savedBlogId}.md`);

        await fetch(blogEndpoints.mdFile(savedBlogId), {
          method: 'POST',
          body: mdFormData
        });
      }

      alert('Blog created successfully!');
      navigate('/learnings?tab=blogs');
    } catch (error) {
      console.error('Error saving blog:', error);
      alert('Failed to save blog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 h-[calc(100vh-1rem)] px-4 py-4 md:px-8 md:py-6">
      <div className="mx-auto flex h-full max-w-7xl flex-col gap-6">
        <div className={`${sectionClass} p-5 md:p-6 shrink-0`}>
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-black md:text-3xl">Create New Blog</h1>
              <p className="mt-1 text-sm text-black/65">
                Blog ID: <span className="font-semibold text-black">{createdBlogId || 'Auto-generated on save'}</span>
              </p>
            </div>
            <div className="flex w-full gap-3 md:w-auto">
              <button
                onClick={() => navigate('/learnings?tab=blogs')}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-black/20 bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-black/5 md:flex-none"
              >
                <X className="h-4 w-4" strokeWidth={2} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-black bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-60 md:flex-none"
              >
                <Save className="h-4 w-4" strokeWidth={2} />
                {loading ? 'Saving...' : 'Save Blog'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="min-h-0 space-y-6 overflow-y-auto pr-1 lg:col-span-8">
            <div className={`${sectionClass} p-2`}>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveTab('metadata')}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    activeTab === 'metadata'
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-black/5'
                  }`}
                >
                  METADATA
                </button>
                <button
                  onClick={() => setActiveTab('markdown')}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    activeTab === 'markdown'
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-black/5'
                  }`}
                >
                  MARKDOWN
                </button>
              </div>
            </div>

            {activeTab === 'metadata' && (
              <>
                <div className={`${sectionClass} p-5 md:p-6`}>
                  <h2 className="text-lg font-semibold text-black md:text-xl">Basic Information</h2>
                  <div className="mt-5 space-y-4">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-black/70">Title *</label>
                      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Enter blog title" />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-black/70">Tagline</label>
                      <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} className={inputClass} placeholder="Short catchy tagline" />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-black/70">Subject</label>
                        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass} placeholder="e.g., DevOps, React" />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-black/70">Date</label>
                        <input type="date" value={datetime} onChange={(e) => setDatetime(e.target.value)} className={inputClass} />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-black/70">Short Description</label>
                      <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder="Brief description for preview" />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-black/70">Tags</label>
                      <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} placeholder="AWS, VPC, Networking (comma separated)" />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-black/70">Footer</label>
                      <input type="text" value={footer} onChange={(e) => setFooter(e.target.value)} className={inputClass} placeholder="Footer text" />
                    </div>
                  </div>
                </div>

                <div className={`${sectionClass} p-5 md:p-6`}>
                  <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <h2 className="text-lg font-semibold text-black md:text-xl">Blog Links</h2>
                    <button
                      onClick={addBlogLink}
                      className="inline-flex items-center gap-2 rounded-lg border border-black/25 bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-black/5"
                    >
                      <LinkIcon className="h-4 w-4" strokeWidth={2} />
                      Add Link
                    </button>
                  </div>

                  <div className="space-y-3">
                    {blogLinks.map((link, index) => (
                      <div key={index} className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]">
                        <input
                          type="text"
                          value={link.platform}
                          onChange={(e) => updateBlogLink(index, 'platform', e.target.value)}
                          className={inputClass}
                          placeholder="Platform (e.g., Medium, Dev.to)"
                        />
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => updateBlogLink(index, 'url', e.target.value)}
                          className={inputClass}
                          placeholder="URL"
                        />
                        {blogLinks.length > 1 && (
                          <button
                            onClick={() => removeBlogLink(index)}
                            className="inline-flex items-center justify-center rounded-xl border border-black/20 bg-white px-3 py-2 text-black transition hover:bg-black/5"
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={2} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'markdown' && (
              <div className={`${sectionClass} p-5 md:p-6`}>
                <h2 className="text-lg font-semibold text-black md:text-xl">Content Editor</h2>
                <p className="mt-1 text-sm text-black/60">Write clean markdown with live preview.</p>
                <div className="mt-4 overflow-hidden rounded-xl border border-black/20 bg-white shadow-[inset_0_1px_4px_rgba(0,0,0,0.08)]">
                  <div data-color-mode="light" className="bg-white">
                    <MDEditor
                      value={mdContent}
                      onChange={(val) => setMdContent(val || '')}
                      height={620}
                      preview="live"
                      textareaProps={{ placeholder: 'Start writing your blog content here...' }}
                    />
                  </div>
                </div>
                <p className="mt-3 text-xs text-black/60">Tip: Reference assets using their asset name in markdown.</p>
              </div>
            )}
          </div>

          <div className="min-h-0 space-y-6 overflow-y-auto pr-1 lg:col-span-4">
            <div className={`${sectionClass} p-5 md:p-6`}>
              <h2 className="text-lg font-semibold text-black md:text-xl">Cover Image</h2>
              <label className="mt-4 block">
                <div className="w-full cursor-pointer rounded-xl border border-black/25 bg-white px-4 py-3 text-center text-sm font-semibold text-black transition hover:bg-black/5">
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
                  <img src={coverPreview} alt="Cover" className="h-44 w-full rounded-xl border border-black/15 object-cover" />
                  <button
                    onClick={() => {
                      setCoverImage(null);
                      setCoverPreview('');
                    }}
                    className="mt-2 w-full rounded-lg border border-black/20 bg-white px-3 py-2 text-sm font-medium text-black transition hover:bg-black/5"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className={`${sectionClass} p-5 md:p-6`}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-black md:text-xl">Assets</h2>
                <button
                  onClick={addAsset}
                  className="inline-flex items-center gap-2 rounded-lg border border-black/25 bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-black/5"
                >
                  <Upload className="h-4 w-4" strokeWidth={2} />
                  Add
                </button>
              </div>

              <div className="max-h-[58vh] space-y-3 overflow-y-auto pr-1">
                {assets.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-black/20 bg-white/70 py-8 text-center text-sm text-black/55">No assets yet</p>
                ) : (
                  assets.map((asset) => (
                    <div key={asset.id} className="space-y-2 rounded-xl border border-black/15 bg-white p-3">
                      <label className="block">
                        <div className="w-full cursor-pointer rounded-lg border border-black/20 bg-white px-3 py-2 text-center text-xs font-semibold text-black transition hover:bg-black/5">
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
                        <img src={asset.preview} alt="Preview" className="h-24 w-full rounded-lg border border-black/10 object-cover" />
                      )}

                      <input type="text" value={asset.filename} readOnly className={`${inputClass} bg-black/5`} placeholder="Filename" />

                      <input
                        type="text"
                        value={asset.assetName}
                        onChange={(e) => updateAsset(asset.id, 'assetName', e.target.value)}
                        className={inputClass}
                        placeholder="Asset name (e.g., diagram-1)"
                      />

                      <button
                        onClick={() => removeAsset(asset.id)}
                        className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-black/20 bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-black/5"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
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
