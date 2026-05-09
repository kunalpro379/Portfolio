import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Pen, Trash2, Download, Bold, Italic, Copy } from 'lucide-react';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function DiaryPage() {
  const [date, setDate] = useState<string>(formatDate(new Date()));
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const saveTimeout = useRef<number | null>(null);
  const bookRef = useRef<HTMLDivElement | null>(null);
  const leftPageRef = useRef<HTMLDivElement | null>(null);
  const rightPageRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    loadEntry(date);
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

  function changeDate(offset: number) {
    if (isFlipping) return;
    setIsFlipping(true);
    const cur = new Date(date + 'T00:00:00');
    cur.setDate(cur.getDate() + offset);
    
    if (rightPageRef.current) {
      const duration = 0.6;
      const keyframes = offset > 0 
        ? `@keyframes pageFlip { 0% { transform: translateX(0) rotateY(0deg); } 50% { transform: translateX(-50%) rotateY(-25deg); } 100% { transform: translateX(0) rotateY(0deg); } }`
        : `@keyframes pageFlip { 0% { transform: translateX(0) rotateY(0deg); } 50% { transform: translateX(50%) rotateY(25deg); } 100% { transform: translateX(0) rotateY(0deg); } }`;
      
      const style = document.createElement('style');
      style.textContent = keyframes;
      document.head.appendChild(style);
      
      rightPageRef.current.style.animation = `pageFlip ${duration}s ease-in-out`;
      
      setTimeout(() => {
        setDate(formatDate(cur));
        if (rightPageRef.current) {
          rightPageRef.current.style.animation = 'none';
        }
        setIsFlipping(false);
        document.head.removeChild(style);
      }, duration * 1000 / 2);
    } else {
      setDate(formatDate(cur));
      setIsFlipping(false);
    }
  }

  function scheduleSave(text: string) {
    if (saveTimeout.current) window.clearTimeout(saveTimeout.current);
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

  function clearContent() {
    if (window.confirm('Are you sure? This will clear the entry for today.')) {
      setContent('');
      saveEntry('');
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(content);
  }

  function insertText(before: string, after: string = '') {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const newContent = content.substring(0, start) + before + selected + after + content.substring(end);
    setContent(newContent);
    scheduleSave(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  }

  function downloadAsText() {
    const element = document.createElement('a');
    const file = new Blob([`${date}\n\n${content}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `diary_${date}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  return (
    <div className="w-full flex flex-col items-center justify-center p-4 md:p-8 relative z-[10]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap');
        
        .diary-font { font-family: 'Caveat', cursive; }
        .handwritten { font-family: 'Caveat', cursive; font-size: 16px; }
        
        .page-paper {
          background-image: 
            linear-gradient(to bottom, transparent 24px, #ccc 24px, #ccc 25px, transparent 25px);
          background-size: 100% 25px;
          background-position: 0 10px;
        }
        
        .page-shadow {
          box-shadow: -8px 8px 20px rgba(0,0,0,0.25), inset -1px -1px 3px rgba(0,0,0,0.08);
        }
        
        @keyframes bookFlipRight {
          0% { transform: translateX(0) rotateY(0deg); }
          100% { transform: translateX(-100%) rotateY(-15deg); }
        }
        
        @keyframes bookFlipLeft {
          0% { transform: translateX(-100%) rotateY(-15deg); }
          100% { transform: translateX(0) rotateY(0deg); }
        }
        
        .book-container {
          perspective: 1500px;
          transform-style: preserve-3d;
        }
        
        .right-page-flip {
          transform-origin: left center;
          animation-fill-mode: forwards;
        }
        
        textarea::placeholder {
          font-family: 'Caveat', cursive;
          color: #9ca3af;
          font-size: 18px;
        }
        
        .toolbar-btn {
          transition: all 0.2s ease;
        }
        
        .toolbar-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
      `}</style>

      {/* Top Toolbar */}
      <div className="w-full max-w-5xl mb-4 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
        {/* Left Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeDate(-1)}
            disabled={isFlipping}
            className="toolbar-btn flex items-center gap-1 px-3 md:px-4 py-2 bg-white border-2 border-black rounded-lg font-bold text-sm md:text-base hover:bg-gray-100 disabled:opacity-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
            <span className="hidden xs:inline">Previous</span>
          </button>
          <button
            onClick={() => changeDate(1)}
            disabled={isFlipping}
            className="toolbar-btn flex items-center gap-1 px-3 md:px-4 py-2 bg-white border-2 border-black rounded-lg font-bold text-sm md:text-base hover:bg-gray-100 disabled:opacity-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <span className="hidden xs:inline">Next</span>
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Center Date Display */}
        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-lg md:text-2xl font-black text-gray-900">{date}</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-2 md:px-3 py-2 border-2 border-black rounded-lg bg-white font-bold text-xs md:text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          />
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="toolbar-btn p-2 md:p-2.5 bg-white border-2 border-black rounded-lg hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            title="Copy to clipboard"
          >
            <Copy className="w-4 h-4 md:w-5 md:h-5 text-gray-700" strokeWidth={2.5} />
          </button>
          <button
            onClick={downloadAsText}
            className="toolbar-btn p-2 md:p-2.5 bg-white border-2 border-black rounded-lg hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            title="Download entry"
          >
            <Download className="w-4 h-4 md:w-5 md:h-5 text-gray-700" strokeWidth={2.5} />
          </button>
          <button
            onClick={clearContent}
            className="toolbar-btn p-2 md:p-2.5 bg-red-100 border-2 border-red-400 rounded-lg hover:bg-red-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            title="Clear entry"
          >
            <Trash2 className="w-4 h-4 md:w-5 md:h-5 text-red-600" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Text Editor Toolbar */}
      {toolbarVisible && (
        <div className="w-full max-w-5xl mb-3 flex flex-wrap items-center gap-2 md:gap-3 bg-white border-2 border-black rounded-lg p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <label className="flex items-center gap-2 font-bold text-xs md:text-sm text-gray-700">
            Size:
            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="px-2 py-1 border border-black rounded text-xs font-bold"
            >
              <option value={12}>12px</option>
              <option value={14}>14px</option>
              <option value={16}>16px (Default)</option>
              <option value={18}>18px</option>
              <option value={20}>20px</option>
              <option value={24}>24px</option>
            </select>
          </label>

          <div className="border-l border-gray-300 h-6 mx-1" />

          <button
            onClick={() => insertText('**', '**')}
            title="Bold"
            className="toolbar-btn p-2 bg-gray-100 border border-black rounded hover:bg-gray-200"
          >
            <Bold className="w-4 h-4 text-gray-700" strokeWidth={2.5} />
          </button>
          <button
            onClick={() => insertText('_', '_')}
            title="Italic"
            className="toolbar-btn p-2 bg-gray-100 border border-black rounded hover:bg-gray-200"
          >
            <Italic className="w-4 h-4 text-gray-700" strokeWidth={2.5} />
          </button>

          <div className="border-l border-gray-300 h-6 mx-1" />

          <button
            onClick={() => insertText('• ')}
            title="Bullet point"
            className="toolbar-btn px-2 py-1 bg-gray-100 border border-black rounded text-xs font-bold hover:bg-gray-200"
          >
            Bullet
          </button>
          <button
            onClick={() => insertText('---\n')}
            title="Divider"
            className="toolbar-btn px-2 py-1 bg-gray-100 border border-black rounded text-xs font-bold hover:bg-gray-200"
          >
            Line
          </button>
        </div>
      )}

      {/* Book Container - Fixed Height */}
      <div className="book-container w-full max-w-5xl" style={{ height: '520px' }}>
        <div
          ref={bookRef}
          className="flex gap-0 md:gap-3 w-full h-full rounded-lg overflow-hidden"
        >
          {/* Left Page - Read-only Mirror */}
          <div
            ref={leftPageRef}
            className="page-shadow page-paper flex-1 bg-amber-50 border-4 border-amber-900 p-6 md:p-8 overflow-y-auto scroll-smooth"
            style={{
              fontFamily: "'Caveat', cursive",
              lineHeight: '2.5',
              boxShadow: '-12px 8px 24px rgba(0,0,0,0.2), inset 1px 1px 0 rgba(255,255,255,0.5)',
            }}
          >
            <div className="mb-4 text-amber-900">
              <span className="text-xl md:text-2xl font-bold diary-font">{date}</span>
            </div>
            <div className="text-black whitespace-pre-wrap break-words handwritten pr-2" style={{ fontSize: `${fontSize}px` }}>
              {content || ''}
            </div>
          </div>

          {/* Right Page - Editable */}
          <div
            ref={rightPageRef}
            className="page-shadow page-paper flex-1 bg-white border-4 border-amber-900 p-6 md:p-8 overflow-y-auto scroll-smooth flex flex-col relative"
            style={{
              boxShadow: '12px 8px 24px rgba(0,0,0,0.2), inset -1px -1px 0 rgba(0,0,0,0.03)',
            }}
          >
            <div className="mb-4 text-amber-900">
              <span className="text-xl md:text-2xl font-bold diary-font">{date}</span>
            </div>
            
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                scheduleSave(e.target.value);
              }}
              placeholder="Write your thoughts here..."
              className="flex-1 resize-none bg-transparent focus:outline-none text-black handwritten placeholder-gray-500 pr-2"
              style={{
                fontFamily: "'Caveat', cursive",
                lineHeight: '2.5',
                fontSize: `${fontSize}px`,
              }}
            />
            
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs md:text-sm text-gray-500 font-bold">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${saving ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                <span>{saving ? 'Saving...' : 'Saved'}</span>
              </div>
              <span className="text-gray-400">{content.length} chars</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
