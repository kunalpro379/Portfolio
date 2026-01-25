// API Configuration for Admin Panel
// @ts-ignore
import CONFIG from '../../../config.shared.js';

// Environment-aware API base URL
const getApiBaseUrl = (): string => {
  // Always use the production API URL
  return 'https://api.kunalpatil.me';
};

const config = {
  // API Base URL - detects environment
  api: {
    baseUrl: getApiBaseUrl(),
    endpoints: {
      // Auth
      auth: `${getApiBaseUrl()}/api/auth`,
      login: `${getApiBaseUrl()}/api/auth/login`,
      verify: `${getApiBaseUrl()}/api/auth/verify`,
      
      // Knowledge Base
      knowledgeBaseFiles: `${getApiBaseUrl()}/api/knowledge-base/files`,
      knowledgeBaseStats: `${getApiBaseUrl()}/api/knowledge-base/stats`,
      knowledgeBaseUpload: `${getApiBaseUrl()}/api/knowledge-base/upload`,
      knowledgeBaseFileById: (id: string) => `${getApiBaseUrl()}/api/knowledge-base/files/${id}`,
      
      // AI Chat
      aiChat: `${getApiBaseUrl()}/api/ai-chat`,
      aiChatHistory: `${getApiBaseUrl()}/api/ai-chat/history`,
      
      // Projects
      projects: `${getApiBaseUrl()}/api/projects`,
      projectById: (id: string) => `${getApiBaseUrl()}/api/projects/${id}`,
      projectCreate: `${getApiBaseUrl()}/api/projects/create`,
      projectReorder: `${getApiBaseUrl()}/api/projects/reorder`,
      projectMdContent: (id: string) => `${getApiBaseUrl()}/api/projects/${id}/md-content`,
      projectMdFile: (id: string) => `${getApiBaseUrl()}/api/projects/${id}/md-file`,
      projectAssets: (id: string) => `${getApiBaseUrl()}/api/projects/${id}/assets`,
      projectCardAssets: (id: string) => `${getApiBaseUrl()}/api/projects/${id}/cardassets`,
      projectAssetByIndex: (id: string, index: number) => `${getApiBaseUrl()}/api/projects/${id}/assets/${index}`,
      projectAssetName: (id: string, index: number) => `${getApiBaseUrl()}/api/projects/${id}/assets/${index}/name`,
      projectCardAssetByIndex: (id: string, index: number) => `${getApiBaseUrl()}/api/projects/${id}/cardassets/${index}`,
      
      // Blogs
      blogs: `${getApiBaseUrl()}/api/blogs`,
      blogById: (id: string) => `${getApiBaseUrl()}/api/blogs/${id}`,
      blogCreate: `${getApiBaseUrl()}/api/blogs/create`,
      blogMdContent: (id: string) => `${getApiBaseUrl()}/api/blogs/${id}/md-content`,
      blogMdFile: (id: string) => `${getApiBaseUrl()}/api/blogs/${id}/md-file`,
      blogAssets: (id: string) => `${getApiBaseUrl()}/api/blogs/${id}/assets`,
      blogCover: (id: string) => `${getApiBaseUrl()}/api/blogs/${id}/cover`,
      blogAssetByIndex: (id: string, index: number) => `${getApiBaseUrl()}/api/blogs/${id}/assets/${index}`,
      blogAssetName: (id: string, index: number) => `${getApiBaseUrl()}/api/blogs/${id}/assets/${index}/name`,
      
      // Documentation
      documentation: `${getApiBaseUrl()}/api/documentation`,
      docById: (id: string) => `${getApiBaseUrl()}/api/documentation/${id}`,
      docCreate: `${getApiBaseUrl()}/api/documentation/create`,
      docUploadAsset: `${getApiBaseUrl()}/api/documentation/upload-asset`,
      docAsset: (id: string, name: string) => `${getApiBaseUrl()}/api/documentation/asset/${id}/${name}`,
      docFiles: (id: string) => `${getApiBaseUrl()}/api/documentation/${id}/files`,
      docFileById: (docId: string, fileId: string) => `${getApiBaseUrl()}/api/documentation/${docId}/files/${fileId}`,
      docAttachments: (id: string) => `${getApiBaseUrl()}/api/documentation/${id}/attachments`,
      docAttachmentsInit: (id: string) => `${getApiBaseUrl()}/api/documentation/${id}/attachments/init`,
      docAttachmentsChunk: (id: string) => `${getApiBaseUrl()}/api/documentation/${id}/attachments/chunk`,
      docAttachmentsComplete: (id: string) => `${getApiBaseUrl()}/api/documentation/${id}/attachments/complete`,
      
      // Notes
      notesFolders: (parentPath: string) => `${getApiBaseUrl()}/api/notes/folders?parentPath=${parentPath}`,
      notesFiles: (folderPath: string) => `${getApiBaseUrl()}/api/notes/files?folderPath=${folderPath}`,
      notesCreateFolder: `${getApiBaseUrl()}/api/notes/folder/create`,
      notesUploadFiles: `${getApiBaseUrl()}/api/notes/files/upload`,
      notesUploadInit: `${getApiBaseUrl()}/api/notes/files/upload/init`,
      notesUploadChunk: `${getApiBaseUrl()}/api/notes/files/upload/chunk`,
      notesUploadFinalize: `${getApiBaseUrl()}/api/notes/files/upload/finalize`,
      notesFileById: (id: string) => `${getApiBaseUrl()}/api/notes/files/${id}`,
      notesFolderById: (id: string) => `${getApiBaseUrl()}/api/notes/folders/${id}`,
      
      // Code
      codeFolders: (parentPath: string) => `${getApiBaseUrl()}/api/code/folders?parentPath=${parentPath}`,
      codeFiles: (folderPath: string) => `${getApiBaseUrl()}/api/code/files?folderPath=${folderPath}`,
      codeCreateFolder: `${getApiBaseUrl()}/api/code/folder/create`,
      codeCreateFile: `${getApiBaseUrl()}/api/code/file/create`,
      codeFileById: (id: string) => `${getApiBaseUrl()}/api/code/files/${id}`,
      codeFileContent: (id: string) => `${getApiBaseUrl()}/api/code/files/${id}/content`,
      codeFolderById: (id: string) => `${getApiBaseUrl()}/api/code/folders/${id}`,
      
      // GitHub Integration
      githubRepos: `${getApiBaseUrl()}/api/github/repos`,
      githubRepoAdd: `${getApiBaseUrl()}/api/github/repos/add`,
      githubRepoById: (id: string) => `${getApiBaseUrl()}/api/github/repos/${id}`,
      githubRepoTree: (id: string, path: string = '') => `${getApiBaseUrl()}/api/github/repos/${id}/tree?path=${encodeURIComponent(path)}`,
      githubRepoFile: (id: string, path: string) => `${getApiBaseUrl()}/api/github/repos/${id}/file?path=${encodeURIComponent(path)}`,
      githubRepoDelete: (id: string) => `${getApiBaseUrl()}/api/github/repos/${id}`,
      
      // Todos
      todos: `${getApiBaseUrl()}/api/todos`,
      todoById: (id: string) => `${getApiBaseUrl()}/api/todos/${id}`,
      todoCreate: `${getApiBaseUrl()}/api/todos/create`,
      
      // Diagrams
      diagrams: `${getApiBaseUrl()}/api/diagrams`,
      diagramById: (id: string) => `${getApiBaseUrl()}/api/diagrams/${id}`,
      
      // Views
      views: `${getApiBaseUrl()}/api/views`,
      viewsStats: `${getApiBaseUrl()}/api/views/stats`,
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
  // If endpoint already starts with http, use it directly
  // Otherwise, build the full URL
  const url = endpoint.startsWith('http') ? endpoint : buildUrl(endpoint);
  return fetch(url, options);
};

export default config;
