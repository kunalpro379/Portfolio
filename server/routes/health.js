import express from 'express';
import databaseUtils from '../utils/database.js';
import serverConfig from '../config/server.js';

const router = express.Router();

/**
 * Health check endpoint using singleton patterns
 * Provides comprehensive system status information
 */
router.get('/', async (req, res) => {
  try {
    const timestamp = new Date().toISOString();
    
    // Get server status from singleton
    const serverStatus = serverConfig.getStatus();
    
    // Get database health from singleton
    const databaseHealth = await databaseUtils.healthCheck();
    
    // Get database connection info
    const connectionInfo = databaseUtils.getConnectionInfo();
    
    // Overall health status
    const isHealthy = databaseHealth.connected && serverStatus.configured;
    
    const healthReport = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp,
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      server: {
        configured: serverStatus.configured,
        running: serverStatus.running,
        port: serverStatus.port,
        environment: serverStatus.environment
      },
      database: {
        status: databaseHealth.status,
        connected: databaseHealth.connected,
        connectionStatus: connectionInfo.status,
        readyState: connectionInfo.readyState,
        lastPing: databaseHealth.timestamp
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      },
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid
      }
    };
    
    // Set appropriate HTTP status code
    const statusCode = isHealthy ? 200 : 503;
    
    res.status(statusCode).json(healthReport);
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Health check failed',
      error: error.message
    });
  }
});

/**
 * Database-specific health check endpoint
 */
router.get('/database', async (req, res) => {
  try {
    const databaseHealth = await databaseUtils.healthCheck();
    const connectionInfo = databaseUtils.getConnectionInfo();
    
    const dbStatus = {
      ...databaseHealth,
      connectionInfo,
      details: {
        readyStates: {
          0: 'disconnected',
          1: 'connected',
          2: 'connecting',
          3: 'disconnecting'
        },
        currentState: connectionInfo.readyState
      }
    };
    
    const statusCode = databaseHealth.connected ? 200 : 503;
    res.status(statusCode).json(dbStatus);
    
  } catch (error) {
    console.error('Database health check failed:', error);
    
    res.status(503).json({
      status: 'error',
      connected: false,
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * Server-specific status endpoint
 */
router.get('/server', (req, res) => {
  try {
    const serverStatus = serverConfig.getStatus();
    
    const status = {
      ...serverStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      versions: process.versions
    };
    
    res.json(status);
    
  } catch (error) {
    console.error('Server status check failed:', error);
    
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

export default router;