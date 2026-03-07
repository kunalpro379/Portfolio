import { useState } from 'react';
import { Youtube, X, Loader2, CheckCircle, AlertCircle, Circle } from 'lucide-react';
import { processYouTubeVideoStream, type StreamUpdate } from '@/services/youtubeTranscriptApi';

interface YouTubeTranscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  guideId: string;
  titleId: string;
  onSuccess: () => void;
}

interface ProcessStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  message?: string;
  progress?: { current: number; total: number };
}

export default function YouTubeTranscriptModal({
  isOpen,
  onClose,
  guideId,
  titleId,
  onSuccess
}: YouTubeTranscriptModalProps) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [steps, setSteps] = useState<ProcessStep[]>([
    { id: 'extract_id', label: 'Extract Video ID', status: 'pending' },
    { id: 'fetch_transcript', label: 'Download Transcript', status: 'pending' },
    { id: 'chunk_transcript', label: 'Split into Chunks', status: 'pending' },
    { id: 'process_chunk', label: 'Process with AI', status: 'pending' },
    { id: 'generate_embeddings', label: 'Generate Embeddings', status: 'pending' },
    { id: 'merge_document', label: 'Create Markdown', status: 'pending' },
    { id: 'save_document', label: 'Save Document', status: 'pending' },
  ]);
  const [finalStats, setFinalStats] = useState<any>(null);

  if (!isOpen) return null;

  const updateStep = (stepId: string, updates: Partial<ProcessStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!youtubeUrl.trim()) {
      updateStep('extract_id', { status: 'error', message: 'Please enter a YouTube URL' });
      return;
    }

    try {
      setProcessing(true);
      
      // Reset all steps
      setSteps(prev => prev.map(step => ({ ...step, status: 'pending', message: undefined, progress: undefined })));
      setFinalStats(null);

      await processYouTubeVideoStream(
        {
          youtubeUrl: youtubeUrl.trim(),
          guideId,
          titleId
        },
        (update: StreamUpdate) => {
          if (update.done) {
            if (update.success) {
              setFinalStats(update.stats);
              setTimeout(() => {
                onSuccess();
                handleClose();
              }, 2000);
            } else {
              updateStep('save_document', { status: 'error', message: 'Processing failed' });
            }
            return;
          }

          const { step, status, message, data } = update;
          
          updateStep(step, {
            status: status as any,
            message,
            progress: data?.current && data?.total ? { current: data.current, total: data.total } : undefined
          });
        }
      );
    } catch (error) {
      console.error('Error processing YouTube video:', error);
      updateStep('save_document', { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Failed to process video' 
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    if (processing) return;
    setYoutubeUrl('');
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending', message: undefined, progress: undefined })));
    setFinalStats(null);
    onClose();
  };

  const getStepIcon = (step: ProcessStep) => {
    if (step.status === 'complete') {
      return <CheckCircle size={20} className="text-green-600 animate-bounce" strokeWidth={2.5} />;
    }
    if (step.status === 'processing') {
      return <Loader2 size={20} className="text-blue-600 animate-spin" strokeWidth={2.5} />;
    }
    if (step.status === 'error') {
      return <AlertCircle size={20} className="text-red-600" strokeWidth={2.5} />;
    }
    return <Circle size={20} className="text-gray-300" strokeWidth={2.5} />;
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[500] p-4"
      onClick={processing ? undefined : handleClose}
    >
      <div 
        className="bg-white border-4 border-black rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500 border-3 border-black rounded-xl">
              <Youtube size={28} strokeWidth={2.5} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-black">Process YouTube Video</h2>
              <p className="text-sm text-gray-600 font-medium">
                AI-powered transcript analysis with embeddings
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={processing}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              YouTube URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              disabled={processing}
              className="w-full px-4 py-3 border-3 border-black rounded-xl font-medium text-black focus:outline-none focus:ring-4 focus:ring-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              autoFocus
            />
          </div>

          {/* Processing Steps */}
          {processing && (
            <div className="bg-gradient-to-br from-gray-50 to-white border-3 border-black rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-black text-black mb-3 uppercase tracking-wider">Processing Steps</h3>
              {steps.map((step, idx) => (
                <div key={step.id} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getStepIcon(step)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${
                        step.status === 'complete' ? 'text-green-700' :
                        step.status === 'processing' ? 'text-blue-700' :
                        step.status === 'error' ? 'text-red-700' :
                        'text-gray-500'
                      }`}>
                        {step.label}
                      </span>
                      {step.progress && (
                        <span className="text-xs font-medium text-gray-600">
                          ({step.progress.current}/{step.progress.total})
                        </span>
                      )}
                    </div>
                    {step.message && (
                      <p className="text-xs text-gray-600 mt-0.5 font-medium">
                        {step.message}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Final Stats */}
          {finalStats && (
            <div className="bg-green-50 border-3 border-black rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle size={24} className="text-green-600" strokeWidth={2.5} />
                <h3 className="text-lg font-black text-green-900">Processing Complete!</h3>
              </div>
              <div className="space-y-1 text-sm font-medium text-gray-700">
                <p>✓ Video ID: {finalStats.videoId}</p>
                <p>✓ Chunks processed: {finalStats.chunksProcessed}</p>
                <p>✓ Embeddings stored: {finalStats.embeddingsStored}</p>
                <p>✓ Markdown document created</p>
              </div>
            </div>
          )}

          {/* Info Box */}
          {!processing && !finalStats && (
            <div className="bg-gradient-to-br from-gray-50 to-white border-3 border-black rounded-xl p-4">
              <h3 className="text-sm font-black text-black mb-3">What happens:</h3>
              <div className="space-y-2 text-xs font-medium text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-red-500 font-black">1.</span>
                  <span>Download video transcript from YouTube</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-500 font-black">2.</span>
                  <span>Split transcript into manageable chunks</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-500 font-black">3.</span>
                  <span>Process each chunk with AI (llama-3.3-70b)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-500 font-black">4.</span>
                  <span>Generate embeddings and store in vector database</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-500 font-black">5.</span>
                  <span>Merge all AI responses into comprehensive markdown</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-500 font-black">6.</span>
                  <span>Enable semantic search across video content</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={processing}
              className="flex-1 px-6 py-3 bg-gray-200 border-3 border-black rounded-xl font-bold text-black hover:bg-gray-300 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? 'Processing...' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={processing || !youtubeUrl.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 border-3 border-black rounded-xl font-bold text-white hover:from-red-600 hover:to-red-700 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 size={20} className="animate-spin" strokeWidth={2.5} />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Youtube size={20} strokeWidth={2.5} />
                  <span>Process Video</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
