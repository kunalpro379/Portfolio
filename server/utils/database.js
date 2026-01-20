import dbConnection from '../config/database.js';

/**
 * Database utility functions using singleton pattern
 * Provides helper methods for common database operations
 */
class DatabaseUtils {
  constructor() {
    this.dbConnection = dbConnection;
  }

  /**
   * Get the singleton instance of DatabaseUtils
   * @returns {DatabaseUtils} The singleton instance
   */
  static getInstance() {
    if (!DatabaseUtils.instance) {
      DatabaseUtils.instance = new DatabaseUtils();
    }
    return DatabaseUtils.instance;
  }

  /**
   * Ensure database connection before performing operations
   * @returns {Promise<mongoose.Connection>} Database connection
   */
  async ensureConnection() {
    if (!this.dbConnection.isConnected()) {
      console.log('Database: Reconnecting...');
      await this.dbConnection.connect();
    }
    return this.dbConnection.connection;
  }

  /**
   * Execute a database operation with automatic connection handling
   * @param {Function} operation - Database operation to execute
   * @param {string} operationName - Name of the operation for logging
   * @returns {Promise<any>} Operation result
   */
  async executeOperation(operation, operationName = 'Database Operation') {
    try {
      // Ensure connection is active
      await this.ensureConnection();
      
      console.log(`Database: Executing ${operationName}`);
      const result = await operation();
      
      return result;
    } catch (error) {
      console.error(`Database: ${operationName} failed:`, error.message);
      throw error;
    }
  }

  /**
   * Get database connection status
   * @returns {object} Connection status information
   */
  getConnectionInfo() {
    return {
      status: this.dbConnection.getConnectionStatus(),
      isConnected: this.dbConnection.isConnected(),
      readyState: this.dbConnection.connection?.readyState || 0
    };
  }

  /**
   * Health check for database connection
   * @returns {Promise<object>} Health check result
   */
  async healthCheck() {
    try {
      await this.ensureConnection();
      
      // Simple ping to test connection
      const admin = this.dbConnection.connection.db.admin();
      const result = await admin.ping();
      
      return {
        status: 'healthy',
        connected: true,
        ping: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Export singleton instance
const databaseUtils = DatabaseUtils.getInstance();
export default databaseUtils;