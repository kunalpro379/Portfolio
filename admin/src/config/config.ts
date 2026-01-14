// API Configuration for Admin Panel
import CONFIG from '../../../config.shared.js';

const config = {
  // API Base URL - from shared config
  api: {
    baseUrl: CONFIG.API.BASE_URL,
    endpoints: {
      // Auth
      auth: CONFIG.API.ENDPOINTS.auth,
      login: `${CONFIG.API.ENDPOINTS.auth}/login`,
      verify: `${CONFIG.API.ENDPOINTS.auth}/verify`,
      
      // Projects
      projects: CONFIG.API.ENDPOINTS.projects,
      projectById: (id: string) => `${CONFIG.API.ENDPOINTS.projects}/${id}`,
      projectMdContent: (id: string) => `${CONFIG.API.ENDPOINTS.projects}/${id}/md-content`,
      projectMdFile: (id: string) => `${CONFIG.API.ENDPOINTS.projects}/${id}/md-file`,
      projectAssets: (id: string) => `${CONFIG.API.ENDPOINTS.projects}/${id}/assets`,
      projectCardAssets: (id: string) => `${CONFIG.API.ENDPOINTS.projects}/${id}/cardassets`,
      projectAssetByIndex: (id: string, index: number) => `${CONFIG.API.ENDPOINTS.projects}/${id}/assets/${index}`,
      projectAssetName: (id: string, index: number) => `${CONFIG.API.ENDPOINTS.projects}/${id}/assets/${index}/name`,
      projectCardAssetByIndex: (id: string, index: number) => `${CONFIG.API.ENDPOINTS.projects}/${id}/cardassets/${index}`,
      
      // Blogs
      blogs: CONFIG.API.ENDPOINTS.blogs,
      blogById: (id: string) => `${CONFIG.API.ENDPOINTS.blogs}/${id}`,
      blogMdContent: (id: string) => `${CONFIG.API.ENDPOINTS.blogs}/${id}/md-content`,
      blogMdFile: (id: string) => `${CONFIG.API.ENDPOINTS.blogs}/${id}/md-file`,
      blogAssets: (id: string) => `${CONFIG.API.ENDPOINTS.blogs}/${id}/assets`,
      blogCover: (id: string) => `${CONFIG.API.ENDPOINTS.blogs}/${id}/cover`,
      blogAssetByIndex: (id: string, index: number) => `${CONFIG.API.ENDPOINTS.blogs}/${id}/assets/${index}`,
      blogAssetName: (id: string, index: number) => `${CONFIG.API.ENDPOINTS.blogs}/${id}/assets/${index}/name`,
      
      // Documentation
      documentation: CONFIG.API.ENDPOINTS.documentation,
      docById: (id: string) => `${CONFIG.API.ENDPOINTS.documentation}/${id}`,
      docUploadAsset: `${CONFIG.API.ENDPOINTS.documentation}/upload-asset`,
      docAsset: (id: string, name: string) => `${CONFIG.API.ENDPOINTS.documentation}/asset/${id}/${name}`,
      
      // Notes
      notesFolders: (parentPath: string) => `${CONFIG.API.ENDPOINTS.notes}/folders?parentPath=${parentPath}`,
      notesFiles: (folderPath: string) => `${CONFIG.API.ENDPOINTS.notes}/files?folderPath=${folderPath}`,
      notesCreateFolder: `${CONFIG.API.ENDPOINTS.notes}/folder/create`,
      notesUploadFiles: `${CONFIG.API.ENDPOINTS.notes}/files/upload`,
      notesUploadInit: `${CONFIG.API.ENDPOINTS.notes}/files/upload/init`,
      notesUploadChunk: `${CONFIG.API.ENDPOINTS.notes}/files/upload/chunk`,
      notesUploadFinalize: `${CONFIG.API.ENDPOINTS.notes}/files/upload/finalize`,
      notesFileById: (id: string) => `${CONFIG.API.ENDPOINTS.notes}/files/${id}`,
      notesFolderById: (id: string) => `${CONFIG.API.ENDPOINTS.notes}/folders/${id}`,
      
      // Todos
      todos: CONFIG.API.ENDPOINTS.todos,
      todoById: (id: string) => `${CONFIG.API.ENDPOINTS.todos}/${id}`,
      todoCreate: `${CONFIG.API.ENDPOINTS.todos}/create`,
      
      // Diagrams
      diagrams: CONFIG.API.ENDPOINTS.diagrams,
      diagramById: (id: string) => `${CONFIG.API.ENDPOINTS.diagrams}/${id}`,
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
