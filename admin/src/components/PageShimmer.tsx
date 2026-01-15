export default function PageShimmer() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-pulse">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header shimmer */}
        <div className="space-y-2">
          <div className="h-8 sm:h-10 bg-gray-200 rounded-lg w-2/3" />
          <div className="h-4 sm:h-5 bg-gray-200 rounded-lg w-1/3" />
        </div>

        {/* Tabs / actions shimmer */}
        <div className="h-10 sm:h-12 bg-gray-200 rounded-2xl w-full" />

        {/* Cards / list shimmer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-gray-100 border-2 sm:border-3 border-gray-300 rounded-2xl p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(209,213,219,1)]"
            >
              <div className="h-5 sm:h-6 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-5/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


