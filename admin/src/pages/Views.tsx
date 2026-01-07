import { useState, useEffect } from 'react';
import { Eye, Trash2, RefreshCw, Monitor, Smartphone, Tablet, Globe } from 'lucide-react';

interface View {
  viewId: string;
  ipAddress: string;
  userAgent: string;
  path: string;
  referrer: string;
  browser: string;
  device: string;
  timestamp: string;
}

interface Stats {
  total: number;
  last24h: number;
  last7days: number;
  uniqueVisitors: number;
  topPages: Array<{ _id: string; count: number }>;
  deviceStats: Array<{ _id: string; count: number }>;
  browserStats: Array<{ _id: string; count: number }>;
}

export default function Views() {
  const [views, setViews] = useState<View[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchViews();
    fetchStats();
  }, [page]);

  const fetchViews = async () => {
    try {
      const response = await fetch(`https://api.kunalpatil.me/api/views?page=${page}&limit=50`);
      const data = await response.json();
      setViews(data.views);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Error fetching views:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('https://api.kunalpatil.me/api/views/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchViews();
    fetchStats();
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all views? This cannot be undone.')) return;

    try {
      const response = await fetch('https://api.kunalpatil.me/api/views', {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('All views cleared successfully!');
        fetchViews();
        fetchStats();
      }
    } catch (error) {
      console.error('Error clearing views:', error);
      alert('Failed to clear views');
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" strokeWidth={2.5} />;
      case 'tablet':
        return <Tablet className="w-4 h-4" strokeWidth={2.5} />;
      default:
        return <Monitor className="w-4 h-4" strokeWidth={2.5} />;
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-xl font-bold">Loading views...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-black mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              Visitor Analytics
            </h1>
            <p className="text-gray-600 font-medium">Track and analyze your website visitors</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-blue-200 border-3 border-black rounded-xl font-bold hover:bg-blue-300 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <RefreshCw className="w-5 h-5" strokeWidth={2.5} />
              Refresh
            </button>
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-4 py-2 bg-red-200 border-3 border-black rounded-xl font-bold hover:bg-red-300 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <Trash2 className="w-5 h-5" strokeWidth={2.5} />
              Clear All
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-200 to-blue-100 border-4 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between mb-2">
                <Eye className="w-8 h-8" strokeWidth={2.5} />
                <span className="text-3xl font-black">{stats.total.toLocaleString()}</span>
              </div>
              <p className="text-sm font-bold uppercase">Total Views</p>
            </div>

            <div className="bg-gradient-to-br from-green-200 to-green-100 border-4 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between mb-2">
                <Globe className="w-8 h-8" strokeWidth={2.5} />
                <span className="text-3xl font-black">{stats.uniqueVisitors.toLocaleString()}</span>
              </div>
              <p className="text-sm font-bold uppercase">Unique Visitors</p>
            </div>

            <div className="bg-gradient-to-br from-purple-200 to-purple-100 border-4 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-black">24h</span>
                <span className="text-3xl font-black">{stats.last24h.toLocaleString()}</span>
              </div>
              <p className="text-sm font-bold uppercase">Last 24 Hours</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-200 to-yellow-100 border-4 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-black">7d</span>
                <span className="text-3xl font-black">{stats.last7days.toLocaleString()}</span>
              </div>
              <p className="text-sm font-bold uppercase">Last 7 Days</p>
            </div>
          </div>
        )}

        {/* Top Pages & Device Stats */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top Pages */}
            <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-xl font-black mb-4">Top Pages</h3>
              <div className="space-y-2">
                {stats.topPages.map((page, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 border-2 border-black rounded-lg">
                    <span className="font-bold text-sm truncate flex-1">{page._id}</span>
                    <span className="px-3 py-1 bg-blue-200 border-2 border-black rounded-lg text-sm font-black">
                      {page.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Device & Browser Stats */}
            <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-xl font-black mb-4">Devices & Browsers</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-bold uppercase mb-2">Devices</p>
                  <div className="space-y-2">
                    {stats.deviceStats.map((device, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 border-2 border-black rounded-lg">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(device._id)}
                          <span className="font-bold text-sm">{device._id}</span>
                        </div>
                        <span className="px-2 py-1 bg-green-200 border-2 border-black rounded text-xs font-black">
                          {device.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold uppercase mb-2">Browsers</p>
                  <div className="space-y-2">
                    {stats.browserStats.map((browser, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 border-2 border-black rounded-lg">
                        <span className="font-bold text-sm">{browser._id}</span>
                        <span className="px-2 py-1 bg-purple-200 border-2 border-black rounded text-xs font-black">
                          {browser.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Views Table */}
        <div className="bg-white border-4 border-black rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-black uppercase">Time</th>
                  <th className="px-4 py-3 text-left text-sm font-black uppercase">IP Address</th>
                  <th className="px-4 py-3 text-left text-sm font-black uppercase">Path</th>
                  <th className="px-4 py-3 text-left text-sm font-black uppercase">Device</th>
                  <th className="px-4 py-3 text-left text-sm font-black uppercase">Browser</th>
                  <th className="px-4 py-3 text-left text-sm font-black uppercase">Referrer</th>
                </tr>
              </thead>
              <tbody>
                {views.map((view, idx) => (
                  <tr key={view.viewId} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-4 py-3 text-sm font-medium">
                      {new Date(view.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold">{view.ipAddress}</td>
                    <td className="px-4 py-3 text-sm font-medium">{view.path}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(view.device)}
                        <span className="text-sm font-medium">{view.device}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{view.browser}</td>
                    <td className="px-4 py-3 text-sm font-medium truncate max-w-xs">
                      {view.referrer || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t-4 border-black p-4 flex items-center justify-between">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 border-3 border-black rounded-lg font-bold hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="font-bold">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-200 border-3 border-black rounded-lg font-bold hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
