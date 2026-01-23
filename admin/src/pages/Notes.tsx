import { useState, useEffect } from 'react';
import { FolderPlus, Upload, Folder, File, Trash2, ExternalLink, ChevronRight, ChevronDown } from 'lucide-react';
import TodoList from '../components/TodoList';
import config, { buildUrl } from '../config/config';

interface FolderType {
  _id: string;
  folderId: string;
  name: string;
  path: string;
  parentPath: string;
  createdAt: string;
}

interface FileType {
  _id: string;
  fileId: string;
  filename: string;
  folderPath: string;
  cloudinaryPath: string;
  cloudinaryUrl: string;
  fileType: string;
  size: number;
  uploadedAt: string;
}

export default function Notes() {
  const [activeTab, setActiveTab] = useState<'files' | 'todos'>('files');
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [files, setFiles] = useState<FileType[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ 
    current: 0, 
    total: 0,
    currentFile: '',
    currentFileProgress: 0,
    currentFileTotal: 0,
    totalBytesUploaded: 0,
    totalBytes: 0
  });

  useEffect(() => {
    fetchFolders();
    fetchFiles();
  }, [currentPath]);

  const fetchFolders = async () => {
    try {
      const response = await fetch(config.api.endpoints.notesFolders(currentPath), {
        credentials: 'include'
      });
      const data = await response.json();
      setFolders(data.folders);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const fetchFiles = async () => {
    try {
      if (!currentPath) {
        setFiles([]);
        return;
      }
      const response = await fetch(config.api.endpoints.notesFiles(currentPath), {
        credentials: 'include'
      });
      const data = await response.json();
      setFiles(data.files);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const createFolder = async () => {
    if (!newFolderName) return;

    setLoading(true);
    try {
      const response = await fetch(config.api.endpoints.notesCreateFolder, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newFolderName,
          parentPath: currentPath
        })
      });

      if (response.ok) {
        setNewFolderName('');
        setShowCreateFolderModal(false);
        fetchFolders();
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadFiles = async (fileList: FileList) => {
    if (!currentPath) {
      alert('Please select a folder first');
      return;
    }

    // Calculate total bytes
    let totalBytes = 0;
    for (let i = 0; i < fileList.length; i++) {
      totalBytes += fileList[i].size;
    }

    setUploading(true);
    setUploadProgress({ 
      current: 0, 
      total: fileList.length,
      currentFile: '',
      currentFileProgress: 0,
      currentFileTotal: 0,
      totalBytesUploaded: 0,
      totalBytes
    });

    let totalBytesUploaded = 0;

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setUploadProgress(prev => ({
          ...prev,
          currentFile: file.name,
          currentFileProgress: 0,
          currentFileTotal: file.size,
          current: i
        }));

        await uploadSingleFile(file, (chunkProgress: number, chunkTotal: number) => {
          setUploadProgress(prev => {
            const fileProgressDiff = chunkProgress - prev.currentFileProgress;
            const newTotal = prev.totalBytesUploaded + fileProgressDiff;

            return {
              ...prev,
              currentFileProgress: Math.min(chunkProgress, file.size),
              totalBytesUploaded: Math.min(newTotal, totalBytes)
            };
          });
        });

        totalBytesUploaded += file.size;
        setUploadProgress(prev => ({
          ...prev,
          current: i + 1,
          currentFileProgress: file.size,
          totalBytesUploaded
        }));
      }

      setTimeout(() => {
        setUploading(false);
        fetchFiles();
      }, 1000);
    } catch (error) {
      console.error('Error uploading files:', error);
      setUploading(false);
      alert('Upload failed: ' + (error as Error).message);
    }
  };

  const uploadSingleFile = async (file: File, onProgress?: (uploaded: number, total: number) => void) => {
    const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB chunks (Vercel WAF limit is ~4-5MB for multipart/form-data)
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const MAX_PARALLEL_UPLOADS = 3; // Upload 3 chunks in parallel

    // For small files (< 10MB), use regular upload
    if (file.size < CHUNK_SIZE) {
      const formData = new FormData();
      formData.append('folderPath', currentPath);
      formData.append('files', file);

      const response = await fetch(config.api.endpoints.notesUploadFiles, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      // Report progress for small files
      if (onProgress) {
        onProgress(file.size, file.size);
      }
      return;
    }

    // For large files, use chunked upload
    console.log(`Uploading ${file.name} in ${totalChunks} chunks`);

    // Step 1: Initialize upload
    const initResponse = await fetch(config.api.endpoints.notesUploadInit, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        filename: file.name,
        fileType: file.type,
        fileSize: file.size,
        folderPath: currentPath
      })
    });

    if (!initResponse.ok) {
      throw new Error('Failed to initialize upload');
    }

    const { uploadId } = await initResponse.json();
    const blockIds: string[] = new Array(totalChunks);

    // Step 2: Upload chunks in parallel batches with progress tracking
    let uploadedBytes = 0;
    
    const uploadChunk = async (chunkIndex: number) => {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);
      const chunkSize = end - start;

      const chunkFormData = new FormData();
      chunkFormData.append('chunk', chunk);
      chunkFormData.append('uploadId', uploadId);
      chunkFormData.append('chunkIndex', chunkIndex.toString());
      chunkFormData.append('totalChunks', totalChunks.toString());
      chunkFormData.append('filename', file.name);
      chunkFormData.append('folderPath', currentPath);
      chunkFormData.append('fileType', file.type);

      const chunkResponse = await fetch(config.api.endpoints.notesUploadChunk, {
        method: 'POST',
        body: chunkFormData,
        credentials: 'include'
      });

      if (!chunkResponse.ok) {
        throw new Error(`Failed to upload chunk ${chunkIndex + 1}/${totalChunks}`);
      }

      const { blockId } = await chunkResponse.json();
      blockIds[chunkIndex] = blockId;

      // Update progress
      uploadedBytes += chunkSize;
      if (onProgress) {
        onProgress(uploadedBytes, file.size);
      }

      console.log(`Uploaded chunk ${chunkIndex + 1}/${totalChunks} (${((uploadedBytes / file.size) * 100).toFixed(1)}%)`);
    };

    // Upload chunks in parallel batches
    for (let i = 0; i < totalChunks; i += MAX_PARALLEL_UPLOADS) {
      const batch = [];
      for (let j = 0; j < MAX_PARALLEL_UPLOADS && i + j < totalChunks; j++) {
        batch.push(uploadChunk(i + j));
      }
      await Promise.all(batch);
    }

    // Step 3: Finalize upload
    const finalizeResponse = await fetch(config.api.endpoints.notesUploadFinalize, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        uploadId,
        filename: file.name,
        folderPath: currentPath,
        fileType: file.type,
        fileSize: file.size,
        blockIds
      })
    });

    if (!finalizeResponse.ok) {
      throw new Error('Failed to finalize upload');
    }

    console.log(`Successfully uploaded ${file.name}`);
  };

  const deleteFile = async (fileId: string) => {
    if (!confirm('Delete this file?')) return;

    try {
      const response = await fetch(config.api.endpoints.notesFileById(fileId), {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchFiles();
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const deleteFolder = async (folderId: string) => {
    if (!confirm('Delete this folder and all its contents?')) return;

    try {
      const response = await fetch(config.api.endpoints.notesFolderById(folderId), {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchFolders();
        if (currentPath) {
          setCurrentPath('');
        }
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const navigateToFolder = (path: string) => {
    setCurrentPath(path);
  };

  const navigateUp = () => {
    const parts = currentPath.split('/');
    parts.pop();
    setCurrentPath(parts.join('/'));
  };

  const getBreadcrumbs = () => {
    if (!currentPath) return [];
    return currentPath.split('/');
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Upload Progress Bar */}
        {uploading && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 sm:border-b-3 lg:border-b-4 border-black shadow-[0_2px_0px_0px_rgba(0,0,0,1)] lg:shadow-[0_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4">
              <div className="flex items-center justify-between mb-2 lg:mb-3">
                <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 border-2 lg:border-3 border-black rounded-full flex items-center justify-center bg-blue-200 animate-pulse flex-shrink-0">
                    <Upload className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-black" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-black text-sm sm:text-base lg:text-lg truncate">
                      {uploadProgress.currentFile || 'Uploading Files...'}
                    </h3>
                    <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 font-medium">
                      File {uploadProgress.current} of {uploadProgress.total} 
                      {uploadProgress.currentFileTotal > 0 && ` • ${formatFileSize(uploadProgress.currentFileProgress)} / ${formatFileSize(uploadProgress.currentFileTotal)}`}
                    </p>
                  </div>
                </div>
                <div className="text-lg sm:text-xl lg:text-2xl font-black text-black flex-shrink-0 ml-2">
                  {uploadProgress.totalBytes > 0 
                    ? Math.round((uploadProgress.totalBytesUploaded / uploadProgress.totalBytes) * 100)
                    : Math.round((uploadProgress.current / uploadProgress.total) * 100)}%
                </div>
              </div>

              {/* Overall Progress Bar */}
              <div className="w-full h-2.5 sm:h-3 lg:h-4 bg-gray-200 border-2 lg:border-3 border-black rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300 ease-out relative"
                  style={{ 
                    width: `${uploadProgress.totalBytes > 0 
                      ? (uploadProgress.totalBytesUploaded / uploadProgress.totalBytes) * 100
                      : (uploadProgress.current / uploadProgress.total) * 100}%` 
                  }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>

              {/* Current File Progress Bar (for chunked uploads) */}
              {uploadProgress.currentFileTotal > (10 * 1024 * 1024) && (
                <div className="w-full h-1.5 sm:h-2 bg-gray-100 border-2 border-gray-300 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300 ease-out"
                    style={{ width: `${(uploadProgress.currentFileProgress / uploadProgress.currentFileTotal) * 100}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6 lg:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-black mb-1 lg:mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              Notes & Files
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium">Organize your files and todos</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-2 sm:border-3 lg:border-4 border-black rounded-lg sm:rounded-xl lg:rounded-2xl p-1 sm:p-1.5 lg:p-2 mb-3 sm:mb-4 md:mb-5 lg:mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] lg:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex gap-1 sm:gap-1.5 lg:gap-2">
            <button
              onClick={() => setActiveTab('files')}
              className={`flex-1 px-2 sm:px-3 md:px-4 lg:px-6 py-2 lg:py-3 rounded-md sm:rounded-lg lg:rounded-xl font-black text-[10px] sm:text-xs lg:text-base uppercase tracking-wide transition-all border-2 lg:border-3 border-black ${activeTab === 'files'
                ? 'bg-black text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] lg:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]'
                : 'bg-white text-black hover:bg-gray-50 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] lg:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
            >
              Files
            </button>
            <button
              onClick={() => setActiveTab('todos')}
              className={`flex-1 px-2 sm:px-3 md:px-4 lg:px-6 py-2 lg:py-3 rounded-md sm:rounded-lg lg:rounded-xl font-black text-[10px] sm:text-xs lg:text-base uppercase tracking-wide transition-all border-2 lg:border-3 border-black ${activeTab === 'todos'
                ? 'bg-black text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] lg:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]'
                : 'bg-white text-black hover:bg-gray-50 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] lg:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
            >
              ToDoList
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        {activeTab === 'files' && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 md:gap-3 mb-3 sm:mb-4 md:mb-5 lg:mb-6">
            <button
              onClick={() => setShowCreateFolderModal(true)}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 bg-blue-200 border-2 lg:border-3 border-black rounded-lg lg:rounded-xl font-bold text-xs sm:text-sm lg:text-base hover:bg-blue-300 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] lg:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] lg:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:hover:translate-x-[-1px] sm:hover:translate-y-[-1px] lg:hover:translate-x-[-2px] lg:hover:translate-y-[-2px]"
            >
              <FolderPlus className="w-4 h-4 lg:w-5 lg:h-5" strokeWidth={2.5} />
              <span className="whitespace-nowrap">New Folder</span>
            </button>
            {currentPath && (
              <label className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 bg-green-200 border-2 lg:border-3 border-black rounded-lg lg:rounded-xl font-bold text-xs sm:text-sm lg:text-base hover:bg-green-300 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] lg:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] lg:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:hover:translate-x-[-1px] sm:hover:translate-y-[-1px] lg:hover:translate-x-[-2px] lg:hover:translate-y-[-2px] cursor-pointer">
                <Upload className="w-4 h-4 lg:w-5 lg:h-5" strokeWidth={2.5} />
                <span className="whitespace-nowrap">Upload Files</span>
                <input
                  type="file"
                  multiple
                  onChange={(e) => e.target.files && uploadFiles(e.target.files)}
                  className="hidden"
                />
              </label>
            )}
          </div>
        )}

        {/* Files Tab Content */}
        {activeTab === 'files' && (
          <>

            {/* Breadcrumbs */}
            {currentPath && (
              <div className="bg-white border-2 sm:border-3 lg:border-3 border-black rounded-lg lg:rounded-xl p-2.5 sm:p-3 lg:p-4 mb-3 sm:mb-4 md:mb-5 lg:mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] lg:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 flex-wrap">
                  <button
                    onClick={() => setCurrentPath('')}
                    className="px-2 sm:px-2.5 lg:px-3 py-0.5 sm:py-1 bg-gray-100 border-2 border-black rounded-md lg:rounded-lg font-bold text-[10px] sm:text-xs lg:text-sm hover:bg-gray-200 transition"
                  >
                    Root
                  </button>
                  {getBreadcrumbs().map((part, index) => (
                    <div key={index} className="flex items-center gap-1 sm:gap-1.5 lg:gap-2">
                      <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4" />
                      <button
                        onClick={() => {
                          const path = getBreadcrumbs().slice(0, index + 1).join('/');
                          setCurrentPath(path);
                        }}
                        className="px-2 sm:px-2.5 lg:px-3 py-0.5 sm:py-1 bg-gray-100 border-2 border-black rounded-md lg:rounded-lg font-bold text-[10px] sm:text-xs lg:text-sm hover:bg-gray-200 transition break-all max-w-[120px] sm:max-w-none truncate"
                      >
                        {part}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-12 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {/* Folders Section */}
              <div className="col-span-12">
                <div className="bg-white border-2 sm:border-3 lg:border-4 border-black rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] lg:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-black mb-3 sm:mb-4 lg:mb-6" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                    Folders
                  </h2>

                  {folders.length === 0 ? (
                    <div className="text-center py-6 sm:py-8 lg:py-12 border-2 lg:border-3 border-dashed border-black rounded-lg lg:rounded-xl">
                      <Folder className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400 mx-auto mb-2 lg:mb-3" strokeWidth={2} />
                      <p className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium">No folders here</p>
                      <p className="text-[10px] sm:text-xs lg:text-sm text-gray-500 mt-1">Create a new folder to get started</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                      {folders.map((folder) => (
                        <div
                          key={folder._id}
                          className="bg-yellow-50 border-2 lg:border-3 border-black rounded-lg lg:rounded-xl p-2.5 sm:p-3 lg:p-4 hover:bg-yellow-100 transition cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] lg:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] sm:hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] lg:hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] sm:hover:translate-x-[-1px] sm:hover:translate-y-[-1px] lg:hover:translate-x-[-2px] lg:hover:translate-y-[-2px]"
                        >
                          <div className="flex items-start justify-between gap-1.5 sm:gap-2">
                            <div
                              onClick={() => navigateToFolder(folder.path)}
                              className="flex-1 min-w-0"
                            >
                              <Folder className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-black mb-1 sm:mb-1.5 lg:mb-2" strokeWidth={2.5} />
                              <h3 className="font-black text-black text-xs sm:text-sm lg:text-base break-words line-clamp-2">{folder.name}</h3>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteFolder(folder.folderId);
                              }}
                              className="p-1 sm:p-1.5 lg:p-2 bg-red-100 border-2 border-black rounded-md lg:rounded-lg hover:bg-red-200 transition flex-shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-black" strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Files Section */}
              {currentPath && (
                <div className="col-span-12">
                  <div className="bg-white border-2 sm:border-3 lg:border-4 border-black rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] lg:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-black mb-3 sm:mb-4 lg:mb-6" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                      Files ({files.length})
                    </h2>

                    {files.length === 0 ? (
                      <div className="text-center py-6 sm:py-8 lg:py-12 border-2 lg:border-3 border-dashed border-black rounded-lg lg:rounded-xl">
                        <File className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400 mx-auto mb-2 lg:mb-3" strokeWidth={2} />
                        <p className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium">No files in this folder</p>
                        <p className="text-[10px] sm:text-xs lg:text-sm text-gray-500 mt-1">Upload files to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-2 sm:space-y-2.5 lg:space-y-3">
                        {files.map((file) => (
                          <div
                            key={file._id}
                            className="flex items-center justify-between p-3 sm:p-3 lg:p-4 bg-white border-2 lg:border-3 border-black rounded-lg lg:rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] lg:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] sm:hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] lg:hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] sm:hover:translate-x-[-1px] sm:hover:translate-y-[-1px] lg:hover:translate-x-[-2px] lg:hover:translate-y-[-2px] transition gap-2 sm:gap-3"
                          >
                            <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 flex-1 min-w-0 overflow-hidden">
                              <File className="w-5 h-5 sm:w-5 sm:h-5 lg:w-5 lg:h-5 text-black flex-shrink-0" strokeWidth={2.5} />
                              <div className="flex-1 min-w-0 overflow-hidden">
                                <p className="font-bold text-black text-sm sm:text-sm lg:text-base truncate w-full">{file.filename}</p>
                                <p className="text-xs sm:text-xs lg:text-sm text-gray-600 font-medium mt-0.5">{formatFileSize(file.size)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 justify-end flex-shrink-0">
                              <a
                                href={file.cloudinaryUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 sm:p-2 bg-green-100 border-2 border-black rounded-md lg:rounded-lg hover:bg-green-200 transition active:translate-x-[1px] active:translate-y-[1px]"
                                title="Open file"
                              >
                                <ExternalLink className="w-4 h-4 sm:w-4 sm:h-4 text-black" strokeWidth={2.5} />
                              </a>
                              <button
                                onClick={() => deleteFile(file.fileId)}
                                className="p-2 sm:p-2 bg-red-100 border-2 border-black rounded-md lg:rounded-lg hover:bg-red-200 transition active:translate-x-[1px] active:translate-y-[1px]"
                                title="Delete file"
                              >
                                <Trash2 className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-black" strokeWidth={2.5} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ToDo Tab Content */}
        {activeTab === 'todos' && (
          <TodoList />
        )}

        {/* Create Folder Modal */}
        {showCreateFolderModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white border-2 sm:border-3 lg:border-4 border-black rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-8 max-w-md w-full mx-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] lg:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-black mb-3 sm:mb-4 lg:mb-6" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                Create New Folder
              </h2>

              <div className="space-y-2.5 sm:space-y-3 lg:space-y-4 mb-4 sm:mb-5 lg:mb-6">
                <div>
                  <label className="block text-[10px] sm:text-xs lg:text-sm font-black text-black mb-1.5 sm:mb-2 uppercase">
                    Folder Name *
                  </label>
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full px-3 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 bg-white border-2 lg:border-3 border-black rounded-lg lg:rounded-xl text-xs sm:text-sm lg:text-base font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] lg:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    placeholder="e.g., Mathematics"
                  />
                </div>

                {currentPath && (
                  <div className="p-2 sm:p-2.5 lg:p-3 bg-blue-50 border-2 border-black rounded-md lg:rounded-lg">
                    <p className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-700">
                      Creating in: <span className="font-black text-black break-all">{currentPath}</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
                <button
                  onClick={() => setShowCreateFolderModal(false)}
                  className="flex-1 px-4 py-2 sm:py-2.5 lg:py-3 bg-white border-2 lg:border-3 border-black rounded-lg lg:rounded-xl font-bold text-xs sm:text-sm lg:text-base hover:bg-gray-50 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] lg:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  Cancel
                </button>
                <button
                  onClick={createFolder}
                  disabled={loading || !newFolderName}
                  className="flex-1 px-4 py-2 sm:py-2.5 lg:py-3 bg-black text-white border-2 lg:border-3 border-black rounded-lg lg:rounded-xl font-bold text-xs sm:text-sm lg:text-base hover:bg-gray-800 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] lg:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
