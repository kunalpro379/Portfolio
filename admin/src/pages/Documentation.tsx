import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Edit, Trash2, Eye, EyeOff, Calendar, Tag } from 'lucide-react';

interface Doc {
  _id: string;
  docId: string;
  title: string;
  subject: string;
  slug: string;
  azureBlobUrl: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Documentation() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all');

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/documentation');
      const data = await response.json();
      setDocs(data.docs);
    } catch (error) {
      console.error('Error fetching documentation:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDoc = async (docId: string) => {
    if (!confirm('Delete this documentation? This cannot be undone.')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/documentation/${docId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchDocs();
      }
    } catch (error) {
      console.error('Error deleting documentation:', error);
    }
  };

  const filteredDocs = docs.filter(doc => {
    if (filter === 'public') return doc.isPublic;
    if (filter === 'private') return !doc.isPublic;
    return true;
  });

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
              Documentation
            </h1>
            <p className="text-gray-600 font-medium">Create and manage your documentation</p>
          </div>
          <button
            onClick={() => navigate('/documentation/create')}
            className="flex items-center gap-2 px-6 py-3 bg-green-200 border-3 border-black rounded-xl font-bold hover:bg-green-300 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
            New Document
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white border-4 border-black rounded-2xl p-2 mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 px-6 py-3 rounded-xl font-black uppercase tracking-wide transition-all border-3 border-black ${
                filter === 'all'
                  ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]'
                  : 'bg-white text-black hover:bg-gray-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              All ({docs.length})
            </button>
            <button
              onClick={() => setFilter('public')}
              className={`flex-1 px-6 py-3 rounded-xl font-black uppercase tracking-wide transition-all border-3 border-black ${
                filter === 'public'
                  ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]'
                  : 'bg-white text-black hover:bg-gray-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              Public ({docs.filter(d => d.isPublic).length})
            </button>
            <button
              onClick={() => setFilter('private')}
              className={`flex-1 px-6 py-3 rounded-xl font-black uppercase tracking-wide transition-all border-3 border-black ${
                filter === 'private'
                  ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]'
                  : 'bg-white text-black hover:bg-gray-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              Private ({docs.filter(d => !d.isPublic).length})
            </button>
          </div>
        </div>

        {/* Documentation List */}
        {filteredDocs.length === 0 ? (
          <div className="bg-white border-4 border-black rounded-2xl p-12 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" strokeWidth={2} />
            <h3 className="text-2xl font-black text-black mb-2">No documentation yet</h3>
            <p className="text-gray-600 mb-6">Create your first document to get started</p>
            <button
              onClick={() => navigate('/documentation/create')}
              className="px-6 py-3 bg-green-200 border-3 border-black rounded-xl font-bold hover:bg-green-300 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              Create Document
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDocs.map((doc) => (
              <div
                key={doc._id}
                className="bg-white border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {doc.isPublic ? (
                        <Eye className="w-4 h-4 text-green-600" strokeWidth={2.5} />
                      ) : (
                        <EyeOff className="w-4 h-4 text-red-600" strokeWidth={2.5} />
                      )}
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg border-2 border-black ${
                        doc.isPublic ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {doc.isPublic ? 'PUBLIC' : 'PRIVATE'}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-black mb-1 line-clamp-2">
                      {doc.title}
                    </h3>
                  </div>
                </div>

                {/* Subject */}
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-4 h-4 text-gray-600" strokeWidth={2.5} />
                  <span className="text-sm font-bold text-gray-700">{doc.subject}</span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" strokeWidth={2.5} />
                  <span>Created: {formatDate(doc.createdAt)}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t-3 border-black">
                  <button
                    onClick={() => navigate(`/documentation/edit/${doc.docId}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-200 border-3 border-black rounded-xl font-bold hover:bg-blue-300 transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <Edit className="w-4 h-4" strokeWidth={2.5} />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteDoc(doc.docId)}
                    className="flex items-center justify-center px-4 py-2 bg-red-200 border-3 border-black rounded-xl font-bold hover:bg-red-300 transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <Trash2 className="w-6 h-6" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
