import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Link as LinkIcon, CheckCircle2, Loader, Circle, Save } from 'lucide-react';
import type { TodoPoint, TodoLink } from '@/services/todoApi';

interface TodoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    topic: string;
    content: string;
    points: TodoPoint[];
    links: TodoLink[];
    isPublic: boolean;
    persistFor: 'day' | 'always';
  }) => Promise<void>;
  initialData?: {
    todoId?: string;
    topic: string;
    content: string;
    points: TodoPoint[];
    links: TodoLink[];
    isPublic?: boolean;
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
  const [isPublic, setIsPublic] = useState(initialData?.isPublic !== undefined ? initialData.isPublic : true);
  const [persistFor, setPersistFor] = useState<'day' | 'always'>('day');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form state when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setTopic(initialData.topic || '');
      setContent(initialData.content || '');
      setPoints(initialData.points || []);
      setLinks(initialData.links || []);
      setIsPublic(initialData.isPublic !== undefined ? initialData.isPublic : true);
    } else {
      // Reset form for create mode
      setTopic('');
      setContent('');
      setPoints([]);
      setLinks([]);
      setIsPublic(true);
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
      updatedPoints[index].status = 'resolved';
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
      await onSubmit({ topic, content, points, links, isPublic, persistFor });
      
      // Reset form state after successful submission
      setTopic('');
      setContent('');
      setPoints([]);
      setLinks([]);
      setNewPoint('');
      setNewLinkTitle('');
      setNewLinkUrl('');
      setIsPublic(true);
      setPersistFor('day');
      
      onClose();
    } catch (error) {
      console.error('Error submitting todo:', error);
      alert('Failed to save task. Please try again.');
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
        className="bg-gradient-to-br from-[#FFF8E7] to-white border-[3px] border-black w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] hide-scrollbar"
        style={{ 
          borderRadius: '25px 28px 26px 29px',
          transform: 'rotate(-0.5deg)'
        }}
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div 
            className="sticky top-0 bg-black border-b-[3px] border-black p-3 sm:p-5 flex items-center justify-between z-10"
            style={{ borderRadius: '22px 25px 0 0' }}
          >
            <h2 className="text-lg sm:text-xl font-black text-white">
              {mode === 'create' ? 'Create New Task' : 'Edit Task'}
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
                className="p-1.5 sm:p-2 text-white hover:bg-[#FFF8E7] hover:text-black rounded-md transition-all border-2 border-white/30 hover:border-black"
              >
                <X size={18} strokeWidth={2} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
            {/* Topic Input */}
            <div>
              <label className="block text-xs sm:text-sm font-black text-black mb-2">
                Topic *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter task topic..."
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border-[3px] border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] transition-all font-medium"
                style={{ borderRadius: '8px 10px 9px 11px' }}
                required
              />
            </div>

            {/* Content Text Editor */}
            <div>
              <label className="block text-xs sm:text-sm font-black text-black mb-2">
                Description
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter detailed description..."
                rows={4}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border-[3px] border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] transition-all resize-none font-medium"
                style={{ borderRadius: '8px 10px 9px 11px' }}
              />
            </div>

            {/* Points Section */}
            <div>
              <label className="block text-xs sm:text-sm font-black text-black mb-3">
                Action Points
              </label>
              
              {/* Existing Points */}
              {points.length > 0 && (
                <div className="space-y-2 mb-3">
                  {points.map((point, index) => {
                    const statusStyles = {
                      pending: { bg: 'bg-white', icon: 'text-black' },
                      working: { bg: 'bg-[#F5E6D3]', icon: 'text-black' },
                      resolved: { bg: 'bg-black', icon: 'text-white', textColor: 'text-white' }
                    };
                    const styles = statusStyles[point.status];
                    
                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-2 p-2 sm:p-3 ${styles.bg} border-[3px] border-black group cursor-pointer hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] transition-all`}
                        style={{ borderRadius: '8px 10px 9px 11px' }}
                        onClick={() => handleTogglePointStatus(index)}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {point.status === 'resolved' && <CheckCircle2 size={14} strokeWidth={3} className={`${styles.icon} flex-shrink-0 sm:w-4 sm:h-4`} />}
                          {point.status === 'working' && <Loader size={14} strokeWidth={3} className={`${styles.icon} flex-shrink-0 sm:w-4 sm:h-4`} />}
                          {point.status === 'pending' && <Circle size={14} strokeWidth={3} className={`${styles.icon} flex-shrink-0 sm:w-4 sm:h-4`} />}
                          <span className={`flex-1 text-xs sm:text-sm font-bold ${styles.textColor || 'text-black'} break-words`}>
                            {point.text}
                          </span>
                          <span 
                            className={`text-[10px] sm:text-xs font-black ${styles.textColor || 'text-black'} uppercase px-1.5 sm:px-2 py-0.5 border-2 border-black flex-shrink-0`}
                            style={{ borderRadius: '4px 6px 5px 7px' }}
                          >
                            {point.status}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePoint(index);
                          }}
                          className="p-1 sm:p-1.5 text-black hover:bg-[#FFF8E7] border-2 border-black rounded opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                        >
                          <Trash2 size={12} strokeWidth={3} className="sm:w-3.5 sm:h-3.5" />
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
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border-[3px] border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] transition-all font-medium"
                  style={{ borderRadius: '8px 10px 9px 11px' }}
                />
                <button
                  type="button"
                  onClick={handleAddPoint}
                  className="px-3 sm:px-5 py-2 sm:py-2.5 bg-black hover:bg-[#FFF8E7] text-white hover:text-black border-[3px] border-black font-black transition-all flex items-center gap-1 sm:gap-2 text-sm sm:text-base flex-shrink-0 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.3)]"
                  style={{ borderRadius: '8px 10px 9px 11px' }}
                >
                  <Plus size={16} strokeWidth={3} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="hidden sm:inline">Add</span>
                </button>
              </div>
            </div>

            {/* Links Section */}
            <div>
              <label className="block text-xs sm:text-sm font-black text-black mb-3">
                Attach Links
              </label>
              
              {/* Existing Links */}
              {links.length > 0 && (
                <div className="space-y-2 mb-3">
                  {links.map((link, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 sm:p-3 bg-[#F5E6D3] border-[3px] border-black group hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] transition-all"
                      style={{ borderRadius: '8px 10px 9px 11px' }}
                    >
                      <LinkIcon size={12} strokeWidth={3} className="text-black flex-shrink-0 sm:w-3.5 sm:h-3.5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-black text-black truncate">{link.title}</div>
                        <div className="text-[10px] sm:text-xs text-black/70 truncate font-medium">{link.url}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(index)}
                        className="p-1 sm:p-1.5 text-black hover:bg-white border-2 border-black rounded opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                      >
                        <Trash2 size={12} strokeWidth={3} className="sm:w-3.5 sm:h-3.5" />
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
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border-[3px] border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] transition-all font-medium"
                  style={{ borderRadius: '8px 10px 9px 11px' }}
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
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border-[3px] border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] transition-all font-medium"
                    style={{ borderRadius: '8px 10px 9px 11px' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="px-3 sm:px-5 py-2 sm:py-2.5 bg-black hover:bg-[#FFF8E7] text-white hover:text-black border-[3px] border-black font-black transition-all flex items-center gap-1 sm:gap-2 text-sm sm:text-base flex-shrink-0 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.3)]"
                    style={{ borderRadius: '8px 10px 9px 11px' }}
                  >
                    <Plus size={16} strokeWidth={3} className="sm:w-[18px] sm:h-[18px]" />
                    <span className="hidden sm:inline">Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Visibility Option */}
            <div>
              <label className="block text-xs sm:text-sm font-black text-black mb-3">
                Task Visibility
              </label>
              <div className="flex gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-base border-[3px] border-black font-black transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.3)] ${
                    isPublic
                      ? 'bg-green-400 text-white'
                      : 'bg-white text-black hover:bg-green-50'
                  }`}
                  style={{ borderRadius: '8px 10px 9px 11px' }}
                >
                  🌍 Public
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-base border-[3px] border-black font-black transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.3)] ${
                    !isPublic
                      ? 'bg-red-400 text-white'
                      : 'bg-white text-black hover:bg-red-50'
                  }`}
                  style={{ borderRadius: '8px 10px 9px 11px' }}
                >
                  🔒 Private
                </button>
              </div>
              <p className="text-[10px] sm:text-xs text-black/70 font-bold mt-2">
                {isPublic
                  ? 'Anyone can view this task'
                  : 'Password required to view this task'}
              </p>
            </div>

            {/* Persistence Option - Only show on create mode */}
            {mode === 'create' && (
              <div>
                <label className="block text-xs sm:text-sm font-black text-black mb-3">
                  Session Persistence
                </label>
                <div className="flex gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setPersistFor('day')}
                    className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-base border-[3px] border-black font-black transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.3)] ${
                      persistFor === 'day'
                        ? 'bg-black text-white'
                        : 'bg-white text-black hover:bg-[#FFF8E7]'
                    }`}
                    style={{ borderRadius: '8px 10px 9px 11px' }}
                  >
                    For 1 Day
                  </button>
                  <button
                    type="button"
                    onClick={() => setPersistFor('always')}
                    className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-base border-[3px] border-black font-black transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.3)] ${
                      persistFor === 'always'
                        ? 'bg-black text-white'
                        : 'bg-white text-black hover:bg-[#FFF8E7]'
                    }`}
                    style={{ borderRadius: '8px 10px 9px 11px' }}
                  >
                    Always
                  </button>
                </div>
                <p className="text-[10px] sm:text-xs text-black/70 font-bold mt-2">
                  {persistFor === 'day'
                    ? 'You will need to enter password again after 24 hours'
                    : 'You will stay authenticated until you manually logout'}
                </p>
              </div>
            )}

            {/* Date & Time Display */}
            <div 
              className="bg-[#F5E6D3] border-[3px] border-black p-2 sm:p-3"
              style={{ borderRadius: '8px 10px 9px 11px' }}
            >
              <div className="flex items-center justify-between text-xs sm:text-sm font-black text-black">
                <span>Date: {new Date().toLocaleDateString()}</span>
                <span>Time: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div 
            className="border-t-[3px] border-black p-3 sm:p-5 bg-[#FFF8E7] flex gap-2 sm:gap-3 sticky bottom-0"
            style={{ borderRadius: '0 0 23px 26px' }}
          >
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base bg-white border-[3px] border-black font-black hover:bg-[#F5E6D3] transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.3)]"
              style={{ borderRadius: '8px 10px 9px 11px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-3 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base bg-black text-white border-[3px] border-black font-black hover:bg-[#FFF8E7] hover:text-black transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderRadius: '8px 10px 9px 11px' }}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader size={14} className="animate-spin sm:w-4 sm:h-4" />
                  {mode === 'create' ? 'Creating...' : 'Saving...'}
                </div>
              ) : (
                mode === 'create' ? 'Create Task' : 'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
