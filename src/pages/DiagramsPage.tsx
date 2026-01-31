import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileImage, Unlock, Lock, ArrowLeft, Edit, Eye, X } from 'lucide-react';
import ExcalidrawCanvas from '@/components/ExcalidrawCanvas';
import { API_BASE_URL } from '@/config/api';
import PageShimmer from '@/components/PageShimmer';

interface Canvas {
  canvasId: string;
  viewerId?: string;
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
  const [activeCanvas, setActiveCanvas] = useState<string | null>(null);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [canvasData, setCanvasData] = useState<any>(null);
  const [viewOnly, setViewOnly] = useState(true); // Default to read-only
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedCanvas, setSelectedCanvas] = useState<Canvas | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const EDIT_PASSWORD = 'Lawm@822471';

  // Check if accessing via share link (canvas or viewer)
  const canvasIdFromUrl = searchParams.get('canvas');
  const viewerIdFromUrl = searchParams.get('viewer');

  useEffect(() => {
    if (viewerIdFromUrl) {
      // Accessing via viewer link - always read-only
      loadCanvasFromViewerLink(viewerIdFromUrl);
    } else if (canvasIdFromUrl) {
      // Accessing via canvas link - ask for viewer or editor
      loadCanvasFromShare(canvasIdFromUrl);
    } else {
      fetchCanvases();
    }
  }, [canvasIdFromUrl, viewerIdFromUrl]);

  const loadCanvasFromShare = async (canvasId: string) => {
    try {
      // Show action modal for canvas links (viewer or editor choice)
      const response = await fetch(`${API_BASE_URL}/api/diagrams/${canvasId}`);
      
      if (!response.ok) throw new Error('Failed to load canvas');
      
      const responseData = await response.json();
      
      // Store data and show modal to choose viewer/editor
      setCanvasData(responseData.data);
      setActiveCanvas(canvasId);
      setViewerId(responseData.canvas.viewerId);
      setShowActionModal(true);
    } catch (error) {
      console.error('Error loading canvas:', error);
      alert('Failed to load canvas. It may have been deleted.');
      navigate('/learnings?tab=diagrams');
    }
  };

  const loadCanvasFromViewerLink = async (viewerId: string) => {
    try {
      // Load canvas via viewer link - always read-only
      const response = await fetch(`${API_BASE_URL}/api/diagrams/viewer/${viewerId}`);
      
      if (!response.ok) throw new Error('Failed to load canvas');
      
      const responseData = await response.json();
      
      // Always load in read-only mode for viewer links
      setCanvasData(responseData.data);
      setActiveCanvas(responseData.canvas.canvasId);
      setViewerId(viewerId);
      setViewOnly(true); // Always read-only
    } catch (error) {
      console.error('Error loading canvas from viewer link:', error);
      alert('Failed to load canvas. The link may be invalid or the canvas was deleted.');
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
      setViewerId(responseData.canvas.viewerId);
      setViewOnly(isViewOnly);
    } catch (error) {
      console.error('Error loading canvas:', error);
      alert('Failed to load canvas');
    }
  };

  const handleCanvasClick = (canvas: Canvas) => {
    // Show action modal to choose between view or edit
    setSelectedCanvas(canvas);
    setShowActionModal(true);
  };

  const handleViewCanvas = () => {
    console.log('Opening canvas in read-only mode');
    setViewOnly(true);
    setShowActionModal(false);
  };

  const handleEditCanvas = () => {
    setShowActionModal(false);
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = () => {
    if (password === EDIT_PASSWORD) {
      console.log('Opening canvas in edit mode');
      setViewOnly(false);
      setShowPasswordModal(false);
      setSelectedCanvas(null);
      setPassword('');
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password. Please try again.');
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPassword('');
    setPasswordError('');
    setSelectedCanvas(null);
  };

  const handleSaveCanvas = async (data: any) => {
    if (!activeCanvas) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/diagrams/${activeCanvas}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });

      if (!response.ok) throw new Error('Failed to save canvas');
      
      console.log('Canvas saved successfully');
    } catch (error) {
      console.error('Error saving canvas:', error);
      throw error;
    }
  };

  if (activeCanvas) {
    const currentCanvas = canvases.find(c => c.canvasId === activeCanvas);
    const canvasIsPublic = currentCanvas?.isPublic || false;
    
    console.log('Rendering canvas:', activeCanvas, 'viewOnly:', viewOnly, 'isPublic:', canvasIsPublic, 'viewerId:', viewerId);
    
    return (
      <ExcalidrawCanvas
        canvasId={activeCanvas}
        viewerId={viewerId || undefined}
        isPublic={canvasIsPublic}
        onClose={() => {
          setActiveCanvas(null);
          setViewerId(null);
          setCanvasData(null);
          setViewOnly(true);
          if (!canvasIdFromUrl && !viewerIdFromUrl) {
            fetchCanvases();
          } else {
            navigate('/learnings?tab=diagrams');
          }
        }}
        onSave={handleSaveCanvas}
        initialData={canvasData}
        viewOnly={viewOnly}
      />
    );
  }

  // Show loading screen when accessing via viewer link
  if (viewerIdFromUrl && loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-2xl font-black mb-2">Loading Diagram...</h3>
          <p className="text-gray-600 font-medium">Please wait while we fetch your diagram</p>
        </div>
      </div>
    );
  }

  // Show loading screen when accessing via canvas link
  if (canvasIdFromUrl && loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-2xl font-black mb-2">Loading Diagram...</h3>
          <p className="text-gray-600 font-medium">Please wait while we fetch your diagram</p>
        </div>
      </div>
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
            <div className="px-3 md:px-6 py-2 md:py-3 bg-blue-100 text-blue-600 border-2 md:border-3 border-blue-300 rounded-lg md:rounded-xl font-bold text-sm md:text-base">
              Public Gallery
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
                      Open Diagram
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Action Modal - Choose View or Edit */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black rounded-2xl p-6 max-w-md w-full mx-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-black"> Choose Action</h3>
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setSelectedCanvas(null);
                  if (canvasIdFromUrl) {
                    navigate('/learnings?tab=diagrams');
                  }
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6 font-medium">
              How would you like to open this diagram?
            </p>
            
            <div className="space-y-3">
              <button
                onClick={handleViewCanvas}
                className="w-full flex items-center gap-3 p-4 bg-blue-500 text-white border-3 border-black rounded-xl hover:bg-blue-600 transition-all font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5"
              >
                <Eye size={20} strokeWidth={2.5} />
                <div className="text-left">
                  <div className="font-bold">View Only</div>
                  <div className="text-sm opacity-90">Browse and view the diagram (No password required)</div>
                </div>
              </button>
              
              <button
                onClick={handleEditCanvas}
                className="w-full flex items-center gap-3 p-4 bg-green-500 text-white border-3 border-black rounded-xl hover:bg-green-600 transition-all font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5"
              >
                <Edit size={20} strokeWidth={2.5} />
                <div className="text-left">
                  <div className="font-bold">Edit Mode</div>
                  <div className="text-sm opacity-90">Make changes to the diagram (Password required)</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black rounded-2xl p-6 max-w-md w-full mx-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-black"> Enter Password</h3>
              <button
                onClick={closePasswordModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4 font-medium">
              Enter the password to edit this diagram:
            </p>
            
            <div className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handlePasswordSubmit();
                  }
                }}
                placeholder="Enter password..."
                className="w-full px-4 py-3 border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                autoFocus
              />
              
              {passwordError && (
                <div className="p-3 bg-red-100 border-2 border-red-500 rounded-lg">
                  <p className="text-red-600 text-sm font-bold">❌ {passwordError}</p>
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={closePasswordModal}
                  className="flex-1 px-4 py-3 bg-gray-500 text-white border-3 border-black rounded-xl hover:bg-gray-600 transition-all font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  className="flex-1 px-4 py-3 bg-green-500 text-white border-3 border-black rounded-xl hover:bg-green-600 transition-all font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5"
                >
                  🔓 Unlock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
