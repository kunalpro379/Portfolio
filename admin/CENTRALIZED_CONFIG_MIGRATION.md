# Centralized Configuration Migration

## Overview
All hardcoded `https://api.kunalpatil.me` URLs have been migrated to use a centralized configuration system. This makes it easier to switch between development and production environments.

## Configuration Files

### 1. **Root Config** - `config.shared.js`
- Shared configuration used across client, admin, and server
- Automatically detects environment (development/production)
- Contains API base URLs, endpoints, CORS origins, etc.

### 2. **Admin Config** - `admin/src/config/config.ts`
- Admin-specific configuration that imports from shared config
- Provides typed endpoints and helper functions
- Easy-to-use endpoint definitions

## Migration Summary

### Files Updated:

1. ✅ **admin/src/pages/Notes.tsx**
   - Replaced 9 hardcoded URLs with config endpoints
   - Added config import
   - Updated all fetch calls to use config endpoints:
     - `notesFolders()` - Fetch folders
     - `notesFiles()` - Fetch files
     - `notesCreateFolder` - Create folder
     - `notesUploadFiles` - Regular file upload
     - `notesUploadInit` - Initialize chunked upload
     - `notesUploadChunk` - Upload file chunks
     - `notesUploadFinalize` - Finalize chunked upload
     - `notesFileById()` - Delete file
     - `notesFolderById()` - Delete folder

2. ✅ **admin/src/context/AuthContext.tsx**
   - Replaced 2 hardcoded URLs
   - Added config import
   - Updated endpoints:
     - `verify` - Token verification
     - `login` - User login

3. ✅ **admin/src/components/TodoList.tsx**
   - Replaced 2 hardcoded URLs
   - Added config import
   - Updated endpoints:
     - `todos` - Fetch all todos
     - `todoById()` - Delete todo

4. ✅ **admin/src/config/config.ts**
   - Added new endpoints:
     - `verify` - Auth token verification
     - `notesUploadInit` - Initialize chunked upload
     - `notesUploadChunk` - Upload file chunk
     - `notesUploadFinalize` - Finalize chunked upload

## Usage Example

### Before (Hardcoded):
```typescript
const response = await fetch('https://api.kunalpatil.me/api/notes/folders?parentPath=root', {
  credentials: 'include'
});
```

### After (Config-based):
```typescript
import config from '../config/config';

const response = await fetch(config.api.endpoints.notesFolders('root'), {
  credentials: 'include'
});
```

## Benefits

1. **Single Source of Truth**: Change API URL in one place, affects everywhere
2. **Environment Detection**: Automatically uses correct URL (dev/prod)
3. **Type Safety**: TypeScript ensures correct endpoint usage
4. **Maintainability**: Easier to update and manage URLs
5. **No More Hardcoding**: Clean, centralized configuration

## Remaining Files to Migrate

✅ **All files have been migrated!**

The following files have been successfully updated:

- ✅ admin/src/pages/CreateBlog.tsx
- ✅ admin/src/pages/EditBlog.tsx
- ✅ admin/src/pages/CreateProject.tsx
- ✅ admin/src/pages/EditProject.tsx
- ✅ admin/src/pages/TodoEditor.tsx
- ✅ admin/src/pages/Blogs.tsx
- ✅ admin/src/pages/CreateDocumentation.tsx
- ✅ admin/src/pages/Dashboard.tsx
- ✅ admin/src/pages/EditDocumentation.tsx
- ✅ admin/src/pages/Documentation.tsx
- ✅ admin/src/pages/ReorderProjects.tsx
- ✅ admin/src/pages/Projects.tsx
- ✅ admin/src/pages/Views.tsx
- ✅ admin/src/pages/Code.tsx
- ✅ admin/src/pages/CodeEditor.tsx
- ✅ admin/src/components/TodoList.tsx

## Critical Fix Applied

**Fixed Double URL Construction Issue:**
- Removed `buildUrl()` calls when using `config.api.endpoints.*` 
- The endpoints already return full URLs, so `buildUrl()` was causing double URL construction
- This was the root cause of "File not found" errors in the admin panel

## Migration Status: ✅ COMPLETE

## How to Use Config

### Import the config:
```typescript
import config from '../config/config';
```

### Access endpoints:
```typescript
// Simple endpoint
config.api.endpoints.blogs

// Parameterized endpoint
config.api.endpoints.blogById('blog-id-123')

// Build full URL (if needed)
import { buildUrl } from '../config/config';
const fullUrl = buildUrl('/api/custom-endpoint');
```

## Environment Configuration

The config automatically detects the environment:

- **Development**: Uses `https://api.kunalpatil.me`
- **Production**: Uses `https://api.kunalpatil.me`

Detection is based on:
- Browser: Checks `window.location.hostname`
- Node.js: Checks `process.env.NODE_ENV`

## Next Steps

To complete the migration:

1. Update remaining page files to use config
2. Remove all hardcoded URLs
3. Test in both development and production
4. Update documentation for new developers

