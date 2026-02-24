import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { fetchGuideById, createTitle, updateTitle, type Guide } from '@/services/guideNotesApi';

export default function TitleEditor() {
  const navigate = useNavigate();
  const { guideId, titleId } = useParams<{ guideId: string; titleId: string }>();
  const isEditMode = titleId && titleId !== 'new';

  const [guide, setGuide] = useState<Guide | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (guideId) {
      loadGuide();
    }
  }, [guideId]);

  const loadGuide = async () => {
    try {
      setLoading(true);
      const fetchedGuide = await fetchGuideById(guideId!);
      setGuide(fetchedGuide);

      if (isEditMode) {
        const title = fetchedGuide.titles.find(t => t.titleId === titleId);
        if (title) {
          setName(title.name);
          setDescription(title.description);
        }
      }
    } catch (err) {
      console.error('Error loading guide:', err);
      alert('Failed to load guide');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Title name is required');
      return;
    }

    try {
      setSaving(true);
      if (isEditMode) {
        await updateTitle(guideId!, titleId!, {
          name: name.trim(),
          description: description.trim()
        });
        alert('Title updated successfully!');
      } else {
        const newTitle = await createTitle(guideId!, {
          name: name.trim(),
          description: description.trim()
        });
        alert('Title created successfully!');
        navigate(`/learnings/guide/${guideId}/title/${newTitle.titleId}/edit`);
      }
    } catch (err) {
      console.error('Error saving title:', err);
      alert('Failed to save title');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(`/learnings/guide/${guideId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-black font-bold text-sm transition-all mb-6"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
          Back to Guide
        </button>

        <div className="bg-white border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-black mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              {isEditMode ? 'Edit Title' : 'Create New Title'}
            </h1>
            {guide && (
              <p className="text-gray-600 font-medium">
                in <span className="font-bold">{guide.name}</span>
              </p>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-black mb-2 uppercase tracking-wider">
                Title Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Introduction to TypeScript"
                className="w-full px-4 py-3 border-3 border-black rounded-lg font-bold text-lg focus:outline-none focus:ring-4 focus:ring-yellow-300"
              />
            </div>

            <div>
              <label className="block text-sm font-black mb-2 uppercase tracking-wider">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this title..."
                rows={4}
                className="w-full px-4 py-3 border-3 border-black rounded-lg font-medium focus:outline-none focus:ring-4 focus:ring-yellow-300 resize-none"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => navigate(`/learnings/guide/${guideId}`)}
                className="flex-1 px-6 py-3 bg-gray-200 border-3 border-black rounded-lg font-bold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-black text-white border-3 border-black rounded-lg font-bold hover:bg-gray-800 transition-all disabled:opacity-50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                <Save size={20} strokeWidth={2.5} />
                {saving ? 'Saving...' : 'Save Title'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
