import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bold, ChevronLeft, ChevronRight, Italic, Trash2 } from 'lucide-react';
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

type EditorSide = 'left' | 'right';

function sanitizeHtml(html: string) {
  return html
    .replace(/<div><br><\/div>/g, '<div>\u00a0</div>')
    .replace(/<p><br><\/p>/g, '<p>\u00a0</p>');
}

export default function DiaryPage() {
  const [date, setDate] = useState(formatDate(new Date()));
  const [leftFontSize, setLeftFontSize] = useState(16);
  const [rightFontSize, setRightFontSize] = useState(16);
  const [saving, setSaving] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev' | null>(null);
  const [loadingDate, setLoadingDate] = useState(false);
  const [activeSide, setActiveSide] = useState<EditorSide>('right');

  const leftSaveTimeout = useRef<number | null>(null);
  const rightSaveTimeout = useRef<number | null>(null);
  const leftEditorRef = useRef<HTMLDivElement | null>(null);
  const rightEditorRef = useRef<HTMLDivElement | null>(null);
  const leftSelectionRef = useRef<Range | null>(null);
  const rightSelectionRef = useRef<Range | null>(null);
  const leftContentRef = useRef('');
  const rightContentRef = useRef('');

  const pageTitle = useMemo(() => date, [date]);

  useEffect(() => {
    loadEntry(date);
  }, [date]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  async function loadEntry(dateText: string) {
    try {
      setLoadingDate(true);
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.diary}/${dateText}`);
      if (!response.ok) throw new Error('Failed to load diary entry');

      const data = await response.json();
      const entry: DiaryEntry | null = data.entry;

      const nextLeftContent = entry?.leftContent ?? '';
      const nextRightContent = entry?.rightContent ?? '';

      leftContentRef.current = nextLeftContent;
      rightContentRef.current = nextRightContent;

      if (leftEditorRef.current) {
        leftEditorRef.current.innerHTML = nextLeftContent;
      }
      if (rightEditorRef.current) {
        rightEditorRef.current.innerHTML = nextRightContent;
      }
    } catch (error) {
      console.error('Load diary entry failed:', error);
      leftContentRef.current = '';
      rightContentRef.current = '';
      if (leftEditorRef.current) leftEditorRef.current.innerHTML = '';
      if (rightEditorRef.current) rightEditorRef.current.innerHTML = '';
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

  function scheduleSave(side: EditorSide, value: string) {
    const timeoutRef = side === 'left' ? leftSaveTimeout : rightSaveTimeout;
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      saveEntry(side === 'left' ? { leftContent: value } : { rightContent: value });
    }, 800);
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

  function getActiveEditor() {
    return activeSide === 'left' ? leftEditorRef.current : rightEditorRef.current;
  }

  function getSelectionStore() {
    return activeSide === 'left' ? leftSelectionRef : rightSelectionRef;
  }

  function updateContentFromEditor(side: EditorSide) {
    const editor = side === 'left' ? leftEditorRef.current : rightEditorRef.current;
    if (!editor) return;
    const html = sanitizeHtml(editor.innerHTML);
    if (side === 'left') {
      leftContentRef.current = html;
      scheduleSave('left', html);
    } else {
      rightContentRef.current = html;
      scheduleSave('right', html);
    }
  }

  function captureSelection(side: EditorSide) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const editor = side === 'left' ? leftEditorRef.current : rightEditorRef.current;
    if (!editor || !editor.contains(range.commonAncestorContainer)) return;
    getSelectionStore().current = range;
  }

  function preserveSelection(side: EditorSide) {
    setActiveSide(side);
    captureSelection(side);
  }

  function restoreSelection(side: EditorSide) {
    const storedRange = side === 'left' ? leftSelectionRef.current : rightSelectionRef.current;
    if (!storedRange) return;
    const selection = window.getSelection();
    if (!selection) return;
    selection.removeAllRanges();
    selection.addRange(storedRange);
  }

  function execCommand(command: string, value?: string) {
    const editor = getActiveEditor();
    if (!editor) return;

    editor.focus();
    restoreSelection(activeSide);
    document.execCommand(command, false, value);
    updateContentFromEditor(activeSide);
  }

  function insertBullet() {
    execCommand('insertHTML', '<div>•&nbsp;</div>');
  }

  function insertLine() {
    execCommand('insertHTML', '<hr />');
  }

  function downloadCurrent() {
    const leftText = leftEditorRef.current?.innerText || '';
    const rightText = rightEditorRef.current?.innerText || '';
    const payload = `Date: ${date}\n\nLeft Page\n${leftText}\n\nRight Page\n${rightText}`;
    const blob = new Blob([payload], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `diary_${date}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function clearCurrentPage() {
    const editor = activeSide === 'left' ? leftEditorRef.current : rightEditorRef.current;
    const confirmMessage = activeSide === 'left'
      ? 'Clear the left page for this date?'
      : 'Clear the right page for this date?';

    if (!window.confirm(confirmMessage)) return;

    if (editor) {
      editor.innerHTML = '';
      updateContentFromEditor(activeSide);
    }
  }

  function handleEditorInput(side: EditorSide) {
    updateContentFromEditor(side);
  }

  const rightPageFlipClass = slideDirection === 'next'
    ? 'right-page-flip right-page-flip-next'
    : slideDirection === 'prev'
      ? 'right-page-flip right-page-flip-prev'
      : 'right-page-flip';

  const leftPageFlipClass = slideDirection === 'next'
    ? 'left-page-flip left-page-flip-next'
    : slideDirection === 'prev'
      ? 'left-page-flip left-page-flip-prev'
      : 'left-page-flip';

  const activeFontSize = activeSide === 'left' ? leftFontSize : rightFontSize;

  return (
    <div className="w-full flex flex-col items-center px-2 md:px-3 lg:px-4 pt-1 pb-4 relative z-[10]">
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

        .book-container {
          perspective: 1800px;
        }

        .right-page-flip {
          transform-origin: left center;
          transform-style: preserve-3d;
          backface-visibility: hidden;
          position: relative;
          overflow: hidden;
          will-change: transform;
        }

        .left-page-flip {
          transform-origin: right center;
          transform-style: preserve-3d;
          backface-visibility: hidden;
          position: relative;
          overflow: hidden;
          will-change: transform;
        }

        .right-page-flip::before {
          content: '';
          position: absolute;
          left: -10px;
          top: 0;
          bottom: 0;
          width: 18px;
          pointer-events: none;
          background: linear-gradient(to right, rgba(0,0,0,0.28), rgba(0,0,0,0.08), transparent);
          opacity: 0.8;
        }

        .left-page-flip::after {
          content: '';
          position: absolute;
          right: -10px;
          top: 0;
          bottom: 0;
          width: 18px;
          pointer-events: none;
          background: linear-gradient(to left, rgba(0,0,0,0.28), rgba(0,0,0,0.08), transparent);
          opacity: 0.8;
        }

        @keyframes flipNext {
          0% { transform: translateX(0) rotateY(0deg) scale(1); }
          25% { transform: translateX(-8px) rotateY(-45deg) scale(0.995); }
          50% { transform: translateX(-12px) rotateY(-90deg) scale(0.985); }
          75% { transform: translateX(-8px) rotateY(-135deg) scale(0.995); }
          100% { transform: translateX(0) rotateY(-180deg) scale(1); }
        }

        @keyframes flipPrev {
          0% { transform: translateX(0) rotateY(-180deg) scale(1); }
          25% { transform: translateX(-8px) rotateY(-135deg) scale(0.995); }
          50% { transform: translateX(-12px) rotateY(-90deg) scale(0.985); }
          75% { transform: translateX(-8px) rotateY(-45deg) scale(0.995); }
          100% { transform: translateX(0) rotateY(0deg) scale(1); }
        }

        @keyframes flipOutNext {
          0% { transform: translateX(0) rotateY(0deg) scale(1); }
          25% { transform: translateX(8px) rotateY(45deg) scale(0.995); }
          50% { transform: translateX(12px) rotateY(90deg) scale(0.985); }
          75% { transform: translateX(8px) rotateY(135deg) scale(0.995); }
          100% { transform: translateX(0) rotateY(180deg) scale(1); }
        }

        @keyframes flipOutPrev {
          0% { transform: translateX(0) rotateY(180deg) scale(1); }
          25% { transform: translateX(8px) rotateY(135deg) scale(0.995); }
          50% { transform: translateX(12px) rotateY(90deg) scale(0.985); }
          75% { transform: translateX(8px) rotateY(45deg) scale(0.995); }
          100% { transform: translateX(0) rotateY(0deg) scale(1); }
        }

        .right-page-flip-next {
          animation: flipNext 700ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          box-shadow: -26px 16px 34px rgba(0, 0, 0, 0.24);
        }

        .right-page-flip-prev {
          animation: flipPrev 700ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          box-shadow: -26px 16px 34px rgba(0, 0, 0, 0.24);
        }

        .left-page-flip-next {
          animation: flipOutNext 700ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          box-shadow: 10px 8px 22px rgba(0, 0, 0, 0.24);
        }

        .left-page-flip-prev {
          animation: flipOutPrev 700ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          box-shadow: 10px 8px 22px rgba(0, 0, 0, 0.24);
        }

        .toolbar-btn {
          transition: transform 150ms ease, box-shadow 150ms ease, background-color 150ms ease;
        }

        .toolbar-btn:hover {
          transform: translateY(-1px);
        }

        .editor-box {
          box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        .editor-area:focus {
          outline: none;
        }

        .editor-area {
          white-space: pre-wrap;
          word-break: break-word;
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.05);
        }

        .editor-area::-webkit-scrollbar {
          width: 8px;
        }

        .editor-area::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
        }

        .editor-area::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }

        .editor-area::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }

        .editor-area hr {
          border: 0;
          border-top: 1px solid rgba(0, 0, 0, 0.25);
          margin: 10px 0;
        }
      `}</style>

      {/* Single control row */}
      <div className="w-full max-w-[1240px] flex flex-wrap items-center justify-between gap-2 mb-1.5 md:mb-2">
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => goToDate('prev')}
            className="toolbar-btn h-11 w-11 flex items-center justify-center bg-white border-2 border-black rounded-lg font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
          </button>
          <button
            onClick={() => goToDate('next')}
            className="toolbar-btn h-11 w-11 flex items-center justify-center bg-white border-2 border-black rounded-lg font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <span className="text-lg md:text-2xl font-black text-gray-900 diary-mono">{pageTitle}</span>
          <input
            type="date"
            value={date}
            onChange={(e) => syncDateInput(e.target.value)}
            className="px-2 md:px-3 py-2 bg-white border-2 border-black rounded-lg font-bold text-xs md:text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] diary-mono"
          />
        </div>

        <div className="flex flex-nowrap items-center justify-end gap-2 overflow-x-auto max-w-full pb-1 md:pb-0">
          <button
            onMouseDown={(e) => { e.preventDefault(); preserveSelection(activeSide); }}
            onClick={() => execCommand('bold')}
            className="toolbar-btn px-2.5 py-2 bg-gray-100 border border-black rounded-md text-xs font-bold diary-mono shrink-0"
          >
            <Bold className="w-4 h-4 inline-block mr-1" strokeWidth={2.5} />
            Bold
          </button>
          <button
            onMouseDown={(e) => { e.preventDefault(); preserveSelection(activeSide); }}
            onClick={() => execCommand('italic')}
            className="toolbar-btn px-2.5 py-2 bg-gray-100 border border-black rounded-md text-xs font-bold diary-mono shrink-0"
          >
            <Italic className="w-4 h-4 inline-block mr-1" strokeWidth={2.5} />
            Italic
          </button>
          <button
            onMouseDown={(e) => { e.preventDefault(); preserveSelection(activeSide); }}
            onClick={insertBullet}
            className="toolbar-btn px-2.5 py-2 bg-gray-100 border border-black rounded-md text-xs font-bold diary-mono shrink-0"
          >
            Bullet
          </button>
          <button
            onMouseDown={(e) => { e.preventDefault(); preserveSelection(activeSide); }}
            onClick={insertLine}
            className="toolbar-btn px-2.5 py-2 bg-gray-100 border border-black rounded-md text-xs font-bold diary-mono shrink-0"
          >
            Line
          </button>
          <label className="flex items-center gap-2 text-xs font-bold text-gray-700 diary-mono px-1 shrink-0">
            Size
            <select
              value={activeSide === 'left' ? leftFontSize : rightFontSize}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (activeSide === 'left') setLeftFontSize(value);
                else setRightFontSize(value);
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
            onClick={clearCurrentPage}
            className="toolbar-btn h-11 w-11 flex items-center justify-center bg-red-100 border-2 border-red-500 text-red-700 rounded-lg font-bold text-xs md:text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Book */}
      <div className="w-full max-w-[1240px]" style={{ height: '560px' }}>
        <div className="book-container w-full h-full flex gap-0 overflow-hidden rounded-lg">
          <div
            className={`editor-box page-lines flex-1 h-full border-[3px] border-[#8a5a44] rounded-l-xl px-3 py-3 md:px-4 md:py-4 bg-[#f6ead6] ${leftPageFlipClass}`}
            onMouseDown={() => setActiveSide('left')}
            style={{ boxShadow: '-10px 8px 22px rgba(0,0,0,0.18)' }}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="diary-mono font-bold text-[#7a4b2b]">Left Page</div>
              <div className="diary-mono text-xs text-[#7a4b2b]">{loadingDate ? 'Loading...' : 'Ready'}</div>
            </div>

            <div
              ref={leftEditorRef}
              contentEditable
              suppressContentEditableWarning
              className="editor-area w-full h-[474px] bg-transparent text-black diary-mono leading-7 pr-1"
              style={{ fontSize: `${leftFontSize}px`, caretColor: '#111827' }}
              onFocus={() => setActiveSide('left')}
              onMouseUp={() => captureSelection('left')}
              onKeyUp={() => captureSelection('left')}
              onInput={() => handleEditorInput('left')}
            />
          </div>

          <div
            className={`editor-box page-lines flex-1 h-full border-[3px] border-[#4f6b88] rounded-r-xl px-3 py-3 md:px-4 md:py-4 bg-[#eef5fb] ${rightPageFlipClass}`}
            onMouseDown={() => setActiveSide('right')}
            style={{ boxShadow: '10px 8px 22px rgba(0,0,0,0.18)' }}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="diary-mono font-bold text-[#2e4964]">Right Page</div>
              <div className="diary-mono text-xs text-[#2e4964]">{saving ? 'Saving...' : 'Saved'}</div>
            </div>

            <div
              ref={rightEditorRef}
              contentEditable
              suppressContentEditableWarning
              className="editor-area w-full h-[474px] bg-transparent text-black diary-mono leading-7 pr-1"
              style={{ fontSize: `${rightFontSize}px`, caretColor: '#111827' }}
              onFocus={() => setActiveSide('right')}
              onMouseUp={() => captureSelection('right')}
              onKeyUp={() => captureSelection('right')}
              onInput={() => handleEditorInput('right')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
