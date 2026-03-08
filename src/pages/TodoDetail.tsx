import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Lock, Edit3, Eye, Settings, X, Maximize2 } from 'lucide-react';
import { fetchTodoById, updateTodo, isAuthenticated, setAuthToken, type Todo, type TodoPoint, type CustomColumn } from '@/services/todoApi';
import LoadingSpinner from '@/components/LoadingSpinner';

const CORRECT_PASSWORD = 'kunal';

export default function TodoDetail() {
  const navigate = useNavigate();
  const { todoId } = useParams<{ todoId: string }>();
  
  const [showPasswordModal, setShowPasswordModal] = useState(!isAuthenticated());
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  const [todo, setTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [editingTopic, setEditingTopic] = useState(false);
  const [topicValue, setTopicValue] = useState('');
  
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState<'text' | 'select' | 'date' | 'number'>('text');
  
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [moreContent, setMoreContent] = useState('');

  const defaultColumns: CustomColumn[] = [
    { id: 'task', name: 'Task', type: 'text', visible: true, width: 300 },
    { id: 'status', name: 'Status', type: 'select', options: ['pending', 'working', 'resolved'], visible: true, width: 150 },
    { id: 'priority', name: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'urgent'], visible: true, width: 120 },
    { id: 'dueDate', name: 'Due Date', type: 'date', visible: true, width: 150 },
    { id: 'notes', name: 'Notes', type: 'text', visible: true, width: 200 },
  ];

  useEffect(() => {
    if (isAuthenticated()) {
      loadTodo();
    }
  }, [todoId]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      setAuthToken(rememberMe ? 'always' : 'day');
      setShowPasswordModal(false);
      setPasswordError('');
      loadTodo();
    } else {
      setPasswordError('Incorrect password');
    }
  };

  const loadTodo = async () => {
    if (!todoId) return;
    try {
      setLoading(true);
      const data = await fetchTodoById(todoId);
      setTodo(data);
      setTopicValue(data.topic);
    } catch (error) {
      console.error('Error loading todo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!todo) return;
    try {
      setSaving(true);
      await updateTodo(todo.todoId, {
        topic: topicValue,
        points: todo.points,
        customColumns: todo.customColumns
      });
      setTodo({ ...todo, topic: topicValue });
      setEditingTopic(false);
    } catch (error) {
      console.error('Error saving todo:', error);
    } finally {
      setSaving(false);
    }
  };

  const updatePoint = (index: number, field: keyof TodoPoint, value: any) => {
    if (!todo) return;
    const newPoints = [...todo.points];
    newPoints[index] = { ...newPoints[index], [field]: value };
    setTodo({ ...todo, points: newPoints });
  };

  const addPoint = () => {
    if (!todo) return;
    const newPoint: TodoPoint = {
      text: '',
      status: 'pending',
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      notes: ''
    };
    setTodo({ ...todo, points: [...todo.points, newPoint] });
  };

  const deletePoint = (index: number) => {
    if (!todo) return;
    const newPoints = todo.points.filter((_, i) => i !== index);
    setTodo({ ...todo, points: newPoints });
  };

  const addCustomColumn = () => {
    if (!todo || !newColumnName.trim()) return;
    const newColumn: CustomColumn = {
      id: `custom_${Date.now()}`,
      name: newColumnName,
      type: newColumnType,
      visible: true,
      width: 150,
      options: newColumnType === 'select' ? [] : undefined
    };
    setTodo({
      ...todo,
      customColumns: [...(todo.customColumns || []), newColumn]
    });
    setNewColumnName('');
    setNewColumnType('text');
  };

  const toggleColumnVisibility = (columnId: string) => {
    if (!todo) return;
    const columns = todo.customColumns || [];
    const updated = columns.map(col =>
      col.id === columnId ? { ...col, visible: !col.visible } : col
    );
    setTodo({ ...todo, customColumns: updated });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-cream-100 border-black text-black';
      case 'working': return 'bg-white border-black text-black';
      case 'pending': return 'bg-gray-50 border-black text-black';
      default: return 'bg-gray-100 border-black text-black';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-black text-white border-black';
      case 'high': return 'bg-gray-800 text-white border-black';
      case 'medium': return 'bg-gray-400 text-black border-black';
      case 'low': return 'bg-gray-200 text-black border-black';
      default: return 'bg-gray-100 border-black text-black';
    }
  };
  
  const openNotesModal = (index: number, currentNotes: string) => {
    setCurrentNoteIndex(index);
    setNoteText(currentNotes || '');
    setShowNotesModal(true);
  };
  
  const saveNotes = () => {
    if (currentNoteIndex !== null) {
      updatePoint(currentNoteIndex, 'notes', noteText);
    }
    setShowNotesModal(false);
    setCurrentNoteIndex(null);
    setNoteText('');
  };
  
  const openMoreModal = (content: string) => {
    setMoreContent(content);
    setShowMoreModal(true);
  };

  const getStats = () => {
    if (!todo) return { total: 0, resolved: 0, working: 0, pending: 0, percentage: 0 };
    const total = todo.points.length;
    const resolved = todo.points.filter(p => p.status === 'resolved').length;
    const working = todo.points.filter(p => p.status === 'working').length;
    const pending = todo.points.filter(p => p.status === 'pending').length;
    const percentage = total > 0 ? Math.round((resolved / total) * 100) : 0;
    return { total, resolved, working, pending, percentage };
  };

  const allColumns = [...defaultColumns, ...(todo?.customColumns || [])];
  const visibleColumns = allColumns.filter(col => col.visible);

  if (showPasswordModal) {
    return (
      <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-black rounded-lg">
              <Lock size={48} className="text-white" strokeWidth={2} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-black mb-2 text-center">
            Protected Todo
          </h2>
          <p className="text-black text-center mb-6">Enter password to access</p>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                autoFocus
              />
              {passwordError && (
                <p className="text-red-600 text-sm mt-2">{passwordError}</p>
              )}
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 border-2 border-black rounded"
              />
              <span className="text-gray-700">Remember me</span>
            </label>
            
            <button
              type="submit"
              className="w-full px-6 py-4 bg-black text-white border-2 border-black rounded-lg font-bold text-lg hover:bg-gray-900 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!todo) {
    return (
      <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-black mb-4">Todo not found</p>
          <button
            onClick={() => navigate('/learnings?tab=todo')}
            className="px-6 py-3 bg-white text-black border-2 border-black rounded-lg font-bold hover:bg-gray-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            Back to Todos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5DC] py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header - Back, Title, Edit Mode in ONE LINE */}
        <div className="flex items-center justify-between mb-8 bg-white rounded-lg p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <button
            onClick={() => navigate('/learnings?tab=todo')}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black rounded-lg font-bold hover:bg-gray-50 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          
          <div className="flex-1 mx-6">
            {isEditMode && editingTopic ? (
              <input
                type="text"
                value={topicValue}
                onChange={(e) => setTopicValue(e.target.value)}
                onBlur={() => setEditingTopic(false)}
                className="w-full text-3xl font-bold text-black bg-transparent border-b-2 border-black focus:outline-none text-center"
                autoFocus
              />
            ) : (
              <h1
                onClick={() => isEditMode && setEditingTopic(true)}
                className={`text-3xl font-bold text-black text-center ${isEditMode ? 'cursor-pointer hover:text-gray-700' : ''}`}
              >
                {topicValue}
              </h1>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {!isEditMode ? (
              <button
                onClick={() => setIsEditMode(true)}
                className="flex items-center gap-2 px-6 py-2 bg-black text-white border-2 border-black rounded-lg font-bold hover:bg-gray-900 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                <Edit3 size={20} />
                Edit Mode
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsEditMode(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black rounded-lg font-bold hover:bg-gray-50 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Eye size={20} />
                  View Mode
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-black text-white border-2 border-black rounded-lg font-bold hover:bg-gray-900 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
                >
                  <Save size={20} />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            )}
          </div>
        </div>

        {isEditMode && (
          <div className="mb-6">
            <button
              onClick={() => setShowColumnSettings(!showColumnSettings)}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black rounded-lg font-bold hover:bg-gray-50 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <Settings size={18} />
              Column Settings
            </button>
            
            {showColumnSettings && (
              <div className="mt-4 bg-white rounded-lg p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex flex-wrap gap-2 mb-4">
                  {allColumns.map(col => (
                    <button
                      key={col.id}
                      onClick={() => toggleColumnVisibility(col.id)}
                      className={`px-3 py-1.5 border-2 border-black rounded-lg font-bold text-sm transition-all ${
                        col.visible ? 'bg-black text-white' : 'bg-gray-200 text-black'
                      }`}
                    >
                      {col.name}
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder="Column name"
                    className="flex-1 px-3 py-2 border-2 border-black rounded-lg"
                  />
                  <select
                    value={newColumnType}
                    onChange={(e) => setNewColumnType(e.target.value as any)}
                    className="px-3 py-2 border-2 border-black rounded-lg"
                  >
                    <option value="text">Text</option>
                    <option value="select">Select</option>
                    <option value="date">Date</option>
                    <option value="number">Number</option>
                  </select>
                  <button
                    onClick={addCustomColumn}
                    className="px-4 py-2 bg-black text-white border-2 border-black rounded-lg font-bold hover:bg-gray-900"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-black border-b-2 border-black">
                  {visibleColumns.map(col => (
                    <th
                      key={col.id}
                      className="px-4 py-4 text-left font-bold text-white border-r-2 border-gray-700 last:border-r-0"
                      style={{ minWidth: col.width }}
                    >
                      {col.name}
                    </th>
                  ))}
                  {isEditMode && (
                    <th className="px-4 py-4 text-center font-bold text-white w-20">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {todo.points.map((point, idx) => (
                  <tr key={idx} className="border-b-2 border-gray-200 hover:bg-[#F5F5DC] transition-colors">
                    {visibleColumns.map(col => {
                      if (col.id === 'task') {
                        return (
                          <td key={col.id} className="px-4 py-3 border-r-2 border-gray-200">
                            {isEditMode ? (
                              <input
                                type="text"
                                value={point.text}
                                onChange={(e) => updatePoint(idx, 'text', e.target.value)}
                                className="w-full px-2 py-1 border-2 border-black rounded"
                              />
                            ) : (
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{point.text}</span>
                                {point.text && point.text.length > 50 && (
                                  <button
                                    onClick={() => openMoreModal(point.text)}
                                    className="ml-2 text-xs px-2 py-1 bg-white border border-black rounded hover:bg-gray-50"
                                  >
                                    <Maximize2 size={12} />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      }
                      if (col.id === 'status') {
                        return (
                          <td key={col.id} className="px-4 py-3 border-r-2 border-gray-200">
                            {isEditMode ? (
                              <select
                                value={point.status}
                                onChange={(e) => updatePoint(idx, 'status', e.target.value)}
                                className={`w-full px-2 py-1 border-2 rounded ${getStatusColor(point.status)}`}
                              >
                                <option value="pending">Pending</option>
                                <option value="working">Working</option>
                                <option value="resolved">Resolved</option>
                              </select>
                            ) : (
                              <span className={`inline-block px-3 py-1 rounded-lg border-2 text-sm font-medium ${getStatusColor(point.status)}`}>
                                {point.status}
                              </span>
                            )}
                          </td>
                        );
                      }
                      if (col.id === 'priority') {
                        return (
                          <td key={col.id} className="px-4 py-3 border-r-2 border-gray-200">
                            {isEditMode ? (
                              <select
                                value={point.priority || 'medium'}
                                onChange={(e) => updatePoint(idx, 'priority', e.target.value)}
                                className={`w-full px-2 py-1 border-2 rounded ${getPriorityColor(point.priority || 'medium')}`}
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                              </select>
                            ) : (
                              <span className={`inline-block px-3 py-1 rounded-lg border-2 text-sm font-medium ${getPriorityColor(point.priority || 'medium')}`}>
                                {point.priority || 'medium'}
                              </span>
                            )}
                          </td>
                        );
                      }
                      if (col.id === 'dueDate') {
                        return (
                          <td key={col.id} className="px-4 py-3 border-r-2 border-gray-200">
                            {isEditMode ? (
                              <input
                                type="date"
                                value={point.dueDate ? new Date(point.dueDate).toISOString().split('T')[0] : ''}
                                onChange={(e) => updatePoint(idx, 'dueDate', e.target.value)}
                                className="w-full px-2 py-1 border-2 border-black rounded"
                              />
                            ) : (
                              <span className="font-medium">
                                {point.dueDate ? new Date(point.dueDate).toLocaleDateString() : '-'}
                              </span>
                            )}
                          </td>
                        );
                      }
                      if (col.id === 'notes') {
                        return (
                          <td key={col.id} className="px-4 py-3 border-r-2 border-gray-200">
                            <button
                              onClick={() => openNotesModal(idx, point.notes || '')}
                              className="w-full text-left px-2 py-1 border-2 border-black rounded hover:bg-gray-50 transition-colors"
                            >
                              <span className="text-sm text-gray-600 truncate block">
                                {point.notes || 'Click to add notes...'}
                              </span>
                            </button>
                          </td>
                        );
                      }
                      return <td key={col.id} className="px-4 py-3 border-r-2 border-gray-200">-</td>;
                    })}
                    {isEditMode && (
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => deletePoint(idx)}
                          className="p-2 bg-white border-2 border-black rounded-lg hover:bg-red-50 hover:border-red-500 transition-colors"
                        >
                          <Trash2 size={16} className="text-black hover:text-red-500" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {isEditMode && (
            <div className="p-4 border-t-2 border-black bg-[#F5F5DC]">
              <button
                onClick={addPoint}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white border-2 border-black rounded-lg font-bold hover:bg-gray-900 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <Plus size={20} />
                Add Task
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b-2 border-black">
              <h3 className="text-xl font-bold">Edit Notes</h3>
              <button
                onClick={() => {
                  setShowNotesModal(false);
                  setCurrentNoteIndex(null);
                  setNoteText('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full h-full min-h-[300px] px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                placeholder="Enter your notes here..."
                autoFocus
              />
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t-2 border-black">
              <button
                onClick={() => {
                  setShowNotesModal(false);
                  setCurrentNoteIndex(null);
                  setNoteText('');
                }}
                className="px-4 py-2 bg-white border-2 border-black rounded-lg font-bold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveNotes}
                className="px-6 py-2 bg-black text-white border-2 border-black rounded-lg font-bold hover:bg-gray-900 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Show More Modal */}
      {showMoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-3xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b-2 border-black">
              <h3 className="text-xl font-bold">Full Content</h3>
              <button
                onClick={() => {
                  setShowMoreModal(false);
                  setMoreContent('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{moreContent}</p>
            </div>
            <div className="flex items-center justify-end p-4 border-t-2 border-black">
              <button
                onClick={() => {
                  setShowMoreModal(false);
                  setMoreContent('');
                }}
                className="px-6 py-2 bg-black text-white border-2 border-black rounded-lg font-bold hover:bg-gray-900 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
