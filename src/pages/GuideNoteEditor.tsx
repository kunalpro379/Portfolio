import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function GuideNoteEditorPage() {
  const navigate = useNavigate();
  const { guideId, titleId, mode } = useParams<{ guideId: string; titleId: string; mode?: string }>();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(`/learnings/guide/${guideId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-black font-bold text-sm transition-all mb-6"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
          Back to Guide
        </button>

        <div className="bg-white border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
          <h1 className="text-3xl font-black text-black mb-4" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            Document Editor
          </h1>
          <p className="text-gray-700 font-medium mb-4">
            Mode: {mode === 'view' ? 'View Only' : 'Edit Mode'}
          </p>
          <p className="text-gray-600">
            Guide ID: {guideId}<br />
            Title ID: {titleId}
          </p>
          <p className="text-sm text-gray-500 mt-6">
            Document editor interface coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
