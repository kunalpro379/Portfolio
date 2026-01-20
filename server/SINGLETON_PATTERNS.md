# Singleton Patterns Implementation

This document explains the singleton patterns implemented for database connections and server configuration in the portfolio application.

## Overview

The singleton pattern ensures that only one instance of a class exists throughout the application lifecycle. This is particularly useful for:

- **Database connections**: Preventing multiple MongoDB connections
- **Server configuration**: Ensuring consistent Express app setup
- **Resource management**: Optimizing memory usage and connection pooling

## Database Singleton (`server/config/database.js`)

### Features

- **Single connection instance**: Prevents multiple MongoDB connections
- **Connection state management**: Tracks connection status and handles reconnections
- **Automatic reconnection**: Handles connection drops gracefully
- **Event listeners**: Monitors connection events for debugging
- **Serverless compatibility**: Works with both traditional servers and serverless environments

### Usage

```javascript
import dbConnection from './config/database.js';

// Connect to database (returns existing connection if already connected)
await dbConnection.connect();

// Check connection status
const isConnected = dbConnection.isConnected();
const status = dbConnection.getConnectionStatus();

// Disconnect (usually not needed, handled automatically)
await dbConnection.disconnect();
```

### Database Utils (`server/utils/database.js`)

Helper utilities that use the database singleton:

```javascript
import databaseUtils from '../utils/database.js';

// Execute database operations with automatic connection handling
const result = await databaseUtils.executeOperation(async () => {
  return await SomeModel.find({});
}, 'Fetch all records');

// Health check
const health = await databaseUtils.healthCheck();
```

## Server Singleton (`server/config/server.js`)

### Features

- **Single Express app instance**: Ensures consistent middleware setup
- **CORS configuration**: Centralized CORS handling
- **Middleware management**: Consistent middleware application
- **Error handling**: Global error handling middleware
- **Serverless compatibility**: Handles both traditional and serverless deployments

### Usage

```javascript
import serverConfig from './config/server.js';

// Get configured Express app (creates and configures if first time)
const app = serverConfig.getApp();

// Start server (only in non-serverless environments)
await serverConfig.startServer(port);

// Get server status
const status = serverConfig.getStatus();

// Stop server gracefully
await serverConfig.stopServer();
```

## Implementation in Routes

### Before (Traditional Approach)

```javascript
import express from 'express';
import SomeModel from '../models/SomeModel.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await SomeModel.find({});
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### After (Singleton Approach)

```javascript
import express from 'express';
import SomeModel from '../models/SomeModel.js';
import databaseUtils from '../utils/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await databaseUtils.executeOperation(async () => {
      return await SomeModel.find({});
    }, 'Fetch all records');
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

## Health Check Endpoints

The application includes comprehensive health check endpoints:

- `GET /api/health` - Overall system health
- `GET /api/health/database` - Database-specific health
- `GET /api/health/server` - Server-specific status

### Example Health Response

```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "uptime": 3600,
  "server": {
    "configured": true,
    "running": true,
    "port": 5000
  },
  "database": {
    "status": "healthy",
    "connected": true,
    "connectionStatus": "connected"
  }
}
```

## Benefits

### 1. **Resource Efficiency**
- Single database connection prevents connection pool exhaustion
- Reduced memory footprint
- Better connection management

### 2. **Consistency**
- Uniform middleware application across all routes
- Consistent error handling
- Standardized CORS configuration

### 3. **Reliability**
- Automatic reconnection handling
- Connection state monitoring
- Graceful error recovery

### 4. **Maintainability**
- Centralized configuration
- Easy to modify connection settings
- Clear separation of concerns

### 5. **Debugging**
- Comprehensive logging
- Health check endpoints
- Connection status monitoring

## Best Practices

### 1. **Always Use Database Utils**
```javascript
// Good
const data = await databaseUtils.executeOperation(async () => {
  return await Model.find({});
}, 'Operation description');

// Avoid direct model calls without connection checking
const data = await Model.find({}); // May fail if connection is lost
```

### 2. **Handle Errors Gracefully**
```javascript
try {
  const result = await databaseUtils.executeOperation(operation, 'Description');
  res.json({ success: true, data: result });
} catch (error) {
  console.error('Operation failed:', error);
  res.status(500).json({ success: false, error: error.message });
}
```

### 3. **Use Health Checks**
- Monitor `/api/health` endpoint for system status
- Set up alerts based on health check responses
- Use database-specific health checks for detailed diagnostics

### 4. **Environment Considerations**
- Singletons automatically handle serverless vs traditional server environments
- No code changes needed for different deployment types
- Connection pooling optimized for each environment

## Migration Guide

To migrate existing routes to use singleton patterns:

1. **Import database utils**:
   ```javascript
   import databaseUtils from '../utils/database.js';
   ```

2. **Wrap database operations**:
   ```javascript
   const result = await databaseUtils.executeOperation(async () => {
     // Your existing database code here
     return await Model.find({});
   }, 'Operation description');
   ```

3. **Remove direct mongoose connection handling**:
   - Remove manual connection checks
   - Remove custom reconnection logic
   - Let the singleton handle connection management

4. **Update error handling**:
   - Use consistent error response format
   - Log errors appropriately
   - Return meaningful error messages

## Troubleshooting

### Connection Issues
- Check `/api/health/database` endpoint
- Review connection logs in console
- Verify environment variables (MONGODB_URI)

### Server Issues
- Check `/api/health/server` endpoint
- Review server configuration logs
- Verify port availability

### Performance Issues
- Monitor connection pool usage
- Check for connection leaks
- Review database operation logs

## Future Enhancements

- Connection pool size optimization
- Advanced retry mechanisms
- Metrics collection and monitoring
- Connection caching strategies
- Load balancing support