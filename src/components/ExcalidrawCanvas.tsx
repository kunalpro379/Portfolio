import { useState, useCallback } from 'react';
import { Excalidraw, MainMenu, WelcomeScreen } from '@excalidraw/excalidraw';
import { Save, Share2, Lock, Unlock, X } from 'lucide-react';

interface ExcalidrawCanvasProps {
  canvasId: string;
  isPublic: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: any;
  viewOnly?: boolean;
}

export default function ExcalidrawCanvas({
  canvasId,
  isPublic,
  onClose,
  onSave,
  initialData,
  viewOnly = false
}: ExcalidrawCanvasProps) {
  console.log('ExcalidrawCanvas props:', { canvasId, isPublic, viewOnly });
  
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [showControls, setShowControls] = useState(true);

  const handleSave = useCallback(async () => {
    if (!excalidrawAPI || viewOnly) return;

    try {
      setIsSaving(true);
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      
      const canvasData = {
        elements,
        appState: {
          viewBackgroundColor: appState.viewBackgroundColor,
          currentItemFontFamily: appState.currentItemFontFamily,
          currentItemFontSize: appState.currentItemFontSize,
          currentItemStrokeColor: appState.currentItemStrokeColor,
          currentItemBackgroundColor: appState.currentItemBackgroundColor,
        },
      };

      await onSave(canvasData);
      
      // Show success message briefly at center
      const successMsg = document.createElement('div');
      successMsg.textContent = 'Saved changes';
      successMsg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;color:black;padding:16px 32px;border-radius:12px;font-weight:bold;z-index:9999;border:3px solid black;box-shadow:4px 4px 0px 0px rgba(0,0,0,1);font-size:18px;';
      document.body.appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 2000);
    } catch (error) {
      console.error('Error saving canvas:', error);
      alert('Failed to save canvas');
    } finally {
      setIsSaving(false);
    }
  }, [excalidrawAPI, onSave, viewOnly]);

  const handleShare = () => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/learnings/diagrams?canvas=${canvasId}`;
    setShareLink(link);
    setShowShareModal(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    const successMsg = document.createElement('div');
    successMsg.textContent = '✓ Link copied!';
    successMsg.style.cssText = 'position:fixed;top:20px;right:20px;background:#3b82f6;color:white;padding:12px 24px;border-radius:8px;font-weight:bold;z-index:9999;border:2px solid black;';
    document.body.appendChild(successMsg);
    setTimeout(() => successMsg.remove(), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white" onMouseMove={() => setShowControls(true)}>
      {/* Floating Controls - Desktop: top horizontal, Mobile: left vertical column (small icons only) */}
      <div 
        className={`fixed z-[60] transition-opacity duration-300 pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0'} 
          md:top-4 md:left-4 md:right-4 md:flex md:flex-row md:items-center md:justify-between
          top-[120px] left-2 flex flex-col gap-1.5 items-start`}
      >
        <div className="flex md:flex-row flex-col items-start md:items-center gap-1.5 md:gap-2 md:bg-white/95 md:backdrop-blur-sm md:border-2 md:border-black md:rounded-lg md:p-2 md:shadow-lg pointer-events-auto">
          <button
            onClick={onClose}
            className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg border-2 border-black transition-all bg-white/95 backdrop-blur-sm shadow-md"
            title="Close"
          >
            <X size={18} strokeWidth={2.5} className="md:w-5 md:h-5" />
          </button>
          <div className={`flex items-center justify-center p-1.5 md:px-3 md:py-1.5 border-2 border-black rounded-lg shadow-md backdrop-blur-sm ${
            viewOnly ? 'bg-red-100' : isPublic ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            {viewOnly ? (
              <>
                <Lock size={18} strokeWidth={2.5} className="text-red-600 md:w-4 md:h-4" />
                <span className="text-sm font-bold text-red-600 hidden md:inline md:ml-2">View Only</span>
              </>
            ) : isPublic ? (
              <>
                <Unlock size={18} strokeWidth={2.5} className="text-green-600 md:w-4 md:h-4" />
                <span className="text-sm font-bold text-green-600 hidden md:inline md:ml-2">Public</span>
              </>
            ) : (
              <>
                <Lock size={18} strokeWidth={2.5} className="md:w-4 md:h-4" />
                <span className="text-sm font-bold hidden md:inline md:ml-2">Private</span>
              </>
            )}
          </div>
        </div>

        {!viewOnly && (
          <div className="flex md:flex-row flex-col items-stretch md:items-center gap-1.5 md:gap-2 md:bg-white/95 md:backdrop-blur-sm md:border-2 md:border-black md:rounded-lg md:p-2 md:shadow-lg pointer-events-auto">
            <button
              onClick={handleShare}
              className="p-1.5 md:px-4 md:py-2 bg-blue-500 text-white border-2 border-black rounded-lg font-bold hover:bg-blue-600 transition-all flex items-center gap-2 justify-center shadow-md backdrop-blur-sm"
              title="Share"
            >
              <Share2 size={18} strokeWidth={2.5} className="md:w-[18px] md:h-[18px]" />
              <span className="hidden md:inline">Share</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="p-1.5 md:px-4 md:py-2 bg-green-500 text-white border-2 border-black rounded-lg font-bold hover:bg-green-600 transition-all flex items-center gap-2 disabled:opacity-50 justify-center shadow-md backdrop-blur-sm"
              title="Save to Azure"
            >
              <Save size={18} strokeWidth={2.5} className="md:w-[18px] md:h-[18px]" />
              <span className="hidden md:inline">{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        )}
      </div>

      {/* View-Only Banner */}
      {viewOnly && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[60] bg-red-500 text-white px-6 py-3 rounded-lg border-2 border-black shadow-lg font-bold pointer-events-none">
           View Only Mode - This is a private canvas
        </div>
      )}

      {/* Full Screen Excalidraw Canvas - z-10 so it's below controls */}
      <div className="absolute inset-0 z-10" key={`canvas-${viewOnly ? 'view' : 'edit'}`}>
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          initialData={initialData}
          viewModeEnabled={viewOnly}
          zenModeEnabled={false}
          gridModeEnabled={false}
        >
          <MainMenu>
            <MainMenu.DefaultItems.ClearCanvas />
            <MainMenu.DefaultItems.SaveAsImage />
            <MainMenu.DefaultItems.ChangeCanvasBackground />
          </MainMenu>
          <WelcomeScreen>
            <WelcomeScreen.Hints.MenuHint />
            <WelcomeScreen.Hints.ToolbarHint />
          </WelcomeScreen>
        </Excalidraw>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white border-4 border-black rounded-2xl p-4 md:p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg md:text-xl font-black">Share Canvas</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-xs md:text-sm font-bold mb-2">
                {isPublic ? ' Public Link (Anyone can edit)' : ' Private Link (View only - no editing)'}
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 px-3 py-2 border-2 border-black rounded-lg font-mono text-xs md:text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-black text-white border-2 border-black rounded-lg font-bold hover:bg-gray-800 transition-all text-sm"
                >
                  Copy
                </button>
              </div>
            </div>

            
          </div>
        </div>
      )}
    </div>
  );
}
