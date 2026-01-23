import { useEffect, useRef, useState } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  filename: string;
  height?: string;
}

export default function CodeEditor({ 
  value, 
  onChange, 
  language, 
  filename, 
  height = '100%' 
}: CodeEditorProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  const getLanguageColor = (lang: string): string => {
    const colorMap: { [key: string]: string } = {
      'javascript': 'bg-yellow-100 border-yellow-300',
      'typescript': 'bg-blue-100 border-blue-300',
      'python': 'bg-green-100 border-green-300',
      'java': 'bg-orange-100 border-orange-300',
      'cpp': 'bg-purple-100 border-purple-300',
      'c': 'bg-gray-100 border-gray-300',
      'csharp': 'bg-indigo-100 border-indigo-300',
      'php': 'bg-violet-100 border-violet-300',
      'ruby': 'bg-red-100 border-red-300',
      'go': 'bg-cyan-100 border-cyan-300',
      'rust': 'bg-amber-100 border-amber-300',
      'html': 'bg-pink-100 border-pink-300',
      'css': 'bg-blue-100 border-blue-300',
      'scss': 'bg-pink-100 border-pink-300',
      'json': 'bg-gray-100 border-gray-300',
      'xml': 'bg-green-100 border-green-300',
      'markdown': 'bg-slate-100 border-slate-300',
      'sql': 'bg-teal-100 border-teal-300',
      'bash': 'bg-gray-100 border-gray-300',
      'yaml': 'bg-purple-100 border-purple-300',
      'plaintext': 'bg-gray-100 border-gray-300'
    };
    return colorMap[lang] || 'bg-gray-100 border-gray-300';
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Language indicator */}
      <div className={`px-3 py-2 border-2 border-black rounded-t-lg font-bold text-xs uppercase tracking-wide ${getLanguageColor(language)}`}>
        <div className="flex items-center justify-between">
          <span>{language}</span>
          <span className="text-gray-600 font-medium normal-case">{filename}</span>
        </div>
      </div>

      {/* Editor */}
      <textarea
        value={localValue}
        onChange={handleChange}
        className="flex-1 w-full p-4 bg-gray-900 text-green-400 font-mono text-sm border-2 border-t-0 border-black rounded-b-lg resize-none focus:outline-none focus:ring-4 focus:ring-black/20"
        style={{ 
          height: height === '100%' ? 'calc(100% - 48px)' : `calc(${height} - 48px)`,
          fontFamily: 'Fira Code, Monaco, Consolas, Courier New, monospace',
          lineHeight: '1.5',
          tabSize: 2
        }}
        placeholder={`Start coding in ${language}...`}
        spellCheck={false}
        onKeyDown={(e) => {
          // Handle tab key for indentation
          if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.currentTarget.selectionStart;
            const end = e.currentTarget.selectionEnd;
            const newValue = localValue.substring(0, start) + '  ' + localValue.substring(end);
            setLocalValue(newValue);
            onChange(newValue);
            
            // Set cursor position after the inserted spaces
            setTimeout(() => {
              e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2;
            }, 0);
          }
        }}
      />

      {/* Footer with stats */}
      <div className="px-3 py-2 bg-gray-100 border-2 border-t-0 border-black rounded-b-lg text-xs text-gray-600 font-medium">
        <div className="flex items-center justify-between">
          <span>Lines: {localValue.split('\n').length}</span>
          <span>Characters: {localValue.length}</span>
          <span>Size: {new Blob([localValue]).size} bytes</span>
        </div>
      </div>
    </div>
  );
}