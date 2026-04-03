import { API_BASE_URL } from '@/config/api';

export interface DSAProject {
  dsaId: string;
  name: string;
  description: string;
  files: DSAFile[];
  folders: DSAFolder[];
  createdAt: string;
  updatedAt: string;
}

export interface DSAFile {
  fileId: string;
  name: string;
  path: string;
  language: string;
  azurePath: string;
  azureUrl: string;
  canvasAzurePath?: string;
  canvasAzureUrl?: string;
  createdAt: string;
}

export interface DSAFolder {
  folderId: string;
  name: string;
  path: string;
  createdAt: string;
}

export const fetchDSAProjects = async (): Promise<DSAProject[]> => {
  const response = await fetch(`${API_BASE_URL}/api/dsa`);
  if (!response.ok) throw new Error('Failed to fetch DSA projects');
  const data = await response.json();
  return data.projects;
};

export const fetchDSAProject = async (dsaId: string): Promise<DSAProject> => {
  const response = await fetch(`${API_BASE_URL}/api/dsa/${dsaId}`);
  if (!response.ok) throw new Error('Failed to fetch DSA project');
  const data = await response.json();
  return data.project;
};

export const createDSAProject = async (projectData: { name: string; description?: string }): Promise<DSAProject> => {
  const response = await fetch(`${API_BASE_URL}/api/dsa/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData)
  });
  if (!response.ok) throw new Error('Failed to create DSA project');
  const data = await response.json();
  return data.project;
};

export const createDSAFolder = async (dsaId: string, folderData: { name: string; path: string }): Promise<DSAFolder> => {
  console.log('Creating folder:', dsaId, folderData);
  const response = await fetch(`${API_BASE_URL}/api/dsa/${dsaId}/folders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(folderData)
  });
  
  const data = await response.json();
  console.log('Folder response:', response.status, data);
  
  if (!response.ok) throw new Error(data.message || 'Failed to create folder');
  return data.folder;
};

export const createDSAFile = async (dsaId: string, fileData: { name: string; path: string; language: string; content?: string }): Promise<DSAFile> => {
  console.log('Creating file:', dsaId, fileData);
  const response = await fetch(`${API_BASE_URL}/api/dsa/${dsaId}/files`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fileData)
  });
  
  const data = await response.json();
  console.log('File response:', response.status, data);
  
  if (!response.ok) throw new Error(data.message || 'Failed to create file');
  return data.file;
};

export const fetchDSAFileContent = async (dsaId: string, fileId: string): Promise<{ file: DSAFile; content: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/dsa/${dsaId}/files/${fileId}`);
  if (!response.ok) throw new Error('Failed to fetch file content');
  return await response.json();
};

export const updateDSAFile = async (dsaId: string, fileId: string, content: string, language?: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/dsa/${dsaId}/files/${fileId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, language })
  });
  if (!response.ok) throw new Error('Failed to update file');
};

export const saveDSACanvas = async (dsaId: string, fileId: string, canvasBlob: Blob): Promise<string> => {
  console.log('=== SAVING CANVAS ===');
  console.log('DSA ID:', dsaId);
  console.log('File ID:', fileId);
  console.log('Blob size:', canvasBlob.size);
  console.log('Blob type:', canvasBlob.type);
  
  const formData = new FormData();
  formData.append('canvas', canvasBlob, 'canvas.json');

  const response = await fetch(`${API_BASE_URL}/api/dsa/${dsaId}/files/${fileId}/canvas`, {
    method: 'POST',
    body: formData
  });
  
  console.log('Response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Canvas save failed:', errorText);
    throw new Error(`Failed to save canvas: ${errorText}`);
  }
  
  const data = await response.json();
  console.log('✓ Canvas saved, URL:', data.canvasUrl);
  return data.canvasUrl;
};

export const deleteDSAFile = async (dsaId: string, fileId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/dsa/${dsaId}/files/${fileId}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete file');
};

export const deleteDSAFolder = async (dsaId: string, folderId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/dsa/${dsaId}/folders/${folderId}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete folder');
};

export const deleteDSAProject = async (dsaId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/dsa/${dsaId}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete DSA project');
};
