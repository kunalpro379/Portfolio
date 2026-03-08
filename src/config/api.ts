// API Configuration for client-side
const getApiBaseUrl = (): string => {
  // Check if we're in development (localhost)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // If running on localhost, use local backend
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }
  
  // For production/deployed version, use production API
  return 'https://api.kunalpatil.me';
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  ENDPOINTS: {
    AI_CHAT: '/api/ai-chat',
    HEALTH: '/api/ai-chat/health',
    CAPABILITIES: '/api/ai-chat/capabilities',
  }
};

// Export API_BASE_URL for backward compatibility
export const API_BASE_URL = getApiBaseUrl();

// Export API_ENDPOINTS for backward compatibility
export const API_ENDPOINTS = {
  projects: '/api/projects',
  blogs: '/api/blogs',
  documentation: '/api/documentation',
  notes: '/api/notes',
  code: '/api/code',
  todos: '/api/todos',
  diagrams: '/api/diagrams',
  auth: '/api/auth',
  views: '/api/views',
  github: {
    repos: '/api/github/repos',
    repoTree: (repoId: string, path: string = '') => `/api/github/repos/${repoId}/tree${path ? `?path=${encodeURIComponent(path)}` : ''}`,
    repoFile: (repoId: string, path: string) => `/api/github/repos/${repoId}/file?path=${encodeURIComponent(path)}`
  },
  aiChat: '/api/ai-chat',
};

export default API_CONFIG;