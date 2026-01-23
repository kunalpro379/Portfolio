declare module '../../../config.shared.js' {
  interface Config {
    API: {
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
  }
  
  const CONFIG: Config;
  export default CONFIG;
}