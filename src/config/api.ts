// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  projects: `${API_BASE_URL}/api/projects`,
  blogs: `${API_BASE_URL}/api/blogs`,
  documentation: `${API_BASE_URL}/api/documentation`,
  notes: `${API_BASE_URL}/api/notes`,
  todos: `${API_BASE_URL}/api/todos`,
};
