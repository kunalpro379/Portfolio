import { CheckCircle2, Circle, Trash2, Calendar, Clock, Loader, Link as LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TodoPoint {
  text: string;
  status: 'pending' | 'working' | 'resolved';
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
    isPublic?: boolean;
    points?: TodoPoint[];
    links?: TodoLink[];
    pointsCount?: number;
    resolvedCount?: number;
    workingCount?: number;
    pendingCount?: number;
    linksCount?: number;
    createdAt: string;
    updatedAt: string;
  };
  onEdit?: (todo: any) => void;
  onDelete?: (todoId: string) => void;
  onTogglePoint?: (todoId: string, pointIndex: number) => void;
}

export default function TodoCard({ todo, onEdit, onDelete }: TodoCardProps) {
  const navigate = useNavigate();
  
  // Use summary data if available, otherwise calculate from full data
  const pointsCount = todo.pointsCount ?? (todo.points || []).length;
  const resolvedCount = todo.resolvedCount ?? (todo.points || []).filter(p => p.status === 'resolved').length;
  const workingCount = todo.workingCount ?? (todo.points || []).filter(p => p.status === 'working').length;
  const pendingCount = todo.pendingCount ?? (todo.points || []).filter(p => p.status === 'pending').length;
  const linksCount = todo.linksCount ?? (todo.links || []).length;
  const progress = pointsCount > 0 ? (resolvedCount / pointsCount) * 100 : 0;

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

  const handleCardClick = () => {
    // Navigate to todo detail page instead of opening modal
    navigate(`/todo/${todo.todoId}`);
  };

  return (
    <div 
      className="bg-gradient-to-br from-[#FFF8E7] to-white border-[3px] border-black p-4 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-1 cursor-pointer group -rotate-1 hover:rotate-0"
      style={{ borderRadius: '16px 20px 18px 22px' }}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="text-base md:text-lg font-black text-black leading-tight group-hover:underline transition-all truncate">
              {todo.topic}
            </h3>
            {todo.isPublic === false && (
              <span className="flex-shrink-0 px-2 py-0.5 bg-red-400 text-white border-2 border-black rounded text-[10px] font-black">
                🔒 PRIVATE
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-700 font-bold">
            <div className="flex items-center gap-1">
              <Calendar size={11} strokeWidth={2.5} className="text-black" />
              <span>{formatDate(todo.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={11} strokeWidth={2.5} className="text-black" />
              <span>{formatTime(todo.createdAt)}</span>
            </div>
          </div>
        </div>
        {onDelete && (
          <div className="flex items-center gap-1.5 ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(todo.todoId);
              }}
              className="p-1.5 text-black hover:bg-white border-2 border-black rounded-lg transition-all opacity-0 group-hover:opacity-100"
              style={{ borderRadius: '8px 6px 9px 7px' }}
              title="Delete"
            >
              <Trash2 size={13} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-white border-2 border-black rounded-lg" style={{ borderRadius: '8px 10px 9px 11px' }}>
          <CheckCircle2 size={12} strokeWidth={2.5} className="text-black flex-shrink-0" />
          <span className="text-xs font-black text-black">{resolvedCount}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-[#FFF8E7] border-2 border-black rounded-lg" style={{ borderRadius: '10px 8px 11px 9px' }}>
          <Loader size={12} strokeWidth={2.5} className="text-black flex-shrink-0" />
          <span className="text-xs font-black text-black">{workingCount}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-white border-2 border-black rounded-lg" style={{ borderRadius: '9px 11px 8px 10px' }}>
          <Circle size={12} strokeWidth={2.5} className="text-black flex-shrink-0" />
          <span className="text-xs font-black text-black">{pendingCount}</span>
        </div>
      </div>

      {/* Progress Bar */}
      {pointsCount > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-700 font-black">Progress</span>
            <span className="font-black text-black">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-white border-2 border-black rounded-full overflow-hidden flex" style={{ borderRadius: '10px 12px 11px 13px' }}>
            <div
              className="h-full bg-black transition-all duration-300"
              style={{ width: `${(resolvedCount / pointsCount) * 100}%` }}
            />
            <div
              className="h-full bg-[#F5E6D3] transition-all duration-300"
              style={{ width: `${(workingCount / pointsCount) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-700 pt-2 border-t-2 border-dashed border-gray-300">
        <span className="font-black">{pointsCount} task{pointsCount !== 1 ? 's' : ''}</span>
        {linksCount > 0 && (
          <div className="flex items-center gap-1 font-black">
            <LinkIcon size={11} strokeWidth={2.5} />
            <span>{linksCount} link{linksCount !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
}
