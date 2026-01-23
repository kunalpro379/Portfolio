import { useEffect, useRef, useState } from 'react';
import FallbackEditor from './FallbackEditor';

interface SimpleMonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  filename: string;
  height?: string;
}

export default function SimpleMonacoEditor({ 
  value, 
  onChange, 
  language, 
  filename,
  height = '100%' 
}: SimpleMonacoEditorProps) {
  const [useFallback, setUseFallback] = useState(true); // Start with fallback by default
  const [showMonacoOption, setShowMonacoOption] = useState(true);

  // For now, just use the fallback editor which works perfectly
  // We can add Monaco as an optional enhancement later
  
  if (useFallback) {
    return (
      <div className="w-full h-full">
        {showMonacoOption && (
          <div className="bg-[#2D2D30] px-4 py-2 border-b border-[#3E3E42] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="ml-4 text-[#CCCCCC] text-sm font-medium">
                Code Editor ({language})
              </span>
            </div>
            <button
              onClick={() => setShowMonacoOption(false)}
              className="text-[#CCCCCC] hover:text-white text-sm px-2 py-1 rounded hover:bg-[#3E3E42] transition"
            >
              ✕
            </button>
          </div>
        )}
        <FallbackEditor
          value={value}
          onChange={onChange}
          language={language}
          filename={filename}
          height={showMonacoOption ? `calc(${height} - 48px)` : height}
        />
      </div>
    );
  }

  // This part is kept for future Monaco integration
  return (
    <div className="w-full h-full bg-[#1E1E1E] rounded-lg overflow-hidden border border-[#3E3E42] shadow-2xl">
      <div className="text-center p-8">
        <p className="text-[#CCCCCC] font-medium">Monaco Editor (Coming Soon)</p>
      </div>
    </div>
  );
}

  const getMonacoLanguage = (lang: string): string => {
    const languageMap: { [key: string]: string } = {
      'javascript': 'javascript',
      'typescript': 'typescript',
      'python': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'csharp': 'csharp',
      'php': 'php',
      'ruby': 'ruby',
      'go': 'go',
      'rust': 'rust',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'xml': 'xml',
      'markdown': 'markdown',
      'sql': 'sql',
      'bash': 'shell',
      'yaml': 'yaml',
      'plaintext': 'plaintext'
    };
    return languageMap[lang] || 'plaintext';
  };
}