import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Plus, ListTodo, Lock, Unlock, BookOpen, Trash2 } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import TodoCard from './TodoCard';
import TodoForm from './TodoForm';
import TodoPasswordModal from './TodoPasswordModal';
import {
  fetchGuides,
  deleteGuide,
  createGuide,
  type Guide
} from '@/services/guideNotesApi';
import {
  fetchTodos,
  fetchTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodoPoint,
  fetchPerformanceStats,
  isAuthenticated,
  setAuthToken,
  clearAuthToken,
  type Todo,
  type CreateTodoData,
  type PerformanceStats
} from '@/services/todoApi';

interface Note {
  folderId: string;
  name: string;
  path: string;
  parentPath: string;
  createdAt: string;
}

interface NotesTabContentProps {
  notes: Note[];
  activeSubTab?: 'guide' | 'notes' | 'todo';
}

export default function NotesTabContent({ notes, activeSubTab: propActiveSubTab }: NotesTabContentProps) {
  const navigate = useNavigate();
  const [activeSubTab, setActiveSubTab] = useState<'guide' | 'notes' | 'todo'>(propActiveSubTab || 'guide');

  // Update activeSubTab when prop changes
  useEffect(() => {
    if (propActiveSubTab) {
      setActiveSubTab(propActiveSubTab);
    }
  }, [propActiveSubTab]);
  
  // Guide Notes State
  const [guides, setGuides] = useState<Guide[]>([]);
  const [guidesLoading, setGuidesLoading] = useState(false);
  const [showCreateGuideModal, setShowCreateGuideModal] = useState(false);
  const [guideFormData, setGuideFormData] = useState({ name: '', topic: '', description: '' });
  const [creatingGuide, setCreatingGuide] = useState(false);

  // Todo State
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todosLoading, setTodosLoading] = useState(false);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
  const [showTodoPasswordModal, setShowTodoPasswordModal] = useState(false);
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [todoFormMode, setTodoFormMode] = useState<'create' | 'edit'>('create');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [todoPasswordMode, setTodoPasswordMode] = useState<'view' | 'create' | 'edit'>('view');
  const [todosAuthenticated, setTodosAuthenticated] = useState(isAuthenticated());

  // Load guides
  useEffect(() => {
    if (activeSubTab === 'guide') {
      loadGuides();
    }
  }, [activeSubTab]);

  // Load todos
  useEffect(() => {
    if (activeSubTab === 'todo' && todosAuthenticated) {
      loadTodos();
    }
  }, [activeSubTab, todosAuthenticated]);

  const loadGuides = async () => {
    try {
      setGuidesLoading(true);
      const fetchedGuides = await fetchGuides();
      setGuides(fetchedGuides);
    } catch (err) {
      console.error('Error loading guides:', err);
    } finally {
      setGuidesLoading(false);
    }
  };

  const loadTodos = async () => {
    try {
      setTodosLoading(true);
      const [fetchedTodos, stats] = await Promise.all([
        fetchTodos(),
        fetchPerformanceStats()
      ]);
      setTodos(fetchedTodos);
      setPerformanceStats(stats);
    } catch (err) {
      console.error('Error loading todos:', err);
    } finally {
      setTodosLoading(false);
    }
  };

  const handleCreateGuide = () => {
    setShowCreateGuideModal(true);
  };

  const handleGuideFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!guideFormData.name.trim() || !guideFormData.topic.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setCreatingGuide(true);
      const newGuide = await createGuide({
        name: guideFormData.name,
        topic: guideFormData.topic,
        description: guideFormData.description
      });
      
      setShowCreateGuideModal(false);
      setGuideFormData({ name: '', topic: '', description: '' });
      await loadGuides();
      
      // Navigate to the newly created guide
      navigate(`/learnings/guide/${newGuide.guideId}`);
    } catch (err) {
      console.error('Error creating guide:', err);
      alert('Failed to create guide. Please try again.');
    } finally {
      setCreatingGuide(false);
    }
  };

  const handleViewGuide = (guide: Guide) => {
    navigate(`/learnings/guide/${guide.guideId}`);
  };

  const handleDeleteGuide = async (guideId: string) => {
    if (!window.confirm('Are you sure you want to delete this guide and all its contents?')) return;
    
    try {
      await deleteGuide(guideId);
      await loadGuides();
    } catch (err) {
      console.error('Error deleting guide:', err);
      alert('Failed to delete guide');
    }
  };

  // Todo handlers
  const handleTodoPasswordSuccess = (persistFor: 'day' | 'always') => {
    setAuthToken(persistFor);
    setTodosAuthenticated(true);
    
    if (todoPasswordMode === 'create') {
      setShowTodoForm(true);
      setTodoFormMode('create');
    } else if (todoPasswordMode === 'edit' && editingTodo) {
      setShowTodoForm(true);
      setTodoFormMode('edit');
    }
  };

  const handleCreateTodo = () => {
    if (!todosAuthenticated) {
      setTodoPasswordMode('create');
      setShowTodoPasswordModal(true);
    } else {
      setTodoFormMode('create');
      setEditingTodo(null);
      setShowTodoForm(true);
    }
  };

  const handleEditTodo = async (todo: Todo) => {
    if (!todosAuthenticated) {
      setTodoPasswordMode('edit');
      setEditingTodo(todo);
      setShowTodoPasswordModal(true);
    } else {
      try {
        if (!todo.points || !todo.content) {
          const fullTodo = await fetchTodoById(todo.todoId);
          setEditingTodo(fullTodo);
        } else {
          setEditingTodo(todo);
        }
        setTodoFormMode('edit');
        setShowTodoForm(true);
      } catch (err) {
        console.error('Error fetching todo details:', err);
        alert('Failed to load todo details. Please try again.');
      }
    }
  };

  const handleTodoSubmit = async (data: CreateTodoData & { persistFor: 'day' | 'always'; links: any[] }) => {
    try {
      if (todoFormMode === 'create') {
        await createTodo({
          topic: data.topic,
          content: data.content,
          points: data.points,
          links: data.links,
          isPublic: data.isPublic
        });
      } else if (editingTodo) {
        await updateTodo(editingTodo.todoId, {
          topic: data.topic,
          content: data.content,
          points: data.points,
          links: data.links
        });
      }
      
      setShowTodoForm(false);
      setEditingTodo(null);
      await loadTodos();
    } catch (err) {
      console.error('Error saving task:', err);
      alert('Failed to save task');
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    // Navigate to the task detail page where delete with password is handled
    navigate(`/todo/${todoId}`);
  };

  const handleToggleTodoPoint = async (todoId: string, pointIndex: number) => {
    try {
      await toggleTodoPoint(todoId, pointIndex);
      await loadTodos();
    } catch (err) {
      console.error('Error toggling point:', err);
      alert('Failed to toggle point');
    }
  };

  const handleTodoFormClose = () => {
    setShowTodoForm(false);
    setEditingTodo(null);
    setTodoFormMode('create');
  };

  const handleLogoutTodos = () => {
    clearAuthToken();
    setTodosAuthenticated(false);
    setTodos([]);
  };

  return (
    <div className="space-y-6">
      {/* Guide Tab Content */}
      {activeSubTab === 'guide' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-black text-black">Guides</h3>
              <p className="text-sm text-gray-600 font-medium">Organize your documentation with guides and titles</p>
            </div>
            <button
              onClick={handleCreateGuide}
              className="flex items-center gap-2 px-4 py-3 bg-black text-white border-3 border-black rounded-xl font-bold hover:bg-gray-800 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <Plus size={20} strokeWidth={2.5} />
              <span className="hidden sm:inline">New Guide</span>
            </button>
          </div>

          {guidesLoading ? (
            <div className="flex items-center justify-center py-16">
              <LoadingSpinner size="md" />
            </div>
          ) : guides.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-3 border-black rounded-2xl p-10 inline-block shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <BookOpen size={48} strokeWidth={2.5} className="mx-auto mb-3 text-yellow-600" />
                <p className="text-black text-lg font-black mb-2">No guides yet</p>
                <p className="text-gray-700 text-sm font-medium mb-4">Create your first guide to get started</p>
                <button
                  onClick={handleCreateGuide}
                  className="px-6 py-3 bg-black text-white border-3 border-black rounded-xl font-bold hover:bg-gray-800 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-flex items-center gap-2"
                >
                  <Plus size={20} strokeWidth={2.5} />
                  Create Guide
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {guides.map((guide, idx) => {
                const titleCount = guide.titles.length;
                
                return (
                  <div
                    key={guide.guideId}
                    onClick={() => handleViewGuide(guide)}
                    className="bg-gradient-to-br from-yellow-50/80 to-white/80 backdrop-blur-sm border-[3px] border-black p-5 transition-all duration-300 hover:-translate-y-2 group h-full flex flex-col cursor-pointer hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] relative rounded-2xl"
                  >
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGuide(guide.guideId);
                        }}
                        className="p-1.5 bg-red-500 text-white border-2 border-black rounded-lg hover:bg-red-600 transition-all"
                      >
                        <Trash2 size={14} strokeWidth={2.5} />
                      </button>
                    </div>

                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2.5 bg-gradient-to-br from-yellow-400 to-yellow-600 border-[3px] border-black rounded-lg group-hover:rotate-12 transition-transform flex-shrink-0">
                        <BookOpen size={20} strokeWidth={2.5} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="px-3 py-1.5 bg-yellow-100 border-2 border-black rounded-lg text-[10px] font-black uppercase tracking-wider inline-block mb-2">
                          {guide.topic}
                        </span>
                        <h3 className="text-base md:text-lg font-black text-black mb-2 leading-tight line-clamp-2">
                          {guide.name}
                        </h3>
                      </div>
                    </div>
                    
                    {guide.description && (
                      <p className="text-gray-700 mb-3 font-medium leading-relaxed line-clamp-3 text-sm flex-1">
                        {guide.description}
                      </p>
                    )}
                    
                    <div className="mt-auto pt-3 border-t-2 border-dashed border-gray-300">
                      <div className="flex items-center justify-between text-xs text-gray-600 font-black">
                        <span>{new Date(guide.updatedAt).toLocaleDateString()}</span>
                        <span className="px-2 py-1 bg-blue-100 border-2 border-black rounded text-[10px]">
                          {titleCount} {titleCount === 1 ? 'title' : 'titles'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Notes Tab Content (Premium File Explorer) */}
      {activeSubTab === 'notes' && (
        <div>
          <div className="mb-6">
            <h3 className="text-2xl font-black text-black">My Files</h3>
            <p className="text-sm text-gray-600 font-medium">Browse your file folders</p>
          </div>

          {notes.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gradient-to-br from-amber-50 to-stone-50 border-3 border-black rounded-2xl p-12 inline-block shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 border-3 border-black rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FolderOpen size={32} strokeWidth={2.5} className="text-white" />
                </div>
                <p className="text-black text-lg font-black mb-2">No file folders yet</p>
                <p className="text-gray-700 text-sm font-medium">Create your first folder to get started</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((note, idx) => {
                const styles = [
                  { bg: 'from-white to-stone-50', icon: 'from-amber-400 to-yellow-500', border: 'border-amber-200', shadow: 'shadow-[5px_5px_0px_0px_rgba(251,191,36,0.3)]', hoverShadow: 'hover:shadow-[8px_8px_0px_0px_rgba(251,191,36,0.5)]' },
                  { bg: 'from-amber-50 to-yellow-50', icon: 'from-yellow-500 to-amber-600', border: 'border-yellow-200', shadow: 'shadow-[5px_5px_0px_0px_rgba(234,179,8,0.3)]', hoverShadow: 'hover:shadow-[8px_8px_0px_0px_rgba(234,179,8,0.5)]' },
                  { bg: 'from-stone-50 to-white', icon: 'from-amber-500 to-orange-500', border: 'border-stone-200', shadow: 'shadow-[5px_5px_0px_0px_rgba(120,113,108,0.3)]', hoverShadow: 'hover:shadow-[8px_8px_0px_0px_rgba(120,113,108,0.5)]' },
                ];
                const style = styles[idx % styles.length];
                
                return (
                  <div
                    key={note.folderId}
                    onClick={() => {
                      if (note.folderId) {
                        navigate(`/learnings/notes/${note.folderId}`);
                      }
                    }}
                    className={`bg-gradient-to-br ${style.bg} border-3 border-black rounded-2xl p-5 transition-all duration-300 cursor-pointer hover:-translate-y-2 ${style.shadow} ${style.hoverShadow} group`}
                    style={{ 
                      borderRadius: idx % 2 === 0 ? '16px 20px 18px 22px' : '20px 16px 22px 18px'
                    }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-3 bg-gradient-to-br ${style.icon} border-3 border-black rounded-xl group-hover:rotate-12 transition-transform flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
                        <FolderOpen size={24} strokeWidth={2.5} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-black text-black mb-2 leading-tight line-clamp-2">
                          {note.name}
                        </h3>
                      </div>
                    </div>
                    
                    <div className={`pt-3 border-t-2 border-dashed ${style.border}`}>
                      <div className="flex items-center gap-2 text-xs text-gray-600 font-bold">
                        <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>
                          {new Date(note.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Todo Tab Content */}
      {activeSubTab === 'todo' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-black border-3 border-black rounded-xl">
                <ListTodo size={28} strokeWidth={2.5} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-black">My Tasks</h2>
                <p className="text-sm font-medium text-gray-600">
                  {todosAuthenticated ? 'Manage your tasks' : 'Password protected'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {todosAuthenticated && (
                <>
                  <button
                    onClick={handleCreateTodo}
                    className="flex items-center gap-2 px-4 py-3 bg-black text-white border-3 border-black rounded-xl font-bold hover:bg-gray-800 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <Plus size={20} strokeWidth={2.5} />
                    <span className="hidden sm:inline">New Task</span>
                  </button>
                  <button
                    onClick={handleLogoutTodos}
                    className="flex items-center gap-2 px-4 py-3 bg-red-500 text-white border-3 border-black rounded-xl font-bold hover:bg-red-600 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    title="Logout from todos"
                  >
                    <Lock size={20} strokeWidth={2.5} />
                  </button>
                </>
              )}
              {!todosAuthenticated && (
                <button
                  onClick={() => {
                    setTodoPasswordMode('view');
                    setShowTodoPasswordModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-3 bg-black text-white border-3 border-black rounded-xl font-bold hover:bg-gray-800 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Lock size={20} strokeWidth={2.5} />
                  <span>Unlock Tasks</span>
                </button>
              )}
            </div>
          </div>

          {!todosAuthenticated ? (
            <div className="text-center py-16">
              <div className="bg-gradient-to-br from-[#FFF8E7] to-[#F5E6D3] border-3 border-black rounded-2xl p-10 inline-block shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className="w-20 h-20 bg-black border-3 border-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock size={40} strokeWidth={2.5} className="text-white" />
                </div>
                <p className="text-black text-lg font-black mb-2">Protected Content</p>
                <p className="text-gray-700 text-sm font-medium mb-4">Enter password to view your tasks</p>
                <button
                  onClick={() => {
                    setTodoPasswordMode('view');
                    setShowTodoPasswordModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white border-3 border-black rounded-xl font-bold hover:bg-gray-800 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Unlock size={20} strokeWidth={2.5} />
                  Unlock
                </button>
              </div>
            </div>
          ) : todosLoading ? (
            <div className="flex items-center justify-center py-16">
              <LoadingSpinner size="md" />
            </div>
          ) : todos.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gradient-to-br from-[#FFF8E7] to-[#F5E6D3] border-3 border-black rounded-2xl p-10 inline-block shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <ListTodo size={48} strokeWidth={2.5} className="mx-auto mb-3 text-black" />
                <p className="text-black text-lg font-black mb-2">No tasks yet</p>
                <p className="text-gray-700 text-sm font-medium mb-4">Create your first task to get started</p>
                <button
                  onClick={handleCreateTodo}
                  className="px-6 py-3 bg-black text-white border-3 border-black rounded-xl font-bold hover:bg-gray-800 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-flex items-center gap-2"
                >
                  <Plus size={20} strokeWidth={2.5} />
                  Create Task
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {todos.map((todo) => (
                  <TodoCard
                    key={todo.todoId}
                    todo={todo}
                    onEdit={handleEditTodo}
                    onDelete={handleDeleteTodo}
                    onTogglePoint={handleToggleTodoPoint}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Modals */}
      <TodoPasswordModal
        isOpen={showTodoPasswordModal}
        onClose={() => setShowTodoPasswordModal(false)}
        onSuccess={handleTodoPasswordSuccess}
        mode={todoPasswordMode}
      />

      <TodoForm
        isOpen={showTodoForm}
        onClose={handleTodoFormClose}
        onSubmit={handleTodoSubmit}
        initialData={editingTodo ? {
          todoId: editingTodo.todoId,
          topic: editingTodo.topic,
          content: editingTodo.content,
          points: editingTodo.points,
          links: editingTodo.links,
          isPublic: editingTodo.isPublic
        } : undefined}
        mode={todoFormMode}
      />

      {/* Create Guide Modal */}
      {showCreateGuideModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[500] p-4" onClick={() => setShowCreateGuideModal(false)}>
          <div className="bg-white border-4 border-black rounded-2xl p-8 max-w-2xl w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-3xl font-black text-black mb-6">Create New Guide</h2>
            
            <form onSubmit={handleGuideFormSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Guide Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={guideFormData.name}
                  onChange={(e) => setGuideFormData({ ...guideFormData, name: e.target.value })}
                  className="w-full px-4 py-3 border-3 border-black rounded-xl font-medium text-black focus:outline-none focus:ring-4 focus:ring-yellow-200 transition-all"
                  placeholder="e.g., React Best Practices"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Topic <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={guideFormData.topic}
                  onChange={(e) => setGuideFormData({ ...guideFormData, topic: e.target.value })}
                  className="w-full px-4 py-3 border-3 border-black rounded-xl font-medium text-black focus:outline-none focus:ring-4 focus:ring-yellow-200 transition-all"
                  placeholder="e.g., Web Development"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Description
                </label>
                <textarea
                  value={guideFormData.description}
                  onChange={(e) => setGuideFormData({ ...guideFormData, description: e.target.value })}
                  className="w-full px-4 py-3 border-3 border-black rounded-xl font-medium text-black focus:outline-none focus:ring-4 focus:ring-yellow-200 transition-all resize-none"
                  placeholder="Brief description of your guide..."
                  rows={4}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateGuideModal(false);
                    setGuideFormData({ name: '', topic: '', description: '' });
                  }}
                  disabled={creatingGuide}
                  className="flex-1 px-6 py-3 bg-gray-200 border-3 border-black rounded-xl font-bold text-black hover:bg-gray-300 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingGuide}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 border-3 border-black rounded-xl font-bold text-black hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creatingGuide ? (
                    <>
                      <div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={20} strokeWidth={2.5} />
                      <span>Create Guide</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
