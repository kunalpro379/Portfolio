import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Plus, ListTodo, Lock, Unlock, BookOpen, Edit, Trash2 } from 'lucide-react';
import TodoCard from './TodoCard';
import TodoForm from './TodoForm';
import TodoPasswordModal from './TodoPasswordModal';
import TodoPerformanceStats from './TodoPerformanceStats';
import {
  fetchGuideNotes,
  deleteGuideNote,
  type GuideNote
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
}

export default function NotesTabContent({ notes }: NotesTabContentProps) {
  const navigate = useNavigate();
  const [activeSubTab, setActiveSubTab] = useState<'guide' | 'notes' | 'todo'>('guide');
  
  // Guide Notes State
  const [guideNotes, setGuideNotes] = useState<GuideNote[]>([]);
  const [guideNotesLoading, setGuideNotesLoading] = useState(false);

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

  // Load guide notes
  useEffect(() => {
    if (activeSubTab === 'guide') {
      loadGuideNotes();
    }
  }, [activeSubTab]);

  // Load todos
  useEffect(() => {
    if (activeSubTab === 'todo' && todosAuthenticated) {
      loadTodos();
    }
  }, [activeSubTab, todosAuthenticated]);

  const loadGuideNotes = async () => {
    try {
      setGuideNotesLoading(true);
      const fetchedNotes = await fetchGuideNotes();
      setGuideNotes(fetchedNotes);
    } catch (err) {
      console.error('Error loading guide notes:', err);
    } finally {
      setGuideNotesLoading(false);
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

  const handleCreateGuideNote = () => {
    navigate('/learnings/guide/new');
  };

  const handleEditGuideNote = (note: GuideNote) => {
    navigate(`/learnings/guide/${note.noteId}`);
  };

  const handleDeleteGuideNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this guide note?')) return;
    
    try {
      await deleteGuideNote(noteId);
      await loadGuideNotes();
    } catch (err) {
      console.error('Error deleting guide note:', err);
      alert('Failed to delete guide note');
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
      {/* Sub-tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveSubTab('guide')}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all border-3 border-black whitespace-nowrap ${
            activeSubTab === 'guide'
              ? 'bg-gradient-to-r from-yellow-400 to-amber-400 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -translate-y-0.5'
              : 'bg-white hover:bg-yellow-50 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
          }`}
          style={{ borderRadius: '12px 15px 13px 14px' }}
        >
          <div className="flex items-center gap-2">
            <BookOpen size={18} strokeWidth={2.5} />
            Guide
          </div>
        </button>
        <button
          onClick={() => setActiveSubTab('notes')}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all border-3 border-black whitespace-nowrap ${
            activeSubTab === 'notes'
              ? 'bg-gradient-to-r from-yellow-400 to-amber-400 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -translate-y-0.5'
              : 'bg-white hover:bg-yellow-50 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
          }`}
          style={{ borderRadius: '14px 12px 15px 13px' }}
        >
          <div className="flex items-center gap-2">
            <FolderOpen size={18} strokeWidth={2.5} />
            Files
          </div>
        </button>
        <button
          onClick={() => setActiveSubTab('todo')}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all border-3 border-black whitespace-nowrap ${
            activeSubTab === 'todo'
              ? 'bg-gradient-to-r from-yellow-400 to-amber-400 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -translate-y-0.5'
              : 'bg-white hover:bg-yellow-50 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
          }`}
          style={{ borderRadius: '13px 14px 12px 15px' }}
        >
          <div className="flex items-center gap-2">
            <ListTodo size={18} strokeWidth={2.5} />
            Todo
          </div>
        </button>
      </div>

      {/* Guide Tab Content */}
      {activeSubTab === 'guide' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-black text-black">Guide Notes</h3>
              <p className="text-sm text-gray-600 font-medium">Create comprehensive notes with markdown, canvas, and file uploads</p>
            </div>
            <button
              onClick={handleCreateGuideNote}
              className="flex items-center gap-2 px-4 py-3 bg-black text-white border-3 border-black rounded-xl font-bold hover:bg-gray-800 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <Plus size={20} strokeWidth={2.5} />
              <span className="hidden sm:inline">New Guide</span>
            </button>
          </div>

          {guideNotesLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
                <p className="text-gray-700 font-bold">Loading guide notes...</p>
              </div>
            </div>
          ) : guideNotes.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-3 border-black rounded-2xl p-10 inline-block shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <BookOpen size={48} strokeWidth={2.5} className="mx-auto mb-3 text-yellow-600" />
                <p className="text-black text-lg font-black mb-2">No guide notes yet</p>
                <p className="text-gray-700 text-sm font-medium mb-4">Create your first guide note to get started</p>
                <button
                  onClick={handleCreateGuideNote}
                  className="px-6 py-3 bg-black text-white border-3 border-black rounded-xl font-bold hover:bg-gray-800 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-flex items-center gap-2"
                >
                  <Plus size={20} strokeWidth={2.5} />
                  Create Guide Note
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {guideNotes.map((note, idx) => {
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
                
                return (
                  <div
                    key={note.noteId}
                    className={`bg-gradient-to-br from-yellow-50 to-white backdrop-blur-sm border-[3px] border-black p-5 transition-all duration-300 hover:-translate-y-2 group h-full flex flex-col ${rotations[idx % 4]} ${hoverRotations[idx % 4]} ${shadows[idx % 4]} ${hoverShadows[idx % 4]} relative`}
                    style={{ 
                      borderRadius: idx % 2 === 0 ? '20px 24px 22px 26px' : '24px 20px 26px 22px'
                    }}
                  >
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={() => handleEditGuideNote(note)}
                        className="p-1.5 bg-blue-500 text-white border-2 border-black rounded-lg hover:bg-blue-600 transition-all"
                      >
                        <Edit size={14} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => handleDeleteGuideNote(note.noteId)}
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
                          {note.topic}
                        </span>
                        <h3 className="text-base md:text-lg font-black text-black mb-2 leading-tight line-clamp-2">
                          {note.title}
                        </h3>
                      </div>
                    </div>
                    
                    {note.content && (
                      <p className="text-gray-700 mb-3 font-medium leading-relaxed line-clamp-3 text-sm flex-1">
                        {note.content.substring(0, 150)}...
                      </p>
                    )}
                    
                    <div className="mt-auto pt-3 border-t-2 border-dashed border-gray-300">
                      <div className="flex items-center justify-between text-xs text-gray-600 font-black">
                        <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                        {note.assets && note.assets.length > 0 && (
                          <span className="px-2 py-1 bg-blue-100 border-2 border-black rounded text-[10px]">
                            {note.assets.length} files
                          </span>
                        )}
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
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"></div>
                <p className="text-gray-700 font-bold">Loading todos...</p>
              </div>
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
