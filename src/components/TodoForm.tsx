import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Link as LinkIcon, CheckCircle2, Loader, Circle, Save } from 'lucide-react';

interface TodoPoint {
  text: string;
  status: 'pending' | 'working' | 'done';
}

interface TodoLink {
  title: string;
  url: string;
}

interface TodoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    topic: string;
    content: string;
    points: TodoPoint[];
    links: TodoLink[];
    persistFor: 'day' | 'always';
  }) => Promise<void>;
  initialData?: {
    todoId?: string;
    topic: string;
    content: string;
    points: TodoPoint[];
    links: TodoLink[];
  };
  mode: 'create' | 'edit';
}

export default function TodoForm({ isOpen, onClose, onSubmit, initialData, mode }: TodoFormProps) {
  const [topic, setTopic] = useState(initialData?.topic || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [points, setPoints] = useState<TodoPoint[]>(initialData?.points || []);
  const [newPoint, setNewPoint] = useState('');
  const [links, setLinks] = useState<TodoLink[]>(initialData?.links || []);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [persistFor, setPersistFor] = useState<'day' | 'always'>('day');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form state when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setTopic(initialData.topic || '');
      setContent(initialData.content || '');
      setPoints(initialData.points || []);
      setLinks(initialData.links || []);
    } else {
      // Reset form for create mode
      setTopic('');
      setContent('');
      setPoints([]);
      setLinks([]);
    }
  }, [initialData, mode]);

  if (!isOpen) return null;

  const handleAddPoint = () => {
    if (newPoint.trim()) {
      setPoints([...points, { text: newPoint.trim(), status: 'pending' }]);
      setNewPoint('');
    }
  };

  const handleRemovePoint = (index: number) => {
    setPoints(points.filter((_, i) => i !== index));
  };

  const handleTogglePointStatus = (index: number) => {
    const updatedPoints = [...points];
    const currentStatus = updatedPoints[index].status;
    if (currentStatus === 'pending') {
      updatedPoints[index].status = 'working';
    } else if (currentStatus === 'working') {
      updatedPoints[index].status = 'done';
    } else {
      updatedPoints[index].status = 'pending';
    }
    setPoints(updatedPoints);
  };

  const handleAddLink = () => {
    if (newLinkTitle.trim() && newLinkUrl.trim()) {
      setLinks([...links, { title: newLinkTitle.trim(), url: newLinkUrl.trim() }]);
      setNewLinkTitle('');
      setNewLinkUrl('');
    }
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      alert('Please enter a topic');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit({ topic, content, points, links, persistFor });
      
      // Reset form state after successful submission
      setTopic('');
      setContent('');
      setPoints([]);
      setLinks([]);
      setNewPoint('');
      setNewLinkTitle('');
      setNewLinkUrl('');
      setPersistFor('day');
      
      onClose();
    } catch (error) {
      console.error('Error submitting todo:', error);
      alert('Failed to save todo. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 overflow-hidden">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div 
        className="bg-white border border-gray-300 rounded-lg w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl hide-scrollbar"
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 border-b border-orange-700 p-3 sm:p-5 flex items-center justify-between z-10">
            <h2 className="text-lg sm:text-xl font-semibold text-white">
              {mode === 'create' ? 'Create New Todo' : 'Edit Todo'}
            </h2>
            <div className="flex items-center gap-2">
              {/* Save button - visible only on mobile */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="sm:hidden p-2 bg-white/20 hover:bg-white/30 rounded-md transition-all disabled:opacity-50"
                title="Save"
              >
                {isSubmitting ? (
                  <Loader size={18} className="animate-spin text-white" />
                ) : (
                  <Save size={18} strokeWidth={2} className="text-white" />
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 sm:p-2 text-white hover:bg-white/20 rounded-md transition-all"
              >
                <X size={18} strokeWidth={2} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
            {/* Topic Input */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Topic *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter todo topic..."
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Content Text Editor */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter detailed description..."
                rows={4}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Points Section */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-3">
                Action Points
              </label>
              
              {/* Existing Points */}
              {points.length > 0 && (
                <div className="space-y-2 mb-3">
                  {points.map((point, index) => {
                    const statusColors = {
                      pending: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
                      working: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
                      done: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' }
                    };
                    const colors = statusColors[point.status];
                    
                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-2 p-2 sm:p-3 ${colors.bg} border ${colors.border} rounded-md group cursor-pointer hover:opacity-80 transition-all`}
                        onClick={() => handleTogglePointStatus(index)}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {point.status === 'done' && <CheckCircle2 size={14} strokeWidth={2} className="text-green-600 flex-shrink-0 sm:w-4 sm:h-4" />}
                          {point.status === 'working' && <Loader size={14} strokeWidth={2} className="text-purple-600 flex-shrink-0 sm:w-4 sm:h-4" />}
                          {point.status === 'pending' && <Circle size={14} strokeWidth={2} className="text-red-600 flex-shrink-0 sm:w-4 sm:h-4" />}
                          <span className={`flex-1 text-xs sm:text-sm font-medium ${colors.text} break-words`}>
                            {point.text}
                          </span>
                          <span className={`text-[10px] sm:text-xs font-semibold ${colors.text} uppercase px-1.5 sm:px-2 py-0.5 rounded flex-shrink-0`}>
                            {point.status}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePoint(index);
                          }}
                          className="p-1 sm:p-1.5 text-red-600 hover:bg-red-100 border border-red-200 rounded opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                        >
                          <Trash2 size={12} strokeWidth={2} className="sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add New Point */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPoint}
                  onChange={(e) => setNewPoint(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPoint();
                    }
                  }}
                  placeholder="Add a new point..."
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddPoint}
                  className="px-3 sm:px-5 py-2 sm:py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-md font-medium transition-all flex items-center gap-1 sm:gap-2 text-sm sm:text-base flex-shrink-0"
                >
                  <Plus size={16} strokeWidth={2} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="hidden sm:inline">Add</span>
                </button>
              </div>
            </div>

            {/* Links Section */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-3">
                Attach Links
              </label>
              
              {/* Existing Links */}
              {links.length > 0 && (
                <div className="space-y-2 mb-3">
                  {links.map((link, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-md group"
                    >
                      <LinkIcon size={12} strokeWidth={2.5} className="text-blue-600 flex-shrink-0 sm:w-3.5 sm:h-3.5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-gray-900 truncate">{link.title}</div>
                        <div className="text-[10px] sm:text-xs text-gray-600 truncate">{link.url}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(index)}
                        className="p-1 sm:p-1.5 text-red-600 hover:bg-red-100 border border-red-200 rounded opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                      >
                        <Trash2 size={12} strokeWidth={2} className="sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Link */}
              <div className="space-y-2">
                <input
                  type="text"
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                  placeholder="Link title..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddLink();
                      }
                    }}
                    placeholder="https://example.com"
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="px-3 sm:px-5 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-all flex items-center gap-1 sm:gap-2 text-sm sm:text-base flex-shrink-0"
                  >
                    <Plus size={16} strokeWidth={2} className="sm:w-[18px] sm:h-[18px]" />
                    <span className="hidden sm:inline">Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Persistence Option - Only show on create mode */}
            {mode === 'create' && (
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-3">
                  Session Persistence
                </label>
                <div className="flex gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setPersistFor('day')}
                    className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-base border rounded-md font-medium transition-all ${
                      persistFor === 'day'
                        ? 'bg-orange-600 text-white border-orange-700'
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    For 1 Day
                  </button>
                  <button
                    type="button"
                    onClick={() => setPersistFor('always')}
                    className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-base border rounded-md font-medium transition-all ${
                      persistFor === 'always'
                        ? 'bg-orange-600 text-white border-orange-700'
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Always
                  </button>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-600 font-medium mt-2">
                  {persistFor === 'day'
                    ? 'You will need to enter password again after 24 hours'
                    : 'You will stay authenticated until you manually logout'}
                </p>
              </div>
            )}

            {/* Date & Time Display */}
            <div className="bg-gray-50 border border-gray-200 rounded-md p-2 sm:p-3">
              <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-gray-600">
                <span>Date: {new Date().toLocaleDateString()}</span>
                <span>Time: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-3 sm:p-5 bg-gray-50 flex gap-2 sm:gap-3 sticky bottom-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base bg-white border border-gray-300 rounded-md font-medium hover:bg-gray-100 transition-all shadow-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-3 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base bg-gradient-to-r from-orange-600 to-orange-700 text-white border border-orange-800 rounded-md font-medium hover:from-orange-700 hover:to-orange-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader size={14} className="animate-spin sm:w-4 sm:h-4" />
                  {mode === 'create' ? 'Creating...' : 'Saving...'}
                </div>
              ) : (
                mode === 'create' ? 'Create Todo' : 'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
