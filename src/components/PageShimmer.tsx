export default function PageShimmer() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Centered spinner */}
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <div className="animate-spin w-16 h-16 border-4 border-black border-t-transparent rounded-full" style={{ animationDuration: '1.5s' }}></div>
          <div className="text-black text-lg font-bold">Loading...</div>
        </div>

        {/* Shimmer skeleton below spinner */}
        <div className="animate-pulse space-y-6">
          {/* Header shimmer */}
          <div className="space-y-3">
            <div className="h-8 sm:h-10 bg-gray-200 rounded-lg w-2/3" />
            <div className="h-4 sm:h-5 bg-gray-200 rounded-lg w-1/3" />
          </div>

          {/* Content shimmer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Sidebar-like skeleton */}
            <div className="space-y-3 md:col-span-1">
              <div className="h-6 bg-gray-200 rounded w-1/2" />
              <div className="h-32 bg-gray-100 rounded-2xl border-2 border-gray-200" />
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-24 bg-gray-100 rounded-2xl border-2 border-gray-200" />
            </div>

            {/* Main content skeleton */}
            <div className="md:col-span-2 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-11/12" />
              <div className="h-4 bg-gray-200 rounded w-10/12" />
              <div className="h-64 bg-gray-100 rounded-2xl border-2 border-gray-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


