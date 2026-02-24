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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/learnings?tab=notes')}
          className="flex items-center gap-2 text-gray-600 hover:text-black font-bold text-sm transition-all mb-6"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
          Back to Guides
        </button>

        <div className="bg-white border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-gradient-to-br from-yellow-400 to-yellow-600 border-4 border-black rounded-xl">
              <BookOpen size={32} strokeWidth={2.5} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                Create New Guide
              </h1>
              <p className="text-gray-600 font-medium">Start organizing your documentation</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-black mb-2 uppercase tracking-wider">
                Guide Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Complete TypeScript Guide"
                className="w-full px-4 py-3 border-3 border-black rounded-lg font-bold text-lg focus:outline-none focus:ring-4 focus:ring-yellow-300"
              />
            </div>

            <div>
              <label className="block text-sm font-black mb-2 uppercase tracking-wider">
                Topic <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., TypeScript, React, Node.js"
                className="w-full px-4 py-3 border-3 border-black rounded-lg font-bold focus:outline-none focus:ring-4 focus:ring-yellow-300"
              />
            </div>

            <div>
              <label className="block text-sm font-black mb-2 uppercase tracking-wider">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this guide..."
                rows={4}
                className="w-full px-4 py-3 border-3 border-black rounded-lg font-medium focus:outline-none focus:ring-4 focus:ring-yellow-300 resize-none"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => navigate('/learnings?tab=notes')}
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
                {saving ? 'Creating...' : 'Create Guide'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
