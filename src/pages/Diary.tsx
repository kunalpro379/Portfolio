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
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  // When switching tabs, ensure the newly rendered editor receives its current content
  useEffect(() => {
    const editor = activeSide === 'left' ? leftEditorRef.current : rightEditorRef.current;
    if (!editor) return;
    const html = activeSide === 'left' ? leftContentRef.current : rightContentRef.current;
    editor.innerHTML = html ?? '';
  }, [activeSide]);

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

  function openExportModal() {
    setExportError('');
    setExportStartDate(date);
    setExportEndDate(date);
    setIsExportModalOpen(true);
  }

  function closeExportModal() {
    if (exportingPdf) return;
    setIsExportModalOpen(false);
    setExportError('');
  }

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

  return (
    <div className="w-full flex flex-col items-start px-2 md:px-3 lg:px-4 pt-0 pb-0 fixed left-0 right-0 bottom-0 top-[188px] md:top-[140px] lg:top-[120px] overflow-hidden" style={{ zIndex: 30 }}>
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

      {/* Mobile toolbar matches the screenshot style */}
      <div className="md:hidden w-full rounded-[22px] border-2 border-white/90 bg-black text-white px-3 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_10px_20px_rgba(0,0,0,0.25)]">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => goToDate('prev')}
            className="toolbar-btn h-14 w-14 flex items-center justify-center rounded-[12px] border-2 border-white bg-transparent text-white text-3xl leading-none shrink-0"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          </button>

          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="whitespace-nowrap font-black diary-mono text-[18px] sm:text-[20px] text-white leading-none">{pageTitle}</span>
            <button
              type="button"
              onClick={() => setActiveSide(activeSide === 'left' ? 'right' : 'left')}
              className={`h-12 w-12 shrink-0 rounded-[8px] border-2 border-white ${activeSide === 'left' ? 'bg-[#8c8a31]' : 'bg-[#4f78b8]'}`}
              aria-label="Toggle page side"
            />
          </div>

          <button
            onClick={() => goToDate('next')}
            className="toolbar-btn h-14 w-14 flex items-center justify-center rounded-[12px] border-2 border-white bg-transparent text-white text-3xl leading-none shrink-0"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        <div className="mt-2 grid grid-cols-6 gap-2">
          <button
            onMouseDown={(e) => { e.preventDefault(); preserveSelection(activeSide); }}
            onClick={() => execCommand('bold')}
            className="toolbar-btn h-14 rounded-[12px] border-2 border-white bg-transparent text-white font-black diary-mono text-lg leading-none active:scale-95"
          >
            B
          </button>
          <button
            onMouseDown={(e) => { e.preventDefault(); preserveSelection(activeSide); }}
            onClick={() => execCommand('italic')}
            className="toolbar-btn h-14 rounded-[12px] border-2 border-white bg-transparent text-white font-black diary-mono text-lg leading-none active:scale-95"
          >
            I
          </button>
          <button
            onMouseDown={(e) => { e.preventDefault(); preserveSelection(activeSide); }}
            onClick={insertBullet}
            className="toolbar-btn h-14 rounded-[12px] border-2 border-white bg-transparent text-white font-black diary-mono text-2xl leading-none active:scale-95"
          >
            •
          </button>
          <button
            onMouseDown={(e) => { e.preventDefault(); preserveSelection(activeSide); }}
            onClick={insertLine}
            className="toolbar-btn h-14 rounded-[12px] border-2 border-white bg-transparent text-white font-black diary-mono text-2xl leading-none active:scale-95"
          >
            -
          </button>
          <select
            value={activeSide === 'left' ? leftFontSize : rightFontSize}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (activeSide === 'left') setLeftFontSize(value);
              else setRightFontSize(value);
            }}
            className="toolbar-btn h-14 rounded-[12px] border-2 border-white bg-transparent px-2 text-center font-black diary-mono text-lg text-white outline-none"
          >
            <option value={12}>12^</option>
            <option value={14}>14^</option>
            <option value={16}>16^</option>
            <option value={18}>18^</option>
            <option value={20}>20^</option>
            <option value={22}>22^</option>
          </select>
          <button
            onClick={clearCurrentPage}
            className="toolbar-btn h-14 rounded-[12px] border-2 border-white bg-black text-white flex items-center justify-center active:scale-95"
            title="Delete"
          >
            <Trash2 className="w-6 h-6" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Desktop toolbar */}
      <div className="hidden md:block w-full flex flex-col gap-3 bg-black text-white rounded-none px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 -mt-2">
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => goToDate('prev')}
            className="toolbar-btn h-9 w-9 flex items-center justify-center bg-transparent border border-white/20 rounded-md text-white hover:bg-white/10 shrink-0"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
          </button>
          <button
            onClick={() => goToDate('next')}
            className="toolbar-btn h-9 w-9 flex items-center justify-center bg-transparent border border-white/20 rounded-md text-white hover:bg-white/10 shrink-0"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          </button>

          <button
            onClick={() => setActiveSide('left')}
            className={`px-3 py-1.5 ml-1 rounded-md font-bold diary-mono transition shrink-0 ${activeSide === 'left' ? 'bg-white text-black border border-white' : 'bg-transparent text-white border border-white/20 hover:bg-white/10'}`}
          >
            Left
          </button>
          <button
            onClick={() => setActiveSide('right')}
            className={`px-3 py-1.5 rounded-md font-bold diary-mono transition shrink-0 ${activeSide === 'right' ? 'bg-white text-black border border-white' : 'bg-transparent text-white border border-white/20 hover:bg-white/10'}`}
          >
            Right
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 md:gap-6">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <span className="text-sm sm:text-base md:text-lg font-black text-white diary-mono whitespace-nowrap">{pageTitle}</span>
            <input
              type="date"
              value={date}
              onChange={(e) => syncDateInput(e.target.value)}
              className="px-2 py-1 bg-transparent border border-white/20 rounded-md text-xs diary-mono text-white min-w-[132px]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-start md:justify-end">
            <button
              onMouseDown={(e) => { e.preventDefault(); preserveSelection(activeSide); }}
              onClick={() => execCommand('bold')}
              className="toolbar-btn px-2 py-1 bg-transparent border border-white/20 rounded-md text-xs font-medium diary-mono text-white hover:bg-white/10 active:scale-95 shrink-0"
            >
              <Bold className="w-3.5 h-3.5 inline-block mr-1" strokeWidth={2} />
              B
            </button>
            <button
              onMouseDown={(e) => { e.preventDefault(); preserveSelection(activeSide); }}
              onClick={() => execCommand('italic')}
              className="toolbar-btn px-2 py-1 bg-transparent border border-white/20 rounded-md text-xs font-medium diary-mono text-white hover:bg-white/10 active:scale-95 shrink-0"
            >
              <Italic className="w-3.5 h-3.5 inline-block mr-1" strokeWidth={2} />
              I
            </button>
            <button
              onMouseDown={(e) => { e.preventDefault(); preserveSelection(activeSide); }}
              onClick={insertBullet}
              className="toolbar-btn px-2 py-1 bg-transparent border border-white/20 rounded-md text-xs font-medium diary-mono text-white hover:bg-white/10 active:scale-95 shrink-0"
            >
              •
            </button>
            <button
              onMouseDown={(e) => { e.preventDefault(); preserveSelection(activeSide); }}
              onClick={insertLine}
              className="toolbar-btn px-2 py-1 bg-transparent border border-white/20 rounded-md text-xs font-medium diary-mono text-white hover:bg-white/10 active:scale-95 shrink-0"
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
              className="px-2 py-1 bg-transparent border border-white/20 rounded-md text-xs diary-mono text-white shrink-0 max-w-[92px]"
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
              className="toolbar-btn h-9 w-9 flex items-center justify-center bg-transparent border border-emerald-400 text-white rounded-md text-xs hover:bg-white/8 active:scale-95 shrink-0"
              title="Download PDF"
            >
              <Download className="w-4 h-4" strokeWidth={2} />
            </button>
            <button
              onClick={clearCurrentPage}
              className="toolbar-btn h-9 w-9 flex items-center justify-center bg-transparent border border-red-400 text-white rounded-md text-xs hover:bg-white/8 active:scale-95 shrink-0"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" strokeWidth={2} />
            </button>
            <div className="ml-0 md:ml-3 text-xs sm:text-sm diary-mono text-white/70 whitespace-nowrap">{loadingDate ? 'Loading...' : saving ? 'Saving...' : 'Saved'}</div>
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
      <div className="w-full max-w-[1400px] diary-container overflow-hidden flex-1">
        <div className="w-full h-full flex flex-col gap-0">
          <div className={`editor-card flex-1 p-6 ${activeSide === 'left' ? 'editor-card-left' : 'editor-card-right'}`}>
            <div className="h-full overflow-auto">
              <div
                ref={activeSide === 'left' ? leftEditorRef : rightEditorRef}
                contentEditable
                suppressContentEditableWarning
                className="editor-area w-full h-full bg-transparent text-black diary-mono leading-7 pr-1"
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
