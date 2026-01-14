import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, Plus, Trash2, Link as LinkIcon, Eye, EyeOff } from 'lucide-react';
import config from '../config/config';

interface Link {
  name: string;
  url: string;
}

interface Todo {
  todoId: string;
  title: string;
  content: string;
  links: Link[];
  txtFilePath: string;
  txtFileUrl: string;
  folderPath: string;
  visibility: 'public' | 'private';
  createdAt: string;
  updatedAt: string;
}

export default function TodoEditor() {
  const { todoId } = useParams();
  const navigate = useNavigate();
  const isNewTodo = todoId === 'new';

  const [loading, setLoading] = useState(!isNewTodo);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [links, setLinks] = useState<Link[]>([{ name: '', url: '' }]);
  const [folderPath, setFolderPath] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('private');

  // Generate 10 character ID
  const generateTodoId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 10; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  };

  const [currentTodoId] = useState(isNewTodo ? generateTodoId() : todoId);

  useEffect(() => {
    if (!isNewTodo) {
      fetchTodo();
    }
  }, [todoId]);

  const fetchTodo = async () => {
    try {
      const response = await fetch(`${config.api.baseUrl}/api/todos/${todoId}`);
      const data = await response.json();
      const todo = data.todo;

      setTitle(todo.title);
      setContent(todo.content);
      setLinks(todo.links.length > 0 ? todo.links : [{ name: '', url: '' }]);
      setFolderPath(todo.folderPath);
      setVisibility(todo.visibility);
    } catch (error) {
      console.error('Error fetching todo:', error);
      alert('Failed to load todo');
      navigate('/notes');
    } finally {
      setLoading(false);
    }
  };

  const addLink = () => {
    setLinks([...links, { name: '', url: '' }]);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: 'name' | 'url', value: string) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const handleSave = async () => {
    if (!title || !folderPath) {
      alert('Title and folder path are required');
      return;
    }

    setSaving(true);
    try {
      const validLinks = links.filter(l => l.name && l.url);

      if (isNewTodo) {
        // Create new todo
        const response = await fetch('${config.api.baseUrl}/api/todos/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            todoId: currentTodoId,
            title,
            content,
            links: validLinks,
            folderPath,
            visibility
          })
        });

        if (response.ok) {
          alert('Todo created successfully!');
          navigate('/notes');
        } else {
          throw new Error('Failed to create todo');
        }
      } else {
        // Update existing todo
        const response = await fetch(`${config.api.baseUrl}/api/todos/${todoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            content,
            links: validLinks,
            visibility
          })
        });

        if (response.ok) {
          alert('Todo updated successfully!');
          navigate('/notes');
        } else {
          throw new Error('Failed to update todo');
        }
      }
    } catch (error) {
      console.error('Error saving todo:', error);
      alert('Failed to save todo');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-2xl font-black">Loading todo...</p>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto bg-gray-50">
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white border-4 border-black rounded-2xl p-6 mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-black mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                {isNewTodo ? 'Create New Todo' : 'Edit Todo'}
              </h1>
              <p className="text-gray-600 font-medium">
                Todo ID: <span className="font-black text-black">{currentTodoId}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/notes')}
                className="flex items-center gap-2 px-5 py-3 bg-white border-3 border-black rounded-xl font-bold hover:bg-gray-50 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <X className="w-5 h-5" strokeWidth={2.5} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-black text-white border-3 border-black rounded-xl font-bold hover:bg-gray-800 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
              >
                <Save className="w-5 h-5" strokeWidth={2.5} />
                {saving ? 'Saving...' : 'Save Todo'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white border-4 border-black rounded-2xl p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-medium text-lg focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                placeholder="Enter todo title"
              />
            </div>

            {/* Folder Path & Visibility */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">
                  Folder Path *
                </label>
                <input
                  type="text"
                  value={folderPath}
                  onChange={(e) => setFolderPath(e.target.value)}
                  disabled={!isNewTodo}
                  className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] disabled:bg-gray-100"
                  placeholder="e.g., Work/Projects"
                />
              </div>

              <div>
                <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">
                  Visibility *
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
                  className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </div>
            </div>

            {/* Content - Rich Text Editor */}
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={15}
                className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-mono text-sm focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] resize-none"
                placeholder="Write your todo content here... (will be saved as .txt file in Azure Blob Storage)"
                style={{ lineHeight: '1.6' }}
              />
              <p className="text-sm text-gray-600 font-medium mt-2">
                Content will be automatically saved as a .txt file in Azure Blob Storage
              </p>
            </div>

            {/* Links */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-black text-black uppercase tracking-wide">
                  Links
                </label>
                <button
                  onClick={addLink}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-200 border-3 border-black rounded-xl font-bold hover:bg-purple-300 transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                  Add Link
                </button>
              </div>

              <div className="space-y-3">
                {links.map((link, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={link.name}
                        onChange={(e) => updateLink(index, 'name', e.target.value)}
                        className="px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                        placeholder="Link name (e.g., GitHub)"
                      />
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateLink(index, 'url', e.target.value)}
                        className="px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                        placeholder="https://..."
                      />
                    </div>
                    {links.length > 1 && (
                      <button
                        onClick={() => removeLink(index)}
                        className="p-3 bg-red-100 border-3 border-black rounded-xl hover:bg-red-200 transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <Trash2 className="w-5 h-5 text-black" strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
