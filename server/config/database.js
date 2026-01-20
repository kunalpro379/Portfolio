import mongoose from 'mongoose';
import CONFIG from '../../config.shared.js';

/**
 * Database Connection Singleton
 * Ensures only one MongoDB connection instance exists throughout the application lifecycle
 */
class DatabaseConnection {
  constructor() {
    this.connection = null;
    this.isConnecting = false;
    this.connectionAttempts = 0;
    this.connectionReuses = 0;
  }

  /**
   * Get the singleton instance of DatabaseConnection
   * @returns {DatabaseConnection} The singleton instance
   */
  static getInstance() {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  /**
   * Connect to MongoDB using singleton pattern
   * @returns {Promise<mongoose.Connection>} The MongoDB connection
   */
  async connect() {
    // Return existing connection if already connected
    if (this.connection && mongoose.connection.readyState === 1) {
      console.log('MongoDB: Using existing connection');
      return this.connection;
    }

    // Prevent multiple simultaneous connection attempts
    if (this.isConnecting) {
      console.log('MongoDB: Connection attempt already in progress, waiting...');
      // Wait for the current connection attempt to complete
      while (this.isConnecting) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.connection;
    }

    try {
      this.isConnecting = true;
      console.log('MongoDB: Establishing new connection...');

      // Connection options for better reliability
      const options = {
        dbName: CONFIG.DATABASE.NAME,
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        bufferMaxEntries: 0, // Disable mongoose buffering
        bufferCommands: false, // Disable mongoose buffering
      };

      // Connect to MongoDB
      await mongoose.connect(process.env.MONGODB_URI, options);
      
      this.connection = mongoose.connection;
      
      // Set up connection event listeners
      this.setupEventListeners();
      
      console.log(`MongoDB: Successfully connected to ${CONFIG.DATABASE.NAME} database`);
      return this.connection;

    } catch (error) {
      console.error('MongoDB: Connection failed:', error.message);
      this.connection = null;
      
      // Don't exit in serverless environment
      if (process.env.VERCEL !== '1') {
        throw error;
      }
      
      return null;
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Set up MongoDB connection event listeners
   * @private
   */
  setupEventListeners() {
    if (!this.connection) return;

    // Connection successful
    this.connection.on('connected', () => {
      console.log('MongoDB: Connection established');
    });

    // Connection error
    this.connection.on('error', (error) => {
      console.error('MongoDB: Connection error:', error);
    });

    // Connection disconnected
    this.connection.on('disconnected', () => {
      console.log('MongoDB: Connection disconnected');
      this.connection = null;
    });

    // Connection reconnected
    this.connection.on('reconnected', () => {
      console.log('MongoDB: Connection reconnected');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  /**
   * Disconnect from MongoDB
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (this.connection && mongoose.connection.readyState === 1) {
      try {
        await mongoose.disconnect();
        console.log('MongoDB: Connection closed');
        this.connection = null;
      } catch (error) {
        console.error('MongoDB: Error during disconnection:', error);
      }
    }
  }

  /**
   * Get the current connection status
   * @returns {string} Connection status
   */
  getConnectionStatus() {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    return states[mongoose.connection.readyState] || 'unknown';
  }

  /**
   * Check if database is connected
   * @returns {boolean} True if connected
   */
  isConnected() {
    return mongoose.connection.readyState === 1;
  }
}

// Export singleton instance
const dbConnection = DatabaseConnection.getInstance();
export default dbConnection;