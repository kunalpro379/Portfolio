import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Database, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  BarChart3,
  RefreshCw,
  FileJson,
  FileCode
} from 'lucide-react';
import config from '../config/config';

interface KnowledgeBaseFile {
  _id: string;
  fileId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: 'processing' | 'completed' | 'failed';
  vectorStatus: 'pending' | 'uploaded' | 'failed';
  error?: string;
  createdAt: string;
  updatedAt: string;
}

interface UploadProgress {
  step: string;
  message: string;
  progress: number;
  success?: boolean;
  error?: string;
  fileId?: string;
  fileName?: string;
}

interface Stats {
  totalFiles: number;
  completedFiles: number;
  failedFiles: number;
  vectorStats?: any;
}

const AIKnowledgeBase: React.FC = () => {
  const [files, setFiles] = useState<KnowledgeBaseFile[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFiles();
    fetchStats();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch(config.api.endpoints.knowledgeBaseFiles);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setFiles(data.files || []);
        if (data.message) {
          console.warn('Knowledge Base service message:', data.message);
        }
      } else {
        setError(data.message || 'Failed to fetch files');
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      if (error.message.includes('503')) {
        setError('Knowledge Base service is temporarily unavailable. Please try again later.');
      } else {
        setError('Failed to fetch files: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(config.api.endpoints.knowledgeBaseStats);
      
      if (!response.ok) {
        console.warn('Stats service unavailable:', response.status);
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        if (data.message) {
          console.warn('Knowledge Base stats message:', data.message);
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Don't show error for stats, just log it
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['.json', '.md', '.txt'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(fileExtension)) {
      setError('Only JSON, Markdown (.md), and Text (.txt) files are allowed');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setUploadProgress(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(config.api.endpoints.knowledgeBaseUpload, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                setUploadProgress(data);
                
                if (data.success === true) {
                  // Refresh files and stats after successful upload
                  setTimeout(() => {
                    fetchFiles();
                    fetchStats();
                  }, 1000);
                }
              } catch (parseError) {
                console.error('Error parsing SSE data:', parseError);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed: ' + (error as Error).message);
    } finally {
      setUploading(false);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(config.api.endpoints.knowledgeBaseFileById(fileId), {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        fetchFiles();
        fetchStats();
      } else {
        setError('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      setError('Failed to delete file');
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case '.json':
        return <FileJson className="w-5 h-5 text-blue-600" />;
      case '.md':
        return <FileCode className="w-5 h-5 text-green-600" />;
      case '.txt':
        return <FileText className="w-5 h-5 text-gray-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string, vectorStatus: string) => {
    if (status === 'completed' && vectorStatus === 'uploaded') {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (status === 'failed' || vectorStatus === 'failed') {
      return <XCircle className="w-5 h-5 text-red-600" />;
    } else {
      return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">AI Knowledge Base</h1>
          </div>
          <p className="text-gray-600">
            Upload and manage files for the AI knowledge base. Supported formats: JSON, Markdown (.md), and Text (.txt)
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Files</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalFiles}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedFiles}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.failedFiles}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Vector Points</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.vectorStats?.points_count || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload New File</h2>
          
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.md,.txt"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-5 h-5" />
              {uploading ? 'Uploading...' : 'Choose File'}
            </button>
            
            <button
              onClick={() => { fetchFiles(); fetchStats(); }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-2">
            Supported formats: JSON, Markdown (.md), Text (.txt) • Max size: 10MB
          </p>
        </div>

        {/* Upload Progress */}
        {uploadProgress && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Progress</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {uploadProgress.success === false ? (
                  <XCircle className="w-6 h-6 text-red-600" />
                ) : uploadProgress.progress === 100 && uploadProgress.success === true ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                )}
                <span className="text-gray-900">{uploadProgress.message}</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    uploadProgress.success === false ? 'bg-red-600' : 
                    uploadProgress.success === true ? 'bg-green-600' : 'bg-blue-600'
                  }`}
                  style={{ width: `${uploadProgress.progress}%` }}
                />
              </div>
              
              <p className="text-sm text-gray-600">
                {uploadProgress.progress}% complete
              </p>
              
              {uploadProgress.error && (
                <p className="text-sm text-red-600">{uploadProgress.error}</p>
              )}
            </div>
          </div>
        )}

        {/* Files List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Knowledge Base Files</h2>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center">
                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading files...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No files uploaded yet</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {files.map((file) => (
                    <tr key={file.fileId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.fileType)}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.fileName}</p>
                            <p className="text-xs text-gray-500">{file.fileId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {file.fileType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatFileSize(file.fileSize)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(file.status, file.vectorStatus)}
                          <div>
                            <p className="text-sm text-gray-900 capitalize">{file.status}</p>
                            <p className="text-xs text-gray-500">Vector: {file.vectorStatus}</p>
                          </div>
                        </div>
                        {file.error && (
                          <p className="text-xs text-red-600 mt-1">{file.error}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(file.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteFile(file.fileId)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIKnowledgeBase;