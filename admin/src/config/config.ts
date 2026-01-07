// API Configuration for Admin Panel

const config = {
  // API Base URL
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://api.kunalpatil.me',
    endpoints: {
      // Auth
      auth: '/api/auth',
      login: '/api/auth/login',
      
      // Projects
      projects: '/api/projects',
      projectById: (id: string) => `/api/projects/${id}`,
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
      blogMdContent: (id: string) => `/api/blogs/${id}/md-content`,
      blogMdFile: (id: string) => `/api/blogs/${id}/md-file`,
      blogAssets: (id: string) => `/api/blogs/${id}/assets`,
      blogCover: (id: string) => `/api/blogs/${id}/cover`,
      blogAssetByIndex: (id: string, index: number) => `/api/blogs/${id}/assets/${index}`,
      blogAssetName: (id: string, index: number) => `/api/blogs/${id}/assets/${index}/name`,
      
      // Documentation
      documentation: '/api/documentation',
      docById: (id: string) => `/api/documentation/${id}`,
      docUploadAsset: '/api/documentation/upload-asset',
      docAsset: (id: string, name: string) => `/api/documentation/asset/${id}/${name}`,
      
      // Notes
      notesFolders: (parentPath: string) => `/api/notes/folders?parentPath=${parentPath}`,
      notesFiles: (folderPath: string) => `/api/notes/files?folderPath=${folderPath}`,
      notesCreateFolder: '/api/notes/folder/create',
      notesUploadFiles: '/api/notes/files/upload',
      notesFileById: (id: string) => `/api/notes/files/${id}`,
      notesFolderById: (id: string) => `/api/notes/folders/${id}`,
      
      // Todos
      todos: '/api/todos',
      todoById: (id: string) => `/api/todos/${id}`,
      todoCreate: '/api/todos/create',
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
