import { CheckCircle2, Circle, Trash2, Edit, Calendar, Clock, Loader, Link as LinkIcon } from 'lucide-react';

interface TodoPoint {
  text: string;
  status: 'pending' | 'working' | 'done';
  completedAt?: string;
}

interface TodoLink {
  title: string;
  url: string;
}

interface TodoCardProps {
  todo: {
    todoId: string;
    topic: string;
    content: string;
    points?: TodoPoint[];
    links?: TodoLink[];
    createdAt: string;
    updatedAt: string;
  };
  onEdit: (todo: any) => void;
  onDelete: (todoId: string) => void;
  onTogglePoint: (todoId: string, pointIndex: number) => void;
}

export default function TodoCard({ todo, onEdit, onDelete, onTogglePoint }: TodoCardProps) {
  const points = todo.points || [];
  const links = todo.links || [];
  
  const donePoints = points.filter(p => p.status === 'done').length;
  const workingPoints = points.filter(p => p.status === 'working').length;
  const pendingPoints = points.filter(p => p.status === 'pending').length;
  const totalPoints = points.length;
  const progress = totalPoints > 0 ? (donePoints / totalPoints) * 100 : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all hover:-translate-y-0.5 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 mb-2 leading-tight group-hover:text-orange-600 transition-colors">
            {todo.topic}
          </h3>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Calendar size={12} strokeWidth={2} className="text-gray-400" />
              <span>{formatDate(todo.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={12} strokeWidth={2} className="text-gray-400" />
              <span>{formatTime(todo.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(todo)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-md transition-all"
            title="Edit"
          >
            <Edit size={14} strokeWidth={2} />
          </button>
          <button
            onClick={() => onDelete(todo.todoId)}
            className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-md transition-all"
            title="Delete"
          >
            <Trash2 size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Content */}
      {todo.content && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {todo.content}
          </p>
        </div>
      )}

      {/* Progress Bar */}
      {totalPoints > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 text-xs font-medium">
              <div className="flex items-center gap-1">
                <CheckCircle2 size={12} strokeWidth={2} className="text-green-600" />
                <span className="text-gray-700">{donePoints}</span>
              </div>
              <div className="flex items-center gap-1">
                <Loader size={12} strokeWidth={2} className="text-blue-600" />
                <span className="text-gray-700">{workingPoints}</span>
              </div>
              <div className="flex items-center gap-1">
                <Circle size={12} strokeWidth={2} className="text-gray-400" />
                <span className="text-gray-700">{pendingPoints}</span>
              </div>
            </div>
            <span className="text-xs font-semibold text-orange-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 border border-gray-200 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${(donePoints / totalPoints) * 100}%` }}
            />
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(workingPoints / totalPoints) * 100}%` }}
            />
            <div
              className="h-full bg-gray-300 transition-all duration-300"
              style={{ width: `${(pendingPoints / totalPoints) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Points */}
      {points.length > 0 && (
        <div className="space-y-2 mb-4">
          {points.map((point, index) => (
            <div
              key={index}
              onClick={() => onTogglePoint(todo.todoId, index)}
              className={`flex items-start gap-3 p-2.5 border rounded-md cursor-pointer transition-all group/point ${
                point.status === 'done'
                  ? 'bg-green-50 border-green-200 hover:bg-green-100'
                  : point.status === 'working'
                  ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              {point.status === 'done' ? (
                <CheckCircle2
                  size={18}
                  strokeWidth={2}
                  className="text-green-600 flex-shrink-0 mt-0.5"
                />
              ) : point.status === 'working' ? (
                <Loader
                  size={18}
                  strokeWidth={2}
                  className="text-blue-600 flex-shrink-0 mt-0.5 animate-spin"
                  style={{ animationDuration: '2s' }}
                />
              ) : (
                <Circle
                  size={18}
                  strokeWidth={2}
                  className="text-gray-400 flex-shrink-0 mt-0.5 group-hover/point:text-orange-500"
                />
              )}
              <span
                className={`text-sm flex-1 ${
                  point.status === 'done'
                    ? 'line-through text-gray-500'
                    : point.status === 'working'
                    ? 'text-blue-900 font-medium'
                    : 'text-gray-700'
                }`}
              >
                {point.text}
              </span>
              {point.status === 'working' && (
                <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] font-medium border border-blue-600 rounded">
                  IN PROGRESS
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Links */}
      {links.length > 0 && (
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <LinkIcon size={14} strokeWidth={2} className="text-orange-600" />
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Attached Links</span>
          </div>
          <div className="space-y-1.5">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-300 rounded-md transition-all group/link text-sm"
              >
                <LinkIcon size={12} strokeWidth={2} className="text-orange-500 flex-shrink-0" />
                <span className="text-xs text-gray-700 group-hover/link:text-orange-600 truncate">
                  {link.title}
                </span>
                <svg
                  className="w-3 h-3 text-gray-400 group-hover/link:text-orange-600 ml-auto flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
