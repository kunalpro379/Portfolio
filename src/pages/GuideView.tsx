import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, BookOpen, FileText, Eye, Lock } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { fetchGuideById, deleteTitle, type Guide } from '@/services/guideNotesApi';

export default function GuideView() {
  const navigate = useNavigate();
  const { guideId } = useParams<{ guideId: string }>();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedTitleId, setSelectedTitleId] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  useEffect(() => {
    if (guideId) {
      loadGuide();
    }
  }, [guideId]);

  const loadGuide = async () => {
    try {
      setLoading(true);
      const fetchedGuide = await fetchGuideById(guideId!);
      setGuide(fetchedGuide);
    } catch (err) {
      console.error('Error loading guide:', err);
      alert('Failed to load guide');
    } finally {
      setLoading(false);
    }
  };

  const handleTitleClick = (title: any, clickMode: 'view' | 'edit') => {
    if (clickMode === 'view') {
      // Use slug-based URL for view mode
      const guideSlug = guide?.guideSlug || guide?.guideId;
      const titleSlug = title.titleSlug || title.titleId;
      navigate(`/learn/${guideSlug}/${titleSlug}`);
    } else {
      // Ask for password for edit mode
      setSelectedTitleId(title.titleId);
      setMode('edit');
      setShowPasswordModal(true);
    }
  };

  const handlePasswordSubmit = () => {
    if (password === 'kunal') {
      setShowPasswordModal(false);
      setPassword('');
      setPasswordError('');
      navigate(`/learnings/guide/${guideId}/title/${selectedTitleId}/edit`);
    } else {
      setPasswordError('Incorrect password');
    }
  };

  const handleCreateTitle = () => {
    navigate(`/learnings/guide/${guideId}/title/new`);
  };

  const handleDeleteTitle = async (titleId: string) => {
    if (!confirm('Are you sure you want to delete this title and all its documents?')) return;
    
    try {
      await deleteTitle(guideId!, titleId);
      await loadGuide();
    } catch (err) {
      console.error('Error deleting title:', err);
      alert('Failed to delete title');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-700 font-bold">Guide not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50/20 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <button
          onClick={() => navigate('/learnings?tab=guide')}
          className="flex items-center gap-2 text-stone-600 hover:text-stone-900 font-medium text-sm transition-all mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={2} />
          Back to Guides
        </button>

        <div className="bg-gradient-to-br from-stone-900 to-stone-800 border-2 border-white/20 rounded-2xl p-6 md:p-8 shadow-lg">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="flex items-start gap-5 flex-1">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400/20 to-stone-400/20 border border-amber-400/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen size={24} className="text-amber-400" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] md:text-xs text-stone-400 font-medium uppercase tracking-wider mb-2">
                  {guide.topic}
                </p>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 break-words">
                  {guide.name}
                </h1>
                {guide.description && (
                  <p className="text-sm text-stone-300 font-normal break-words">{guide.description}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleCreateTitle}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md text-sm"
            >
              <Plus size={16} strokeWidth={2} />
              New Title
            </button>
          </div>
        </div>
      </div>

      {/* Titles Grid */}
      <div className="max-w-7xl mx-auto">
        {guide.titles.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gradient-to-br from-stone-900 to-stone-800 border-2 border-white/20 rounded-2xl p-12 inline-block shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400/20 to-stone-400/20 border border-amber-400/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText size={32} className="text-amber-400" strokeWidth={1.5} />
              </div>
              <p className="text-white text-lg font-semibold mb-2">No titles yet</p>
              <p className="text-stone-300 text-sm mb-6">Create your first title to organize your documents</p>
              <button
                onClick={handleCreateTitle}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md text-sm inline-flex items-center gap-2"
              >
                <Plus size={16} strokeWidth={2} />
                Create Title
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {guide.titles.map((title, idx) => {
              const markdownCount = title.documents.filter(d => d.type === 'markdown').length;
              const diagramCount = title.documents.filter(d => d.type === 'diagram').length;
              const attachmentCount = title.documents.filter(d => d.type === 'attachment').length;
              
              return (
                <div
                  key={title.titleId}
                  className="group bg-gradient-to-br from-stone-900 to-stone-800 hover:from-stone-800 hover:to-stone-700 border-2 border-white/20 hover:border-white/30 rounded-xl p-5 transition-all duration-300 hover:shadow-lg relative"
                >
                  <button
                    onClick={() => handleDeleteTitle(title.titleId)}
                    className="absolute top-3 right-3 p-1.5 bg-stone-800/80 border border-red-400/40 text-red-400 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-all opacity-0 group-hover:opacity-100 z-10"
                  >
                    <Trash2 size={12} strokeWidth={2} />
                  </button>

                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-11 h-11 bg-gradient-to-br from-amber-400/20 to-stone-400/20 border border-amber-400/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <FileText size={18} strokeWidth={1.5} className="text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h3 className="text-sm font-semibold text-white mb-1 leading-tight line-clamp-2">
                        {title.name}
                      </h3>
                      {title.description && (
                        <p className="text-stone-400 text-[11px] font-normal line-clamp-2">{title.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4 pt-3 border-t border-white/10">
                    <div className="flex flex-wrap gap-1.5 text-[10px] font-medium">
                      {markdownCount > 0 && (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                          {markdownCount} MD
                        </span>
                      )}
                      {diagramCount > 0 && (
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full">
                          {diagramCount} Diagram
                        </span>
                      )}
                      {attachmentCount > 0 && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full">
                          {attachmentCount} Files
                        </span>
                      )}
                      {title.documents.length === 0 && (
                        <span className="px-2 py-0.5 bg-stone-700/50 text-stone-400 border border-stone-600 rounded-full">
                          Empty
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTitleClick(title, 'view')}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 rounded-lg font-medium transition-all text-xs"
                    >
                      <Eye size={12} strokeWidth={2} />
                      View
                    </button>
                    <button
                      onClick={() => handleTitleClick(title, 'edit')}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500/90 hover:bg-amber-500 text-white rounded-lg font-medium transition-all text-xs"
                    >
                      <Edit size={12} strokeWidth={2} />
                      Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-stone-900 to-stone-800 border-2 border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400/20 to-stone-400/20 border border-amber-400/30 rounded-xl flex items-center justify-center">
                <Lock size={20} strokeWidth={2} className="text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Enter Password</h3>
                <p className="text-sm text-stone-400 font-normal">
                  Password required to edit
                </p>
              </div>
            </div>

            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError('');
              }}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              placeholder="Enter password"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl font-normal text-white placeholder-stone-400 mb-2 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all"
              autoFocus
            />
            
            {passwordError && (
              <p className="text-red-400 text-sm font-medium mb-4">{passwordError}</p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setPasswordError('');
                }}
                className="flex-1 px-5 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="flex-1 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
