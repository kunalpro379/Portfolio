import { API_BASE_URL } from '@/config/api';

export interface GuideNote {
  noteId: string;
  title: string;
  topic: string;
  content: string;
  canvasData?: any;
  assets: Array<{
    assetId: string;
    filename: string;
    fileType: string;
    size: number;
    azureUrl: string;
    uploadedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGuideNoteData {
  title: string;
  topic: string;
  content?: string;
  canvasData?: any;
}

// Fetch all guide notes
export async function fetchGuideNotes(): Promise<GuideNote[]> {
  const response = await fetch(`${API_BASE_URL}/api/guide-notes`);
  if (!response.ok) throw new Error('Failed to fetch guide notes');
  const data = await response.json();
  return data.notes;
}

// Fetch single guide note
export async function fetchGuideNoteById(noteId: string): Promise<GuideNote> {
  const response = await fetch(`${API_BASE_URL}/api/guide-notes/${noteId}`);
  if (!response.ok) throw new Error('Failed to fetch guide note');
  const data = await response.json();
  return data.note;
}

// Create new guide note
export async function createGuideNote(data: CreateGuideNoteData): Promise<GuideNote> {
  const response = await fetch(`${API_BASE_URL}/api/guide-notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) throw new Error('Failed to create guide note');
  const result = await response.json();
  return result.note;
}

// Update guide note
export async function updateGuideNote(noteId: string, data: Partial<CreateGuideNoteData>): Promise<GuideNote> {
  const response = await fetch(`${API_BASE_URL}/api/guide-notes/${noteId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) throw new Error('Failed to update guide note');
  const result = await response.json();
  return result.note;
}

// Delete guide note
export async function deleteGuideNote(noteId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/guide-notes/${noteId}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) throw new Error('Failed to delete guide note');
}

// Upload asset to guide note
export async function uploadAsset(noteId: string, file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE_URL}/api/guide-notes/${noteId}/assets`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) throw new Error('Failed to upload asset');
  const data = await response.json();
  return data.asset;
}

// Delete asset from guide note
export async function deleteAsset(noteId: string, assetId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/guide-notes/${noteId}/assets/${assetId}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) throw new Error('Failed to delete asset');
}
