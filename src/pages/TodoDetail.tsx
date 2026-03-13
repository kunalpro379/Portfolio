import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Lock, Edit3, Eye, Settings, X, Maximize2 } from 'lucide-react';
import { fetchTodoById, updateTodo, deleteTodo, isAuthenticated, setAuthToken, type Todo, type TodoPoint, type CustomColumn } from '@/services/todoApi';
import LoadingSpinner from '@/components/LoadingSpinner';

// NO HARDCODED PASSWORD - Server validates against hashed password in DB
export default function TodoDetail() {
  const navigate = useNavigate();
  const { todoId } = useParams<{ todoId: string }>();
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordMode, setPasswordMode] = useState<'view' | 'delete'>('view');
  
  const [todo, setTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPrivateTodo, setIsPrivateTodo] = useState(false);
  
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
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletePasswordError, setDeletePasswordError] = useState('');

  const defaultColumns: CustomColumn[] = [
    { id: 'task', name: 'Task', type: 'text', visible: true, width: 300 },
    { id: 'status', name: 'Status', type: 'select', options: ['pending', 'working', 'resolved'], visible: true, width: 150 },
    { id: 'priority', name: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'urgent'], visible: true, width: 120 },
    { id: 'dueDate', name: 'Due Date', type: 'date', visible: false, width: 150 },
    { id: 'notes', name: 'Notes', type: 'text', visible: true, width: 200 },
  ];

  useEffect(() => {
    loadTodo();
  }, [todoId]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    // Send password to server for verification
    await loadTodo(password);
  };

  const loadTodo = async (pwd?: string) => {
    if (!todoId) return;
    try {
      setLoading(true);
      const data = await fetchTodoById(todoId, pwd);
      // If we get here, password was correct (or not needed)
      setTodo(data);
      setTopicValue(data.topic);
      setIsPrivateTodo(false);
      setShowPasswordModal(false);
      setPassword('');
      setPasswordError('');
    } catch (error: any) {
      if (error.message === 'PRIVATE_TODO') {
        setIsPrivateTodo(true);
        setPasswordMode('view');
        setShowPasswordModal(true);
        setPasswordError(pwd ? 'Incorrect password' : '');
      } else {
        console.error('Error loading todo:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteTodo(todoId!, deletePassword);
      navigate('/learnings?tab=tasks');
    } catch (error: any) {
      setDeletePasswordError(error.message || 'Failed to delete');
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
      case 'resolved': return 'border-green-400 text-green-800';
      case 'working': return 'border-orange-400 text-orange-800';
      case 'pending': return 'border-red-400 text-red-800';
      default: return 'border-gray-400 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-900 border-red-400';
      case 'high': return 'text-orange-900 border-orange-400';
      case 'medium': return 'text-yellow-900 border-yellow-400';
      case 'low': return 'text-blue-900 border-blue-400';
      default: return 'border-gray-400 text-gray-800';
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

  // Sort tasks by status and priority - always sorted
  const getSortedPoints = () => {
    if (!todo) return [];
    
    const statusOrder = { 'pending': 1, 'working': 2, 'resolved': 3 };
    const priorityOrder = { 'urgent': 1, 'high': 2, 'medium': 3, 'low': 4 };
    
    return [...todo.points].sort((a, b) => {
      // First sort by status
      const statusDiff = (statusOrder[a.status as keyof typeof statusOrder] || 999) - 
                        (statusOrder[b.status as keyof typeof statusOrder] || 999);
      if (statusDiff !== 0) return statusDiff;
      
      // Then sort by priority
      return (priorityOrder[a.priority as keyof typeof priorityOrder] || 999) - 
             (priorityOrder[b.priority as keyof typeof priorityOrder] || 999);
    });
  };

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
            Private Task
          </h2>
          <p className="text-black text-center mb-6">Enter password to view this task</p>
          
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
            
            <button
              type="submit"
              className="w-full px-6 py-4 bg-black text-white border-2 border-black rounded-lg font-bold text-lg hover:bg-gray-900 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            >
              Unlock
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/learnings?tab=tasks')}
              className="w-full px-6 py-3 bg-white text-black border-2 border-black rounded-lg font-bold hover:bg-gray-50 transition-all"
            >
              Back to Tasks
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
          <p className="text-2xl font-bold text-black mb-4">Task not found</p>
          <button
            onClick={() => navigate('/learnings?tab=todo')}
            className="px-6 py-3 bg-white text-black border-2 border-black rounded-lg font-bold hover:bg-gray-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            Back to Tasks
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
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white border-2 border-black rounded-lg font-bold hover:bg-red-700 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Trash2 size={20} />
                  Delete
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
                  <th className="px-4 py-4 text-left font-bold text-white border-r-2 border-gray-700 w-16">
                    #
                  </th>
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
                {getSortedPoints().map((point, idx) => {
                  // Find the original index for editing
                  const originalIdx = todo.points.indexOf(point);
                  
                  // Get row background color based on status
                  const getRowBgColor = () => {
                    if (point.status === 'resolved') return 'bg-green-50 hover:bg-green-100';
                    if (point.status === 'working') return 'bg-orange-50 hover:bg-orange-100';
                    if (point.status === 'pending') return 'bg-red-50 hover:bg-red-100';
                    return 'bg-white hover:bg-gray-50';
                  };
                  
                  return (
                  <tr key={originalIdx} className={`border-b-2 border-gray-200 transition-colors ${getRowBgColor()}`}>
                    {/* Serial Number */}
                    <td className="px-4 py-3 border-r-2 border-gray-200 font-bold text-gray-700">
                      {idx + 1}
                    </td>
                    
                    {visibleColumns.map(col => {
                      if (col.id === 'task') {
                        return (
                          <td key={col.id} className="px-4 py-3 border-r-2 border-gray-200">
                            {isEditMode ? (
                              <input
                                type="text"
                                value={point.text}
                                onChange={(e) => updatePoint(originalIdx, 'text', e.target.value)}
                                className="w-full px-3 py-2 border-2 border-black rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-black"
                              />
                            ) : (
                              <span className="font-medium text-gray-900">{point.text}</span>
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
                                onChange={(e) => updatePoint(originalIdx, 'status', e.target.value)}
                                className={`w-full px-3 py-2 border-2 rounded-lg font-bold bg-white ${getStatusColor(point.status)}`}
                              >
                                <option value="pending">Pending</option>
                                <option value="working">Working</option>
                                <option value="resolved">Resolved</option>
                              </select>
                            ) : (
                              <span className={`inline-block px-3 py-1.5 rounded-lg border-2 text-sm font-bold bg-white ${getStatusColor(point.status)}`}>
                                {point.status.charAt(0).toUpperCase() + point.status.slice(1)}
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
                                onChange={(e) => updatePoint(originalIdx, 'priority', e.target.value)}
                                className={`w-full px-3 py-2 border-2 rounded-lg font-bold bg-white ${getPriorityColor(point.priority || 'medium')}`}
                              >
                                <option value="urgent">Urgent</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                              </select>
                            ) : (
                              <span className={`inline-block px-3 py-1.5 rounded-lg border-2 text-sm font-bold bg-white ${getPriorityColor(point.priority || 'medium')}`}>
                                {(point.priority || 'medium').charAt(0).toUpperCase() + (point.priority || 'medium').slice(1)}
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
                                onChange={(e) => updatePoint(originalIdx, 'dueDate', e.target.value)}
                                className="w-full px-3 py-2 border-2 border-black rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-black"
                              />
                            ) : (
                              <span className="font-medium text-gray-700">
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
                              onClick={() => openNotesModal(originalIdx, point.notes || '')}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border-2 border-blue-400 rounded-lg hover:bg-blue-100 transition-colors font-medium text-blue-700"
                            >
                              <Maximize2 size={14} />
                              {point.notes ? 'View Notes' : 'Add Notes'}
                            </button>
                          </td>
                        );
                      }
                      return <td key={col.id} className="px-4 py-3 border-r-2 border-gray-200">-</td>;
                    })}
                    {isEditMode && (
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => deletePoint(originalIdx)}
                          className="p-2 bg-white border-2 border-black rounded-lg hover:bg-red-50 hover:border-red-500 transition-colors"
                        >
                          <Trash2 size={16} className="text-black hover:text-red-500" />
                        </button>
                      </td>
                    )}
                  </tr>
                )})}
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
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b-2 border-black">
              <h3 className="text-xl font-bold">Delete Task</h3>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword('');
                  setDeletePasswordError('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this task? This action cannot be undone.
              </p>
              <p className="text-gray-700 font-bold mb-4">
                Enter password to confirm:
              </p>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => {
                  setDeletePassword(e.target.value);
                  setDeletePasswordError('');
                }}
                placeholder="Enter password"
                className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black mb-2"
                autoFocus
              />
              {deletePasswordError && (
                <p className="text-red-600 text-sm mb-4">{deletePasswordError}</p>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t-2 border-black">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword('');
                  setDeletePasswordError('');
                }}
                className="px-4 py-2 bg-white border-2 border-black rounded-lg font-bold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2 bg-red-600 text-white border-2 border-black rounded-lg font-bold hover:bg-red-700 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
