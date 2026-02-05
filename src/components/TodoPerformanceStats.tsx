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
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-gray-200 rounded-lg p-5 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 border border-purple-700 rounded-md">
          <TrendingUp size={20} strokeWidth={2} className="text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-black">Performance Analytics</h3>
          <p className="text-sm font-normal text-gray-600">Your productivity overview</p>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Overall Completion</span>
          <span className="text-2xl font-semibold text-purple-600">{stats.overallPercentage}%</span>
        </div>
        <div className="h-3 bg-gray-200 border border-gray-300 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
            style={{ width: `${(stats.donePoints / stats.totalPoints) * 100}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
            style={{ width: `${(stats.workingPoints / stats.totalPoints) * 100}%` }}
          />
          <div
            className="h-full bg-gray-300 transition-all duration-500"
            style={{ width: `${(stats.pendingPoints / stats.totalPoints) * 100}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Todos */}
        <div className="bg-white border border-gray-200 rounded-md p-3 text-center">
          <div className="flex justify-center mb-2">
            <div className="p-1.5 bg-gray-100 border border-gray-200 rounded">
              <ListTodo size={18} strokeWidth={2} className="text-gray-700" />
            </div>
          </div>
          <div className="text-xl font-semibold text-black">{stats.totalTodos}</div>
          <div className="text-xs font-medium text-gray-600">Total Todos</div>
        </div>

        {/* Completed */}
        <div className="bg-green-50 border border-green-200 rounded-md p-3 text-center">
          <div className="flex justify-center mb-2">
            <div className="p-1.5 bg-green-100 border border-green-200 rounded">
              <CheckCircle2 size={18} strokeWidth={2} className="text-green-600" />
            </div>
          </div>
          <div className="text-xl font-semibold text-green-700">{stats.donePoints}</div>
          <div className="text-xs font-medium text-green-700">Completed</div>
        </div>

        {/* Working */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-center">
          <div className="flex justify-center mb-2">
            <div className="p-1.5 bg-blue-100 border border-blue-200 rounded">
              <Loader size={18} strokeWidth={2} className="text-blue-600" />
            </div>
          </div>
          <div className="text-xl font-semibold text-blue-700">{stats.workingPoints}</div>
          <div className="text-xs font-medium text-blue-700">In Progress</div>
        </div>

        {/* Pending */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-center">
          <div className="flex justify-center mb-2">
            <div className="p-1.5 bg-gray-100 border border-gray-200 rounded">
              <Circle size={18} strokeWidth={2} className="text-gray-600" />
            </div>
          </div>
          <div className="text-xl font-semibold text-gray-700">{stats.pendingPoints}</div>
          <div className="text-xs font-medium text-gray-700">Pending</div>
        </div>
      </div>

      {/* Completion Stats */}
      <div className="mt-4 p-4 bg-white border border-gray-200 rounded-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">Fully Completed Todos</div>
            <div className="text-2xl font-semibold text-purple-600">{stats.completedTodos}</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium text-gray-600 mb-1">Total Tasks</div>
            <div className="text-2xl font-semibold text-black">{stats.totalPoints}</div>
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      {stats.overallPercentage === 100 ? (
        <div className="mt-4 p-3 bg-gradient-to-r from-green-500 to-green-600 border border-green-700 rounded-md text-center">
          <div className="text-sm font-medium text-white">Amazing! All tasks completed!</div>
        </div>
      ) : stats.overallPercentage >= 75 ? (
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-500 to-blue-600 border border-blue-700 rounded-md text-center">
          <div className="text-sm font-medium text-white">Great progress! Keep it up!</div>
        </div>
      ) : stats.overallPercentage >= 50 ? (
        <div className="mt-4 p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 border border-yellow-700 rounded-md text-center">
          <div className="text-sm font-medium text-white">You're halfway there!</div>
        </div>
      ) : (
        <div className="mt-4 p-3 bg-gradient-to-r from-orange-500 to-orange-600 border border-orange-700 rounded-md text-center">
          <div className="text-sm font-medium text-white">Let's crush these todos!</div>
        </div>
      )}
    </div>
  );
}
