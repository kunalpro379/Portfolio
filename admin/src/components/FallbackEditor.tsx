import { useEffect, useRef, useState } from 'react';

interface FallbackEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  filename: string;
  height?: string;
}

export default function FallbackEditor({ 
  value, 
  onChange, 
  language, 
  filename,
  height = '100%' 
}: FallbackEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState(['']);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 });

  useEffect(() => {
    if (textareaRef.current && textareaRef.current.value !== value) {
      textareaRef.current.value = value;
    }
    // Update line numbers when content changes
    const contentLines = (value || '').split('\n');
    setLines(contentLines.length > 0 ? contentLines : ['']);
  }, [value]);

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
    const lines = textBeforeCursor.split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;
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
      updateCursorPosition(textarea);
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
      
      // Check if we need to add closing brace
      const nextChar = value.charAt(start);
      let closingBrace = '';
      if (currentLine.trim().endsWith('{') && (nextChar === '}' || nextChar === '')) {
        closingBrace = '\n' + indent + '}';
      }
      
      const newValue = value.substring(0, start) + '\n' + indent + extraIndent + value.substring(start) + closingBrace;
      textarea.value = newValue;
      onChange(newValue);
      
      // Position cursor
      const newCursorPos = start + 1 + indent.length + extraIndent.length;
      textarea.selectionStart = textarea.selectionEnd = newCursorPos;
      updateCursorPosition(textarea);
    }
    
    // Handle closing braces
    else if (e.key === '}' || e.key === ']' || e.key === ')') {
      const start = textarea.selectionStart;
      const value = textarea.value;
      const lines = value.substring(0, start).split('\n');
      const currentLine = lines[lines.length - 1];
      
      // Auto-dedent closing braces
      if (currentLine.trim() === '' && currentLine.length >= 2) {
        e.preventDefault();
        const newValue = value.substring(0, start - 2) + e.key + value.substring(start);
        textarea.value = newValue;
        onChange(newValue);
        textarea.selectionStart = textarea.selectionEnd = start - 1;
        updateCursorPosition(textarea);
      }
    }
    
    // Handle cursor movement
    else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      setTimeout(() => updateCursorPosition(textarea), 0);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
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

  // Syntax highlighting function
  const getHighlightedCode = (code: string, lang: string) => {
    if (!code) return '';
    
    let highlighted = code;
    
    // Language-specific patterns
    const patterns = {
      // Keywords
      keywords: {
        java: /\b(public|private|protected|static|final|abstract|class|interface|extends|implements|import|package|void|int|long|double|float|boolean|char|String|byte|short|if|else|for|while|do|switch|case|default|break|continue|return|new|this|super|try|catch|finally|throw|throws|synchronized|volatile|transient|native|strictfp|enum)\b/g,
        javascript: /\b(const|let|var|function|class|extends|import|export|from|default|if|else|for|while|do|switch|case|break|continue|return|new|this|async|await|try|catch|finally|throw|typeof|instanceof|in|of|delete|void|null|undefined|true|false)\b/g,
        python: /\b(def|class|import|from|as|if|elif|else|for|while|in|try|except|finally|with|return|yield|lambda|and|or|not|is|None|True|False|self|pass|break|continue|global|nonlocal|assert|del|raise)\b/g,
        typescript: /\b(const|let|var|function|class|interface|type|extends|implements|import|export|from|default|if|else|for|while|do|switch|case|break|continue|return|new|this|async|await|try|catch|finally|throw|typeof|instanceof|in|of|delete|void|null|undefined|true|false|any|string|number|boolean|object|array)\b/g,
      },
      // Strings
      strings: /"([^"\\]|\\.)*"|'([^'\\]|\\.)*'|`([^`\\]|\\.)*`/g,
      // Comments
      comments: {
        java: /\/\/.*$|\/\*[\s\S]*?\*\//gm,
        javascript: /\/\/.*$|\/\*[\s\S]*?\*\//gm,
        python: /#.*$/gm,
        typescript: /\/\/.*$|\/\*[\s\S]*?\*\//gm,
      },
      // Numbers
      numbers: /\b\d+\.?\d*[fFdDlL]?\b/g,
      // Functions and methods
      functions: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g,
      // Annotations (Java)
      annotations: /@[a-zA-Z_][a-zA-Z0-9_]*/g,
    };

    // Apply syntax highlighting with proper colors
    highlighted = highlighted
      // Comments first (green, italic)
      .replace(patterns.comments[lang as keyof typeof patterns.comments] || /\/\/.*$|\/\*[\s\S]*?\*\/|#.*$/gm, 
        '<span style="color: #6A9955; font-style: italic;">$&</span>')
      // Strings (orange)
      .replace(patterns.strings, 
        '<span style="color: #CE9178;">$&</span>')
      // Keywords (blue, bold)
      .replace(patterns.keywords[lang as keyof typeof patterns.keywords] || patterns.keywords.javascript, 
        '<span style="color: #569CD6; font-weight: bold;">$&</span>')
      // Numbers (light green)
      .replace(patterns.numbers, 
        '<span style="color: #B5CEA8;">$&</span>')
      // Annotations (yellow)
      .replace(patterns.annotations, 
        '<span style="color: #DCDCAA;">$&</span>')
      // Functions (yellow)
      .replace(patterns.functions, 
        '<span style="color: #DCDCAA; font-weight: bold;">$1</span>');

    return highlighted;
  };

  // Generate line numbers
  const lineNumbers = Array.from({ length: Math.max(lines.length, 50) }, (_, i) => i + 1);

  return (
    <div className="w-full h-full bg-[#1E1E1E] flex flex-col">
      {/* Header */}
      <div className="bg-[#2D2D30] px-4 py-2 border-b border-[#3E3E42] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="ml-4 text-[#CCCCCC] text-sm font-medium">
            {filename} - {language}
          </span>
        </div>
        <div className="text-[#858585] text-xs">
          {lines.length} lines
        </div>
      </div>
      
      {/* Editor Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Line Numbers */}
        <div 
          ref={lineNumbersRef}
          className="bg-[#1E1E1E] border-r border-[#3E3E42] overflow-hidden flex-shrink-0 select-none"
          style={{
            width: '60px',
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
            fontSize: '14px',
            lineHeight: '1.5',
          }}
        >
          <div className="text-[#858585] text-right pr-3 pl-2 py-3">
            {lineNumbers.map((lineNum) => (
              <div key={lineNum} className="h-[21px] leading-[21px]">
                {lineNum}
              </div>
            ))}
          </div>
        </div>
        
        {/* Code Editor Area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Syntax Highlighting Layer */}
          <pre
            ref={highlightRef}
            className="absolute inset-0 p-3 m-0 whitespace-pre-wrap overflow-auto pointer-events-none z-10"
            style={{
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
              fontSize: '14px',
              lineHeight: '1.5',
              tabSize: 2,
              background: 'transparent',
              color: 'transparent',
            }}
            dangerouslySetInnerHTML={{
              __html: getHighlightedCode(value, language)
            }}
          />
          
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            defaultValue={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onClick={handleClick}
            onScroll={handleScroll}
            className="absolute inset-0 w-full h-full bg-transparent text-transparent resize-none outline-none border-none p-3 z-20"
            style={{
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
              fontSize: '14px',
              lineHeight: '1.5',
              tabSize: 2,
              caretColor: '#FFFFFF',
            }}
            placeholder={`Start typing your ${language} code here...`}
            spellCheck={false}
          />
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="bg-[#007ACC] px-4 py-1 flex items-center justify-between text-sm text-white flex-shrink-0">
        <div className="flex items-center gap-6">
          <span>Ln {cursorPosition.line}, Col {cursorPosition.col}</span>
          <span>UTF-8</span>
          <span>LF</span>
          <span className="capitalize font-medium">{language}</span>
        </div>
        
        <div className="flex items-center gap-6">
          <span>{lines.length} lines</span>
          <span>{value.length} characters</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="font-medium">Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}