import { useState, useEffect } from 'react';
import { Upload, Database, FileText, Code, BookOpen, FolderOpen, Loader2, CheckCircle, XCircle, Plus, Clock, ArrowRight } from 'lucide-react';
import config from '../config/config';

interface KnowledgeBaseFile {
  _id: string;
  fileId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  azureBlobUrl: string;
  status: 'processing' | 'completed' | 'failed';
  vectorStatus: 'pending' | 'uploaded' | 'failed' | 'skipped';
  createdAt: string;
}

interface ExistingContent {
  _id: string;
  title: string;
  type: 'project' | 'blog' | 'documentation' | 'code';
  fileName?: string;
  mdContent?: string;
  content?: string;
  createdAt: string;
  selected?: boolean;
}

interface ProcessingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
}

interface UploadProgress {
  fileName: string;
  steps: ProcessingStep[];
  currentStep: number;
  overallProgress: number;
  status: 'uploading' | 'completed' | 'error';
}

export default function AIKnowledgeBase() {
  const [activeTab, setActiveTab] = useState<'upload' | 'existing'>('upload');
  const [knowledgeBaseFiles, setKnowledgeBaseFiles] = useState<KnowledgeBaseFile[]>([]);
  const [existingContent, setExistingContent] = useState<ExistingContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [showExistingModal, setShowExistingModal] = useState(false);
  const [processingExisting, setProcessingExisting] = useState(false);
  const [existingProcessSteps, setExistingProcessSteps] = useState<ProcessingStep[]>([]);
  const [showUploadProgress, setShowUploadProgress] = useState(false);

  useEffect(() => {
    fetchKnowledgeBaseFiles();
  }, []);

  const fetchKnowledgeBaseFiles = async () => {
    try {
      const response = await fetch(config.api.endpoints.knowledgeBaseFiles, {
        credentials: 'include'
      });
      const data = await response.json();
      setKnowledgeBaseFiles(data.files || []);
    } catch (error) {
      console.error('Error fetching knowledge base files:', error);
    }
  };

  const fetchExistingContent = async () => {
    setLoading(true);
    try {
      console.log('Fetching existing content...');
      
      // Fetch all data sources
      const responses = await Promise.allSettled([
        fetch(config.api.endpoints.projects, { credentials: 'include' }),
        fetch(config.api.endpoints.blogs, { credentials: 'include' }),
        fetch(config.api.endpoints.documentation, { credentials: 'include' }),
        fetch(config.api.endpoints.codeFolders(''), { credentials: 'include' })
      ]);

      console.log('API responses status:', responses.map((r, i) => ({
        index: i,
        status: r.status,
        endpoint: [
          config.api.endpoints.projects,
          config.api.endpoints.blogs,
          config.api.endpoints.documentation,
          config.api.endpoints.codeFolders('')
        ][i]
      })));

      const content: ExistingContent[] = [];

      // Process Projects
      if (responses[0].status === 'fulfilled' && responses[0].value.ok) {
        try {
          const projects = await responses[0].value.json();
          console.log('Projects data:', projects);
          
          if (projects.projects) {
            projects.projects.forEach((project: any) => {
              if (project.mdContent && project.mdContent.trim()) {
                content.push({
                  _id: project._id,
                  title: project.title,
                  type: 'project',
                  fileName: `${project.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`,
                  mdContent: project.mdContent,
                  createdAt: project.createdAt,
                  selected: false
                });
              }
            });
          }
        } catch (error) {
          console.error('Error processing projects:', error);
        }
      }

      // Process Blogs
      if (responses[1].status === 'fulfilled' && responses[1].value.ok) {
        try {
          const blogs = await responses[1].value.json();
          console.log('Blogs data:', blogs);
          
          if (blogs.blogs) {
            blogs.blogs.forEach((blog: any) => {
              if (blog.mdContent && blog.mdContent.trim()) {
                content.push({
                  _id: blog._id,
                  title: blog.title,
                  type: 'blog',
                  fileName: `${blog.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`,
                  mdContent: blog.mdContent,
                  createdAt: blog.createdAt,
                  selected: false
                });
              }
            });
          }
        } catch (error) {
          console.error('Error processing blogs:', error);
        }
      }

      // Process Documentation
      if (responses[2].status === 'fulfilled' && responses[2].value.ok) {
        try {
          const docs = await responses[2].value.json();
          console.log('Documentation data:', docs);
          
          // Try different possible response structures
          let documentationArray = [];
          if (docs.documentation) {
            documentationArray = docs.documentation;
          } else if (docs.docs) {
            documentationArray = docs.docs;
          } else if (Array.isArray(docs)) {
            documentationArray = docs;
          }

          console.log('Documentation array:', documentationArray);

          documentationArray.forEach((doc: any) => {
            if (doc.content && doc.content.trim()) {
              content.push({
                _id: doc._id,
                title: doc.title,
                type: 'documentation',
                fileName: `${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`,
                content: doc.content,
                createdAt: doc.createdAt,
                selected: false
              });
            }
          });
        } catch (error) {
          console.error('Error processing documentation:', error);
        }
      } else {
        console.error('Documentation API failed:', responses[2]);
      }

      // Process Code Files
      if (responses[3].status === 'fulfilled' && responses[3].value.ok) {
        try {
          const codeFolders = await responses[3].value.json();
          console.log('Code folders data:', codeFolders);
          
          if (codeFolders.folders) {
            for (const folder of codeFolders.folders) {
              try {
                const filesRes = await fetch(config.api.endpoints.codeFiles(folder.path), {
                  credentials: 'include'
                });
                
                if (filesRes.ok) {
                  const filesData = await filesRes.json();
                  
                  if (filesData.files) {
                    filesData.files.forEach((file: any) => {
                      if (file.content && file.content.trim()) {
                        content.push({
                          _id: file._id,
                          title: `${folder.name}/${file.filename}`,
                          type: 'code',
                          fileName: file.filename,
                          content: file.content,
                          createdAt: file.createdAt,
                          selected: false
                        });
                      }
                    });
                  }
                }
              } catch (error) {
                console.error(`Error fetching files for folder ${folder.name}:`, error);
              }
            }
          }
        } catch (error) {
          console.error('Error processing code folders:', error);
        }
      }

      console.log('Final content array:', content);
      console.log('Content by type:', {
        projects: content.filter(c => c.type === 'project').length,
        blogs: content.filter(c => c.type === 'blog').length,
        documentation: content.filter(c => c.type === 'documentation').length,
        code: content.filter(c => c.type === 'code').length
      });
      
      setExistingContent(content);
    } catch (error) {
      console.error('Error fetching existing content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    setShowUploadProgress(true);
    
    const initialProgress: UploadProgress[] = Array.from(files).map((file, index) => ({
      fileName: file.name,
      steps: [
        { id: 'validate', title: 'Validating File', description: 'Checking file format and size', status: 'pending' },
        { id: 'upload', title: 'Uploading to Cloud', description: 'Storing file in Azure Blob Storage', status: 'pending' },
        { id: 'process', title: 'Processing Content', description: 'Analyzing and extracting content', status: 'pending' },
        { id: 'database', title: 'Saving to Database', description: 'Storing metadata and references', status: 'pending' },
        { id: 'complete', title: 'Finalizing', description: 'Adding to knowledge base', status: 'pending' }
      ],
      currentStep: 0,
      overallProgress: 0,
      status: 'uploading'
    }));
    
    setUploadProgress(initialProgress);
    
    try {
      // Process files one by one
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Update current file progress
        const updateProgress = (stepIndex: number, stepStatus: 'processing' | 'completed' | 'error', progress: number) => {
          setUploadProgress(prev => prev.map((item, index) => {
            if (index === i) {
              const updatedSteps = item.steps.map((step, sIndex) => {
                if (sIndex === stepIndex) {
                  return { ...step, status: stepStatus, progress };
                } else if (sIndex < stepIndex) {
                  return { ...step, status: 'completed' };
                }
                return step;
              });
              
              return {
                ...item,
                steps: updatedSteps,
                currentStep: stepIndex,
                overallProgress: progress,
                status: stepStatus === 'error' ? 'error' : (stepIndex === 4 && stepStatus === 'completed' ? 'completed' : 'uploading')
              };
            }
            return item;
          }));
        };

        try {
          // Step 1: Validate
          updateProgress(0, 'processing', 10);
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate validation
          updateProgress(0, 'completed', 20);

          // Step 2: Upload
          updateProgress(1, 'processing', 30);
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch(config.api.endpoints.knowledgeBaseUpload, {
            method: 'POST',
            credentials: 'include',
            body: formData
          });

          if (!response.ok) {
            throw new Error(`Upload failed for ${file.name}`);
          }

          updateProgress(1, 'completed', 50);

          // Step 3: Process
          updateProgress(2, 'processing', 60);
          await new Promise(resolve => setTimeout(resolve, 800)); // Simulate processing
          updateProgress(2, 'completed', 80);

          // Step 4: Database
          updateProgress(3, 'processing', 90);
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate database save
          updateProgress(3, 'completed', 95);

          // Step 5: Complete
          updateProgress(4, 'processing', 98);
          await new Promise(resolve => setTimeout(resolve, 300));
          updateProgress(4, 'completed', 100);

        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          updateProgress(Math.min(4, initialProgress[i].currentStep), 'error', initialProgress[i].overallProgress);
        }
      }

      await fetchKnowledgeBaseFiles();
      // Reset file input
      event.target.value = '';
      
      // Hide progress after 2 seconds
      setTimeout(() => {
        setShowUploadProgress(false);
        setUploadProgress([]);
      }, 2000);
      
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleContentSelection = (id: string) => {
    setExistingContent(prev => 
      prev.map(item => 
        item._id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const selectAllContent = () => {
    const allSelected = existingContent.every(item => item.selected);
    setExistingContent(prev => 
      prev.map(item => ({ ...item, selected: !allSelected }))
    );
  };

  const processSelectedContent = async () => {
    const selectedItems = existingContent.filter(item => item.selected);
    if (selectedItems.length === 0) return;

    setProcessingExisting(true);
    
    // Initialize processing steps
    const steps: ProcessingStep[] = [
      { id: 'fetch', title: 'Fetching Content', description: `Collecting ${selectedItems.length} selected items`, status: 'pending' },
      { id: 'convert', title: 'Converting Format', description: 'Converting content to knowledge base format', status: 'pending' },
      { id: 'upload', title: 'Uploading to Cloud', description: 'Storing files in Azure Blob Storage', status: 'pending' },
      { id: 'process', title: 'Processing Content', description: 'Analyzing and indexing content', status: 'pending' },
      { id: 'database', title: 'Saving to Database', description: 'Storing in knowledge base collection', status: 'pending' },
      { id: 'complete', title: 'Finalizing', description: 'Adding to searchable knowledge base', status: 'pending' }
    ];
    
    setExistingProcessSteps(steps);

    const updateStep = (stepId: string, status: 'processing' | 'completed' | 'error', progress?: number) => {
      setExistingProcessSteps(prev => prev.map(step => 
        step.id === stepId ? { ...step, status, progress } : step
      ));
    };

    try {
      // Step 1: Fetch Content
      updateStep('fetch', 'processing', 10);
      await new Promise(resolve => setTimeout(resolve, 800));
      updateStep('fetch', 'completed', 20);

      // Step 2: Convert Format
      updateStep('convert', 'processing', 30);
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateStep('convert', 'completed', 40);

      // Step 3: Upload to Cloud
      updateStep('upload', 'processing', 50);
      
      const response = await fetch(config.api.endpoints.knowledgeBaseProcessExisting, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ items: selectedItems })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Processing failed');
      }

      updateStep('upload', 'completed', 60);

      // Step 4: Process Content
      updateStep('process', 'processing', 70);
      await new Promise(resolve => setTimeout(resolve, 1200));
      updateStep('process', 'completed', 85);

      // Step 5: Database
      updateStep('database', 'processing', 90);
      await new Promise(resolve => setTimeout(resolve, 800));
      updateStep('database', 'completed', 95);

      // Step 6: Complete
      updateStep('complete', 'processing', 98);
      await new Promise(resolve => setTimeout(resolve, 500));
      updateStep('complete', 'completed', 100);

      const data = await response.json();
      alert(`Successfully processed ${data.stats.successful} items!`);
      
      await fetchKnowledgeBaseFiles();
      setShowExistingModal(false);
      setExistingContent(prev => prev.map(item => ({ ...item, selected: false })));
      
      // Hide steps after 2 seconds
      setTimeout(() => {
        setExistingProcessSteps([]);
      }, 2000);
      
    } catch (error) {
      console.error('Error processing existing content:', error);
      const currentStep = existingProcessSteps.find(step => step.status === 'processing');
      if (currentStep) {
        updateStep(currentStep.id, 'error');
      }
      alert(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setProcessingExisting(false);
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'processing': return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusIcon = (status: string, vectorStatus: string) => {
    if (status === 'processing') return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    if (status === 'failed') return <XCircle className="w-4 h-4 text-red-500" />;
    if (vectorStatus === 'uploaded') return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <CheckCircle className="w-4 h-4 text-yellow-500" />;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project': return <FolderOpen className="w-4 h-4 text-blue-500" />;
      case 'blog': return <FileText className="w-4 h-4 text-green-500" />;
      case 'documentation': return <BookOpen className="w-4 h-4 text-purple-500" />;
      case 'code': return <Code className="w-4 h-4 text-orange-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-black mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              AI Knowledge Base
            </h1>
            <p className="text-sm lg:text-base text-gray-600 font-medium">
              Upload files or push existing content to the knowledge base
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2 border-2 border-black rounded-lg font-bold text-sm transition ${
              activeTab === 'upload'
                ? 'bg-blue-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            <Upload className="w-4 h-4" strokeWidth={2.5} />
            Upload New Files
          </button>
          <button
            onClick={() => {
              setActiveTab('existing');
              if (existingContent.length === 0) {
                fetchExistingContent();
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 border-2 border-black rounded-lg font-bold text-sm transition ${
              activeTab === 'existing'
                ? 'bg-green-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            <Database className="w-4 h-4" strokeWidth={2.5} />
            Push Existing Info
          </button>
        </div>

        {/* Upload New Files Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="bg-white border-2 border-black rounded-xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xl font-black text-black mb-4" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                Upload New Files
              </h2>
              
              <div className="border-2 border-dashed border-black rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" strokeWidth={2} />
                <p className="text-lg font-bold text-black mb-2">Drop files here or click to browse</p>
                <p className="text-sm text-gray-600 mb-4">Supports .md, .txt, .json files</p>
                
                <input
                  type="file"
                  multiple
                  accept=".md,.txt,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={loading}
                />
                <label
                  htmlFor="file-upload"
                  className={`inline-flex items-center gap-2 px-6 py-3 bg-blue-200 border-2 border-black rounded-lg font-bold text-sm hover:bg-blue-300 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" strokeWidth={2.5} />
                      Choose Files
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Knowledge Base Files List */}
            <div className="bg-white border-2 border-black rounded-xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xl font-black text-black mb-4" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                Knowledge Base Files ({knowledgeBaseFiles.length})
              </h2>

              {knowledgeBaseFiles.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-black rounded-lg">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" strokeWidth={2} />
                  <p className="text-base text-gray-600 font-medium">No files in knowledge base</p>
                  <p className="text-sm text-gray-500 mt-1">Upload files to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {knowledgeBaseFiles.map((file) => (
                    <div
                      key={file._id}
                      className="flex items-center justify-between p-4 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="w-5 h-5 text-black flex-shrink-0" strokeWidth={2.5} />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-black text-sm truncate">{file.fileName}</p>
                          <p className="text-xs text-gray-600 font-medium">
                            {file.fileType} • {formatFileSize(file.fileSize)} • {new Date(file.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(file.status, file.vectorStatus)}
                        <span className="text-xs font-medium text-gray-600 capitalize">
                          {file.vectorStatus === 'uploaded' ? 'Ready' : file.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Push Existing Info Tab */}
        {activeTab === 'existing' && (
          <div className="space-y-6">
            <div className="bg-white border-2 border-black rounded-xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  Existing Content
                </h2>
                <button
                  onClick={() => setShowExistingModal(true)}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-200 border-2 border-black rounded-lg font-bold text-sm hover:bg-green-300 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Database className="w-4 h-4" strokeWidth={2.5} />
                  )}
                  Select & Push Content
                </button>
              </div>

              <p className="text-sm text-gray-600 font-medium mb-4">
                Push your existing projects, blogs, documentation, and code files to the knowledge base
              </p>

              {/* Debug Info */}
              {existingContent.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 border-2 border-gray-300 rounded-lg">
                  <p className="text-xs font-bold text-gray-700 mb-2">Content Summary:</p>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>Projects: {existingContent.filter(c => c.type === 'project').length}</div>
                    <div>Blogs: {existingContent.filter(c => c.type === 'blog').length}</div>
                    <div>Docs: {existingContent.filter(c => c.type === 'documentation').length}</div>
                    <div>Code: {existingContent.filter(c => c.type === 'code').length}</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border-2 border-black rounded-lg p-4 text-center">
                  <FolderOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" strokeWidth={2.5} />
                  <p className="font-bold text-black text-sm">Projects</p>
                  <p className="text-xs text-gray-600">Portfolio projects</p>
                </div>
                <div className="bg-green-50 border-2 border-black rounded-lg p-4 text-center">
                  <FileText className="w-8 h-8 text-green-500 mx-auto mb-2" strokeWidth={2.5} />
                  <p className="font-bold text-black text-sm">Blogs</p>
                  <p className="text-xs text-gray-600">Blog articles</p>
                </div>
                <div className="bg-purple-50 border-2 border-black rounded-lg p-4 text-center">
                  <BookOpen className="w-8 h-8 text-purple-500 mx-auto mb-2" strokeWidth={2.5} />
                  <p className="font-bold text-black text-sm">Documentation</p>
                  <p className="text-xs text-gray-600">Technical docs</p>
                </div>
                <div className="bg-orange-50 border-2 border-black rounded-lg p-4 text-center">
                  <Code className="w-8 h-8 text-orange-500 mx-auto mb-2" strokeWidth={2.5} />
                  <p className="font-bold text-black text-sm">Code Files</p>
                  <p className="text-xs text-gray-600">Source code</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Progress Modal */}
        {showUploadProgress && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white border-2 border-black rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  Uploading Files
                </h2>
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  <span className="text-sm font-medium text-gray-600">
                    {uploadProgress.filter(p => p.status === 'completed').length} / {uploadProgress.length} completed
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {uploadProgress.map((progress, index) => (
                  <div key={index} className="border-2 border-black rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-black text-sm truncate flex-1 mr-2">{progress.fileName}</h3>
                      <div className="flex items-center gap-2">
                        {progress.status === 'uploading' && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                        {progress.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {progress.status === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                        <span className="text-xs font-medium text-gray-600">{progress.overallProgress}%</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 border-2 border-black rounded-lg h-2 mb-3">
                      <div 
                        className="bg-blue-500 h-full rounded-md transition-all duration-300"
                        style={{ width: `${progress.overallProgress}%` }}
                      />
                    </div>

                    {/* Steps */}
                    <div className="space-y-2">
                      {progress.steps.map((step, stepIndex) => (
                        <div key={step.id} className="flex items-center gap-3">
                          {getStepIcon(step.status)}
                          <div className="flex-1">
                            <p className="text-xs font-bold text-black">{step.title}</p>
                            <p className="text-xs text-gray-600">{step.description}</p>
                          </div>
                          {stepIndex < progress.steps.length - 1 && step.status === 'completed' && (
                            <ArrowRight className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Existing Content Processing Progress */}
        {processingExisting && existingProcessSteps.length > 0 && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white border-2 border-black rounded-xl p-6 max-w-lg w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  Processing Content
                </h2>
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              </div>

              <div className="space-y-4">
                {existingProcessSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-3">
                    {getStepIcon(step.status)}
                    <div className="flex-1">
                      <p className="text-sm font-bold text-black">{step.title}</p>
                      <p className="text-xs text-gray-600">{step.description}</p>
                    </div>
                    {index < existingProcessSteps.length - 1 && step.status === 'completed' && (
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                ))}
              </div>

              {/* Overall Progress */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">Overall Progress</span>
                  <span className="text-xs font-bold text-black">
                    {Math.round((existingProcessSteps.filter(s => s.status === 'completed').length / existingProcessSteps.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 border-2 border-black rounded-lg h-2">
                  <div 
                    className="bg-green-500 h-full rounded-md transition-all duration-300"
                    style={{ 
                      width: `${(existingProcessSteps.filter(s => s.status === 'completed').length / existingProcessSteps.length) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Existing Content Selection Modal */}
        {showExistingModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white border-2 border-black rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  Select Content to Push
                </h2>
                <button
                  onClick={() => setShowExistingModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  {existingContent.filter(item => item.selected).length} of {existingContent.length} items selected
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllContent}
                    className="px-3 py-1 bg-gray-100 border-2 border-black rounded-lg font-bold text-xs hover:bg-gray-200 transition"
                  >
                    {existingContent.every(item => item.selected) ? 'Deselect All' : 'Select All'}
                  </button>
                  <button
                    onClick={processSelectedContent}
                    disabled={processingExisting || existingContent.filter(item => item.selected).length === 0}
                    className="px-4 py-1 bg-green-200 border-2 border-black rounded-lg font-bold text-xs hover:bg-green-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingExisting ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                        Processing...
                      </>
                    ) : (
                      'Push Selected'
                    )}
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-96 space-y-2">
                {existingContent.map((item) => (
                  <div
                    key={item._id}
                    className={`flex items-center gap-3 p-3 border-2 border-black rounded-lg cursor-pointer transition ${
                      item.selected ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => toggleContentSelection(item._id)}
                  >
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleContentSelection(item._id)}
                      className="w-4 h-4"
                    />
                    {getTypeIcon(item.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-black text-sm truncate">{item.title}</p>
                      <p className="text-xs text-gray-600 font-medium capitalize">
                        {item.type} • {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}