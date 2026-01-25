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
      auth: '/api/auth',
      login: '/api/auth/login',
      verify: '/api/auth/verify',
      
      // Projects
      projects: '/api/projects',
      projectById: (id: string) => `/api/projects/${id}`,
      projectCreate: '/api/projects/create',
      projectReorder: '/api/projects/reorder',
      projectMdContent: (id: string) => `/api/projects/${id}/md-content`,
      projectMdFile: (id: string) => `/api/projects/${id}/md-file`,
      projectAssets: (id: string) => `/api/projects/${id}/assets`,
      projectCardAssets: (id: string) => `/api/projects/${id}/cardassets`,
      projectAssetByIndex: (id: string, index: number) => `/api/projects/${id}/assets/${index}`,
      projectAssetName: (id: string, index: number) => `/api/projects/${id}/assets/${index}/name`,
      projectCardAssetByIndex: (id: string, index: number) => `/api/projects/${id}/cardassets/${index}`,
      
      // Blogs
      blogs: '/api/blogs',
      blogById: (id: string) => `/api/blogs/${id}`,
      blogCreate: '/api/blogs/create',
      blogMdContent: (id: string) => `/api/blogs/${id}/md-content`,
      blogMdFile: (id: string) => `/api/blogs/${id}/md-file`,
      blogAssets: (id: string) => `/api/blogs/${id}/assets`,
      blogCover: (id: string) => `/api/blogs/${id}/cover`,
      blogAssetByIndex: (id: string, index: number) => `/api/blogs/${id}/assets/${index}`,
      blogAssetName: (id: string, index: number) => `/api/blogs/${id}/assets/${index}/name`,
      
      // Documentation
      documentation: '/api/documentation/admin/all',
      docById: (id: string) => `/api/documentation/admin/${id}`,
      docCreate: '/api/documentation/create',
      docUploadAsset: '/api/documentation/upload-asset',
      docAsset: (id: string, name: string) => `/api/documentation/asset/${id}/${name}`,
      docFiles: (id: string) => `/api/documentation/admin/${id}/files`,
      docFileById: (docId: string, fileId: string) => `/api/documentation/admin/${docId}/files/${fileId}`,
      docAttachments: (id: string) => `/api/documentation/${id}/attachments`,
      docAttachmentsInit: (id: string) => `/api/documentation/${id}/attachments/init`,
      docAttachmentsChunk: (id: string) => `/api/documentation/${id}/attachments/chunk`,
      docAttachmentsComplete: (id: string) => `/api/documentation/${id}/attachments/complete`,
      docDiagram: (id: string) => `/api/documentation/admin/${id}/diagram`,
      
      // Notes
      notesFolders: (parentPath: string) => `/api/notes/folders?parentPath=${parentPath}`,
      notesFiles: (folderPath: string) => `/api/notes/files?folderPath=${folderPath}`,
      notesCreateFolder: '/api/notes/folder/create',
      notesUploadFiles: '/api/notes/files/upload',
      notesUploadInit: '/api/notes/files/upload/init',
      notesUploadChunk: '/api/notes/files/upload/chunk',
      notesUploadFinalize: '/api/notes/files/upload/finalize',
      notesFileById: (id: string) => `/api/notes/files/${id}`,
      notesFolderById: (id: string) => `/api/notes/folders/${id}`,
      
      // Code
      codeFolders: (parentPath: string) => `/api/code/folders?parentPath=${parentPath}`,
      codeFiles: (folderPath: string) => `/api/code/files?folderPath=${folderPath}`,
      codeCreateFolder: '/api/code/folder/create',
      codeCreateFile: '/api/code/file/create',
      codeFileById: (id: string) => `/api/code/files/${id}`,
      codeFileContent: (id: string) => `/api/code/files/${id}/content`,
      codeFolderById: (id: string) => `/api/code/folders/${id}`,
      
      // GitHub Integration
      githubRepos: '/api/github/repos',
      githubRepoAdd: '/api/github/repos/add',
      githubRepoById: (id: string) => `/api/github/repos/${id}`,
      githubRepoTree: (id: string, path: string = '') => `/api/github/repos/${id}/tree?path=${encodeURIComponent(path)}`,
      githubRepoFile: (id: string, path: string) => `/api/github/repos/${id}/file?path=${encodeURIComponent(path)}`,
      githubRepoDelete: (id: string) => `/api/github/repos/${id}`,
      
      // Todos
      todos: '/api/todos',
      todoById: (id: string) => `/api/todos/${id}`,
      todoCreate: '/api/todos/create',
      
      // Diagrams
      diagrams: '/api/diagrams',
      diagramById: (id: string) => `/api/diagrams/${id}`,
      
      // Views
      views: '/api/views',
      viewsStats: '/api/views/stats',
      
      // Knowledge Base
      knowledgeBase: '/api/knowledge-base',
      knowledgeBaseUpload: '/api/knowledge-base/upload',
      knowledgeBaseFiles: '/api/knowledge-base/files',
      knowledgeBaseStats: '/api/knowledge-base/stats',
      knowledgeBaseFileById: (fileId: string) => `/api/knowledge-base/files/${fileId}`,
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
