export default function DashboardShimmer() {
  return (
    <div className="p-4 md:p-8 animate-pulse">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Card Shimmer */}
        <div className="bg-gray-200 border-4 border-gray-300 rounded-2xl p-4 md:p-8 mb-4 md:mb-8 shadow-[8px_8px_0px_0px_rgba(209,213,219,1)]">
          <div className="h-8 md:h-10 bg-gray-300 rounded-lg w-3/4 mb-3"></div>
          <div className="h-4 md:h-6 bg-gray-300 rounded-lg w-1/2"></div>
        </div>

        {/* Stats Grid Shimmer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i}
              className="bg-gray-200 border-4 border-gray-300 rounded-2xl p-3 md:p-6 shadow-[6px_6px_0px_0px_rgba(209,213,219,1)]"
            >
              <div className="w-8 h-8 md:w-12 md:h-12 bg-gray-300 rounded-lg mb-2 md:mb-4"></div>
              <div className="h-3 md:h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
              <div className="h-8 md:h-12 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))}
        </div>

        {/* Quick Actions Shimmer */}
        <div className="bg-gray-200 border-4 border-gray-300 rounded-2xl p-4 md:p-6 shadow-[8px_8px_0px_0px_rgba(209,213,219,1)]">
          <div className="h-6 md:h-8 bg-gray-300 rounded-lg w-1/4 mb-4 md:mb-6"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i}
                className="flex items-center gap-3 md:gap-4 p-3 md:p-5 bg-white border-3 border-gray-300 rounded-xl shadow-[4px_4px_0px_0px_rgba(209,213,219,1)]"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-300 rounded-lg flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-5 md:h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 md:h-4 bg-gray-300 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
