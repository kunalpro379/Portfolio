import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, FileText, Clock, Folder } from 'lucide-react';
import config, { buildUrl } from '../config/config';
import MonacoCodeEditor from '../components/MonacoCodeEditor';

interface CodeFile {
  _id: string;
  fileId: string;
  filename: string;
  folderPath: string;
  content: string;
  language: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

export default function CodeEditor() {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const [file, setFile] = useState<CodeFile | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (fileId) {
      fetchFile();
    }
  }, [fileId]);

  useEffect(() => {
    // Auto-save every 30 seconds if there are unsaved changes
    const interval = setInterval(() => {
      if (hasUnsavedChanges && !saving) {
        saveFile();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [hasUnsavedChanges, saving]);

  const fetchFile = async () => {
    try {
      setLoading(true);
      
      // Get file metadata
      const fileResponse = await fetch(buildUrl(config.api.endpoints.codeFileById(fileId!)), {
        credentials: 'include'
      });
      
      if (!fileResponse.ok) throw new Error('File not found');
      
      const fileData = await fileResponse.json();
      
      // Get file content
      const contentResponse = await fetch(buildUrl(config.api.endpoints.codeFileContent(fileId!)), {
        credentials: 'include'
      });
      
      if (!contentResponse.ok) throw new Error('Failed to fetch file content');
      
      const contentData = await contentResponse.json();
      
      setFile(fileData.file);
      setContent(contentData.content || '');
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error fetching file:', error);
      alert('Failed to load file');
      navigate('/code');
    } finally {
      setLoading(false);
    }
  };

  const saveFile = async () => {
    if (!file || saving) return;

    try {
      setSaving(true);
      
      const response = await fetch(buildUrl(config.api.endpoints.codeFileById(file.fileId)), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content })
      });

      if (!response.ok) throw new Error('Failed to save file');
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Failed to save file');
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl+S or Cmd+S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveFile();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getLanguageColor = (language: string): string => {
    const colorMap: { [key: string]: string } = {
      'javascript': 'bg-[#F7DF1E] text-black border-[#F7DF1E]',
      'typescript': 'bg-[#3178C6] text-white border-[#3178C6]',
      'python': 'bg-[#3776AB] text-white border-[#3776AB]',
      'java': 'bg-[#ED8B00] text-white border-[#ED8B00]',
      'cpp': 'bg-[#00599C] text-white border-[#00599C]',
      'c': 'bg-[#A8B9CC] text-black border-[#A8B9CC]',
      'html': 'bg-[#E34F26] text-white border-[#E34F26]',
      'css': 'bg-[#1572B6] text-white border-[#1572B6]',
      'json': 'bg-[#000000] text-white border-[#000000]',
      'markdown': 'bg-[#083FA1] text-white border-[#083FA1]',
      'php': 'bg-[#777BB4] text-white border-[#777BB4]',
      'ruby': 'bg-[#CC342D] text-white border-[#CC342D]',
      'go': 'bg-[#00ADD8] text-white border-[#00ADD8]',
      'rust': 'bg-[#000000] text-white border-[#000000]'
    };
    return colorMap[language] || 'bg-[#6C6C6C] text-white border-[#6C6C6C]';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-3 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white font-bold">Loading file...</p>
        </div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl font-bold mb-4">File not found</p>
          <button
            onClick={() => navigate('/code')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Back to Code
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E] flex flex-col">
      {/* Header */}
      <div className="bg-[#2D2D30] border-b border-[#3E3E42] px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/code')}
            className="flex items-center gap-2 text-[#CCCCCC] hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-[#3E3E42]"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
            <span className="font-medium">Back to Code</span>
          </button>
          
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-[#4FC1FF]" strokeWidth={2.5} />
            <div>
              <h1 className="text-white font-bold text-lg">{file.filename}</h1>
              <div className="flex items-center gap-3 text-sm text-[#CCCCCC]">
                <div className="flex items-center gap-1">
                  <Folder className="w-3 h-3" strokeWidth={2.5} />
                  <span>{file.folderPath}</span>
                </div>
                <span className={`px-2 py-0.5 text-xs font-bold border rounded ${getLanguageColor(file.language)}`}>
                  {file.language}
                </span>
                <span>{formatFileSize(file.size)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 text-[#FFCC02]">
              <div className="w-2 h-2 bg-[#FFCC02] rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Unsaved changes</span>
            </div>
          )}
          
          {lastSaved && (
            <div className="flex items-center gap-2 text-[#CCCCCC] text-sm">
              <Clock className="w-3 h-3" strokeWidth={2.5} />
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            </div>
          )}

          <button
            onClick={saveFile}
            disabled={saving || !hasUnsavedChanges}
            className="flex items-center gap-2 px-4 py-2 bg-[#0E639C] text-white rounded-md hover:bg-[#1177BB] transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Save className="w-4 h-4" strokeWidth={2.5} />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <MonacoCodeEditor
          value={content}
          onChange={handleContentChange}
          language={file.language}
          filename={file.filename}
        />
      </div>

      {/* Status Bar */}
      <div className="bg-[#007ACC] px-4 py-2 flex items-center justify-between text-sm text-white flex-shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1">
            <span className="font-medium">Ln {content.split('\n').length}</span>
            <span className="text-[#CCE7FF]">•</span>
            <span className="font-medium">Col 1</span>
          </div>
          <span>UTF-8</span>
          <span>LF</span>
          <span className="capitalize font-medium">{file.language}</span>
        </div>
        
        <div className="flex items-center gap-6">
          <span>{content.split('\n').length} lines</span>
          <span>{content.length} characters</span>
          <span>{new Blob([content]).size} bytes</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="font-medium">Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}