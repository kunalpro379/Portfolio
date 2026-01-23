import { useState, useEffect } from 'react';
import { X, Download, Copy, Eye, FileText, Calendar, HardDrive } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

interface CodeFile {
  _id: string;
  fileId: string;
  filename: string;
  folderPath: string;
  language: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

interface CodeViewerProps {
  file: CodeFile;
  onClose: () => void;
}

export default function CodeViewer({ file, onClose }: CodeViewerProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchFileContent();
  }, [file.fileId]);

  const fetchFileContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_ENDPOINTS.code}/files/${file.fileId}/content`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch file content');
      }
      
      const data = await response.json();
      setContent(data.content || '');
    } catch (error) {
      console.error('Error fetching file content:', error);
      setError('Failed to load file content');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const downloadFile = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLanguageColor = (language: string): string => {
    const colorMap: { [key: string]: string } = {
      'javascript': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'typescript': 'bg-blue-100 text-blue-800 border-blue-300',
      'python': 'bg-green-100 text-green-800 border-green-300',
      'java': 'bg-orange-100 text-orange-800 border-orange-300',
      'cpp': 'bg-purple-100 text-purple-800 border-purple-300',
      'c': 'bg-gray-100 text-gray-800 border-gray-300',
      'html': 'bg-pink-100 text-pink-800 border-pink-300',
      'css': 'bg-blue-100 text-blue-800 border-blue-300',
      'json': 'bg-gray-100 text-gray-800 border-gray-300',
      'markdown': 'bg-slate-100 text-slate-800 border-slate-300'
    };
    return colorMap[language] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getLineNumbers = () => {
    const lines = content.split('\n');
    return lines.map((_, index) => index + 1);
  };

  const highlightSyntax = (code: string, language: string) => {
    // Simple syntax highlighting for common languages
    let highlighted = code;
    
    if (language === 'javascript' || language === 'typescript') {
      // Keywords
      highlighted = highlighted.replace(
        /\b(const|let|var|function|class|if|else|for|while|return|import|export|from|default|async|await|try|catch|finally)\b/g,
        '<span class="text-blue-600 font-semibold">$1</span>'
      );
      // Strings
      highlighted = highlighted.replace(
        /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g,
        '<span class="text-green-600">$1$2$1</span>'
      );
      // Comments
      highlighted = highlighted.replace(
        /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
        '<span class="text-gray-500 italic">$1</span>'
      );
    } else if (language === 'python') {
      // Keywords
      highlighted = highlighted.replace(
        /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|with|lambda|and|or|not|in|is|None|True|False)\b/g,
        '<span class="text-blue-600 font-semibold">$1</span>'
      );
      // Strings
      highlighted = highlighted.replace(
        /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
        '<span class="text-green-600">$1$2$1</span>'
      );
      // Comments
      highlighted = highlighted.replace(
        /(#.*$)/gm,
        '<span class="text-gray-500 italic">$1</span>'
      );
    } else if (language === 'html') {
      // Tags
      highlighted = highlighted.replace(
        /(&lt;\/?)([a-zA-Z][a-zA-Z0-9]*)(.*?)(&gt;)/g,
        '<span class="text-blue-600">$1</span><span class="text-red-600 font-semibold">$2</span><span class="text-purple-600">$3</span><span class="text-blue-600">$4</span>'
      );
    } else if (language === 'css') {
      // Selectors
      highlighted = highlighted.replace(
        /^([.#]?[a-zA-Z][a-zA-Z0-9-_]*)\s*{/gm,
        '<span class="text-blue-600 font-semibold">$1</span> {'
      );
      // Properties
      highlighted = highlighted.replace(
        /([a-zA-Z-]+)(\s*:\s*)/g,
        '<span class="text-red-600">$1</span>$2'
      );
    }
    
    return highlighted;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{file.filename}</h2>
              <div className="flex items-center gap-4 mt-1">
                <span className={`px-2 py-1 text-xs font-bold border rounded ${getLanguageColor(file.language)}`}>
                  {file.language}
                </span>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <HardDrive className="w-4 h-4" />
                  {formatFileSize(file.size)}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {new Date(file.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 border-2 border-blue-300 rounded-lg hover:bg-blue-200 transition"
              title="Copy to clipboard"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
            
            <button
              onClick={downloadFile}
              className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 border-2 border-green-300 rounded-lg hover:bg-green-200 transition"
              title="Download file"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            
            <button
              onClick={onClose}
              className="p-2 bg-red-100 text-red-600 border-2 border-red-300 rounded-lg hover:bg-red-200 transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading file content...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-auto bg-gray-50">
              <div className="flex">
                {/* Line Numbers */}
                <div className="bg-gray-100 border-r-2 border-gray-200 px-4 py-4 text-right text-sm text-gray-500 font-mono select-none">
                  {getLineNumbers().map(lineNum => (
                    <div key={lineNum} className="leading-6">
                      {lineNum}
                    </div>
                  ))}
                </div>
                
                {/* Code Content */}
                <div className="flex-1 p-4">
                  <pre className="text-sm font-mono leading-6 whitespace-pre-wrap">
                    <code
                      dangerouslySetInnerHTML={{
                        __html: highlightSyntax(content, file.language)
                      }}
                    />
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t-2 border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Lines: {content.split('\n').length}</span>
            <span>Characters: {content.length}</span>
            <span>Path: {file.folderPath}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Read-only view</span>
          </div>
        </div>
      </div>
    </div>
  );
}