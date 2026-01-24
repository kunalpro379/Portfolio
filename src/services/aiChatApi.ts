export interface ChatMessage {
  message: string;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  contextUsed?: boolean;
  sources?: Array<{
    section: string;
    type: string;
    technologies: string[];
  }>;
  timestamp: string;
  error?: string;
}

export interface HealthResponse {
  success: boolean;
  status: string;
  services: {
    qdrant: string;
    groq: string;
    error?: string;
  };
  timestamp: string;
}

export interface CapabilitiesResponse {
  success: boolean;
  capabilities: {
    topics: string[];
    features: string[];
    limitations: string[];
  };
}

class AIChatAPI {
  private baseUrl = '/api/ai-chat';

  async sendMessage(message: string): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getHealth(): Promise<HealthResponse> {
    const response = await fetch(`${this.baseUrl}/health`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getCapabilities(): Promise<CapabilitiesResponse> {
    const response = await fetch(`${this.baseUrl}/capabilities`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const aiChatApi = new AIChatAPI();