import React, { useEffect, useState, useRef } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function DiaryPage() {
  const [date, setDate] = useState<string>(formatDate(new Date()));
  const [content, setContent] = useState('');
  const [prevContent, setPrevContent] = useState('');
  const [saving, setSaving] = useState(false);
  const saveTimeout = useRef<number | null>(null);
  const flipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadEntry(date);
    // load previous day's preview
    const prev = new Date(date + 'T00:00:00');
    prev.setDate(prev.getDate() - 1);
    loadPrevEntry(formatDate(prev));
  }, [date]);

  async function loadEntry(d: string) {
    try {
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.diary}/${d}`);
      if (!res.ok) {
        setContent('');
        return;
      }
      const data = await res.json();
      setContent(data.entry?.content || '');
    } catch (err) {
      console.error(err);
    }
  }

  async function loadPrevEntry(d: string) {
    try {
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.diary}/${d}`);
      if (!res.ok) {
        setPrevContent('');
        return;
      }
      const data = await res.json();
      setPrevContent(data.entry?.content || '');
    } catch (err) {
      console.error(err);
    }
  }

  function changeDate(offset: number) {
    const cur = new Date(date + 'T00:00:00');
    cur.setDate(cur.getDate() + offset);
    setDate(formatDate(cur));
    triggerFlip();
  }

  function triggerFlip() {
    if (!flipRef.current) return;
    flipRef.current.classList.remove('flip');
    // trigger reflow
    // @ts-ignore
    void flipRef.current.offsetWidth;
    flipRef.current.classList.add('flip');
  }

  function scheduleSave(text: string) {
    if (saveTimeout.current) window.clearTimeout(saveTimeout.current);
    // autosave after 1.5s of inactivity
    // @ts-ignore
    saveTimeout.current = window.setTimeout(() => saveEntry(text), 1500);
  }

  async function saveEntry(text: string) {
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.diary}/${date}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text })
      });
      if (!res.ok) throw new Error('Failed to save');
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => changeDate(-1)} className="px-3 py-2 bg-white border-2 border-black rounded">Previous</button>
          <button onClick={() => changeDate(1)} className="px-3 py-2 bg-white border-2 border-black rounded">Next</button>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-bold">{date}</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-2 py-1 border-2 border-black rounded bg-white"
          />
        </div>
      </div>

      <div className="book-container relative perspective-1000">
        <div ref={flipRef} className="book flex w-full shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform duration-700 transform-style-preserve-3d">
          <div className="page left bg-[#fbf7f0] border-2 border-black p-4 w-1/2 min-h-[320px] overflow-auto">
            <div className="text-xs text-gray-600 font-bold mb-2">Previous ({new Date(new Date(date + 'T00:00:00').getTime() - 86400000).toISOString().slice(0,10)})</div>
            <div className="whitespace-pre-wrap text-sm text-gray-800">{prevContent || 'No entry'}</div>
          </div>

          <div className="page right bg-white border-2 border-black p-4 w-1/2 min-h-[320px]">
            <div className="text-xs text-gray-600 font-bold mb-2">Entry</div>
            <textarea
              value={content}
              onChange={(e) => { setContent(e.target.value); scheduleSave(e.target.value); }}
              placeholder="Write your diary here..."
              className="w-full h-[260px] resize-none bg-transparent focus:outline-none text-sm leading-relaxed"
            />
            <div className="mt-2 text-right text-[11px] text-gray-500">{saving ? 'Saving…' : 'Saved'}</div>
          </div>
        </div>
      </div>

      <style>{`
        .book-container { perspective: 1400px; }
        .book { display: flex; transform-origin: left center; }
        .book.flip { transform: rotateY(-8deg); }
        .page { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
