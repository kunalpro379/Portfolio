import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, BookOpen } from 'lucide-react';
import { createGuide } from '@/services/guideNotesApi';

export default function GuideCreate() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !topic.trim()) {
      alert('Name and topic are required');
      return;
    }

    try {
      setSaving(true);
      const newGuide = await createGuide({
        name: name.trim(),
        topic: topic.trim(),
        description: description.trim()
      });
      alert('Guide created successfully!');
      navigate(`/learnings/guide/${newGuide.guideId}`);
    } catch (err) {
      console.error('Error creating guide:', err);
      alert('Failed to create guide');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => navigate('/learnings?tab=notes')}
          className="mb-5 flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-black"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
          Back to Guides
        </button>

        <div className="border border-gray-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] md:p-8">
          <div className="mb-8 flex items-center gap-4">
            <div className="border border-gray-200 bg-gradient-to-br from-amber-300 to-orange-400 p-3">
              <BookOpen size={32} strokeWidth={2.5} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-black">
                Create New Guide
              </h1>
              <p className="text-sm font-medium text-gray-600">Start organizing your documentation</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-700">
                Guide Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Complete TypeScript Guide"
                className="w-full rounded-none border border-gray-200 px-4 py-3 text-base font-medium text-black focus:border-gray-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-700">
                Topic <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., TypeScript, React, Node.js"
                className="w-full rounded-none border border-gray-200 px-4 py-3 text-base font-medium text-black focus:border-gray-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-700">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this guide..."
                rows={4}
                className="w-full rounded-none border border-gray-200 px-4 py-3 font-medium text-black focus:border-gray-400 focus:outline-none resize-none"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => navigate('/learnings?tab=notes')}
                className="flex-1 rounded-none border border-gray-200 bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 border border-black bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-900 disabled:opacity-50"
              >
                <Save size={20} strokeWidth={2.5} />
                {saving ? 'Creating...' : 'Create Guide'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
