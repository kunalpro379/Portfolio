// API Configuration for Admin Panel
// @ts-ignore
import CONFIG from '../../../config.shared.js';

const config = {
  // API Base URL - always use production API
  api: {
    baseUrl: 'https://api.kunalpatil.me',
    endpoints: {
      // Auth
      auth: `https://api.kunalpatil.me/api/auth`,
      login: `https://api.kunalpatil.me/api/auth/login`,
      verify: `https://api.kunalpatil.me/api/auth/verify`,
      
      // Projects
      projects: `https://api.kunalpatil.me/api/projects`,
      projectById: (id: string) => `https://api.kunalpatil.me/api/projects/${id}`,
      projectCreate: `https://api.kunalpatil.me/api/projects/create`,
      projectReorder: `https://api.kunalpatil.me/api/projects/reorder`,
      projectMdContent: (id: string) => `https://api.kunalpatil.me/api/projects/${id}/md-content`,
      projectMdFile: (id: string) => `https://api.kunalpatil.me/api/projects/${id}/md-file`,
      projectAssets: (id: string) => `https://api.kunalpatil.me/api/projects/${id}/assets`,
      projectCardAssets: (id: string) => `https://api.kunalpatil.me/api/projects/${id}/cardassets`,
      projectAssetByIndex: (id: string, index: number) => `https://api.kunalpatil.me/api/projects/${id}/assets/${index}`,
      projectAssetName: (id: string, index: number) => `https://api.kunalpatil.me/api/projects/${id}/assets/${index}/name`,
      projectCardAssetByIndex: (id: string, index: number) => `https://api.kunalpatil.me/api/projects/${id}/cardassets/${index}`,
      
      // Blogs
      blogs: `https://api.kunalpatil.me/api/blogs`,
      blogById: (id: string) => `https://api.kunalpatil.me/api/blogs/${id}`,
      blogCreate: `https://api.kunalpatil.me/api/blogs/create`,
      blogMdContent: (id: string) => `https://api.kunalpatil.me/api/blogs/${id}/md-content`,
      blogMdFile: (id: string) => `https://api.kunalpatil.me/api/blogs/${id}/md-file`,
      blogAssets: (id: string) => `https://api.kunalpatil.me/api/blogs/${id}/assets`,
      blogCover: (id: string) => `https://api.kunalpatil.me/api/blogs/${id}/cover`,
      blogAssetByIndex: (id: string, index: number) => `https://api.kunalpatil.me/api/blogs/${id}/assets/${index}`,
      blogAssetName: (id: string, index: number) => `https://api.kunalpatil.me/api/blogs/${id}/assets/${index}/name`,
      
      // Documentation
      documentation: `https://api.kunalpatil.me/api/documentation`,
      docById: (id: string) => `https://api.kunalpatil.me/api/documentation/${id}`,
      docCreate: `https://api.kunalpatil.me/api/documentation/create`,
      docUploadAsset: `https://api.kunalpatil.me/api/documentation/upload-asset`,
      docAsset: (id: string, name: string) => `https://api.kunalpatil.me/api/documentation/asset/${id}/${name}`,
      docFiles: (id: string) => `https://api.kunalpatil.me/api/documentation/${id}/files`,
      docFileById: (docId: string, fileId: string) => `https://api.kunalpatil.me/api/documentation/${docId}/files/${fileId}`,
      docAttachments: (id: string) => `https://api.kunalpatil.me/api/documentation/${id}/attachments`,
      docAttachmentsInit: (id: string) => `https://api.kunalpatil.me/api/documentation/${id}/attachments/init`,
      docAttachmentsChunk: (id: string) => `https://api.kunalpatil.me/api/documentation/${id}/attachments/chunk`,
      docAttachmentsComplete: (id: string) => `https://api.kunalpatil.me/api/documentation/${id}/attachments/complete`,
      
      // Notes
      notesFolders: (parentPath: string) => `https://api.kunalpatil.me/api/notes/folders?parentPath=${parentPath}`,
      notesFiles: (folderPath: string) => `https://api.kunalpatil.me/api/notes/files?folderPath=${folderPath}`,
      notesCreateFolder: `https://api.kunalpatil.me/api/notes/folder/create`,
      notesUploadFiles: `https://api.kunalpatil.me/api/notes/files/upload`,
      notesUploadInit: `https://api.kunalpatil.me/api/notes/files/upload/init`,
      notesUploadChunk: `https://api.kunalpatil.me/api/notes/files/upload/chunk`,
      notesUploadFinalize: `https://api.kunalpatil.me/api/notes/files/upload/finalize`,
      notesFileById: (id: string) => `https://api.kunalpatil.me/api/notes/files/${id}`,
      notesFolderById: (id: string) => `https://api.kunalpatil.me/api/notes/folders/${id}`,
      
      // Code
      codeFolders: (parentPath: string) => `https://api.kunalpatil.me/api/code/folders?parentPath=${parentPath}`,
      codeFiles: (folderPath: string) => `https://api.kunalpatil.me/api/code/files?folderPath=${folderPath}`,
      codeCreateFolder: `https://api.kunalpatil.me/api/code/folder/create`,
      codeCreateFile: `https://api.kunalpatil.me/api/code/file/create`,
      codeFileById: (id: string) => `https://api.kunalpatil.me/api/code/files/${id}`,
      codeFileContent: (id: string) => `https://api.kunalpatil.me/api/code/files/${id}/content`,
      codeFolderById: (id: string) => `https://api.kunalpatil.me/api/code/folders/${id}`,
      
      // GitHub Integration
      githubRepos: `https://api.kunalpatil.me/api/github/repos`,
      githubRepoAdd: `https://api.kunalpatil.me/api/github/repos/add`,
      githubRepoById: (id: string) => `https://api.kunalpatil.me/api/github/repos/${id}`,
      githubRepoTree: (id: string, path: string = '') => `https://api.kunalpatil.me/api/github/repos/${id}/tree?path=${encodeURIComponent(path)}`,
      githubRepoFile: (id: string, path: string) => `https://api.kunalpatil.me/api/github/repos/${id}/file?path=${encodeURIComponent(path)}`,
      githubRepoDelete: (id: string) => `https://api.kunalpatil.me/api/github/repos/${id}`,
      
      // Todos
      todos: `https://api.kunalpatil.me/api/todos`,
      todoById: (id: string) => `https://api.kunalpatil.me/api/todos/${id}`,
      todoCreate: `https://api.kunalpatil.me/api/todos/create`,
      
      // Diagrams
      diagrams: `https://api.kunalpatil.me/api/diagrams`,
      diagramById: (id: string) => `https://api.kunalpatil.me/api/diagrams/${id}`,
      
      // Views
      views: `https://api.kunalpatil.me/api/views`,
      viewsStats: `https://api.kunalpatil.me/api/views/stats`,
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
