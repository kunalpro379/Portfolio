import { useState, useEffect } from 'react';
import { FolderPlus, Upload, Folder, File, Trash2, ExternalLink, ChevronRight, ChevronDown } from 'lucide-react';
import TodoList from '../components/TodoList';

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
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    fetchFolders();
    fetchFiles();
  }, [currentPath]);

  const fetchFolders = async () => {
    try {
      const response = await fetch(`https://api.kunalpatil.me/api/notes/folders?parentPath=${currentPath}`, {
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
      const response = await fetch(`https://api.kunalpatil.me/api/notes/files?folderPath=${currentPath}`, {
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
      const response = await fetch('https://api.kunalpatil.me/api/notes/folder/create', {
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

    setUploading(true);
    setUploadProgress({ current: 0, total: fileList.length });

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        await uploadSingleFile(file);
        setUploadProgress({ current: i + 1, total: fileList.length });
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

  const uploadSingleFile = async (file: File) => {
    const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB chunks
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    // For small files (< 4MB), use regular upload
    if (file.size < CHUNK_SIZE) {
      const formData = new FormData();
      formData.append('folderPath', currentPath);
      formData.append('files', file);

      const response = await fetch('https://api.kunalpatil.me/api/notes/files/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }
      return;
    }

    // For large files, use chunked upload
    console.log(`Uploading ${file.name} in ${totalChunks} chunks`);

    // Step 1: Initialize upload
    const initResponse = await fetch('https://api.kunalpatil.me/api/notes/files/upload/init', {
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
    const blockIds: string[] = [];

    // Step 2: Upload chunks
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const chunkFormData = new FormData();
      chunkFormData.append('chunk', chunk);
      chunkFormData.append('uploadId', uploadId);
      chunkFormData.append('chunkIndex', chunkIndex.toString());
      chunkFormData.append('totalChunks', totalChunks.toString());
      chunkFormData.append('filename', file.name);
      chunkFormData.append('folderPath', currentPath);
      chunkFormData.append('fileType', file.type);

      const chunkResponse = await fetch('https://api.kunalpatil.me/api/notes/files/upload/chunk', {
        method: 'POST',
        body: chunkFormData,
        credentials: 'include'
      });

      if (!chunkResponse.ok) {
        throw new Error(`Failed to upload chunk ${chunkIndex + 1}/${totalChunks}`);
      }

      const { blockId } = await chunkResponse.json();
      blockIds.push(blockId);

      console.log(`Uploaded chunk ${chunkIndex + 1}/${totalChunks}`);
    }

    // Step 3: Finalize upload
    const finalizeResponse = await fetch('https://api.kunalpatil.me/api/notes/files/upload/finalize', {
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
      const response = await fetch(`https://api.kunalpatil.me/api/notes/files/${fileId}`, {
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
      const response = await fetch(`https://api.kunalpatil.me/api/notes/folders/${folderId}`, {
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
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Upload Progress Bar */}
        {uploading && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b-4 border-black shadow-[0_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="max-w-7xl mx-auto px-8 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-3 border-black rounded-full flex items-center justify-center bg-blue-200 animate-pulse">
                    <Upload className="w-4 h-4 text-black" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-black text-black text-lg">Uploading Files...</h3>
                    <p className="text-sm text-gray-600 font-medium">
                      {uploadProgress.current} of {uploadProgress.total} files uploaded
                    </p>
                  </div>
                </div>
                <div className="text-2xl font-black text-black">
                  {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-4 bg-gray-200 border-3 border-black rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500 ease-out relative"
                  style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-black mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              Notes & Files
            </h1>
            <p className="text-gray-600 font-medium">Organize your files and todos</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-4 border-black rounded-2xl p-2 mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('files')}
              className={`flex-1 px-6 py-3 rounded-xl font-black uppercase tracking-wide transition-all border-3 border-black ${activeTab === 'files'
                ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]'
                : 'bg-white text-black hover:bg-gray-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
            >
              Files
            </button>
            <button
              onClick={() => setActiveTab('todos')}
              className={`flex-1 px-6 py-3 rounded-xl font-black uppercase tracking-wide transition-all border-3 border-black ${activeTab === 'todos'
                ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]'
                : 'bg-white text-black hover:bg-gray-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
            >
              ToDoList
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        {activeTab === 'files' && (
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setShowCreateFolderModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-200 border-3 border-black rounded-xl font-bold hover:bg-blue-300 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
            >
              <FolderPlus className="w-5 h-5" strokeWidth={2.5} />
              New Folder
            </button>
            {currentPath && (
              <label className="flex items-center gap-2 px-6 py-3 bg-green-200 border-3 border-black rounded-xl font-bold hover:bg-green-300 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] cursor-pointer">
                <Upload className="w-5 h-5" strokeWidth={2.5} />
                Upload Files
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
              <div className="bg-white border-3 border-black rounded-xl p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setCurrentPath('')}
                    className="px-3 py-1 bg-gray-100 border-2 border-black rounded-lg font-bold hover:bg-gray-200 transition"
                  >
                    Root
                  </button>
                  {getBreadcrumbs().map((part, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4" />
                      <button
                        onClick={() => {
                          const path = getBreadcrumbs().slice(0, index + 1).join('/');
                          setCurrentPath(path);
                        }}
                        className="px-3 py-1 bg-gray-100 border-2 border-black rounded-lg font-bold hover:bg-gray-200 transition"
                      >
                        {part}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-12 gap-6">
              {/* Folders Section */}
              <div className="col-span-12">
                <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <h2 className="text-2xl font-black text-black mb-6" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                    Folders
                  </h2>

                  {folders.length === 0 ? (
                    <div className="text-center py-12 border-3 border-dashed border-black rounded-xl">
                      <Folder className="w-12 h-12 text-gray-400 mx-auto mb-3" strokeWidth={2} />
                      <p className="text-gray-600 font-medium">No folders here</p>
                      <p className="text-sm text-gray-500 mt-1">Create a new folder to get started</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {folders.map((folder) => (
                        <div
                          key={folder._id}
                          className="bg-yellow-50 border-3 border-black rounded-xl p-4 hover:bg-yellow-100 transition cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div
                              onClick={() => navigateToFolder(folder.path)}
                              className="flex-1"
                            >
                              <Folder className="w-8 h-8 text-black mb-2" strokeWidth={2.5} />
                              <h3 className="font-black text-black">{folder.name}</h3>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteFolder(folder.folderId);
                              }}
                              className="p-2 bg-red-100 border-2 border-black rounded-lg hover:bg-red-200 transition"
                            >
                              <Trash2 className="w-6 h-6 text-black" strokeWidth={2.5} />
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
                  <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <h2 className="text-2xl font-black text-black mb-6" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                      Files ({files.length})
                    </h2>

                    {files.length === 0 ? (
                      <div className="text-center py-12 border-3 border-dashed border-black rounded-xl">
                        <File className="w-12 h-12 text-gray-400 mx-auto mb-3" strokeWidth={2} />
                        <p className="text-gray-600 font-medium">No files in this folder</p>
                        <p className="text-sm text-gray-500 mt-1">Upload files to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {files.map((file) => (
                          <div
                            key={file._id}
                            className="flex items-center justify-between p-4 bg-white border-3 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <File className="w-5 h-5 text-black" strokeWidth={2.5} />
                              <div className="flex-1">
                                <p className="font-bold text-black">{file.filename}</p>
                                <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href={file.cloudinaryUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-green-100 border-2 border-black rounded-lg hover:bg-green-200 transition"
                              >
                                <ExternalLink className="w-4 h-4 text-black" strokeWidth={2.5} />
                              </a>
                              <button
                                onClick={() => deleteFile(file.fileId)}
                                className="p-2 bg-red-100 border-2 border-black rounded-lg hover:bg-red-200 transition"
                              >
                                <Trash2 className="w-6 h-6 text-black" strokeWidth={2.5} />
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white border-4 border-black rounded-2xl p-8 max-w-md w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-3xl font-black text-black mb-6" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                Create New Folder
              </h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-black text-black mb-2 uppercase">
                    Folder Name *
                  </label>
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    placeholder="e.g., Mathematics"
                  />
                </div>

                {currentPath && (
                  <div className="p-3 bg-blue-50 border-2 border-black rounded-lg">
                    <p className="text-sm font-medium text-gray-700">
                      Creating in: <span className="font-black text-black">{currentPath}</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateFolderModal(false)}
                  className="flex-1 px-4 py-3 bg-white border-3 border-black rounded-xl font-bold hover:bg-gray-50 transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  Cancel
                </button>
                <button
                  onClick={createFolder}
                  disabled={loading || !newFolderName}
                  className="flex-1 px-4 py-3 bg-black text-white border-3 border-black rounded-xl font-bold hover:bg-gray-800 transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
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
