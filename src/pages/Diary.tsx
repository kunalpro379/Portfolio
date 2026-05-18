import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bold, Calendar, ChevronLeft, ChevronRight, Download, Italic, Trash2, X } from 'lucide-react';
import { flushSync } from 'react-dom';
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

type DiaryExportEntry = DiaryEntry;

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
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState(date);
  const [exportEndDate, setExportEndDate] = useState(date);
  const [exportError, setExportError] = useState('');
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportEntries, setExportEntries] = useState<DiaryExportEntry[]>([]);

  // --- Helper actions (restored) ---
  function openExportModal() {
    setExportStartDate(date);
    setExportEndDate(date);
    setExportError('');
    setIsExportModalOpen(true);
  }

  function closeExportModal() {
    setIsExportModalOpen(false);
    setExportError('');
    setExportEntries([]);
  }

  function syncDateInput(value: string) {
    setDate(value);
  }

  async function loadEntry(dateText: string) {
    setLoadingDate(true);
    try {
      const resp = await fetch(`${API_BASE_URL}${API_ENDPOINTS.diary}/${dateText}`);
      if (!resp.ok) {
        leftContentRef.current = '';
        rightContentRef.current = '';
      } else {
        const data = await resp.json();
        const entry: DiaryEntry | null = data.entry ?? null;
        leftContentRef.current = entry?.leftContent ?? '';
        rightContentRef.current = entry?.rightContent ?? '';
      }

      // reflect into editors if mounted
      if (leftEditorRef.current) leftEditorRef.current.innerHTML = leftContentRef.current;
      if (rightEditorRef.current) rightEditorRef.current.innerHTML = rightContentRef.current;
    } catch (err) {
      console.error('Failed to load diary entry', err);
    } finally {
      setLoadingDate(false);
    }
  }

  async function saveEntry(side: EditorSide, html: string) {
    try {
      const payload: Partial<DiaryEntry> = { date } as any;
      if (side === 'left') payload.leftContent = html;
      else payload.rightContent = html;

      await fetch(`${API_BASE_URL}${API_ENDPOINTS.diary}/${date}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Failed to save diary entry', err);
    }
  }

  function scheduleSave(side: EditorSide, html: string) {
    if (side === 'left') {
      if (leftSaveTimeout.current) window.clearTimeout(leftSaveTimeout.current);
      leftSaveTimeout.current = window.setTimeout(() => {
        saveEntry('left', html);
      }, 800);
    } else {
      if (rightSaveTimeout.current) window.clearTimeout(rightSaveTimeout.current);
      rightSaveTimeout.current = window.setTimeout(() => {
        saveEntry('right', html);
      }, 800);
    }
  }

  const leftSaveTimeout = useRef<number | null>(null);
  const rightSaveTimeout = useRef<number | null>(null);
  const leftEditorRef = useRef<HTMLDivElement | null>(null);
  const rightEditorRef = useRef<HTMLDivElement | null>(null);
  const exportSheetRef = useRef<HTMLDivElement | null>(null);
  const leftSelectionRef = useRef<Range | null>(null);
  const rightSelectionRef = useRef<Range | null>(null);
  const leftContentRef = useRef('');
  const rightContentRef = useRef('');

  const pageTitle = useMemo(() => date, [date]);

  useEffect(() => {
    loadEntry(date);
  }, [date]);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    if (isExportModalOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isExportModalOpen]);

  function getDateRange(startDate: string, endDate: string) {
    const orderedStart = startDate <= endDate ? startDate : endDate;
    const orderedEnd = startDate <= endDate ? endDate : startDate;
    const dates: string[] = [];
    let current = orderedStart;

    while (current <= orderedEnd) {
      dates.push(current);
      current = addDays(current, 1);
    }

    return dates;
  }

  async function fetchDiaryEntry(dateText: string): Promise<DiaryExportEntry> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.diary}/${dateText}`);
    if (!response.ok) {
      throw new Error(`Failed to load diary entry for ${dateText}`);
    }

    const data = await response.json();
    const entry: DiaryEntry | null = data.entry;

    return {
      date: dateText,
      leftContent: entry?.leftContent ?? '',
      rightContent: entry?.rightContent ?? ''
    };
  }

  async function downloadPdfForRange() {
    if (!exportStartDate || !exportEndDate) {
      setExportError('Please select both start and end dates.');
      return;
    }

    setExportError('');
    setExportingPdf(true);

    try {
      const dates = getDateRange(exportStartDate, exportEndDate);
      const entries = await Promise.all(dates.map((dateText) => fetchDiaryEntry(dateText)));

      flushSync(() => {
        setExportEntries(entries);
      });

      await document.fonts?.ready;
      await new Promise((resolve) => window.requestAnimationFrame(() => resolve(null)));

      const pdfModule = await import('html2pdf.js');
      const html2pdf = pdfModule.default ?? pdfModule;
      const exportElement = exportSheetRef.current;

      if (!exportElement) {
        throw new Error('Export preview is not ready.');
      }

      const fileName = `diary_${dates[0]}_to_${dates[dates.length - 1]}.pdf`;

      // Fallback: generate PDF directly using jsPDF (monospace Courier) with two-column layout.
      try {
        const jspdfModule = await import('jspdf');
        const { jsPDF } = jspdfModule;

        const doc = new jsPDF({ unit: 'px', format: [1240, 660], orientation: 'landscape' });
        doc.setFont('Courier');

        const pageWidth = 1240;
        const pageHeight = 660;
        const margin = 20;
        const colGap = 16;
        const colWidth = (pageWidth - margin * 2 - colGap) / 2;

        function htmlToText(html: string) {
          return html
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<li>/gi, '• ')
            .replace(/<\/li>/gi, '\n')
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .trim();
        }

        for (const entry of entries) {
          const leftText = htmlToText(sanitizeHtml(entry.leftContent || '')) || '';
          const rightText = htmlToText(sanitizeHtml(entry.rightContent || '')) || '';

          const fontSize = 14; // reasonable default
          const lineHeight = Math.round(fontSize * 1.25);
          doc.setFontSize(fontSize);

          const leftLinesAll = doc.splitTextToSize(leftText, colWidth - 8);
          const rightLinesAll = doc.splitTextToSize(rightText, colWidth - 8);

          const linesPerPage = Math.floor((pageHeight - 60) / lineHeight);

          let idx = 0;
          const maxLines = Math.max(leftLinesAll.length, rightLinesAll.length);

          while (idx < maxLines) {
            // header
            doc.setFontSize(16);
            doc.setFont('Courier', 'normal');
            doc.text('Diary Export', margin + 4, 28);
            doc.text(entry.date, pageWidth - margin - 80, 28);
            doc.setFontSize(fontSize);

            const leftSlice = leftLinesAll.slice(idx, idx + linesPerPage);
            const rightSlice = rightLinesAll.slice(idx, idx + linesPerPage);

            // draw left column
            const leftX = margin;
            let y = 48;
            doc.setFont('Courier', 'bold');
            doc.text('Left Page', leftX + 4, y);
            doc.setFont('Courier', 'normal');
            y += 8;

            for (const line of leftSlice) {
              y += lineHeight;
              doc.text(String(line), leftX + 4, y, { maxWidth: colWidth - 8 });
            }

            // draw right column
            const rightX = margin + colWidth + colGap;
            y = 48;
            doc.setFont('Courier', 'bold');
            doc.text('Right Page', rightX + 4, y);
            doc.setFont('Courier', 'normal');
            y += 8;
            for (const line of rightSlice) {
              y += lineHeight;
              doc.text(String(line), rightX + 4, y, { maxWidth: colWidth - 8 });
            }

            idx += linesPerPage;
            if (idx < maxLines) doc.addPage();
          }

          // after each entry, add a new page for the next entry (unless last slice already advanced)
          doc.addPage();
        }

        // remove potential trailing blank page
        const totalPages = doc.getNumberOfPages();
        // if last page is blank (no content), remove it
        // naive check: if totalPages > 1, delete last page
        if (totalPages > 1) doc.deletePage(totalPages);

        doc.save(fileName);
      } catch (err) {
        console.error('jsPDF export failed:', err);
        throw err;
      }

      setIsExportModalOpen(false);
    } catch (error) {
      console.error('PDF export failed:', error);
      setExportError('Failed to create the PDF. Please try again.');
    } finally {
      flushSync(() => {
        setExportEntries([]);
      });
      setExportingPdf(false);
    }
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

  const dateInputRef = useRef<HTMLInputElement | null>(null);

  const openDatePicker = () => {
    const inp = dateInputRef.current;
    if (!inp) return;
    try {
      // modern browsers
      (inp as any).showPicker?.();
      inp.focus();
    } catch (e) {
      inp.focus();
    }
  };

  return (
    <div className="w-full flex flex-col items-start px-2 md:px-3 lg:px-4 pt-0 pb-0 flex-1 overflow-hidden" style={{ zIndex: 30 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');

        .diary-mono {
          font-family: 'JetBrains Mono', 'Cascadia Code', 'SFMono-Regular', monospace;
        }

        .page-lines {
          /* darker ruled lines for readability */
          background-image: linear-gradient(to bottom, transparent 28px, rgba(0,0,0,0.12) 28px, rgba(0,0,0,0.12) 29px, transparent 29px);
          background-size: 100% 29px;
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
          15% { transform: translateX(-6px) rotateY(-30deg) scale(0.997); }
          30% { transform: translateX(-10px) rotateY(-60deg) scale(0.993); }
          45% { transform: translateX(-14px) rotateY(-90deg) scale(0.99); }
          60% { transform: translateX(-10px) rotateY(-120deg) scale(0.993); }
          75% { transform: translateX(-6px) rotateY(-150deg) scale(0.997); }
          100% { transform: translateX(0) rotateY(-180deg) scale(1); }
        }

        @keyframes flipPrev {
          0% { transform: translateX(0) rotateY(-180deg) scale(1); }
          15% { transform: translateX(-6px) rotateY(-150deg) scale(0.997); }
          30% { transform: translateX(-10px) rotateY(-120deg) scale(0.993); }
          45% { transform: translateX(-14px) rotateY(-90deg) scale(0.99); }
          60% { transform: translateX(-10px) rotateY(-60deg) scale(0.993); }
          75% { transform: translateX(-6px) rotateY(-30deg) scale(0.997); }
          100% { transform: translateX(0) rotateY(0deg) scale(1); }
        }

        @keyframes flipOutNext {
          0% { transform: translateX(0) rotateY(0deg) scale(1); }
          15% { transform: translateX(6px) rotateY(30deg) scale(0.997); }
          30% { transform: translateX(10px) rotateY(60deg) scale(0.993); }
          45% { transform: translateX(14px) rotateY(90deg) scale(0.99); }
          60% { transform: translateX(10px) rotateY(120deg) scale(0.993); }
          75% { transform: translateX(6px) rotateY(150deg) scale(0.997); }
          100% { transform: translateX(0) rotateY(180deg) scale(1); }
        }

        @keyframes flipOutPrev {
          0% { transform: translateX(0) rotateY(180deg) scale(1); }
          15% { transform: translateX(6px) rotateY(150deg) scale(0.997); }
          30% { transform: translateX(10px) rotateY(120deg) scale(0.993); }
          45% { transform: translateX(14px) rotateY(90deg) scale(0.99); }
          60% { transform: translateX(10px) rotateY(60deg) scale(0.993); }
          75% { transform: translateX(6px) rotateY(30deg) scale(0.997); }
          100% { transform: translateX(0) rotateY(0deg) scale(1); }
        }

        .right-page-flip-next {
          animation: flipNext 900ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          box-shadow: -26px 16px 34px rgba(0, 0, 0, 0.24);
        }

        .right-page-flip-prev {
          animation: flipPrev 900ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          box-shadow: -26px 16px 34px rgba(0, 0, 0, 0.24);
        }

        .left-page-flip-next {
          animation: flipOutNext 900ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          box-shadow: 10px 8px 22px rgba(0, 0, 0, 0.24);
        }

        .left-page-flip-prev {
          animation: flipOutPrev 900ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
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

        .editor-card {
          background: rgba(255,255,255,0.22);
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow: 0 10px 30px rgba(16,24,40,0.12);
          backdrop-filter: blur(8px);
          overflow: hidden;
        }

        .editor-card-left {
          background-color: rgba(249, 246, 231, 0.65);
          background-image: repeating-linear-gradient(to bottom, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 1px, transparent 1px, transparent 28px);
        }

        .editor-card-right {
          background-color: rgba(235, 246, 255, 0.65);
          background-image: repeating-linear-gradient(to bottom, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 1px, transparent 1px, transparent 28px);
        }

        /* Responsive adjustments */
        .diary-container { height: auto; flex: 1; }

        @media (max-width: 1024px) {
          .diary-container { height: auto; }
        }

        @media (max-width: 640px) {
          .editor-card { padding: 12px; }
          .toolbar-btn { padding: 8px 10px; }
          .editor-area { font-size: 15px !important; line-height: 1.5; }
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
          scrollbar-color: #3b82f6 rgba(0, 0, 0, 0.05);
        }

        .editor-area::-webkit-scrollbar {
          width: 6px;
        }

        .editor-area::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
        }

        .editor-area::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 3px;
        }

        .editor-area::-webkit-scrollbar-thumb:hover {
          background: #2563eb;
        }

        .editor-area hr {
          border: 0;
          border-top: 1px solid rgba(0, 0, 0, 0.25);
          margin: 10px 0;
        }
      `}</style>

      {/* Mobile toolbar - compact & connected to tabbar */}
      <div className="md:hidden w-full bg-white px-3 py-1 -mt-px rounded-none border-t border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToDate('prev')}
            className="h-8 w-8 flex items-center justify-center rounded-none border border-gray-200 text-gray-700 shrink-0 bg-white"
            aria-label="Previous date"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="whitespace-nowrap font-bold diary-mono text-sm text-gray-800 truncate">{pageTitle}</span>
            <button
              type="button"
              onClick={() => setActiveSide(activeSide === 'left' ? 'right' : 'left')}
              className={`h-8 w-8 shrink-0 rounded-none border border-gray-200 flex items-center justify-center bg-white text-gray-800 ${activeSide === 'left' ? 'font-bold' : ''}`}
              aria-label="Toggle page side"
            >
              {activeSide === 'left' ? 'L' : 'R'}
            </button>
          </div>

          <button
            onClick={() => goToDate('next')}
            className="h-8 w-8 flex items-center justify-center rounded-none border border-gray-200 text-gray-700 shrink-0 bg-white"
            aria-label="Next date"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          </button>

          <button
            onClick={openDatePicker}
            className="ml-2 h-8 w-8 flex items-center justify-center rounded-none bg-[#8fb0ff] text-white shrink-0"
            aria-label="Open date picker"
            title="Pick a date"
          >
            <Calendar className="w-4 h-4" strokeWidth={2} />
          </button>
          <input ref={dateInputRef} type="date" value={date} onChange={(e) => syncDateInput(e.target.value)} className="sr-only" />
        </div>

        <div className="mt-2 grid grid-cols-6 gap-2">
          <button
            onMouseDown={(e) => { e.preventDefault(); preserveSelection(activeSide); }}
            onClick={() => execCommand('bold')}
            className="h-8 rounded-none border border-gray-200 bg-white text-gray-800 font-medium diary-mono text-sm"
          >
            B
          </button>
          <button
            onMouseDown={(e) => { e.preventDefault(); preserveSelection(activeSide); }}
            onClick={() => execCommand('italic')}
            className="h-8 rounded-none border border-gray-200 bg-white text-gray-800 font-medium diary-mono text-sm"
          >
            I
          </button>
          <button
            onMouseDown={(e) => { e.preventDefault(); preserveSelection(activeSide); }}
            onClick={insertBullet}
            className="h-8 rounded-none border border-gray-200 bg-white text-gray-800 font-medium diary-mono text-lg"
          >
            •
          </button>
          <button
            onMouseDown={(e) => { e.preventDefault(); preserveSelection(activeSide); }}
            onClick={insertLine}
            className="h-8 rounded-none border border-gray-200 bg-white text-gray-800 font-medium diary-mono text-lg"
          >
            —
          </button>
          <select
            value={activeSide === 'left' ? leftFontSize : rightFontSize}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (activeSide === 'left') setLeftFontSize(value);
              else setRightFontSize(value);
            }}
            className="h-8 rounded-none border border-gray-200 bg-white text-center font-medium diary-mono text-sm"
          >
            <option value={12}>12</option>
            <option value={14}>14</option>
            <option value={16}>16</option>
            <option value={18}>18</option>
            <option value={20}>20</option>
            <option value={22}>22</option>
          </select>
          <button
            onClick={clearCurrentPage}
            className="h-8 rounded-none border border-gray-200 bg-white text-red-600 flex items-center justify-center"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Desktop toolbar */}
      <div className="hidden md:block w-full bg-white text-gray-800 rounded-none px-3 sm:px-4 md:px-6 py-1 -mt-px border-t border-gray-200">
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => goToDate('prev')}
            className="toolbar-btn h-8 w-8 flex items-center justify-center bg-white border border-gray-200 rounded-none text-gray-700 shrink-0"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
          </button>
          <button
            onClick={() => goToDate('next')}
            className="toolbar-btn h-8 w-8 flex items-center justify-center bg-white border border-gray-200 rounded-none text-gray-700 shrink-0"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          </button>

          <button
            onClick={() => setActiveSide('left')}
            className={`px-3 py-1 ml-1 rounded-none font-bold diary-mono transition shrink-0 border border-gray-200 ${activeSide === 'left' ? 'bg-black text-white' : 'bg-white text-gray-700'}`}
          >
            L
          </button>
          <button
            onClick={() => setActiveSide('right')}
            className={`px-3 py-1 rounded-none font-bold diary-mono transition shrink-0 border border-gray-200 ${activeSide === 'right' ? 'bg-black text-white' : 'bg-white text-gray-700'}`}
          >
            R
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 md:gap-4 mt-2">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <span className="text-sm sm:text-base md:text-lg font-black text-gray-800 diary-mono whitespace-nowrap">{pageTitle}</span>
            <input
              type="date"
              value={date}
              onChange={(e) => syncDateInput(e.target.value)}
              className="px-2 py-1 rounded-none border border-gray-200 text-xs diary-mono text-gray-800 bg-white min-w-[132px]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-start md:justify-end">
            <button
              onMouseDown={(e) => { e.preventDefault(); preserveSelection(activeSide); }}
              onClick={() => execCommand('bold')}
              className="toolbar-btn px-2 py-1 rounded-none border border-gray-200 bg-white text-xs font-medium diary-mono text-gray-800 active:scale-95 shrink-0"
            >
              <Bold className="w-3.5 h-3.5 inline-block mr-1" strokeWidth={2} />
              B
            </button>
            <button
              onMouseDown={(e) => { e.preventDefault(); preserveSelection(activeSide); }}
              onClick={() => execCommand('italic')}
              className="toolbar-btn px-2 py-1 rounded-none border border-gray-200 bg-white text-xs font-medium diary-mono text-gray-800 active:scale-95 shrink-0"
            >
              <Italic className="w-3.5 h-3.5 inline-block mr-1" strokeWidth={2} />
              I
            </button>
            <button
              onMouseDown={(e) => { e.preventDefault(); preserveSelection(activeSide); }}
              onClick={insertBullet}
              className="toolbar-btn px-2 py-1 rounded-none border border-gray-200 bg-white text-xs font-medium diary-mono text-gray-800 active:scale-95 shrink-0"
            >
              •
            </button>
            <button
              onMouseDown={(e) => { e.preventDefault(); preserveSelection(activeSide); }}
              onClick={insertLine}
              className="toolbar-btn px-2 py-1 rounded-none border border-gray-200 bg-white text-xs font-medium diary-mono text-gray-800 active:scale-95 shrink-0"
            >
              —
            </button>
            <select
              value={activeSide === 'left' ? leftFontSize : rightFontSize}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (activeSide === 'left') setLeftFontSize(value);
                else setRightFontSize(value);
              }}
              className="px-2 py-1 rounded-none border border-gray-200 text-xs diary-mono text-gray-800 bg-white shrink-0 max-w-[92px]"
            >
              <option value={12}>12</option>
              <option value={14}>14</option>
              <option value={16}>16</option>
              <option value={18}>18</option>
              <option value={20}>20</option>
              <option value={22}>22</option>
            </select>
            <button
              onClick={openExportModal}
              className="toolbar-btn h-8 w-8 flex items-center justify-center bg-white border border-gray-200 text-gray-800 rounded-none text-xs active:scale-95 shrink-0"
              title="Download PDF"
            >
              <Download className="w-4 h-4" strokeWidth={2} />
            </button>
            <button
              onClick={clearCurrentPage}
              className="toolbar-btn h-8 w-8 flex items-center justify-center bg-white border border-gray-200 text-red-600 rounded-none text-xs active:scale-95 shrink-0"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" strokeWidth={2} />
            </button>
            <div className="ml-0 md:ml-3 text-xs sm:text-sm diary-mono text-gray-500 whitespace-nowrap">{loadingDate ? 'Loading...' : saving ? 'Saving...' : 'Saved'}</div>
          </div>
        </div>
      </div>

      {isExportModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl border-2 border-black bg-[#fffaf1] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden diary-mono">
            <div className="flex items-center justify-between border-b-2 border-black bg-[#f6ead6] px-4 py-3">
              <div>
                <div className="text-base font-black text-gray-900">Download Diary PDF</div>
                <div className="text-xs font-bold text-gray-600">Pick a start and end date for the export</div>
              </div>
              <button
                type="button"
                onClick={closeExportModal}
                className="h-9 w-9 flex items-center justify-center rounded-lg border border-black bg-white text-gray-900"
                disabled={exportingPdf}
              >
                <X className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>

            <div className="space-y-4 px-4 py-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-xs font-bold text-gray-700">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" strokeWidth={2.5} />
                    Start Date
                  </span>
                  <input
                    type="date"
                    value={exportStartDate}
                    onChange={(e) => setExportStartDate(e.target.value)}
                    className="w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-sm font-bold text-gray-900"
                    disabled={exportingPdf}
                  />
                </label>

                <label className="space-y-1 text-xs font-bold text-gray-700">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" strokeWidth={2.5} />
                    End Date
                  </span>
                  <input
                    type="date"
                    value={exportEndDate}
                    onChange={(e) => setExportEndDate(e.target.value)}
                    className="w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-sm font-bold text-gray-900"
                    disabled={exportingPdf}
                  />
                </label>
              </div>

              <div className="rounded-xl border border-dashed border-black/30 bg-white/80 px-3 py-2 text-xs font-bold text-gray-600">
                The PDF will keep the notebook look, JetBrains Mono font, and include the date on every spread.
              </div>

              {exportError && (
                <div className="rounded-xl border border-red-400 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                  {exportError}
                </div>
              )}
            </div>

            <div className="flex gap-3 border-t-2 border-black bg-[#f6ead6] px-4 py-3">
              <button
                type="button"
                onClick={closeExportModal}
                className="flex-1 rounded-lg border-2 border-black bg-white px-4 py-2.5 text-sm font-black text-gray-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                disabled={exportingPdf}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={downloadPdfForRange}
                className="flex-1 rounded-lg border-2 border-emerald-700 bg-emerald-500 px-4 py-2.5 text-sm font-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={exportingPdf}
              >
                {exportingPdf ? 'Preparing PDF...' : 'Download'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single blurred editor with Left/Right tabs */}
      <div className="w-full max-w-[1400px] diary-container overflow-hidden flex-1 mx-auto">
        <div className="w-full h-full flex flex-col gap-0">
          <div className={`editor-card flex-1 p-4 ${activeSide === 'left' ? 'editor-card-left' : 'editor-card-right'}`} style={{ borderRadius: 0 }}>
            <div className="h-full overflow-auto">
              <div
                ref={activeSide === 'left' ? leftEditorRef : rightEditorRef}
                contentEditable
                suppressContentEditableWarning
                className="editor-area w-full h-full bg-transparent text-black diary-mono leading-7 pr-1 max-w-none"
                style={{ fontSize: `${activeFontSize}px`, caretColor: '#111827', minHeight: '100%' }}
                onFocus={() => setActiveSide(activeSide)}
                onMouseUp={() => captureSelection(activeSide)}
                onKeyUp={() => captureSelection(activeSide)}
                onInput={() => handleEditorInput(activeSide)}
              />
            </div>
          </div>
        </div>
      </div>

      {exportEntries.length > 0 && (
        <div ref={exportSheetRef} className="fixed left-[-20000px] top-0 pointer-events-none" aria-hidden="true">
          <div className="flex flex-col bg-[#f6ead6]" style={{ width: '1240px' }}>
            {exportEntries.map((entry) => (
              <section
                key={entry.date}
                className="w-[1240px] px-2 py-2"
                style={{ breakAfter: 'page', minHeight: '660px' }}
              >
                <div className="mb-2 flex items-center justify-between px-2 diary-mono">
                  <div className="text-base font-black text-gray-900">Diary Export</div>
                  <div className="text-sm font-bold text-gray-700">{entry.date}</div>
                </div>

                <div className="book-container flex h-[560px] w-full gap-0 overflow-hidden rounded-lg">
                  <div
                    className="editor-box page-lines flex-1 h-full border-[3px] border-[#8a5a44] rounded-l-xl px-3 py-3 md:px-4 md:py-4 bg-[#f6ead6]"
                    style={{ boxShadow: '-10px 8px 22px rgba(0,0,0,0.18)' }}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="diary-mono font-bold text-[#7a4b2b]">Left Page</div>
                      <div className="diary-mono text-xs text-[#7a4b2b]">{entry.date}</div>
                    </div>
                    <div
                      className="editor-area w-full h-[474px] bg-transparent text-black diary-mono leading-7 pr-1"
                      style={{ fontSize: `${leftFontSize}px`, caretColor: '#111827' }}
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(entry.leftContent) }}
                    />
                  </div>

                  <div
                    className="editor-box page-lines flex-1 h-full border-[3px] border-[#4f6b88] rounded-r-xl px-3 py-3 md:px-4 md:py-4 bg-[#eef5fb]"
                    style={{ boxShadow: '10px 8px 22px rgba(0,0,0,0.18)' }}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="diary-mono font-bold text-[#2e4964]">Right Page</div>
                      <div className="diary-mono text-xs text-[#2e4964]">{entry.date}</div>
                    </div>
                    <div
                      className="editor-area w-full h-[474px] bg-transparent text-black diary-mono leading-7 pr-1"
                      style={{ fontSize: `${rightFontSize}px`, caretColor: '#111827' }}
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(entry.rightContent) }}
                    />
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
