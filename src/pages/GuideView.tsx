import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, BookOpen, FileText, Eye, Lock, Share2, Copy, Check } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { fetchGuideById, getTitleShareLink, deleteTitleWithPassword, type Guide } from '@/services/guideNotesApi';

export default function GuideView() {
  const navigate = useNavigate();
  const { guideId } = useParams<{ guideId: string }>();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedTitleId, setSelectedTitleId] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [mode, setMode] = useState<'view' | 'edit' | 'delete'>('view');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

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

  const handlePasswordSubmit = async () => {
    if (password === 'kunal') {
      if (mode === 'edit') {
        setShowPasswordModal(false);
        setPassword('');
        setPasswordError('');
        navigate(`/learnings/guide/${guideId}/title/${selectedTitleId}/edit`);
      } else if (mode === 'delete' && selectedTitleId) {
        try {
          await deleteTitleWithPassword(guideId!, selectedTitleId, password);
          setShowPasswordModal(false);
          setPassword('');
          setPasswordError('');
          await loadGuide();
        } catch (err: any) {
          setPasswordError(err.message || 'Failed to delete title');
        }
      }
    } else {
      setPasswordError('Incorrect password');
    }
  };

  const handleCreateTitle = () => {
    navigate(`/learnings/guide/${guideId}/title/new`);
  };

  const handleDeleteTitle = (titleId: string) => {
    setSelectedTitleId(titleId);
    setMode('delete');
    setShowPasswordModal(true);
  };

  const handleShareTitle = async (titleId: string) => {
    try {
      const url = await getTitleShareLink(guideId!, titleId);
      setShareUrl(url);
      setShowShareModal(true);
    } catch (err) {
      alert('Failed to get share link');
    }
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    <div className="min-h-screen p-4 md:p-8 relative">
      {/* Animated Background - Same as Learnings Page */}
      {/* Static Background Image for Mobile */}
      <div className="fixed inset-0 z-0 md:hidden">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/back11.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'grayscale(100%)',
            opacity: 0.45
          }}
        />
      </div>

      {/* Animated Background Images - Desktop Only */}
      <div className="fixed inset-0 z-0 hidden md:block">
        <style>{`
          @keyframes backgroundSlideshow {
            0% { opacity: 0; }
            8% { opacity: 0.55; }
            16% { opacity: 0; }
            100% { opacity: 0; }
          }
          
          .bg-slide {
            position: absolute;
            inset: 0;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            filter: grayscale(100%);
            opacity: 0;
          }
          
          .bg-slide-1 { animation: backgroundSlideshow 104s ease-in-out infinite 0s; background-image: url(/back1.png); }
          .bg-slide-2 { animation: backgroundSlideshow 104s ease-in-out infinite 8s; background-image: url(/back2.png); }
          .bg-slide-3 { animation: backgroundSlideshow 104s ease-in-out infinite 16s; background-image: url(/back3.png); }
          .bg-slide-4 { animation: backgroundSlideshow 104s ease-in-out infinite 24s; background-image: url(/back4.png); }
          .bg-slide-5 { animation: backgroundSlideshow 104s ease-in-out infinite 32s; background-image: url(/back5.png); }
          .bg-slide-6 { animation: backgroundSlideshow 104s ease-in-out infinite 40s; background-image: url(/back6.png); }
          .bg-slide-7 { animation: backgroundSlideshow 104s ease-in-out infinite 48s; background-image: url(/back7.png); }
          .bg-slide-8 { animation: backgroundSlideshow 104s ease-in-out infinite 56s; background-image: url(/back8.png); }
          .bg-slide-9 { animation: backgroundSlideshow 104s ease-in-out infinite 64s; background-image: url(/back9.png); }
          .bg-slide-10 { animation: backgroundSlideshow 104s ease-in-out infinite 72s; background-image: url(/back10.png); }
          .bg-slide-11 { animation: backgroundSlideshow 104s ease-in-out infinite 80s; background-image: url(/back11.png); }
          .bg-slide-12 { animation: backgroundSlideshow 104s ease-in-out infinite 88s; background-image: url(/back12.png); }
          .bg-slide-13 { animation: backgroundSlideshow 104s ease-in-out infinite 96s; background-image: url(/back13.png); }
        `}</style>
        <div className="bg-slide bg-slide-1" />
        <div className="bg-slide bg-slide-2" />
        <div className="bg-slide bg-slide-3" />
        <div className="bg-slide bg-slide-4" />
        <div className="bg-slide bg-slide-5" />
        <div className="bg-slide bg-slide-6" />
        <div className="bg-slide bg-slide-7" />
        <div className="bg-slide bg-slide-8" />
        <div className="bg-slide bg-slide-9" />
        <div className="bg-slide bg-slide-10" />
        <div className="bg-slide bg-slide-11" />
        <div className="bg-slide bg-slide-12" />
        <div className="bg-slide bg-slide-13" />
      </div>
      
      {/* Beautiful Gradient Background - Top to Bottom */}
      <div
        className="fixed inset-0 z-[1]"
        style={{
          background: 'linear-gradient(to bottom, rgba(243, 232, 255, 0.6) 0%, rgba(219, 234, 254, 0.6) 16.67%, rgba(220, 252, 231, 0.6) 33.33%, rgba(254, 252, 232, 0.6) 50%, rgba(255, 237, 213, 0.6) 66.67%, rgba(254, 226, 226, 0.6) 83.33%, rgba(254, 226, 226, 0.5) 100%)'
        }}
      />

      {/* Background Texture Pattern on Top */}
      <div className="fixed inset-0 z-[2] opacity-20 mix-blend-multiply" style={{ backgroundImage: 'url(/page7.png)', backgroundRepeat: 'repeat', filter: 'grayscale(100%) brightness(0)' }} />
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 relative z-[3]">
        <button
          onClick={() => navigate('/learnings?tab=guide')}
          className="flex items-center gap-2 text-black hover:text-gray-700 font-bold text-sm transition-all mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
          Back to Guides
        </button>

        <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-600 font-black uppercase tracking-wider mb-2">
              {guide.topic}
            </p>
            <h1 className="text-4xl md:text-5xl font-black text-black mb-2 break-words">
              {guide.name}
            </h1>
            {guide.description && (
              <p className="text-base text-gray-700 font-medium break-words">{guide.description}</p>
            )}
          </div>
          <button
            onClick={handleCreateTitle}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-black border-3 border-black rounded-xl font-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 text-sm"
          >
            <Plus size={18} strokeWidth={2.5} />
            New Title
          </button>
        </div>
      </div>

      {/* Titles Grid */}
      <div className="max-w-7xl mx-auto relative z-[3]">
        {guide.titles.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white/80 backdrop-blur-sm border-3 border-black rounded-2xl p-12 inline-block shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <FileText size={48} className="mx-auto mb-4 text-black" strokeWidth={2.5} />
              <p className="text-black text-lg font-black mb-2">No titles yet</p>
              <p className="text-gray-700 text-sm font-medium mb-6">Create your first title to organize your documents</p>
              <button
                onClick={handleCreateTitle}
                className="px-6 py-3 bg-white text-black border-3 border-black rounded-xl font-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 text-sm inline-flex items-center gap-2"
              >
                <Plus size={18} strokeWidth={2.5} />
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
                  className="group bg-black border-3 border-black rounded-xl p-5 transition-all duration-300 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 relative"
                >
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={() => handleShareTitle(title.titleId)}
                      className="p-1.5 bg-white text-black border-2 border-black rounded-lg hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all"
                      title="Share"
                    >
                      <Share2 size={12} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => handleDeleteTitle(title.titleId)}
                      className="p-1.5 bg-white text-black border-2 border-black rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                      title="Delete"
                    >
                      <Trash2 size={12} strokeWidth={2.5} />
                    </button>
                  </div>

                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-11 h-11 bg-white border-2 border-black rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <FileText size={18} strokeWidth={2.5} className="text-black" />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h3 className="text-sm font-black text-white mb-1 leading-tight line-clamp-2">
                        {title.name}
                      </h3>
                      {title.description && (
                        <p className="text-gray-300 text-[11px] font-medium line-clamp-2">{title.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4 pt-3 border-t-2 border-white/20">
                    <div className="flex flex-wrap gap-1.5 text-[10px] font-black">
                      {markdownCount > 0 && (
                        <span className="px-2 py-0.5 bg-white text-black border-2 border-black rounded-full">
                          {markdownCount} MD
                        </span>
                      )}
                      {diagramCount > 0 && (
                        <span className="px-2 py-0.5 bg-white text-black border-2 border-black rounded-full">
                          {diagramCount} Diagram
                        </span>
                      )}
                      {attachmentCount > 0 && (
                        <span className="px-2 py-0.5 bg-white text-black border-2 border-black rounded-full">
                          {attachmentCount} Files
                        </span>
                      )}
                      {title.documents.length === 0 && (
                        <span className="px-2 py-0.5 bg-gray-800 text-white border-2 border-white rounded-full">
                          Empty
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTitleClick(title, 'view')}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white text-black border-2 border-black rounded-lg font-black transition-all text-xs hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                    >
                      <Eye size={12} strokeWidth={2.5} />
                      View
                    </button>
                    <button
                      onClick={() => handleTitleClick(title, 'edit')}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white text-black border-2 border-black rounded-lg font-black transition-all text-xs hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                    >
                      <Edit size={12} strokeWidth={2.5} />
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
                  Password required to {mode === 'delete' ? 'delete' : 'edit'}
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

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 border-2 border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400/20 to-blue-400/20 border border-blue-400/30 rounded-xl flex items-center justify-center">
                <Share2 size={20} strokeWidth={2} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Share Link</h3>
                <p className="text-sm text-blue-200 font-normal">
                  Copy this link to share
                </p>
              </div>
            </div>

            <div className="bg-white/10 border border-white/20 rounded-xl p-3 mb-4">
              <p className="text-white text-sm font-mono break-all">{shareUrl}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setCopied(false);
                }}
                className="flex-1 px-5 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-all"
              >
                Close
              </button>
              <button
                onClick={handleCopyShareLink}
                className="flex-1 px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check size={16} strokeWidth={2.5} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} strokeWidth={2.5} />
                    Copy Link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
