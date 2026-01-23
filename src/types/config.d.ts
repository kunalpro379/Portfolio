declare module '../../config.shared.js' {
  interface Config {
    NODE_ENV: string;
    API: {
      PRODUCTION_URL: string;
      DEVELOPMENT_URL: string;
      BASE_URL: string;
      ENDPOINTS: {
        projects: string;
        blogs: string;
        documentation: string;
        notes: string;
        code: string;
        todos: string;
        diagrams: string;
        auth: string;
        views: string;
      };
    };
    FRONTEND: {
      PRODUCTION_URL: string;
      DEVELOPMENT_URL: string;
      BASE_URL: string;
    };
    ADMIN: {
      PRODUCTION_URL: string;
      DEVELOPMENT_URL: string;
      BASE_URL: string;
    };
    CORS: {
      ORIGINS: string[];
    };
    AZURE: {
      CONTAINERS: {
        NOTES: string;
        CODE: string;
        DIAGRAMS: string;
      };
    };
    DATABASE: {
      NAME: string;
    };
    SERVER: {
      PORT: number;
    };
  }
  
  const CONFIG: Config;
  export default CONFIG;
}