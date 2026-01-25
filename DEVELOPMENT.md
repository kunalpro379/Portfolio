# Development Setup Guide

## Quick Start

### 1. Check Server Status
```bash
node check-server.js
```

### 2. Start Local Server
```bash
# Option 1: Start server only
cd server
npm run dev

# Option 2: Use the helper script
npm run start-server
```

### 3. Start Admin Panel
```bash
# In a new terminal
cd admin
npm run dev
```

### 4. Access the Application
- **Admin Panel**: http://localhost:5173
- **API Server**: http://localhost:5000
- **Main Portfolio**: http://localhost:3001

## Environment Configuration

The admin panel automatically detects the environment:

- **Development** (localhost): Uses `http://localhost:5000`
- **Production**: Uses `https://api.kunalpatil.me`

## Troubleshooting

### ERR_NAME_NOT_RESOLVED Error
This means the production server is not accessible. Solutions:

1. **Use Local Development**:
   ```bash
   cd server
   npm run dev
   ```

2. **Check Server Status**:
   ```bash
   node check-server.js
   ```

3. **Verify Environment**:
   - Admin panel should show "DEV" badge when running locally
   - Check browser console for API calls to `localhost:5000`

### Knowledge Base 503 Errors
If you see 503 errors for knowledge base:

1. **Check if server is running**:
   ```bash
   curl http://localhost:5000/api/knowledge-base/test
   ```

2. **Check server logs** for any import errors

3. **Test basic routes**:
   ```bash
   curl http://localhost:5000/api/health
   ```

## Environment Variables

Create `.env` files in both `server/` and `admin/` directories:

### Server (.env)
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your-secret-key
AZURE_STORAGE_CONNECTION_STRING=your_azure_connection
GROQ_API_KEY=your_groq_api_key
```

### Admin (.env)
```env
VITE_API_BASE_URL=http://localhost:5000
```

## Features Status

- ✅ **Basic Admin Panel**: Working
- ✅ **Authentication**: Working with fallback
- ✅ **Projects/Blogs/Docs**: Working
- ✅ **Knowledge Base**: Working with graceful degradation
- ⚠️ **Vector Database**: Optional (requires Qdrant setup)
- ⚠️ **Azure Storage**: Optional (falls back to local storage)

## Development Workflow

1. **Start Server**: `cd server && npm run dev`
2. **Start Admin**: `cd admin && npm run dev`
3. **Make Changes**: Files auto-reload
4. **Test Features**: Use admin panel at localhost:5173
5. **Check Logs**: Monitor server terminal for errors

## Production Deployment

The configuration automatically switches to production URLs when deployed.
No code changes needed for deployment.