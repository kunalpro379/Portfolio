import { API_BASE_URL } from '@/config/api';

// Types
export interface Document {
  documentId: string;
  name: string;
  type: 'markdown' | 'diagram' | 'attachment';
  content: string;
  fileType?: string;
  size?: number;
  azurePath?: string;
  azureUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Title {
  titleId: string;
  titleSlug?: string;
  name: string;
  description: string;
  documents: Document[];
  createdAt: string;
  updatedAt: string;
}

export interface Guide {
  guideId: string;
  guideSlug?: string;
  name: string;
  topic: string;
  description: string;
  titles: Title[];
  createdAt: string;
  updatedAt: string;
}

// ============ GUIDE API ============

export async function fetchGuides(): Promise<Guide[]> {
  const response = await fetch(`${API_BASE_URL}/api/guide-notes/guides`);
  if (!response.ok) throw new Error('Failed to fetch guides');
  const data = await response.json();
  return data.guides;
}

export async function fetchGuideById(guideId: string): Promise<Guide> {
  const response = await fetch(`${API_BASE_URL}/api/guide-notes/guides/${guideId}`);
  if (!response.ok) throw new Error('Failed to fetch guide');
  const data = await response.json();
  return data.guide;
}

export async function fetchGuideBySlug(guideSlug: string, titleSlug: string): Promise<{ guide: Guide; title: Title }> {
  const response = await fetch(`${API_BASE_URL}/api/guide-notes/view/${guideSlug}/${titleSlug}`);
  if (!response.ok) throw new Error('Failed to fetch guide');
  const data = await response.json();
  return { guide: data.guide, title: data.title };
}

export async function createGuide(data: { name: string; topic: string; description?: string }): Promise<Guide> {
  const response = await fetch(`${API_BASE_URL}/api/guide-notes/guides`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) throw new Error('Failed to create guide');
  const result = await response.json();
  return result.guide;
}

export async function updateGuide(guideId: string, data: { name?: string; topic?: string; description?: string }): Promise<Guide> {
  const response = await fetch(`${API_BASE_URL}/api/guide-notes/guides/${guideId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) throw new Error('Failed to update guide');
  const result = await response.json();
  return result.guide;
}

export async function deleteGuide(guideId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/guide-notes/guides/${guideId}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) throw new Error('Failed to delete guide');
}

// ============ TITLE API ============

export async function createTitle(guideId: string, data: { name: string; description?: string }): Promise<Title> {
  const response = await fetch(`${API_BASE_URL}/api/guide-notes/guides/${guideId}/titles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) throw new Error('Failed to create title');
  const result = await response.json();
  return result.title;
}

export async function updateTitle(guideId: string, titleId: string, data: { name?: string; description?: string }): Promise<Title> {
  const response = await fetch(`${API_BASE_URL}/api/guide-notes/guides/${guideId}/titles/${titleId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) throw new Error('Failed to update title');
  const result = await response.json();
  return result.title;
}

export async function deleteTitle(guideId: string, titleId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/guide-notes/guides/${guideId}/titles/${titleId}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) throw new Error('Failed to delete title');
}

// ============ DOCUMENT API ============

export async function createMarkdownDocument(guideId: string, titleId: string, data: { name: string; content?: string }): Promise<Document> {
  const response = await fetch(`${API_BASE_URL}/api/guide-notes/guides/${guideId}/titles/${titleId}/documents/markdown`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) throw new Error('Failed to create markdown document');
  const result = await response.json();
  return result.document;
}

export async function createDiagramDocument(guideId: string, titleId: string, data: { name: string; content?: string }): Promise<Document> {
  const response = await fetch(`${API_BASE_URL}/api/guide-notes/guides/${guideId}/titles/${titleId}/documents/diagram`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) throw new Error('Failed to create diagram document');
  const result = await response.json();
  return result.document;
}

export async function uploadAttachment(guideId: string, titleId: string, file: File): Promise<Document> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE_URL}/api/guide-notes/guides/${guideId}/titles/${titleId}/documents/attachment`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) throw new Error('Failed to upload attachment');
  const result = await response.json();
  return result.document;
}

export async function updateDocument(guideId: string, titleId: string, documentId: string, data: { name?: string; content?: string }): Promise<Document> {
  const response = await fetch(`${API_BASE_URL}/api/guide-notes/guides/${guideId}/titles/${titleId}/documents/${documentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) throw new Error('Failed to update document');
  const result = await response.json();
  return result.document;
}

export async function deleteDocument(guideId: string, titleId: string, documentId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/guide-notes/guides/${guideId}/titles/${titleId}/documents/${documentId}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) throw new Error('Failed to delete document');
}
