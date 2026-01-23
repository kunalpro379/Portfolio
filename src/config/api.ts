import CONFIG from '../../config.shared.js';

// API Configuration
export const API_BASE_URL = CONFIG.API.BASE_URL;

export const API_ENDPOINTS = {
  projects: `${API_BASE_URL}${CONFIG.API.ENDPOINTS.projects}`,
  blogs: `${API_BASE_URL}${CONFIG.API.ENDPOINTS.blogs}`,
  documentation: `${API_BASE_URL}${CONFIG.API.ENDPOINTS.documentation}`,
  notes: `${API_BASE_URL}${CONFIG.API.ENDPOINTS.notes}`,
  code: `${API_BASE_URL}${CONFIG.API.ENDPOINTS.code}`,
  todos: `${API_BASE_URL}${CONFIG.API.ENDPOINTS.todos}`,
  diagrams: `${API_BASE_URL}${CONFIG.API.ENDPOINTS.diagrams}`,
};
