import { useEffect, useRef, useState } from 'react';

interface SimpleCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  filename: string;
  height?: string;
}

export default function SimpleCodeEditor({ 
  value, 
  onChange, 
  language, 
  filename,
  height = '100%' 
}: SimpleCodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setDisplayValue(newValue);
    onChange(newValue);
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
      setDisplayValue(newValue);
      onChange(newValue);
      
      // Move cursor
      textarea.selectionStart = textarea.selectionEnd = start + 2;
    }
  };

  return (
    <div className="w-full h-full bg-[#1E1E1E] rounded-lg overflow-hidden border border-[#3E3E42] shadow-2xl">
      {/* Header */}
      <div className="bg-[#2D2D30] px-4 py-2 border-b border-[#3E3E42] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="ml-4 text-[#CCCCCC] text-sm font-medium">
            Simple Code Editor ({language})
          </span>
        </div>
        <div className="text-[#858585] text-xs">
          {filename}
        </div>
      </div>
      
      {/* Editor */}
      <div className="w-full" style={{ height: `calc(${height} - 48px)` }}>
        <textarea
          ref={textareaRef}
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="w-full h-full bg-[#1E1E1E] text-[#D4D4D4] font-mono text-sm p-4 resize-none outline-none border-none"
          style={{
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
            fontSize: '14px',
            lineHeight: '1.5',
            tabSize: 2,
          }}
          placeholder="Start typing your code here..."
          spellCheck={false}
        />
      </div>
    </div>
  );
}