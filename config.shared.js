/**
 * Shared Configuration File
 * This file is used by client, admin, and server projects
 * Change API URLs here and it will reflect everywhere
 */

const CONFIG = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // API Configuration
  API: {
    // Production API URL
    PRODUCTION_URL: 'https://api.kunalpatil.me',
    
    // Development API URL
    DEVELOPMENT_URL: 'https://api.kunalpatil.me',
    
    // Get current API URL based on environment
    get BASE_URL() {
      // Check if running in browser
      if (typeof window !== 'undefined') {
        // Browser environment - check hostname
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          return this.DEVELOPMENT_URL;
        }
        return this.PRODUCTION_URL;
      }
      
      // Node environment - check NODE_ENV
      return this.NODE_ENV === 'production' ? this.PRODUCTION_URL : this.DEVELOPMENT_URL;
    },
    
    // API Endpoints
    ENDPOINTS: {
      projects: '/api/projects',
      blogs: '/api/blogs',
      documentation: '/api/documentation',
      notes: '/api/notes',
      code: '/api/code',
      todos: '/api/todos',
      diagrams: '/api/diagrams',
      auth: '/api/auth',
      views: '/api/views',
    }
  },
  
  // Frontend URLs
  FRONTEND: {
    PRODUCTION_URL: 'https://www.kunalpatil.me',
    DEVELOPMENT_URL: 'http://localhost:3002',
    
    get BASE_URL() {
      if (typeof window !== 'undefined') {
        return window.location.origin;
      }
      return this.NODE_ENV === 'production' ? this.PRODUCTION_URL : this.DEVELOPMENT_URL;
    }
  },
  
  // Admin URLs
  ADMIN: {
    PRODUCTION_URL: 'https://admin.kunalpatil.me',
    DEVELOPMENT_URL: 'http://localhost:3001',
    
    get BASE_URL() {
      if (typeof window !== 'undefined') {
        return window.location.origin;
      }
      return this.NODE_ENV === 'production' ? this.PRODUCTION_URL : this.DEVELOPMENT_URL;
    }
  },
  
  // CORS Origins (for server)
  CORS: {
    ORIGINS: [
      'https://kunalpatil.me',
      'https://www.kunalpatil.me',
      'https://admin.kunalpatil.me',
      'https://www.admin.kunalpatil.me',
      'http://localhost:5173',
      'http://localhost:3001',
      'http://localhost:3002',
    ]
  },
  
  // Azure Configuration
  AZURE: {
    CONTAINERS: {
      NOTES: 'notes',
      CODE: 'code',
      DIAGRAMS: 'diagrams',
    }
  },
  
  // MongoDB Configuration
  DATABASE: {
    NAME: 'Portfolio'
  },
  
  // Server Configuration
  SERVER: {
    PORT: process.env.PORT || 5000,
  }
};

// Export for CommonJS (Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}

// Export for ES6 (Browser/Vite)
if (typeof window !== 'undefined') {
  window.APP_CONFIG = CONFIG;
}

// Default export
export default CONFIG;
