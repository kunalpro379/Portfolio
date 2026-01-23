import { useEffect, useRef, useState } from 'react';
import Prism from 'prismjs';

// Import Prism languages
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';

interface ProfessionalCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  filename: string;
}

export default function ProfessionalCodeEditor({ 
  value, 
  onChange, 
  language, 
  filename
}: ProfessionalCodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState(['']);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 });
  const [visibleLines, setVisibleLines] = useState(50);

  useEffect(() => {
    if (textareaRef.current && textareaRef.current.value !== value) {
      textareaRef.current.value = value;
    }
    // Update line numbers when content changes
    const contentLines = (value || '').split('\n');
    setLines(contentLines.length > 0 ? contentLines : ['']);
    
    // Highlight syntax using Prism with custom light theme colors
    if (highlightRef.current) {
      const highlighted = Prism.highlight(
        value || '', 
        Prism.languages[getPrismLanguage(language)] || Prism.languages.javascript, 
        getPrismLanguage(language)
      );
      highlightRef.current.innerHTML = highlighted;
    }
  }, [value, language]);

  const getPrismLanguage = (lang: string): string => {
    const languageMap: { [key: string]: string } = {
      'javascript': 'javascript',
      'typescript': 'typescript',
      'java': 'java',
      'python': 'python',
      'css': 'css',
      'json': 'json',
      'markdown': 'markdown',
      'html': 'markup',
    };
    return languageMap[lang.toLowerCase()] || 'javascript';
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Update line numbers
    const contentLines = newValue.split('\n');
    setLines(contentLines.length > 0 ? contentLines : ['']);
    
    // Update cursor position
    updateCursorPosition(e.target);
  };

  const updateCursorPosition = (textarea: HTMLTextAreaElement) => {
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, cursorPos);
    const textLines = textBeforeCursor.split('\n');
    const line = textLines.length;
    const col = textLines[textLines.length - 1].length + 1;
    setCursorPosition({ line, col });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    
    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      
      // Insert 2 spaces for tab
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      textarea.value = newValue;
      onChange(newValue);
      
      // Move cursor
      textarea.selectionStart = textarea.selectionEnd = start + 2;
      // Update cursor position after DOM update
      setTimeout(() => updateCursorPosition(textarea), 0);
    }
    
    // Handle Enter key for auto-indentation
    else if (e.key === 'Enter') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const value = textarea.value;
      const lines = value.substring(0, start).split('\n');
      const currentLine = lines[lines.length - 1];
      
      // Get current indentation
      const indent = currentLine.match(/^\s*/)?.[0] || '';
      
      // Add extra indent for opening braces/brackets
      let extraIndent = '';
      if (currentLine.trim().endsWith('{') || currentLine.trim().endsWith('[') || currentLine.trim().endsWith('(')) {
        extraIndent = '  ';
      }
      
      const newValue = value.substring(0, start) + '\n' + indent + extraIndent + value.substring(start);
      textarea.value = newValue;
      onChange(newValue);
      
      // Position cursor
      const newCursorPos = start + 1 + indent.length + extraIndent.length;
      textarea.selectionStart = textarea.selectionEnd = newCursorPos;
      // Update cursor position after DOM update
      setTimeout(() => updateCursorPosition(textarea), 0);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    // Update cursor position after click
    setTimeout(() => updateCursorPosition(e.currentTarget), 0);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Update cursor position on key up for arrow keys, etc.
    updateCursorPosition(e.currentTarget);
  };

  const handleSelectionChange = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    // Update cursor position on selection change
    updateCursorPosition(e.currentTarget);
  };

  const handleScroll = () => {
    // Sync line numbers and highlighting with textarea scroll
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
    if (highlightRef.current && textareaRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  useEffect(() => {
    // Calculate visible lines based on container height
    const updateVisibleLines = () => {
      if (textareaRef.current) {
        const containerHeight = textareaRef.current.clientHeight;
        const lineHeight = 21; // 14px font * 1.5 line height
        const calculatedLines = Math.floor(containerHeight / lineHeight);
        // Always show at least 50 lines to fill the editor completely
        const totalLines = Math.max(lines.length, calculatedLines, 50);
        setVisibleLines(totalLines);
      }
    };

    // Use a timeout to ensure the DOM is fully rendered
    setTimeout(updateVisibleLines, 100);
    window.addEventListener('resize', updateVisibleLines);
    
    return () => window.removeEventListener('resize', updateVisibleLines);
  }, [lines.length]);

  // Generate line numbers to fill the entire visible area
  const lineNumbers = Array.from({ length: visibleLines }, (_, i) => i + 1);

  return (
    <>
      {/* Custom CSS for proper light theme syntax highlighting */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .prism-light-theme .token.comment,
          .prism-light-theme .token.prolog,
          .prism-light-theme .token.doctype,
          .prism-light-theme .token.cdata {
            color: #6a737d;
            font-style: italic;
          }
          
          .prism-light-theme .token.punctuation {
            color: #24292e;
          }
          
          .prism-light-theme .token.property,
          .prism-light-theme .token.tag,
          .prism-light-theme .token.boolean,
          .prism-light-theme .token.number,
          .prism-light-theme .token.constant,
          .prism-light-theme .token.symbol,
          .prism-light-theme .token.deleted {
            color: #005cc5;
          }
          
          .prism-light-theme .token.selector,
          .prism-light-theme .token.attr-name,
          .prism-light-theme .token.string,
          .prism-light-theme .token.char,
          .prism-light-theme .token.builtin,
          .prism-light-theme .token.inserted {
            color: #032f62;
          }
          
          .prism-light-theme .token.operator,
          .prism-light-theme .token.entity,
          .prism-light-theme .token.url,
          .prism-light-theme .language-css .token.string,
          .prism-light-theme .style .token.string {
            color: #d73a49;
          }
          
          .prism-light-theme .token.atrule,
          .prism-light-theme .token.attr-value,
          .prism-light-theme .token.keyword {
            color: #d73a49;
            font-weight: bold;
          }
          
          .prism-light-theme .token.function,
          .prism-light-theme .token.class-name {
            color: #6f42c1;
            font-weight: bold;
          }
          
          .prism-light-theme .token.regex,
          .prism-light-theme .token.important,
          .prism-light-theme .token.variable {
            color: #e36209;
          }
        `
      }} />
      
      <div className="w-full h-full bg-white flex flex-col">
        {/* Header - Fixed */}
        <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-gray-700 text-sm font-medium">
              {filename}
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
              {language}
            </span>
          </div>
          <div className="text-gray-500 text-xs">
            {lines.length} lines
          </div>
        </div>
        
        {/* Editor Container - Takes all remaining height */}
        <div className="flex-1 flex min-h-0">
          {/* Line Numbers - Scrollable with content */}
          <div 
            ref={lineNumbersRef}
            className="bg-white border-r border-gray-200 flex-shrink-0 select-none overflow-hidden"
            style={{
              width: '60px',
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "Courier New", monospace',
              fontSize: '14px',
              lineHeight: '1.5',
            }}
          >
            <div className="text-gray-400 text-right pr-3 pl-2 py-4 h-full overflow-y-auto">
              {lineNumbers.map((lineNum) => (
                <div 
                  key={lineNum} 
                  className="h-[21px] leading-[21px] hover:text-gray-600"
                  style={{ 
                    color: '#6b7280'
                  }}
                >
                  {lineNum}
                </div>
              ))}
            </div>
          </div>
          
          {/* Code Editor Area - Scrollable content */}
          <div className="flex-1 relative">
            {/* Syntax Highlighting Layer */}
            <pre
              ref={highlightRef}
              className="prism-light-theme absolute inset-0 p-4 m-0 whitespace-pre-wrap overflow-auto pointer-events-none z-10"
              style={{
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "Courier New", monospace',
                fontSize: '14px',
                lineHeight: '1.5',
                tabSize: 2,
                background: 'transparent',
                color: '#24292e',
              }}
            />
            
            {/* Textarea - Scrollable */}
            <textarea
              ref={textareaRef}
              defaultValue={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              onClick={handleClick}
              onSelect={handleSelectionChange}
              onScroll={handleScroll}
              className="absolute inset-0 w-full h-full bg-transparent text-transparent resize-none outline-none border-none p-4 z-20"
              style={{
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "Courier New", monospace',
                fontSize: '14px',
                lineHeight: '1.5',
                tabSize: 2,
                caretColor: '#24292e',
              }}
              placeholder={`Start typing your ${language} code here...`}
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </>
  );
}