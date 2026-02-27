import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Lock, Edit3, Eye, Settings } from 'lucide-react';
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

  const defaultColumns: CustomColumn[] = [
    { id: 'task', name: 'Task', type: 'text', visible: true, width: 300 },
    { id: 'status', name: 'Status', type: 'select', options: ['pending', 'working', 'resolved'], visible: true, width: 150 },
    { id: 'priority', name: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'urgent'], visible: true, width: 120 },
    { id: 'assignee', name: 'Assignee', type: 'text', visible: true, width: 150 },
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
      assignee: '',
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
      case 'resolved': return 'bg-yellow-400 border-black text-black';
      case 'working': return 'bg-yellow-200 border-black text-black';
      case 'pending': return 'bg-white border-black text-black';
      default: return 'bg-gray-100 border-black text-black';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-yellow-500 border-black text-black';
      case 'high': return 'bg-yellow-400 border-black text-black';
      case 'medium': return 'bg-yellow-200 border-black text-black';
      case 'low': return 'bg-white border-black text-black';
      default: return 'bg-gray-100 border-black text-black';
    }
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
  const stats = getStats();

  if (showPasswordModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-yellow-50 to-amber-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-yellow-400 border-4 border-black rounded-2xl">
              <Lock size={48} className="text-black" strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="text-3xl font-black text-black mb-2 text-center" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            Protected Todo
          </h2>
          <p className="text-black font-bold text-center mb-6">Enter password to access</p>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 border-3 border-black rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-yellow-300"
                autoFocus
              />
              {passwordError && (
                <p className="text-red-600 font-bold text-sm mt-2">{passwordError}</p>
              )}
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 border-3 border-black rounded"
              />
              <span className="font-bold text-gray-700">Remember me</span>
            </label>
            
            <button
              type="submit"
              className="w-full px-6 py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-black border-4 border-black rounded-2xl font-black text-lg hover:from-yellow-500 hover:to-amber-600 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
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
      <div className="min-h-screen bg-gradient-to-br from-white via-yellow-50 to-amber-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!todo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-yellow-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-black text-black mb-4">Todo not found</p>
          <button
            onClick={() => navigate('/learnings?tab=todo')}
            className="px-6 py-3 bg-yellow-400 text-black border-4 border-black rounded-2xl font-black hover:bg-yellow-500 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            Back to Todos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-yellow-50 to-amber-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/learnings?tab=todo')}
              className="flex items-center gap-2 px-4 py-2 bg-white border-3 border-black rounded-xl font-bold hover:bg-gray-50 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            >
              <ArrowLeft size={20} strokeWidth={2.5} />
              Back
            </button>
            
            <div className="flex items-center gap-3">
              {!isEditMode ? (
                <button
                  onClick={() => setIsEditMode(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-black text-yellow-400 border-3 border-black rounded-xl font-black hover:bg-gray-900 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Edit3 size={20} strokeWidth={2.5} />
                  Edit Mode
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditMode(false)}
                    className="flex items-center gap-2 px-4 py-3 bg-white border-3 border-black rounded-xl font-bold hover:bg-gray-50 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <Eye size={20} strokeWidth={2.5} />
                    View Mode
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-yellow-400 text-black border-3 border-black rounded-xl font-black hover:bg-yellow-500 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
                  >
                    <Save size={20} strokeWidth={2.5} />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-6">
            {isEditMode && editingTopic ? (
              <input
                type="text"
                value={topicValue}
                onChange={(e) => setTopicValue(e.target.value)}
                onBlur={() => setEditingTopic(false)}
                className="w-full text-4xl font-black text-black bg-transparent border-b-4 border-black focus:outline-none"
                style={{ fontFamily: 'Comic Sans MS, cursive' }}
                autoFocus
              />
            ) : (
              <h1
                onClick={() => isEditMode && setEditingTopic(true)}
                className={`text-4xl font-black text-black ${isEditMode ? 'cursor-pointer hover:text-gray-700' : ''}`}
                style={{ fontFamily: 'Comic Sans MS, cursive' }}
              >
                {topicValue}
              </h1>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <div className="bg-white rounded-2xl p-4 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-xs font-bold text-black mb-1">Total</p>
              <p className="text-2xl font-black text-black">{stats.total}</p>
            </div>
            <div className="bg-yellow-400 rounded-2xl p-4 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-xs font-bold text-black mb-1">Resolved</p>
              <p className="text-2xl font-black text-black">{stats.resolved}</p>
            </div>
            <div className="bg-yellow-200 rounded-2xl p-4 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-xs font-bold text-black mb-1">Working</p>
              <p className="text-2xl font-black text-black">{stats.working}</p>
            </div>
            <div className="bg-yellow-100 rounded-2xl p-4 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-xs font-bold text-black mb-1">Pending</p>
              <p className="text-2xl font-black text-black">{stats.pending}</p>
            </div>
            <div className="bg-yellow-300 rounded-2xl p-4 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-xs font-bold text-black mb-1">Progress</p>
              <p className="text-2xl font-black text-black">{stats.percentage}%</p>
            </div>
          </div>
        </div>

        {isEditMode && (
          <div className="mb-6">
            <button
              onClick={() => setShowColumnSettings(!showColumnSettings)}
              className="flex items-center gap-2 px-4 py-2 bg-white border-3 border-black rounded-xl font-bold hover:bg-gray-50 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            >
              <Settings size={18} strokeWidth={2.5} />
              Column Settings
            </button>
            
            {showColumnSettings && (
              <div className="mt-4 bg-white rounded-2xl p-4 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex flex-wrap gap-2 mb-4">
                  {allColumns.map(col => (
                    <button
                      key={col.id}
                      onClick={() => toggleColumnVisibility(col.id)}
                      className={`px-3 py-1.5 border-2 border-black rounded-lg font-bold text-sm transition-all ${
                        col.visible ? 'bg-yellow-300' : 'bg-gray-200'
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
                    className="flex-1 px-3 py-2 border-2 border-black rounded-lg font-bold"
                  />
                  <select
                    value={newColumnType}
                    onChange={(e) => setNewColumnType(e.target.value as any)}
                    className="px-3 py-2 border-2 border-black rounded-lg font-bold"
                  >
                    <option value="text">Text</option>
                    <option value="select">Select</option>
                    <option value="date">Date</option>
                    <option value="number">Number</option>
                  </select>
                  <button
                    onClick={addCustomColumn}
                    className="px-4 py-2 bg-yellow-400 border-2 border-black rounded-lg font-bold hover:bg-yellow-500"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-yellow-400 border-b-4 border-black">
                  {visibleColumns.map(col => (
                    <th
                      key={col.id}
                      className="px-4 py-4 text-left font-black text-black border-r-3 border-black last:border-r-0"
                      style={{ minWidth: col.width }}
                    >
                      {col.name}
                    </th>
                  ))}
                  {isEditMode && (
                    <th className="px-4 py-4 text-center font-black text-black w-20">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {todo.points.map((point, idx) => (
                  <tr key={idx} className="border-b-3 border-black hover:bg-yellow-50 transition-colors">
                    {visibleColumns.map(col => {
                      if (col.id === 'task') {
                        return (
                          <td key={col.id} className="px-4 py-3 border-r-3 border-black">
                            {isEditMode ? (
                              <input
                                type="text"
                                value={point.text}
                                onChange={(e) => updatePoint(idx, 'text', e.target.value)}
                                className="w-full px-2 py-1 border-2 border-black rounded font-bold"
                              />
                            ) : (
                              <span className="font-bold">{point.text}</span>
                            )}
                          </td>
                        );
                      }
                      if (col.id === 'status') {
                        return (
                          <td key={col.id} className="px-4 py-3 border-r-3 border-black">
                            {isEditMode ? (
                              <select
                                value={point.status}
                                onChange={(e) => updatePoint(idx, 'status', e.target.value)}
                                className={`w-full px-2 py-1 border-2 rounded font-bold ${getStatusColor(point.status)}`}
                              >
                                <option value="pending">Pending</option>
                                <option value="working">Working</option>
                                <option value="resolved">Resolved</option>
                              </select>
                            ) : (
                              <span className={`inline-block px-3 py-1 rounded-lg border-2 font-bold ${getStatusColor(point.status)}`}>
                                {point.status}
                              </span>
                            )}
                          </td>
                        );
                      }
                      if (col.id === 'priority') {
                        return (
                          <td key={col.id} className="px-4 py-3 border-r-3 border-black">
                            {isEditMode ? (
                              <select
                                value={point.priority || 'medium'}
                                onChange={(e) => updatePoint(idx, 'priority', e.target.value)}
                                className={`w-full px-2 py-1 border-2 rounded font-bold ${getPriorityColor(point.priority || 'medium')}`}
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                              </select>
                            ) : (
                              <span className={`inline-block px-3 py-1 rounded-lg border-2 font-bold ${getPriorityColor(point.priority || 'medium')}`}>
                                {point.priority || 'medium'}
                              </span>
                            )}
                          </td>
                        );
                      }
                      if (col.id === 'assignee') {
                        return (
                          <td key={col.id} className="px-4 py-3 border-r-3 border-black">
                            {isEditMode ? (
                              <input
                                type="text"
                                value={point.assignee || ''}
                                onChange={(e) => updatePoint(idx, 'assignee', e.target.value)}
                                className="w-full px-2 py-1 border-2 border-black rounded font-bold"
                                placeholder="Assignee"
                              />
                            ) : (
                              <span className="font-bold">{point.assignee || '-'}</span>
                            )}
                          </td>
                        );
                      }
                      if (col.id === 'dueDate') {
                        return (
                          <td key={col.id} className="px-4 py-3 border-r-3 border-black">
                            {isEditMode ? (
                              <input
                                type="date"
                                value={point.dueDate ? new Date(point.dueDate).toISOString().split('T')[0] : ''}
                                onChange={(e) => updatePoint(idx, 'dueDate', e.target.value)}
                                className="w-full px-2 py-1 border-2 border-black rounded font-bold"
                              />
                            ) : (
                              <span className="font-bold">
                                {point.dueDate ? new Date(point.dueDate).toLocaleDateString() : '-'}
                              </span>
                            )}
                          </td>
                        );
                      }
                      if (col.id === 'notes') {
                        return (
                          <td key={col.id} className="px-4 py-3 border-r-3 border-black">
                            {isEditMode ? (
                              <input
                                type="text"
                                value={point.notes || ''}
                                onChange={(e) => updatePoint(idx, 'notes', e.target.value)}
                                className="w-full px-2 py-1 border-2 border-black rounded font-bold"
                                placeholder="Notes"
                              />
                            ) : (
                              <span className="font-bold text-sm text-gray-600">{point.notes || '-'}</span>
                            )}
                          </td>
                        );
                      }
                      return <td key={col.id} className="px-4 py-3 border-r-3 border-black">-</td>;
                    })}
                    {isEditMode && (
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => deletePoint(idx)}
                          className="p-2 bg-white border-2 border-black rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Trash2 size={16} strokeWidth={2.5} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {isEditMode && (
            <div className="p-4 border-t-4 border-black bg-yellow-100">
              <button
                onClick={addPoint}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black border-3 border-black rounded-xl font-black hover:bg-yellow-500 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                <Plus size={20} strokeWidth={2.5} />
                Add Task
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
