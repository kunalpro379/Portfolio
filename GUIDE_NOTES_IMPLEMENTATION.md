# Guide Notes Feature Implementation Plan

## ✅ Completed (Backend)

### 1. Database Model
- **File**: `server/models/GuideNote.js`
- Schema includes: noteId, title, topic, content (MD), canvasData, assets array
- Auto-updates `updatedAt` timestamp

### 2. API Routes
- **File**: `server/routes/guide-notes.js`
- **Endpoints**:
  - `POST /api/guide-notes` - Create new guide note
  - `GET /api/guide-notes` - Get all guide notes
  - `GET /api/guide-notes/:noteId` - Get single guide note
  - `PUT /api/guide-notes/:noteId` - Update guide note
  - `POST /api/guide-notes/:noteId/assets` - Upload asset (images, PDFs, files)
  - `DELETE /api/guide-notes/:noteId/assets/:assetId` - Delete asset
  - `DELETE /api/guide-notes/:noteId` - Delete guide note
- Assets stored in Azure: `guide-notes/{noteId}/assets/{filename}`

### 3. Server Integration
- **File**: `server/index.js`
- Route registered at `/api/guide-notes`

### 4. Frontend API Service
- **File**: `src/services/guideNotesApi.ts`
- TypeScript interfaces and API functions

## 🔨 TODO (Frontend Components)

### 1. Guide Note Editor Component
**File**: `src/components/GuideNoteEditor.tsx`

**Features**:
- Title input (auto-generated from topic + date)
- Topic input
- Markdown editor (use `react-markdown` + `react-simplemde-editor` or similar)
- Canvas drawing integration (Excalidraw component)
- Insert canvas into MD as image
- File upload (images, PDFs, documents)
- Asset gallery
- Save/Update functionality

**Dependencies to install**:
```bash
npm install react-markdown react-simplemde-editor easymde
npm install @uiw/react-md-editor
```

### 2. Guide Note Card Component
**File**: `src/components/GuideNoteCard.tsx`

**Features**:
- Display title, topic, date
- Preview of content (first few lines)
- Asset count indicator
- Edit/Delete actions
- Click to open full editor

### 3. Updated Learnings Page
**File**: `src/pages/Learnings.tsx` (Update existing)

**Structure**:
```
Notes Tab:
├── Guide (New Section)
│   ├── Create Guide Note button
│   └── Grid of Guide Note Cards
├── Notes Folders (Existing)
│   └── Folder structure
└── Todos (Existing)
    └── Todo list
```

## 📝 Implementation Steps

### Step 1: Install Dependencies
```bash
cd Portfolio
npm install @uiw/react-md-editor
npm install lucide-react (if not already installed)
```

### Step 2: Create GuideNoteEditor Component
- MD editor with toolbar
- Canvas drawing modal
- File upload dropzone
- Asset management

### Step 3: Create GuideNoteCard Component
- Card with hand-drawn aesthetics (matching other cards)
- Hover effects
- Action buttons

### Step 4: Update Learnings Page
- Add "Guide" section at top of Notes tab
- Keep existing "Notes Folders" section
- Keep existing "Todos" section
- Add state management for guide notes

### Step 5: Add Canvas Integration
- Reuse existing Excalidraw component
- Add "Insert to MD" button
- Export canvas as PNG/SVG
- Upload to assets
- Insert markdown image syntax

## 🎨 UI/UX Design

### Guide Section Layout
```
┌─────────────────────────────────────────┐
│  Guide                    [+ New Guide] │
├─────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐          │
│  │ Card │  │ Card │  │ Card │          │
│  │      │  │      │  │      │          │
│  └──────┘  └──────┘  └──────┘          │
└─────────────────────────────────────────┘
```

### Editor Modal Layout
```
┌─────────────────────────────────────────┐
│  Create Guide Note            [X] Close │
├─────────────────────────────────────────┤
│  Title: [Auto: Topic - Date]            │
│  Topic: [________________]              │
├─────────────────────────────────────────┤
│  [MD Editor Toolbar]                    │
│  ┌───────────────────────────────────┐  │
│  │ # Markdown Content                │  │
│  │                                   │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
├─────────────────────────────────────────┤
│  [🎨 Draw Canvas] [📎 Upload Files]    │
│                                         │
│  Assets: [img1.png] [doc.pdf] [...]    │
├─────────────────────────────────────────┤
│              [Cancel] [Save]            │
└─────────────────────────────────────────┘
```

## 🔄 Data Flow

### Creating a Guide Note
1. User clicks "+ New Guide"
2. Modal opens with empty editor
3. User enters topic (title auto-generates)
4. User writes markdown content
5. User can draw on canvas → exports → uploads as asset → inserts in MD
6. User can upload files → stored as assets → can reference in MD
7. User clicks Save
8. API call to create note
9. Refresh guide notes list

### Editing a Guide Note
1. User clicks on guide note card
2. Fetch full note data
3. Load in editor modal
4. User makes changes
5. User clicks Save
6. API call to update note
7. Refresh guide notes list

## 🗂️ Folder Structure in Azure

```
guide-notes/
├── {noteId1}/
│   └── assets/
│       ├── canvas-drawing-1.png
│       ├── document.pdf
│       └── image.jpg
├── {noteId2}/
│   └── assets/
│       └── ...
```

## 📊 Database Structure

```javascript
{
  noteId: "abc123...",
  title: "React Hooks - 2024-02-24",
  topic: "React Hooks",
  content: "# React Hooks\n\n![Canvas](url)\n\n...",
  canvasData: "{...excalidraw json...}",
  assets: [
    {
      assetId: "xyz789...",
      filename: "canvas-drawing.png",
      fileType: "image/png",
      size: 102400,
      azurePath: "guide-notes/abc123/assets/canvas-drawing.png",
      azureUrl: "https://...",
      uploadedAt: "2024-02-24T..."
    }
  ],
  createdAt: "2024-02-24T...",
  updatedAt: "2024-02-24T..."
}
```

## 🚀 Next Steps

1. Install MD editor package
2. Create GuideNoteEditor component
3. Create GuideNoteCard component  
4. Update Learnings page with 3 sections
5. Test create/edit/delete flows
6. Test canvas integration
7. Test file uploads
8. Add loading states and error handling

## 💡 Additional Features (Future)

- Search/filter guide notes
- Tags for categorization
- Export guide note as PDF
- Share guide note (public link)
- Version history
- Collaborative editing
- Code syntax highlighting in MD
- LaTeX math support
