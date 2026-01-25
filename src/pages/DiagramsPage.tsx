import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileImage, Unlock, Lock, ArrowLeft } from 'lucide-react';
import ExcalidrawCanvas from '@/components/ExcalidrawCanvas';
import { API_BASE_URL } from '@/config/api';
import PageShimmer from '@/components/PageShimmer';

interface Canvas {
  canvasId: string;
  name: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
}

export default function DiagramsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCanvasName, setNewCanvasName] = useState('');
  const [newCanvasPublic, setNewCanvasPublic] = useState(false);
  const [activeCanvas, setActiveCanvas] = useState<string | null>(null);
  const [canvasData, setCanvasData] = useState<any>(null);
  const [viewOnly, setViewOnly] = useState(true); // Default to read-only

  // Check if accessing via share link
  const canvasIdFromUrl = searchParams.get('canvas');

  useEffect(() => {
    if (canvasIdFromUrl) {
      // Accessing via share link - bypass password and determine access from canvas settings
      loadCanvasFromShare(canvasIdFromUrl);
    } else {
      fetchCanvases();
    }
  }, [canvasIdFromUrl]);

  const loadCanvasFromShare = async (canvasId: string) => {
    try {
      // Load canvas in read-only mode (no password required)
      const response = await fetch(`${API_BASE_URL}/api/diagrams/${canvasId}`);
      
      if (!response.ok) throw new Error('Failed to load canvas');
      
      const responseData = await response.json();
      
      // Always load in read-only mode for public access
      setCanvasData(responseData.data);
      setActiveCanvas(canvasId);
      setViewOnly(true); // Always read-only
    } catch (error) {
      console.error('Error loading canvas:', error);
      alert('Failed to load canvas. It may have been deleted.');
      navigate('/learnings?tab=diagrams');
    }
  };

  const fetchCanvases = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/diagrams`);
      
      if (!response.ok) throw new Error('Failed to fetch canvases');
      
      const data = await response.json();
      setCanvases(data.canvases || []);
    } catch (error) {
      console.error('Error fetching canvases:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCanvas = async (canvasId: string, isViewOnly: boolean = true) => {
    try {
      console.log('Loading canvas:', canvasId, 'viewOnly:', isViewOnly);
      const response = await fetch(`${API_BASE_URL}/api/diagrams/${canvasId}`);
      
      if (!response.ok) throw new Error('Failed to load canvas');
      
      const responseData = await response.json();
      console.log('Canvas loaded, setting viewOnly to:', isViewOnly);
      setCanvasData(responseData.data);
      setActiveCanvas(canvasId);
      setViewOnly(isViewOnly); // Always read-only for public access
    } catch (error) {
      console.error('Error loading canvas:', error);
      alert('Failed to load canvas');
    }
  };

  const handleCanvasClick = (canvas: Canvas) => {
    // Open canvas in read-only mode (no password required)
    console.log('Opening canvas in read-only mode');
    loadCanvas(canvas.canvasId, true); // Always view-only for public access
  };

  if (activeCanvas) {
    const currentCanvas = canvases.find(c => c.canvasId === activeCanvas);
    const canvasIsPublic = currentCanvas?.isPublic || false;
    
    console.log('Rendering canvas:', activeCanvas, 'viewOnly:', viewOnly, 'isPublic:', canvasIsPublic);
    
    return (
      <ExcalidrawCanvas
        canvasId={activeCanvas}
        isPublic={canvasIsPublic}
        onClose={() => {
          setActiveCanvas(null);
          setCanvasData(null);
          setViewOnly(true);
          if (!canvasIdFromUrl) {
            fetchCanvases();
          } else {
            navigate('/learnings?tab=diagrams');
          }
        }}
        initialData={canvasData}
        viewOnly={viewOnly}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0 opacity-5"
        style={{
          backgroundImage: 'url(/page13.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b-2 md:border-b-4 border-black p-4 md:p-6 sticky top-0 z-50 shadow-lg relative">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/learnings?tab=diagrams')}
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-3 md:mb-4 font-bold text-sm md:text-base"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
            Back to Learnings
          </button>

          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-4xl font-black text-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              Kunal's Diagrams
            </h1>
            <div className="px-3 md:px-6 py-2 md:py-3 bg-gray-100 text-gray-600 border-2 md:border-3 border-gray-300 rounded-lg md:rounded-xl font-bold text-sm md:text-base">
              Read Only
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <PageShimmer />
          ) : canvases.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white border-3 md:border-4 border-black rounded-xl md:rounded-2xl p-8 md:p-12 inline-block">
                <FileImage size={48} strokeWidth={2.5} className="mx-auto mb-4 md:w-16 md:h-16" />
                <p className="text-gray-600 text-base md:text-lg font-bold mb-4">No diagrams available</p>
                <p className="text-gray-500 text-sm">Check back later for new diagrams!</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {canvases.map((canvas) => (
                <div
                  key={canvas.canvasId}
                  className="bg-white border-3 md:border-4 border-black rounded-xl md:rounded-2xl overflow-hidden hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all group"
                >
                  <div
                    onClick={() => handleCanvasClick(canvas)}
                    className="cursor-pointer"
                  >
                    <div className="h-40 md:h-48 bg-gradient-to-br from-purple-100 to-pink-100 border-b-3 md:border-b-4 border-black flex items-center justify-center">
                      <FileImage size={48} strokeWidth={2.5} className="text-purple-500 md:w-16 md:h-16" />
                    </div>
                    <div className="p-4 md:p-6">
                      <div className="flex items-center justify-between mb-2 md:mb-3">
                        <h3 className="text-lg md:text-xl font-black text-black line-clamp-1">{canvas.name}</h3>
                        {canvas.isPublic ? (
                          <Unlock size={18} strokeWidth={2.5} className="text-green-500 md:w-5 md:h-5" />
                        ) : (
                          <Lock size={18} strokeWidth={2.5} className="text-red-500 md:w-5 md:h-5" />
                        )}
                      </div>
                      <p className="text-xs md:text-sm text-gray-600 font-medium">
                        Updated: {new Date(canvas.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="border-t-2 border-black p-3 md:p-4">
                    <button
                      onClick={() => handleCanvasClick(canvas)}
                      className="w-full px-2 md:px-3 py-1.5 md:py-2 bg-blue-500 text-white border-2 border-black rounded-lg font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm"
                    >
                      <FileImage size={14} strokeWidth={2.5} className="md:w-4 md:h-4" />
                      View Diagram
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
