import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bold, ChevronLeft, ChevronRight, Copy, Download, Italic, Trash2 } from 'lucide-react';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDate(dateText: string) {
  const [year, month, day] = dateText.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addDays(dateText: string, offset: number) {
  const nextDate = parseDate(dateText);
  nextDate.setDate(nextDate.getDate() + offset);
  return formatDate(nextDate);
}

type DiaryEntry = {
  date: string;
  leftContent: string;
  rightContent: string;
};

export default function DiaryPage() {
  const [date, setDate] = useState(formatDate(new Date()));
  const [leftContent, setLeftContent] = useState('');
  const [rightContent, setRightContent] = useState('');
  const [leftFontSize, setLeftFontSize] = useState(16);
  const [rightFontSize, setRightFontSize] = useState(16);
  const [saving, setSaving] = useState(false);
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev' | null>(null);
  const [loadingDate, setLoadingDate] = useState(false);

  const leftSaveTimeout = useRef<number | null>(null);
  const rightSaveTimeout = useRef<number | null>(null);
  const leftEditorRef = useRef<HTMLTextAreaElement | null>(null);
  const rightEditorRef = useRef<HTMLTextAreaElement | null>(null);
  const activeEditorRef = useRef<'left' | 'right'>('right');

  const pageTitle = useMemo(() => date, [date]);

  useEffect(() => {
    loadEntry(date);
  }, [date]);

  async function loadEntry(dateText: string) {
    try {
      setLoadingDate(true);
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.diary}/${dateText}`);
      if (!response.ok) throw new Error('Failed to load diary entry');

      const data = await response.json();
      const entry: DiaryEntry | null = data.entry;

      setLeftContent(entry?.leftContent ?? '');
      setRightContent(entry?.rightContent ?? '');
    } catch (error) {
      console.error('Load diary entry failed:', error);
      setLeftContent('');
      setRightContent('');
    } finally {
      setLoadingDate(false);
    }
  }

  async function saveEntry(payload: Partial<DiaryEntry>) {
    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.diary}/${date}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to save diary entry');
    } catch (error) {
      console.error('Save diary entry failed:', error);
    } finally {
      setSaving(false);
    }
  }

  function scheduleLeftSave(value: string) {
    if (leftSaveTimeout.current) window.clearTimeout(leftSaveTimeout.current);
    leftSaveTimeout.current = window.setTimeout(() => saveEntry({ leftContent: value }), 800);
  }

  function scheduleRightSave(value: string) {
    if (rightSaveTimeout.current) window.clearTimeout(rightSaveTimeout.current);
    rightSaveTimeout.current = window.setTimeout(() => saveEntry({ rightContent: value }), 800);
  }

  function animateSlide(direction: 'next' | 'prev', nextDateText: string) {
    setSlideDirection(direction);
    window.setTimeout(() => {
      setDate(nextDateText);
      window.setTimeout(() => setSlideDirection(null), 250);
    }, 160);
  }

  function goToDate(direction: 'next' | 'prev') {
    const offset = direction === 'next' ? 1 : -1;
    animateSlide(direction, addDays(date, offset));
  }

  function syncDateInput(value: string) {
    setDate(value);
  }

  function insertAtCursor(editor: 'left' | 'right', before: string, after = '') {
    const textarea = editor === 'left' ? leftEditorRef.current : rightEditorRef.current;
    if (!textarea) return;

    const currentValue = editor === 'left' ? leftContent : rightContent;
    const setValue = editor === 'left' ? setLeftContent : setRightContent;
    const save = editor === 'left' ? scheduleLeftSave : scheduleRightSave;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = currentValue.slice(start, end);
    const nextValue = currentValue.slice(0, start) + before + selected + after + currentValue.slice(end);

    setValue(nextValue);
    save(nextValue);

    window.setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  }

  function copyCurrent() {
    const text = activeEditorRef.current === 'left' ? leftContent : rightContent;
    navigator.clipboard.writeText(text);
  }

  function downloadCurrent() {
    const payload = `Date: ${date}\n\nLeft Page\n${leftContent}\n\nRight Page\n${rightContent}`;
    const blob = new Blob([payload], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `diary_${date}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function clearCurrentPage() {
    const editor = activeEditorRef.current;
    const confirmMessage = editor === 'left'
      ? 'Clear the left page for this date?'
      : 'Clear the right page for this date?';

    if (!window.confirm(confirmMessage)) return;

    if (editor === 'left') {
      setLeftContent('');
      saveEntry({ leftContent: '' });
    } else {
      setRightContent('');
      saveEntry({ rightContent: '' });
    }
  }

  const slideClass = slideDirection === 'next'
    ? 'diary-page slide-next'
    : slideDirection === 'prev'
      ? 'diary-page slide-prev'
      : 'diary-page';

  return (
    <div className="w-full flex flex-col items-center px-3 md:px-4 lg:px-6 pt-1 pb-4 relative z-[10]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');

        .diary-mono {
          font-family: 'JetBrains Mono', 'Cascadia Code', 'SFMono-Regular', monospace;
        }

        .page-lines {
          background-image: linear-gradient(to bottom, transparent 29px, rgba(120, 120, 120, 0.18) 29px, rgba(120, 120, 120, 0.18) 30px, transparent 30px);
          background-size: 100% 30px;
          background-position: 0 12px;
        }

        .diary-page {
          transform: translateX(0) rotateY(0deg);
          transition: transform 260ms ease, box-shadow 260ms ease;
          will-change: transform;
        }

        .diary-page.slide-next {
          transform: translateX(-24px) rotateY(-6deg);
          box-shadow: -18px 10px 26px rgba(0, 0, 0, 0.2);
        }

        .diary-page.slide-prev {
          transform: translateX(24px) rotateY(6deg);
          box-shadow: -18px 10px 26px rgba(0, 0, 0, 0.2);
        }

        .toolbar-btn {
          transition: transform 150ms ease, box-shadow 150ms ease, background-color 150ms ease;
        }

        .toolbar-btn:hover {
          transform: translateY(-1px);
        }

        .editor-box {
          box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05);
        }

        textarea::placeholder {
          color: rgba(31, 41, 55, 0.45);
        }
      `}</style>

      {/* Top row */}
      <div className="w-full max-w-[1240px] flex items-center justify-between gap-2 mb-2 md:mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToDate('prev')}
            className="toolbar-btn px-3 py-2 bg-white border-2 border-black rounded-lg font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
          </button>
          <button
            onClick={() => goToDate('next')}
            className="toolbar-btn px-3 py-2 bg-white border-2 border-black rounded-lg font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-lg md:text-2xl font-black text-gray-900 diary-mono">{pageTitle}</span>
          <input
            type="date"
            value={date}
            onChange={(e) => syncDateInput(e.target.value)}
            className="px-2 md:px-3 py-2 bg-white border-2 border-black rounded-lg font-bold text-xs md:text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] diary-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadCurrent}
            className="toolbar-btn px-3 md:px-4 py-2 bg-white border-2 border-black rounded-lg font-bold text-xs md:text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <Download className="w-4 h-4 inline-block mr-1" strokeWidth={2.5} />
            Download
          </button>
          <button
            onClick={clearCurrentPage}
            className="toolbar-btn px-3 md:px-4 py-2 bg-red-100 border-2 border-red-500 text-red-700 rounded-lg font-bold text-xs md:text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <Trash2 className="w-4 h-4 inline-block mr-1" strokeWidth={2.5} />
            Delete
          </button>
        </div>
      </div>

      {/* Editor toolbar */}
      {toolbarVisible && (
        <div className="w-full max-w-[1240px] mb-2 flex flex-wrap items-center gap-2 bg-white border-2 border-black rounded-lg px-3 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <button
            onClick={() => insertAtCursor(activeEditorRef.current, '**', '**')}
            className="toolbar-btn px-3 py-2 bg-gray-100 border border-black rounded-md text-xs font-bold diary-mono"
          >
            <Bold className="w-4 h-4 inline-block mr-1" strokeWidth={2.5} />
            Bold
          </button>
          <button
            onClick={() => insertAtCursor(activeEditorRef.current, '_', '_')}
            className="toolbar-btn px-3 py-2 bg-gray-100 border border-black rounded-md text-xs font-bold diary-mono"
          >
            <Italic className="w-4 h-4 inline-block mr-1" strokeWidth={2.5} />
            Italic
          </button>
          <button
            onClick={() => insertAtCursor(activeEditorRef.current, '• ')}
            className="toolbar-btn px-3 py-2 bg-gray-100 border border-black rounded-md text-xs font-bold diary-mono"
          >
            Bullet
          </button>
          <button
            onClick={() => insertAtCursor(activeEditorRef.current, '---\n')}
            className="toolbar-btn px-3 py-2 bg-gray-100 border border-black rounded-md text-xs font-bold diary-mono"
          >
            Line
          </button>

          <div className="h-7 w-px bg-gray-300 mx-1" />

          <label className="flex items-center gap-2 text-xs font-bold text-gray-700 diary-mono">
            Size
            <select
              value={activeEditorRef.current === 'left' ? leftFontSize : rightFontSize}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (activeEditorRef.current === 'left') {
                  setLeftFontSize(value);
                } else {
                  setRightFontSize(value);
                }
              }}
              className="px-2 py-1 bg-white border border-black rounded-md text-xs font-bold diary-mono"
            >
              <option value={12}>12</option>
              <option value={14}>14</option>
              <option value={16}>16</option>
              <option value={18}>18</option>
              <option value={20}>20</option>
              <option value={22}>22</option>
            </select>
          </label>

          <button
            onClick={copyCurrent}
            className="toolbar-btn px-3 py-2 bg-gray-100 border border-black rounded-md text-xs font-bold diary-mono"
          >
            <Copy className="w-4 h-4 inline-block mr-1" strokeWidth={2.5} />
            Copy
          </button>
          <button
            onClick={() => setToolbarVisible(false)}
            className="toolbar-btn px-3 py-2 bg-gray-100 border border-black rounded-md text-xs font-bold diary-mono ml-auto"
          >
            Hide Tools
          </button>
        </div>
      )}

      {!toolbarVisible && (
        <div className="w-full max-w-[1240px] mb-2 flex justify-end">
          <button
            onClick={() => setToolbarVisible(true)}
            className="toolbar-btn px-3 py-2 bg-white border-2 border-black rounded-lg text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] diary-mono"
          >
            Show Tools
          </button>
        </div>
      )}

      {/* Book */}
      <div className="w-full max-w-[1240px]" style={{ height: '560px' }}>
        <div className="book-container w-full h-full flex gap-0 overflow-hidden rounded-lg">
          <div
            className={`editor-box page-lines flex-1 h-full border-[3px] border-[#8a5a44] rounded-l-xl px-4 py-4 md:px-5 md:py-5 overflow-y-auto bg-[#f6ead6] ${slideClass}`}
            onMouseDown={() => { activeEditorRef.current = 'left'; }}
            style={{ boxShadow: '-10px 8px 22px rgba(0,0,0,0.18)' }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="diary-mono font-bold text-[#7a4b2b]">Left Page</div>
              <div className="diary-mono text-xs text-[#7a4b2b]">{loadingDate ? 'Loading...' : 'Ready'}</div>
            </div>

            <textarea
              ref={leftEditorRef}
              value={leftContent}
              onFocus={() => { activeEditorRef.current = 'left'; }}
              onChange={(e) => {
                setLeftContent(e.target.value);
                scheduleLeftSave(e.target.value);
              }}
              placeholder="Left page notes..."
              spellCheck={false}
              className="w-full h-[470px] resize-none bg-transparent focus:outline-none text-black diary-mono leading-7 overflow-y-auto"
              style={{ fontSize: `${leftFontSize}px`, caretColor: '#111827' }}
            />
          </div>

          <div
            className={`editor-box page-lines flex-1 h-full border-[3px] border-[#4f6b88] rounded-r-xl px-4 py-4 md:px-5 md:py-5 overflow-y-auto bg-[#eef5fb] ${slideClass}`}
            onMouseDown={() => { activeEditorRef.current = 'right'; }}
            style={{ boxShadow: '10px 8px 22px rgba(0,0,0,0.18)' }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="diary-mono font-bold text-[#2e4964]">Right Page</div>
              <div className="diary-mono text-xs text-[#2e4964]">{saving ? 'Saving...' : 'Saved'}</div>
            </div>

            <textarea
              ref={rightEditorRef}
              value={rightContent}
              onFocus={() => { activeEditorRef.current = 'right'; }}
              onChange={(e) => {
                setRightContent(e.target.value);
                scheduleRightSave(e.target.value);
              }}
              placeholder="Right page notes..."
              spellCheck={false}
              className="w-full h-[470px] resize-none bg-transparent focus:outline-none text-black diary-mono leading-7 overflow-y-auto"
              style={{ fontSize: `${rightFontSize}px`, caretColor: '#111827' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
