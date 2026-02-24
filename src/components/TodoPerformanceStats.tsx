import { TrendingUp, ListTodo, CheckCircle2, Loader, Circle } from 'lucide-react';

interface PerformanceStatsProps {
  stats: {
    totalTodos: number;
    totalPoints: number;
    donePoints: number;
    workingPoints: number;
    pendingPoints: number;
    overallPercentage: number;
    completedTodos: number;
  };
}

export default function TodoPerformanceStats({ stats }: PerformanceStatsProps) {
  return (
    <div className="bg-gradient-to-br from-[#FFF8E7] to-[#F5E6D3] border-[3px] border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-1" style={{ borderRadius: '20px 24px 22px 26px' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-black border-[3px] border-black rounded-lg" style={{ borderRadius: '10px 12px 11px 13px' }}>
          <TrendingUp size={20} strokeWidth={2.5} className="text-white" />
        </div>
        <div>
          <h3 className="text-lg font-black text-black">Performance Analytics</h3>
          <p className="text-sm font-bold text-gray-700">Your productivity overview</p>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-black text-gray-700">Overall Completion</span>
          <span className="text-2xl font-black text-black">{stats.overallPercentage}%</span>
        </div>
        <div className="h-3 bg-white border-[3px] border-black rounded-full overflow-hidden flex" style={{ borderRadius: '12px 14px 13px 15px' }}>
          <div
            className="h-full bg-black transition-all duration-500"
            style={{ width: `${(stats.donePoints / stats.totalPoints) * 100}%` }}
          />
          <div
            className="h-full bg-[#F5E6D3] transition-all duration-500"
            style={{ width: `${(stats.workingPoints / stats.totalPoints) * 100}%` }}
          />
          <div
            className="h-full bg-white transition-all duration-500"
            style={{ width: `${(stats.pendingPoints / stats.totalPoints) * 100}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Todos */}
        <div className="bg-white border-[3px] border-black rounded-lg p-3 text-center -rotate-1" style={{ borderRadius: '12px 14px 13px 15px' }}>
          <div className="flex justify-center mb-2">
            <div className="p-1.5 bg-[#FFF8E7] border-2 border-black rounded-lg" style={{ borderRadius: '8px 10px 9px 11px' }}>
              <ListTodo size={18} strokeWidth={2.5} className="text-black" />
            </div>
          </div>
          <div className="text-xl font-black text-black">{stats.totalTodos}</div>
          <div className="text-xs font-black text-gray-700">Total Todos</div>
        </div>

        {/* Completed */}
        <div className="bg-white border-[3px] border-black rounded-lg p-3 text-center rotate-1" style={{ borderRadius: '14px 12px 15px 13px' }}>
          <div className="flex justify-center mb-2">
            <div className="p-1.5 bg-[#FFF8E7] border-2 border-black rounded-lg" style={{ borderRadius: '10px 8px 11px 9px' }}>
              <CheckCircle2 size={18} strokeWidth={2.5} className="text-black" />
            </div>
          </div>
          <div className="text-xl font-black text-black">{stats.donePoints}</div>
          <div className="text-xs font-black text-gray-700">Completed</div>
        </div>

        {/* Working */}
        <div className="bg-white border-[3px] border-black rounded-lg p-3 text-center -rotate-1" style={{ borderRadius: '13px 15px 12px 14px' }}>
          <div className="flex justify-center mb-2">
            <div className="p-1.5 bg-[#FFF8E7] border-2 border-black rounded-lg" style={{ borderRadius: '9px 11px 8px 10px' }}>
              <Loader size={18} strokeWidth={2.5} className="text-black" />
            </div>
          </div>
          <div className="text-xl font-black text-black">{stats.workingPoints}</div>
          <div className="text-xs font-black text-gray-700">In Progress</div>
        </div>

        {/* Pending */}
        <div className="bg-white border-[3px] border-black rounded-lg p-3 text-center rotate-1" style={{ borderRadius: '15px 13px 14px 12px' }}>
          <div className="flex justify-center mb-2">
            <div className="p-1.5 bg-[#FFF8E7] border-2 border-black rounded-lg" style={{ borderRadius: '11px 9px 10px 8px' }}>
              <Circle size={18} strokeWidth={2.5} className="text-black" />
            </div>
          </div>
          <div className="text-xl font-black text-black">{stats.pendingPoints}</div>
          <div className="text-xs font-black text-gray-700">Pending</div>
        </div>
      </div>

      {/* Completion Stats */}
      <div className="mt-4 p-4 bg-white border-[3px] border-black rounded-lg" style={{ borderRadius: '16px 18px 17px 19px' }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-black text-gray-700 mb-1">Fully Completed Todos</div>
            <div className="text-2xl font-black text-black">{stats.completedTodos}</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-black text-gray-700 mb-1">Total Tasks</div>
            <div className="text-2xl font-black text-black">{stats.totalPoints}</div>
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="mt-4 p-3 bg-black border-[3px] border-black rounded-lg text-center" style={{ borderRadius: '14px 16px 15px 17px' }}>
        <div className="text-sm font-black text-white">
          {stats.overallPercentage === 100 
            ? "Amazing! All tasks completed!"
            : stats.overallPercentage >= 75
            ? "Great progress! Keep it up!"
            : stats.overallPercentage >= 50
            ? "You're halfway there!"
            : "Let's crush these todos!"}
        </div>
      </div>
    </div>
  );
}
