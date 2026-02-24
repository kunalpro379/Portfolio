import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Plus, ListTodo, Lock, Unlock, BookOpen, Trash2 } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import TodoCard from './TodoCard';
import TodoForm from './TodoForm';
import TodoPasswordModal from './TodoPasswordModal';
import TodoPerformanceStats from './TodoPerformanceStats';
import {
  fetchGuides,
  deleteGuide,
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
    navigate('/learnings/guide/create');
  };

  const handleViewGuide = (guide: Guide) => {
    navigate(`/learnings/guide/${guide.guideId}`);
  };

  const handleDeleteGuide = async (guideId: string) => {
    if (!confirm('Are you sure you want to delete this guide and all its contents?')) return;
    
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
          links: data.links
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
      console.error('Error saving todo:', err);
      alert('Failed to save todo');
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    if (!confirm('Are you sure you want to delete this todo?')) return;
    
    try {
      await deleteTodo(todoId);
      await loadTodos();
    } catch (err) {
      console.error('Error deleting todo:', err);
      alert('Failed to delete todo');
    }
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

      {/* Notes Tab Content (Existing folders) */}
      {activeSubTab === 'notes' && (
        <div>
          <div className="mb-6">
            <h3 className="text-2xl font-black text-black">My Files</h3>
            <p className="text-sm text-gray-600 font-medium">Browse your file folders</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {notes.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <div className="bg-gray-50/70 backdrop-blur-sm border-3 border-black rounded-2xl p-10 inline-block shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <FolderOpen size={48} strokeWidth={2.5} className="mx-auto mb-3 text-yellow-500" />
                  <p className="text-gray-600 text-base font-bold">No file folders yet</p>
                </div>
              </div>
            ) : (
              notes.map((note, idx) => {
                const rotations = ['-rotate-1', 'rotate-1', '-rotate-2', 'rotate-2', '-rotate-1', 'rotate-1'];
                const hoverRotations = ['hover:rotate-1', 'hover:-rotate-1', 'hover:rotate-2', 'hover:-rotate-2', 'hover:rotate-1', 'hover:-rotate-1'];
                const shadows = [
                  'shadow-[5px_5px_0px_0px_rgba(251,191,36,0.5)]',
                  'shadow-[6px_5px_0px_0px_rgba(245,158,11,0.5)]',
                  'shadow-[5px_6px_0px_0px_rgba(234,179,8,0.5)]',
                  'shadow-[6px_6px_0px_0px_rgba(251,191,36,0.5)]',
                  'shadow-[5px_5px_0px_0px_rgba(245,158,11,0.5)]',
                  'shadow-[6px_5px_0px_0px_rgba(234,179,8,0.5)]'
                ];
                const hoverShadows = [
                  'hover:shadow-[9px_9px_0px_0px_rgba(251,191,36,0.7)]',
                  'hover:shadow-[10px_9px_0px_0px_rgba(245,158,11,0.7)]',
                  'hover:shadow-[9px_10px_0px_0px_rgba(234,179,8,0.7)]',
                  'hover:shadow-[10px_10px_0px_0px_rgba(251,191,36,0.7)]',
                  'hover:shadow-[9px_9px_0px_0px_rgba(245,158,11,0.7)]',
                  'hover:shadow-[10px_9px_0px_0px_rgba(234,179,8,0.7)]'
                ];
                const bgGradients = [
                  'bg-gradient-to-br from-yellow-50 to-white',
                  'bg-gradient-to-br from-amber-50 to-white',
                  'bg-gradient-to-br from-yellow-100 to-yellow-50',
                  'bg-gradient-to-br from-amber-100 to-amber-50',
                  'bg-gradient-to-br from-yellow-50 to-white',
                  'bg-gradient-to-br from-amber-50 to-white'
                ];
                
                return (
                  <div
                    key={note.folderId}
                    onClick={() => {
                      if (note.folderId) {
                        navigate(`/learnings/notes/${note.folderId}`);
                      }
                    }}
                    className={`${bgGradients[idx % 6]} backdrop-blur-sm border-[3px] border-black p-4 transition-all duration-300 cursor-pointer hover:-translate-y-2 group ${rotations[idx % 6]} ${hoverRotations[idx % 6]} ${shadows[idx % 6]} ${hoverShadows[idx % 6]}`}
                    style={{ 
                      borderRadius: idx % 2 === 0 ? '16px 20px 18px 22px' : '20px 16px 22px 18px'
                    }}
                  >
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="p-2.5 bg-gradient-to-br from-yellow-300 to-yellow-400 border-[3px] border-black rounded-lg group-hover:rotate-12 transition-transform">
                        <FolderOpen size={24} strokeWidth={2.5} />
                      </div>
                      <h3 className="text-sm font-black text-black line-clamp-2 leading-tight">{note.name}</h3>
                    </div>
                  </div>
                );
              })
            )}
          </div>
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
                <h2 className="text-2xl font-black text-black">My Todos</h2>
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
                    <span className="hidden sm:inline">New Todo</span>
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
                  <span>Unlock Todos</span>
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
                <p className="text-gray-700 text-sm font-medium mb-4">Enter password to view your todos</p>
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
                <p className="text-black text-lg font-black mb-2">No todos yet</p>
                <p className="text-gray-700 text-sm font-medium mb-4">Create your first todo to get started</p>
                <button
                  onClick={handleCreateTodo}
                  className="px-6 py-3 bg-black text-white border-3 border-black rounded-xl font-bold hover:bg-gray-800 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-flex items-center gap-2"
                >
                  <Plus size={20} strokeWidth={2.5} />
                  Create Todo
                </button>
              </div>
            </div>
          ) : (
            <>
              {performanceStats && todos.length > 0 && (
                <div className="mb-6">
                  <TodoPerformanceStats stats={performanceStats} />
                </div>
              )}

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
          links: editingTodo.links
        } : undefined}
        mode={todoFormMode}
      />
    </div>
  );
}
