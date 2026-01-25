// API Configuration for Admin Panel
// @ts-ignore
import CONFIG from '../../../config.shared.js';

// Determine API base URL based on environment
const getApiBaseUrl = (): string => {
  // Check if we're in development (localhost)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Use local server for development
      return 'http://localhost:5000';
    }
  }
  
  // Use production API for deployed version
  return 'https://api.kunalpatil.me';
};

const API_BASE_URL = getApiBaseUrl();

const config = {
  // API Base URL - automatically detects environment
  api: {
    baseUrl: API_BASE_URL,
    endpoints: {
      // Auth
      auth: `${API_BASE_URL}/api/auth`,
      login: `${API_BASE_URL}/api/auth/login`,
      verify: `${API_BASE_URL}/api/auth/verify`,
      
      // Projects
      projects: `${API_BASE_URL}/api/projects`,
      projectById: (id: string) => `${API_BASE_URL}/api/projects/${id}`,
      projectCreate: `${API_BASE_URL}/api/projects/create`,
      projectReorder: `${API_BASE_URL}/api/projects/reorder`,
      projectMdContent: (id: string) => `${API_BASE_URL}/api/projects/${id}/md-content`,
      projectMdFile: (id: string) => `${API_BASE_URL}/api/projects/${id}/md-file`,
      projectAssets: (id: string) => `${API_BASE_URL}/api/projects/${id}/assets`,
      projectCardAssets: (id: string) => `${API_BASE_URL}/api/projects/${id}/cardassets`,
      projectAssetByIndex: (id: string, index: number) => `${API_BASE_URL}/api/projects/${id}/assets/${index}`,
      projectAssetName: (id: string, index: number) => `${API_BASE_URL}/api/projects/${id}/assets/${index}/name`,
      projectCardAssetByIndex: (id: string, index: number) => `${API_BASE_URL}/api/projects/${id}/cardassets/${index}`,
      
      // Blogs
      blogs: `${API_BASE_URL}/api/blogs`,
      blogById: (id: string) => `${API_BASE_URL}/api/blogs/${id}`,
      blogCreate: `${API_BASE_URL}/api/blogs/create`,
      blogMdContent: (id: string) => `${API_BASE_URL}/api/blogs/${id}/md-content`,
      blogMdFile: (id: string) => `${API_BASE_URL}/api/blogs/${id}/md-file`,
      blogAssets: (id: string) => `${API_BASE_URL}/api/blogs/${id}/assets`,
      blogCover: (id: string) => `${API_BASE_URL}/api/blogs/${id}/cover`,
      blogAssetByIndex: (id: string, index: number) => `${API_BASE_URL}/api/blogs/${id}/assets/${index}`,
      blogAssetName: (id: string, index: number) => `${API_BASE_URL}/api/blogs/${id}/assets/${index}/name`,
      
      // Documentation
      documentation: `${API_BASE_URL}/api/documentation/admin/all`,
      docById: (id: string) => `${API_BASE_URL}/api/documentation/admin/${id}`,
      docCreate: `${API_BASE_URL}/api/documentation/create`,
      docUploadAsset: `${API_BASE_URL}/api/documentation/upload-asset`,
      docAsset: (id: string, name: string) => `${API_BASE_URL}/api/documentation/asset/${id}/${name}`,
      docFiles: (id: string) => `${API_BASE_URL}/api/documentation/admin/${id}/files`,
      docFileById: (docId: string, fileId: string) => `${API_BASE_URL}/api/documentation/admin/${docId}/files/${fileId}`,
      docAttachments: (id: string) => `${API_BASE_URL}/api/documentation/${id}/attachments`,
      docAttachmentsInit: (id: string) => `${API_BASE_URL}/api/documentation/${id}/attachments/init`,
      docAttachmentsChunk: (id: string) => `${API_BASE_URL}/api/documentation/${id}/attachments/chunk`,
      docAttachmentsComplete: (id: string) => `${API_BASE_URL}/api/documentation/${id}/attachments/complete`,
      docDiagram: (id: string) => `${API_BASE_URL}/api/documentation/admin/${id}/diagram`,
      
      // Notes
      notesFolders: (parentPath: string) => `${API_BASE_URL}/api/notes/folders?parentPath=${parentPath}`,
      notesFiles: (folderPath: string) => `${API_BASE_URL}/api/notes/files?folderPath=${folderPath}`,
      notesCreateFolder: `${API_BASE_URL}/api/notes/folder/create`,
      notesUploadFiles: `${API_BASE_URL}/api/notes/files/upload`,
      notesUploadInit: `${API_BASE_URL}/api/notes/files/upload/init`,
      notesUploadChunk: `${API_BASE_URL}/api/notes/files/upload/chunk`,
      notesUploadFinalize: `${API_BASE_URL}/api/notes/files/upload/finalize`,
      notesFileById: (id: string) => `${API_BASE_URL}/api/notes/files/${id}`,
      notesFolderById: (id: string) => `${API_BASE_URL}/api/notes/folders/${id}`,
      
      // Code
      codeFolders: (parentPath: string) => `${API_BASE_URL}/api/code/folders?parentPath=${parentPath}`,
      codeFiles: (folderPath: string) => `${API_BASE_URL}/api/code/files?folderPath=${folderPath}`,
      codeCreateFolder: `${API_BASE_URL}/api/code/folder/create`,
      codeCreateFile: `${API_BASE_URL}/api/code/file/create`,
      codeFileById: (id: string) => `${API_BASE_URL}/api/code/files/${id}`,
      codeFileContent: (id: string) => `${API_BASE_URL}/api/code/files/${id}/content`,
      codeFolderById: (id: string) => `${API_BASE_URL}/api/code/folders/${id}`,
      
      // GitHub Integration
      githubRepos: `${API_BASE_URL}/api/github/repos`,
      githubRepoAdd: `${API_BASE_URL}/api/github/repos/add`,
      githubRepoById: (id: string) => `${API_BASE_URL}/api/github/repos/${id}`,
      githubRepoTree: (id: string, path: string = '') => `${API_BASE_URL}/api/github/repos/${id}/tree?path=${encodeURIComponent(path)}`,
      githubRepoFile: (id: string, path: string) => `${API_BASE_URL}/api/github/repos/${id}/file?path=${encodeURIComponent(path)}`,
      githubRepoDelete: (id: string) => `${API_BASE_URL}/api/github/repos/${id}`,
      
      // Todos
      todos: `${API_BASE_URL}/api/todos`,
      todoById: (id: string) => `${API_BASE_URL}/api/todos/${id}`,
      todoCreate: `${API_BASE_URL}/api/todos/create`,
      
      // Diagrams
      diagrams: `${API_BASE_URL}/api/diagrams`,
      diagramById: (id: string) => `${API_BASE_URL}/api/diagrams/${id}`,
      
      // Views
      views: `${API_BASE_URL}/api/views`,
      viewsStats: `${API_BASE_URL}/api/views/stats`,
      
      // Knowledge Base
      knowledgeBase: `${API_BASE_URL}/api/knowledge-base`,
      knowledgeBaseUpload: `${API_BASE_URL}/api/knowledge-base/upload`,
      knowledgeBaseFiles: `${API_BASE_URL}/api/knowledge-base/files`,
      knowledgeBaseStats: `${API_BASE_URL}/api/knowledge-base/stats`,
      knowledgeBaseFileById: (fileId: string) => `${API_BASE_URL}/api/knowledge-base/files/${fileId}`,
    }
  },

  // App Configuration
  app: {
    name: 'Portfolio Admin',
    version: '1.0.0'
  }
};

// Helper function to build full URL
export const buildUrl = (endpoint: string): string => {
  return `${config.api.baseUrl}${endpoint}`;
};

// Helper function for API calls
export const apiCall = async (
  endpoint: string,
  options?: RequestInit
): Promise<Response> => {
  const url = buildUrl(endpoint);
  return fetch(url, options);
};

export default config;
