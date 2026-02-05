import express from 'express';
import cors from 'cors';
import CONFIG from '../../config.shared.js';

/**
 * Server Configuration Singleton
 * Ensures consistent server setup and configuration across the application
 */
class ServerConfig {
  constructor() {
    this.app = null;
    this.server = null;
    this.isConfigured = false;
  }

  /**
   * Get the singleton instance of ServerConfig
   * @returns {ServerConfig} The singleton instance
   */
  static getInstance() {
    if (!ServerConfig.instance) {
      ServerConfig.instance = new ServerConfig();
    }
    return ServerConfig.instance;
  }

  /**
   * Configure and return the Express application
   * @returns {express.Application} Configured Express app
   */
  getApp() {
    if (!this.app || !this.isConfigured) {
      this.app = this.createApp();
      this.configureMiddleware();
      this.isConfigured = true;
      console.log('Server: Express application configured');
    }
    return this.app;
  }

  /**
   * Create Express application instance
   * @private
   * @returns {express.Application} Express app instance
   */
  createApp() {
    const app = express();
    
    // Trust proxy for proper IP handling in production
    app.set('trust proxy', 1);
    
    return app;
  }

  /**
   * Configure middleware for the Express application
   * @private
   */
  configureMiddleware() {
    if (!this.app) return;

    // CORS Configuration
    this.configureCORS();
    
    // Cache control middleware
    this.configureCacheControl();
    
    // Request logging middleware
    this.configureRequestLogging();
    
    // Body parsing middleware
    this.configureBodyParsing();
    
    // Error handling middleware
    this.configureErrorHandling();
  }

  /**
   * Configure CORS middleware
   * @private
   */
  configureCORS() {
    console.log('Server: Configuring CORS with origins:', CONFIG.CORS.ORIGINS);

    const corsOptions = {
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        // Check if origin is in allowed list
        if (CONFIG.CORS.ORIGINS.includes(origin)) {
          console.log('CORS: Allowing origin:', origin);
          callback(null, true);
        } else {
          console.log('CORS: Blocked origin:', origin);
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Origin', 'X-Requested-With', 'Content-Type', 'Accept', 
        'Authorization', 'Content-Length', 'X-File-Name', 
        'X-File-Size', 'X-File-Type'
      ],
      exposedHeaders: ['Content-Length', 'Content-Type'],
      maxAge: 86400,
      preflightContinue: false,
      optionsSuccessStatus: 204
    };

    this.app.use(cors(corsOptions));
    
    // Additional CORS headers for all responses
    this.app.use((req, res, next) => {
      const origin = req.headers.origin;
      if (origin && CONFIG.CORS.ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Length, X-File-Name, X-File-Size, X-File-Type');
      }
      next();
    });
  }

  /**
   * Configure cache control middleware
   * @private
   */
  configureCacheControl() {
    this.app.use((req, res, next) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      next();
    });
  }

  /**
   * Configure request logging middleware
   * @private
   */
  configureRequestLogging() {
    this.app.use((req, res, next) => {
      const timestamp = new Date().toISOString();
      const logData = {
        method: req.method,
        path: req.path,
        origin: req.headers.origin,
        contentType: req.headers['content-type'],
        contentLength: req.headers['content-length'],
        userAgent: req.headers['user-agent']?.substring(0, 50)
      };
      
      console.log(`[${timestamp}] ${req.method} ${req.path}`, logData);
      next();
    });
  }

  /**
   * Configure body parsing middleware
   * @private
   */
  configureBodyParsing() {
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ limit: '50mb', extended: true }));
  }

  /**
   * Configure error handling middleware
   * @private
   */
  configureErrorHandling() {
    // Global error handler - must be last middleware
    this.app.use((err, req, res, next) => {
      console.error('Server Error:', err);
      
      // Ensure CORS headers are set even on errors
      const origin = req.headers.origin;
      const allowedOrigin = CONFIG.CORS.ORIGINS.includes(origin) ? origin : null;
      
      if (allowedOrigin) {
        res.header('Access-Control-Allow-Origin', allowedOrigin);
        res.header('Access-Control-Allow-Credentials', 'true');
      }
      
      const statusCode = err.status || err.statusCode || 500;
      const message = err.message || 'Internal server error';
      
      res.status(statusCode).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    });
  }

  /**
   * Start the server on specified port
   * @param {number} port - Port number to listen on
   * @returns {Promise<Server>} HTTP server instance
   */
  async startServer(port = CONFIG.SERVER.PORT) {
    return new Promise((resolve, reject) => {
      try {
        // Don't start server in serverless environment
        if (process.env.VERCEL === '1') {
          console.log('Server: Running in serverless mode, skipping port binding');
          resolve(null);
          return;
        }

        if (this.server) {
          console.log('Server: Already running');
          resolve(this.server);
          return;
        }

        this.server = this.app.listen(port, () => {
          console.log(`Server: Running on port ${port}`);
          console.log(`Server: Environment - ${process.env.NODE_ENV || 'development'}`);
          resolve(this.server);
        });

        this.server.on('error', (error) => {
          console.error('Server: Failed to start:', error);
          reject(error);
        });

      } catch (error) {
        console.error('Server: Startup error:', error);
        reject(error);
      }
    });
  }

  /**
   * Stop the server gracefully
   * @returns {Promise<void>}
   */
  async stopServer() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('Server: Stopped gracefully');
          this.server = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Get server status
   * @returns {object} Server status information
   */
  getStatus() {
    return {
      configured: this.isConfigured,
      running: !!this.server,
      port: this.server?.address()?.port || null,
      environment: process.env.NODE_ENV || 'development'
    };
  }
}

// Export singleton instance
const serverConfig = ServerConfig.getInstance();
export default serverConfig;