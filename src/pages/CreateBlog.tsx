import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, Upload, Trash2, Link as LinkIcon, Maximize2, Minimize2 } from 'lucide-react';
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
  'border border-slate-200 bg-white';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none transition-colors';

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
  const [isMarkdownFullscreen, setIsMarkdownFullscreen] = useState(false);

  useEffect(() => {
    if (!isMarkdownFullscreen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMarkdownFullscreen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMarkdownFullscreen]);

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
    <div className="relative z-10 h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#f8fafc_0%,#eef2ff_45%,#f8fafc_100%)] text-slate-900">
      <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      <div className="relative z-10 flex h-full flex-col gap-3 px-3 py-3 md:px-6 md:py-5">
        <header className="shrink-0 border border-slate-200 bg-white/90 px-4 py-4 shadow-sm backdrop-blur md:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Create New Blog</h1>
              <p className="mt-1 text-sm text-slate-500">
                Blog ID: <span className="font-semibold text-slate-900">{createdBlogId || 'Auto-generated on save'}</span>
              </p>
            </div>

            <div className="flex w-full gap-3 lg:w-auto">
              <button
                onClick={() => navigate('/learnings?tab=blogs')}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 lg:flex-none"
              >
                <X className="h-4 w-4" strokeWidth={2} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-900 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 lg:flex-none"
              >
                <Save className="h-4 w-4" strokeWidth={2} />
                {loading ? 'Saving...' : 'Save Blog'}
              </button>
            </div>
          </div>
        </header>

        <div className="lg:hidden border border-slate-200 bg-white/90 p-1 shadow-sm backdrop-blur">
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('metadata')}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${activeTab === 'metadata' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
            >
              METADATA
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('markdown')}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${activeTab === 'markdown' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
            >
              MARKDOWN
            </button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(360px,420px)_minmax(0,1fr)]">
          <aside className={`min-h-0 overflow-y-auto pr-1 ${activeTab === 'markdown' ? 'hidden lg:block' : ''}`}>
            <div className="space-y-3">
              <section className={`${sectionClass} p-5 md:p-6`}>
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <h2 className="text-lg font-semibold text-slate-900 md:text-xl">Basic Information</h2>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Metadata</span>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Title *</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Enter blog title" />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Tagline</label>
                    <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} className={inputClass} placeholder="Short catchy tagline" />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Subject</label>
                      <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass} placeholder="e.g., DevOps, React" />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Date</label>
                      <input type="date" value={datetime} onChange={(e) => setDatetime(e.target.value)} className={inputClass} />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Short Description</label>
                    <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder="Brief description for preview" />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Tags</label>
                    <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} placeholder="AWS, VPC, Networking (comma separated)" />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Footer</label>
                    <input type="text" value={footer} onChange={(e) => setFooter(e.target.value)} className={inputClass} placeholder="Footer text" />
                  </div>
                </div>
              </section>

              <section className={`${sectionClass} p-5 md:p-6`}>
                <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <h2 className="text-lg font-semibold text-slate-900 md:text-xl">Blog Links</h2>
                  <button
                    type="button"
                    onClick={addBlogLink}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
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
                          type="button"
                          onClick={() => removeBlogLink(index)}
                          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={2} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section className={`${sectionClass} p-5 md:p-6`}>
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <h2 className="text-lg font-semibold text-slate-900 md:text-xl">Cover Image</h2>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Preview</span>
                </div>
                <label className="mt-4 block">
                  <div className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
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
                    <img src={coverPreview} alt="Cover" className="h-44 w-full rounded-xl border border-slate-200 object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverImage(null);
                        setCoverPreview('');
                      }}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </section>

              <section className={`${sectionClass} p-5 md:p-6`}>
                <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <h2 className="text-lg font-semibold text-slate-900 md:text-xl">Assets</h2>
                  <button
                    type="button"
                    onClick={addAsset}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <Upload className="h-4 w-4" strokeWidth={2} />
                    Add
                  </button>
                </div>

                <div className="space-y-3">
                  {assets.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500">No assets yet</p>
                  ) : (
                    assets.map((asset) => (
                      <div key={asset.id} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                        <label className="block">
                          <div className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50">
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
                          <img src={asset.preview} alt="Preview" className="h-28 w-full rounded-xl border border-slate-200 object-cover" />
                        )}

                        <input type="text" value={asset.filename} readOnly className={`${inputClass} bg-slate-100`} placeholder="Filename" />

                        <input
                          type="text"
                          value={asset.assetName}
                          onChange={(e) => updateAsset(asset.id, 'assetName', e.target.value)}
                          className={inputClass}
                          placeholder="Asset name (e.g., diagram-1)"
                        />

                        <button
                          type="button"
                          onClick={() => removeAsset(asset.id)}
                          className="inline-flex w-full items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </aside>

          <section className={`min-h-0 overflow-y-auto pr-1 ${activeTab === 'metadata' ? 'hidden lg:block' : ''}`}>
            <div className={`${sectionClass} flex min-h-full flex-col p-5 md:p-6`}>
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 md:text-xl">Content Editor</h2>
                  <p className="mt-1 text-sm text-slate-500">Write clean markdown with live preview.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMarkdownFullscreen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <Maximize2 className="h-4 w-4" />
                  Full Screen
                </button>
              </div>

              <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div data-color-mode="light" className="min-h-0 flex-1 bg-white">
                  <MDEditor
                    value={mdContent}
                    onChange={(val) => setMdContent(val || '')}
                    height={Math.max(680, window.innerHeight - 280)}
                    preview="live"
                    textareaProps={{ placeholder: 'Start writing your blog content here...' }}
                  />
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-500">Tip: Reference assets using their asset name in markdown.</p>
            </div>
          </section>
        </div>
      </div>

      {isMarkdownFullscreen && (
        <div className="fixed inset-0 z-[500] bg-white">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-black/10 px-4 py-3 md:px-6">
              <h2 className="text-base font-semibold text-black md:text-lg">Markdown Editor</h2>
              <button
                type="button"
                onClick={() => setIsMarkdownFullscreen(false)}
                className="inline-flex items-center gap-2 rounded-lg border border-black/20 bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-black/5"
              >
                <Minimize2 className="h-4 w-4" />
                Exit Full Screen
              </button>
            </div>

            <div className="flex-1 overflow-hidden bg-white p-3 md:p-5" data-color-mode="light">
              <MDEditor
                value={mdContent}
                onChange={(val) => setMdContent(val || '')}
                height={window.innerHeight - 110}
                preview="live"
                textareaProps={{ placeholder: 'Start writing your blog content here...' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
