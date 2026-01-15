import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit2, Link as LinkIcon, Eye, EyeOff } from 'lucide-react';
import config, { buildUrl } from '../config/config';

interface Link {
  name: string;
  url: string;
}

interface Todo {
  _id: string;
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

export default function TodoList() {
  const navigate = useNavigate();
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch(buildUrl(config.api.endpoints.todos), {
        credentials: 'include',
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to fetch todos: ${response.status} ${response.statusText} - ${text}`);
      }

      const data = await response.json();
      setTodos(data.todos);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const deleteTodo = async (todoId: string) => {
    if (!confirm('Delete this todo?')) return;

    try {
      const response = await fetch(buildUrl(config.api.endpoints.todoById(todoId)), {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        fetchTodos();
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-black text-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            ToDoList
          </h2>
          <p className="text-gray-600 font-medium mt-1">Manage your tasks and todos</p>
        </div>
        <button
          onClick={() => navigate('/notes/todo/new')}
          className="flex items-center gap-2 px-6 py-3 bg-green-200 border-3 border-black rounded-xl font-bold hover:bg-green-300 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          New Todo
        </button>
      </div>

      {/* Todos List */}
      <div className="space-y-4">
        {todos.length === 0 ? (
          <div className="bg-white border-4 border-black rounded-2xl p-12 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-gray-600 font-medium text-lg">No todos yet</p>
            <p className="text-sm text-gray-500 mt-2">Click "New Todo" to create one</p>
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo._id}
              className="bg-white border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-black text-black">{todo.title}</h3>
                    <span className={`px-3 py-1 rounded-lg border-2 border-black text-xs font-bold ${
                      todo.visibility === 'public' ? 'bg-green-200' : 'bg-gray-200'
                    }`}>
                      {todo.visibility === 'public' ? (
                        <><Eye className="w-3 h-3 inline mr-1" /> Public</>
                      ) : (
                        <><EyeOff className="w-3 h-3 inline mr-1" /> Private</>
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    {todo.folderPath} - {formatDate(todo.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/notes/todo/${todo.todoId}`)}
                    className="p-2 bg-blue-100 border-2 border-black rounded-lg hover:bg-blue-200 transition"
                  >
                    <Edit2 className="w-4 h-4 text-black" strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => deleteTodo(todo.todoId)}
                    className="p-2 bg-red-100 border-2 border-black rounded-lg hover:bg-red-200 transition"
                  >
                    <Trash2 className="w-4 h-4 text-black" strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {todo.content && (
                <div className="mb-4 p-4 bg-yellow-50 border-2 border-black rounded-lg">
                  <p className="text-sm font-medium text-gray-800 whitespace-pre-wrap">{todo.content}</p>
                </div>
              )}

              {todo.links && todo.links.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {todo.links.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1 bg-purple-100 border-2 border-black rounded-lg hover:bg-purple-200 transition text-sm font-bold"
                    >
                      <LinkIcon className="w-3 h-3" strokeWidth={2.5} />
                      {link.name}
                    </a>
                  ))}
                </div>
              )}

              {todo.txtFileUrl && (
                <div className="mt-4">
                  <a
                    href={todo.txtFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 border-2 border-black rounded-lg hover:bg-blue-200 transition text-sm font-bold"
                  >
                    View Text File
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
