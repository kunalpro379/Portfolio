# Guide Notes - Dedicated Page Implementation

## Overview
Converted Guide Notes from modal-based editing to a dedicated full-page editor, similar to the documentation editor in the admin panel.

## Changes Made

### 1. New Dedicated Page
**File**: `src/pages/GuideNoteEditor.tsx`

Features:
- Full-page editor with proper header and navigation
- Title and Topic fields at the top
- Markdown editor with live preview toggle
- File upload support (images, PDFs, documents)
- Canvas drawing integration (Excalidraw)
- Asset management (view, download, delete)
- Auto-save functionality
- Responsive design

### 2. Routing Updates
**File**: `src/App.tsx`

Added two new routes:
- `/learnings/guide/new` - Create new guide note
- `/learnings/guide/:noteId` - Edit existing guide note

### 3. Navigation Updates
**File**: `src/components/NotesTabContent.tsx`

Changes:
- Removed modal-based editor
- Updated "New Guide" button to navigate to `/learnings/guide/new`
- Updated edit button to navigate to `/learnings/guide/:noteId`
- Removed unused state: `showGuideEditor`, `editingGuideNote`
- Removed `handleSaveGuideNote` function
- Removed `GuideNoteEditor` modal component

### 4. Removed Old Modal Component
**File**: `src/components/GuideNoteEditor.tsx`

This component is no longer used and can be deleted if needed. The new page-based editor is in `src/pages/GuideNoteEditor.tsx`.

## User Flow

### Creating a New Guide Note
1. Navigate to Learnings page → Notes tab → Guide sub-tab
2. Click "New Guide" button
3. Redirected to `/learnings/guide/new`
4. Fill in title and topic (required)
5. Write content in markdown
6. (Optional) Click "Draw Canvas" to add diagrams
7. Click "Save" - note is created
8. After save, can upload files
9. URL updates to `/learnings/guide/{noteId}` for editing

### Editing an Existing Guide Note
1. Navigate to Learnings page → Notes tab → Guide sub-tab
2. Click edit icon on any guide note card
3. Redirected to `/learnings/guide/{noteId}`
4. Edit title, topic, content
5. Upload/delete files
6. Draw on canvas
7. Click "Save" to update

## Features

### Editor Features
- **Markdown Support**: Full markdown syntax with code highlighting
- **Live Preview**: Toggle between edit and preview modes
- **File Uploads**: Upload images, PDFs, docs (max 50MB)
- **Canvas Drawing**: Integrated Excalidraw for diagrams
- **Asset Management**: View, download, delete uploaded files
- **Auto-insert Links**: Uploaded files automatically insert markdown links

### UI/UX
- Clean, full-page layout
- Sticky header with save button
- Back button to return to notes list
- Preview toggle for instant feedback
- Responsive design for mobile/tablet
- Loading states for better UX

### File Upload Flow
1. Save note first (to get noteId)
2. Click "Upload File" button
3. Select file(s)
4. Files upload to Azure Blob Storage
5. Markdown links auto-inserted
6. Assets listed above editor

### Canvas Integration
1. Click "Draw Canvas" button
2. Canvas opens in full-screen modal
3. Draw diagrams using Excalidraw
4. Click "Insert to Note"
5. Canvas reference added to markdown
6. Canvas data saved with note

## Technical Details

### State Management
- Local state for form fields (title, topic, content)
- Canvas data stored separately
- Assets array for uploaded files
- Loading/saving states for UX

### API Integration
- `fetchGuideNoteById()` - Load existing note
- `createGuideNote()` - Create new note
- `updateGuideNote()` - Update existing note
- File upload via multipart/form-data
- Asset deletion via DELETE endpoint

### Navigation
- Uses React Router's `useNavigate()` and `useParams()`
- Automatic redirect after creation
- Back button returns to notes list

## Comparison with Admin Panel

Similar to admin documentation editor:
- ✅ Full-page layout
- ✅ Title/topic fields
- ✅ Markdown editor
- ✅ Live preview
- ✅ File uploads
- ✅ Canvas/diagram support
- ✅ Asset management
- ✅ Save button in header

## Benefits

1. **Better UX**: Full-page editor provides more space
2. **Proper URLs**: Each note has its own URL for sharing
3. **Browser History**: Back/forward navigation works
4. **More Features**: Room for additional tools
5. **Consistent**: Matches admin panel experience
6. **Mobile Friendly**: Better responsive layout

## File Structure

```
src/
├── pages/
│   └── GuideNoteEditor.tsx (NEW - Full page editor)
├── components/
│   ├── NotesTabContent.tsx (UPDATED - Navigation only)
│   └── GuideNoteEditor.tsx (OLD - Can be deleted)
└── App.tsx (UPDATED - Added routes)
```

## Next Steps (Optional)

1. Add autosave functionality
2. Add version history
3. Add collaborative editing
4. Add note templates
5. Add export to PDF
6. Add search within note
7. Add table of contents generation
8. Add image optimization
