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
    content?: string;
    points?: TodoPoint[];
    links?: TodoLink[];
    pointsCount?: number;
    doneCount?: number;
    workingCount?: number;
    pendingCount?: number;
    linksCount?: number;
    createdAt: string;
    updatedAt: string;
  };
  onEdit: (todo: any) => void;
  onDelete: (todoId: string) => void;
  onTogglePoint?: (todoId: string, pointIndex: number) => void;
}

export default function TodoCard({ todo, onEdit, onDelete }: TodoCardProps) {
  // Use summary data if available, otherwise calculate from full data
  const pointsCount = todo.pointsCount ?? (todo.points || []).length;
  const doneCount = todo.doneCount ?? (todo.points || []).filter(p => p.status === 'done').length;
  const workingCount = todo.workingCount ?? (todo.points || []).filter(p => p.status === 'working').length;
  const pendingCount = todo.pendingCount ?? (todo.points || []).filter(p => p.status === 'pending').length;
  const linksCount = todo.linksCount ?? (todo.links || []).length;
  const progress = pointsCount > 0 ? (doneCount / pointsCount) * 100 : 0;

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
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer group"
      onClick={() => onEdit(todo)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 mb-1.5 leading-tight group-hover:text-orange-600 transition-colors truncate">
            {todo.topic}
          </h3>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar size={11} strokeWidth={2} className="text-gray-400" />
              <span>{formatDate(todo.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={11} strokeWidth={2} className="text-gray-400" />
              <span>{formatTime(todo.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(todo);
            }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-md transition-all opacity-0 group-hover:opacity-100"
            title="Edit"
          >
            <Edit size={13} strokeWidth={2} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(todo.todoId);
            }}
            className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-md transition-all opacity-0 group-hover:opacity-100"
            title="Delete"
          >
            <Trash2 size={13} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-green-50 border border-green-200 rounded">
          <CheckCircle2 size={12} strokeWidth={2} className="text-green-600 flex-shrink-0" />
          <span className="text-xs font-medium text-green-700">{doneCount}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-blue-50 border border-blue-200 rounded">
          <Loader size={12} strokeWidth={2} className="text-blue-600 flex-shrink-0" />
          <span className="text-xs font-medium text-blue-700">{workingCount}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded">
          <Circle size={12} strokeWidth={2} className="text-gray-600 flex-shrink-0" />
          <span className="text-xs font-medium text-gray-700">{pendingCount}</span>
        </div>
      </div>

      {/* Progress Bar */}
      {pointsCount > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-600 font-medium">Progress</span>
            <span className="font-semibold text-gray-900">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${(doneCount / pointsCount) * 100}%` }}
            />
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(workingCount / pointsCount) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
        <span className="font-medium">{pointsCount} task{pointsCount !== 1 ? 's' : ''}</span>
        {linksCount > 0 && (
          <div className="flex items-center gap-1">
            <LinkIcon size={11} strokeWidth={2} />
            <span>{linksCount} link{linksCount !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
}
