import { API_BASE_URL } from '@/config/api';

export interface ProcessYouTubeRequest {
  youtubeUrl: string;
  guideId: string;
  titleId: string;
}

export interface StreamUpdate {
  step: string;
  status: 'processing' | 'complete' | 'error';
  message: string;
  data?: any;
  done?: boolean;
  success?: boolean;
  document?: any;
  stats?: {
    videoId: string;
    chunksProcessed: number;
    embeddingsStored: number;
    documentCreated: boolean;
  };
}

export interface ProcessYouTubeResponse {
  success: boolean;
  message: string;
  document?: any;
  stats?: {
    videoId: string;
    chunksProcessed: number;
    embeddingsStored: number;
    documentCreated: boolean;
  };
  error?: string;
}

export interface QueryRequest {
  question: string;
  guideId?: string;
  titleId?: string;
  limit?: number;
}

export interface QueryResult {
  score: number;
  chunkIndex: number;
  text: string;
  originalText: string;
  videoUrl: string;
}

export interface QueryResponse {
  success: boolean;
  question: string;
  results: QueryResult[];
  error?: string;
}

export async function processYouTubeVideoStream(
  data: ProcessYouTubeRequest,
  onUpdate: (update: StreamUpdate) => void
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/youtube-transcript/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to start processing');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6);
          try {
            const update = JSON.parse(jsonStr);
            onUpdate(update);
            
            if (update.done) {
              return;
            }
          } catch (e) {
            console.error('Error parsing SSE data:', e);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in stream:', error);
    throw error;
  }
}

export async function queryYouTubeTranscript(data: QueryRequest): Promise<QueryResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/youtube-transcript/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to query transcript');
    }
    
    return result;
  } catch (error) {
    console.error('Error querying transcript:', error);
    throw error;
  }
}
