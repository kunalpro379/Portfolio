import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, FileImage, Lock, Unlock, Trash2, Edit, ArrowLeft } from 'lucide-react';
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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedCanvas, setSelectedCanvas] = useState<Canvas | null>(null);
  const [password, setPassword] = useState('');
  const [newCanvasName, setNewCanvasName] = useState('');
  const [newCanvasPublic, setNewCanvasPublic] = useState(false);
  const [activeCanvas, setActiveCanvas] = useState<string | null>(null);
  const [canvasData, setCanvasData] = useState<any>(null);
  const [viewOnly, setViewOnly] = useState(false);

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
      // First fetch canvas info to check if it's public or private
      const response = await fetch(`${API_BASE_URL}/api/diagrams/${canvasId}`);
      
      if (!response.ok) throw new Error('Failed to load canvas');
      
      const responseData = await response.json();
      const isPublicCanvas = responseData.canvas.isPublic;
      
      // Public canvas = editable, Private canvas = view-only
      setCanvasData(responseData.data);
      setActiveCanvas(canvasId);
      setViewOnly(!isPublicCanvas); // If public, allow editing; if private, view-only
    } catch (error) {
      console.error('Error loading canvas:', error);
      alert('Failed to load canvas. It may have been deleted or you may not have access.');
      navigate('/learnings?tab=diagrams');
    }
  };

  const fetchCanvases = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/diagrams`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch canvases');
      
      const data = await response.json();
      setCanvases(data.canvases || []);
    } catch (error) {
      console.error('Error fetching canvases:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCanvas = async (canvasId: string, isViewOnly: boolean = false) => {
    try {
      console.log('Loading canvas:', canvasId, 'viewOnly:', isViewOnly);
      const response = await fetch(`${API_BASE_URL}/api/diagrams/${canvasId}`);
      
      if (!response.ok) throw new Error('Failed to load canvas');
      
      const responseData = await response.json();
      console.log('Canvas loaded, setting viewOnly to:', isViewOnly);
      setCanvasData(responseData.data);
      setActiveCanvas(canvasId);
      setViewOnly(isViewOnly); // Use the parameter directly
    } catch (error) {
      console.error('Error loading canvas:', error);
      alert('Failed to load canvas');
    }
  };

  const handleCanvasClick = (canvas: Canvas) => {
    setSelectedCanvas(canvas);
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = () => {
    if (password === 'kunal') {
      setShowPasswordModal(false);
      setPassword('');
      if (selectedCanvas) {
        console.log('Opening canvas with password - editable mode');
        // Direct access with password = always editable
        loadCanvas(selectedCanvas.canvasId, false);
      }
    } else {
      alert('Incorrect password!');
    }
  };

  const handleCreateCanvas = async () => {
    if (!newCanvasName.trim()) {
      alert('Please enter a canvas name');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/diagrams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: newCanvasName,
          isPublic: newCanvasPublic,
          data: { elements: [], appState: {} }
        })
      });

      if (!response.ok) throw new Error('Failed to create canvas');

      const data = await response.json();
      setShowCreateModal(false);
      setNewCanvasName('');
      setNewCanvasPublic(false);
      
      // Open the newly created canvas
      loadCanvas(data.canvasId, false);
      fetchCanvases();
    } catch (error) {
      console.error('Error creating canvas:', error);
      alert('Failed to create canvas');
    }
  };

  const handleSaveCanvas = async (data: any) => {
    if (!activeCanvas) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/diagrams/${activeCanvas}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ data })
      });

      if (!response.ok) throw new Error('Failed to save canvas');
    } catch (error) {
      console.error('Error saving canvas:', error);
      throw error;
    }
  };

  const handleDeleteCanvas = async (canvasId: string) => {
    if (!confirm('Are you sure you want to delete this canvas?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/diagrams/${canvasId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete canvas');

      fetchCanvases();
    } catch (error) {
      console.error('Error deleting canvas:', error);
      alert('Failed to delete canvas');
    }
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
          setViewOnly(false);
          if (!canvasIdFromUrl) {
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
              My Diagrams
            </h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 md:px-6 py-2 md:py-3 bg-purple-500 text-white border-2 md:border-3 border-black rounded-lg md:rounded-xl font-bold hover:bg-purple-600 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1 md:gap-2 text-sm md:text-base"
            >
              <Plus size={18} className="md:w-5 md:h-5" strokeWidth={2.5} />
              <span className="hidden sm:inline">New Canvas</span>
              <span className="sm:hidden">New</span>
            </button>
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
                <p className="text-gray-600 text-base md:text-lg font-bold mb-4">No canvases yet</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 md:px-6 py-2 md:py-3 bg-purple-500 text-white border-2 md:border-3 border-black rounded-lg md:rounded-xl font-bold hover:bg-purple-600 transition-all text-sm md:text-base"
                >
                  Create Your First Canvas
                </button>
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
                  <div className="border-t-2 border-black p-3 md:p-4 flex gap-2">
                    <button
                      onClick={() => handleCanvasClick(canvas)}
                      className="flex-1 px-2 md:px-3 py-1.5 md:py-2 bg-blue-500 text-white border-2 border-black rounded-lg font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm"
                    >
                      <Edit size={14} strokeWidth={2.5} className="md:w-4 md:h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCanvas(canvas.canvasId)}
                      className="px-2 md:px-3 py-1.5 md:py-2 bg-red-500 text-white border-2 border-black rounded-lg font-bold hover:bg-red-600 transition-all"
                    >
                      <Trash2 size={14} strokeWidth={2.5} className="md:w-4 md:h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Canvas Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-black mb-4">Create New Canvas</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Canvas Name</label>
              <input
                type="text"
                value={newCanvasName}
                onChange={(e) => setNewCanvasName(e.target.value)}
                placeholder="My Awesome Diagram"
                className="w-full px-4 py-2 border-2 border-black rounded-lg font-medium"
              />
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newCanvasPublic}
                  onChange={(e) => setNewCanvasPublic(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="font-bold text-sm">
                  Make Public (Anyone with link can edit)
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewCanvasName('');
                  setNewCanvasPublic(false);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 border-2 border-black rounded-lg font-bold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCanvas}
                className="flex-1 px-4 py-2 bg-purple-500 text-white border-2 border-black rounded-lg font-bold hover:bg-purple-600 transition-all"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-black mb-4"> Enter Password</h3>
            
            <div className="mb-6">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                placeholder="Enter password"
                className="w-full px-4 py-2 border-2 border-black rounded-lg font-medium"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setSelectedCanvas(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 border-2 border-black rounded-lg font-bold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="flex-1 px-4 py-2 bg-black text-white border-2 border-black rounded-lg font-bold hover:bg-gray-800 transition-all"
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
