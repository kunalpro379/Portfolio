import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Edit, Trash2, Calendar, Tag } from 'lucide-react';

interface Blog {
  _id: string;
  blogId: string;
  title: string;
  slug: string;
  tagline: string;
  subject: string;
  shortDescription: string;
  tags: string[];
  datetime: string;
  coverImage: string;
  created_at: string;
}

export default function Blogs() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBlogId, setNewBlogId] = useState('');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch('https://api.kunalpatil.me/api/blogs');
      const data = await response.json();
      setBlogs(data.blogs);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBlog = async (blogId: string) => {
    if (!confirm('Delete this blog? This will remove all associated files from Azure.')) return;

    try {
      const response = await fetch(`https://api.kunalpatil.me/api/blogs/${blogId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchBlogs();
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };

  const handleCreateBlog = () => {
    if (!newBlogId.trim()) {
      alert('Please enter a blog ID');
      return;
    }
    navigate(`/blogs/create/${newBlogId}`);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl font-black">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-black mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              Blogs
            </h1>
            <p className="text-gray-600 font-medium">Manage your blog posts</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-green-200 border-3 border-black rounded-xl font-bold hover:bg-green-300 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
            New Blog
          </button>
        </div>

        {/* Blogs Grid */}
        {blogs.length === 0 ? (
          <div className="bg-white border-4 border-black rounded-2xl p-12 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" strokeWidth={2} />
            <h3 className="text-2xl font-black text-black mb-2">No blogs yet</h3>
            <p className="text-gray-600 mb-6">Create your first blog post to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-green-200 border-3 border-black rounded-xl font-bold hover:bg-green-300 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              Create Blog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                className="bg-white border-4 border-black rounded-2xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition"
              >
                {/* Cover Image */}
                {blog.coverImage && (
                  <div className="h-48 border-b-4 border-black overflow-hidden">
                    <img 
                      src={blog.coverImage} 
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  {/* Subject Badge */}
                  {blog.subject && (
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-4 h-4 text-gray-600" strokeWidth={2.5} />
                      <span className="text-xs font-bold px-3 py-1 bg-yellow-200 border-2 border-black rounded-lg">
                        {blog.subject}
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="text-xl font-black text-black mb-2 line-clamp-2">
                    {blog.title}
                  </h3>

                  {/* Tagline */}
                  {blog.tagline && (
                    <p className="text-sm text-gray-600 font-medium mb-3 line-clamp-2">
                      {blog.tagline}
                    </p>
                  )}

                  {/* Short Description */}
                  {blog.shortDescription && (
                    <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                      {blog.shortDescription}
                    </p>
                  )}

                  {/* Tags */}
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {blog.tags.slice(0, 3).map((tag, idx) => (
                        <span 
                          key={idx}
                          className="text-xs px-2 py-1 bg-blue-100 border-2 border-black rounded font-bold"
                        >
                          {tag}
                        </span>
                      ))}
                      {blog.tags.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-gray-100 border-2 border-black rounded font-bold">
                          +{blog.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" strokeWidth={2.5} />
                    <span>{formatDate(blog.datetime || blog.created_at)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t-3 border-black">
                    <button
                      onClick={() => navigate(`/blogs/edit/${blog.blogId}`)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-200 border-3 border-black rounded-xl font-bold hover:bg-blue-300 transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <Edit className="w-4 h-4" strokeWidth={2.5} />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteBlog(blog.blogId)}
                      className="flex items-center justify-center px-4 py-2 bg-red-200 border-3 border-black rounded-xl font-bold hover:bg-red-300 transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <Trash2 className="w-6 h-6" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Blog Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white border-4 border-black rounded-2xl p-8 max-w-md w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-3xl font-black text-black mb-6" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                Create New Blog
              </h2>
              
              <div className="mb-6">
                <label className="block text-sm font-black text-black mb-2 uppercase">
                  Blog ID *
                </label>
                <input
                  type="text"
                  value={newBlogId}
                  onChange={(e) => setNewBlogId(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  placeholder="e.g., aws-vpc-traffic-flow"
                />
                <p className="text-xs text-gray-600 mt-2">
                  Use lowercase with hyphens (e.g., my-blog-post)
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewBlogId('');
                  }}
                  className="flex-1 px-4 py-3 bg-white border-3 border-black rounded-xl font-bold hover:bg-gray-50 transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBlog}
                  className="flex-1 px-4 py-3 bg-black text-white border-3 border-black rounded-xl font-bold hover:bg-gray-800 transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
