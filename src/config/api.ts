// @ts-ignore
import CONFIG from '../../config.shared.js';

// API Configuration - always use production API
export const API_BASE_URL = 'https://api.kunalpatil.me';

export const API_ENDPOINTS = {
  projects: `https://api.kunalpatil.me/api/projects`,
  blogs: `https://api.kunalpatil.me/api/blogs`,
  documentation: `https://api.kunalpatil.me/api/documentation`,
  notes: `https://api.kunalpatil.me/api/notes`,
  code: `https://api.kunalpatil.me/api/code`,
  todos: `https://api.kunalpatil.me/api/todos`,
  diagrams: `https://api.kunalpatil.me/api/diagrams`,
  github: {
    repos: `https://api.kunalpatil.me/api/github/repos`,
    repoById: (id: string) => `https://api.kunalpatil.me/api/github/repos/${id}`,
    repoTree: (id: string, path: string = '') => `https://api.kunalpatil.me/api/github/repos/${id}/tree?path=${encodeURIComponent(path)}`,
    repoFile: (id: string, path: string) => `https://api.kunalpatil.me/api/github/repos/${id}/file?path=${encodeURIComponent(path)}`,
  },
};
