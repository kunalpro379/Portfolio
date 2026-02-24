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

  const handleTitleClick = (titleId: string, clickMode: 'view' | 'edit') => {
    if (clickMode === 'view') {
      // Direct navigation for view mode - no password required
      navigate(`/learnings/guide/${guideId}/title/${titleId}/view`);
    } else {
      // Ask for password for edit mode
      setSelectedTitleId(titleId);
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
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <button
          onClick={() => navigate('/learnings?tab=notes')}
          className="flex items-center gap-2 text-gray-600 hover:text-black font-bold text-sm transition-all mb-4"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
          Back to Guides
        </button>

        <div className="bg-white border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-4 bg-gradient-to-br from-yellow-400 to-yellow-600 border-4 border-black rounded-xl">
                <BookOpen size={32} strokeWidth={2.5} className="text-white" />
              </div>
              <div>
                <span className="px-3 py-1.5 bg-yellow-100 border-2 border-black rounded-lg text-xs font-black uppercase tracking-wider inline-block mb-2">
                  {guide.topic}
                </span>
                <h1 className="text-4xl font-black text-black mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  {guide.name}
                </h1>
                {guide.description && (
                  <p className="text-gray-700 font-medium">{guide.description}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleCreateTitle}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white border-3 border-black rounded-xl font-bold hover:bg-gray-800 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            >
              <Plus size={20} strokeWidth={2.5} />
              New Title
            </button>
          </div>
        </div>
      </div>

      {/* Titles Grid */}
      <div className="max-w-7xl mx-auto">
        {guide.titles.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-3 border-black rounded-2xl p-10 inline-block shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <FileText size={48} strokeWidth={2.5} className="mx-auto mb-3 text-yellow-600" />
              <p className="text-black text-lg font-black mb-2">No titles yet</p>
              <p className="text-gray-700 text-sm font-medium mb-4">Create your first title to organize your documents</p>
              <button
                onClick={handleCreateTitle}
                className="px-6 py-3 bg-black text-white border-3 border-black rounded-xl font-bold hover:bg-gray-800 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] inline-flex items-center gap-2"
              >
                <Plus size={20} strokeWidth={2.5} />
                Create Title
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {guide.titles.map((title, idx) => {
              const rotations = ['-rotate-1', 'rotate-1', '-rotate-2', 'rotate-2'];
              const hoverRotations = ['hover:rotate-0', 'hover:-rotate-1', 'hover:rotate-1', 'hover:-rotate-2'];
              const shadows = [
                'shadow-[5px_5px_0px_0px_rgba(251,191,36,0.5)]',
                'shadow-[6px_5px_0px_0px_rgba(245,158,11,0.5)]',
                'shadow-[5px_6px_0px_0px_rgba(234,179,8,0.5)]',
                'shadow-[6px_6px_0px_0px_rgba(251,191,36,0.5)]'
              ];
              const hoverShadows = [
                'hover:shadow-[9px_9px_0px_0px_rgba(251,191,36,0.7)]',
                'hover:shadow-[10px_9px_0px_0px_rgba(245,158,11,0.7)]',
                'hover:shadow-[9px_10px_0px_0px_rgba(234,179,8,0.7)]',
                'hover:shadow-[10px_10px_0px_0px_rgba(251,191,36,0.7)]'
              ];
              
              const markdownCount = title.documents.filter(d => d.type === 'markdown').length;
              const diagramCount = title.documents.filter(d => d.type === 'diagram').length;
              const attachmentCount = title.documents.filter(d => d.type === 'attachment').length;
              
              return (
                <div
                  key={title.titleId}
                  className={`bg-gradient-to-br from-white to-yellow-50 backdrop-blur-sm border-[3px] border-black p-6 transition-all duration-300 hover:-translate-y-2 group relative ${rotations[idx % 4]} ${hoverRotations[idx % 4]} ${shadows[idx % 4]} ${hoverShadows[idx % 4]}`}
                  style={{ 
                    borderRadius: idx % 2 === 0 ? '20px 24px 22px 26px' : '24px 20px 26px 22px'
                  }}
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={() => handleDeleteTitle(title.titleId)}
                      className="p-1.5 bg-red-500 text-white border-2 border-black rounded-lg hover:bg-red-600 transition-all"
                    >
                      <Trash2 size={14} strokeWidth={2.5} />
                    </button>
                  </div>

                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2.5 bg-gradient-to-br from-blue-400 to-blue-600 border-[3px] border-black rounded-lg group-hover:rotate-12 transition-transform flex-shrink-0">
                      <FileText size={20} strokeWidth={2.5} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-black text-black mb-1 leading-tight line-clamp-2">
                        {title.name}
                      </h3>
                      {title.description && (
                        <p className="text-gray-600 text-xs font-medium line-clamp-2">{title.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4 pt-3 border-t-2 border-dashed border-gray-300">
                    <div className="flex flex-wrap gap-2 text-xs font-bold">
                      {markdownCount > 0 && (
                        <span className="px-2 py-1 bg-green-100 border-2 border-black rounded">
                          {markdownCount} MD
                        </span>
                      )}
                      {diagramCount > 0 && (
                        <span className="px-2 py-1 bg-purple-100 border-2 border-black rounded">
                          {diagramCount} Diagram
                        </span>
                      )}
                      {attachmentCount > 0 && (
                        <span className="px-2 py-1 bg-blue-100 border-2 border-black rounded">
                          {attachmentCount} Files
                        </span>
                      )}
                      {title.documents.length === 0 && (
                        <span className="px-2 py-1 bg-gray-100 border-2 border-black rounded text-gray-500">
                          Empty
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTitleClick(title.titleId, 'view')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white border-3 border-black rounded-lg font-bold hover:bg-blue-600 transition-all"
                    >
                      <Eye size={16} strokeWidth={2.5} />
                      View
                    </button>
                    <button
                      onClick={() => handleTitleClick(title.titleId, 'edit')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-400 text-black border-3 border-black rounded-lg font-bold hover:bg-yellow-500 transition-all"
                    >
                      <Edit size={16} strokeWidth={2.5} />
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black rounded-2xl p-8 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-yellow-400 border-3 border-black rounded-xl">
                <Lock size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-black">Enter Password</h3>
                <p className="text-sm text-gray-600 font-medium">
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
              className="w-full px-4 py-3 border-3 border-black rounded-lg font-bold mb-2 focus:outline-none focus:ring-4 focus:ring-yellow-300"
              autoFocus
            />
            
            {passwordError && (
              <p className="text-red-600 text-sm font-bold mb-4">{passwordError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setPasswordError('');
                }}
                className="flex-1 px-4 py-3 bg-gray-200 border-3 border-black rounded-lg font-bold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="flex-1 px-4 py-3 bg-black text-white border-3 border-black rounded-lg font-bold hover:bg-gray-800 transition-all"
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
