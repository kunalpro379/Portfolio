// API Configuration for client-side
const getApiBaseUrl = (): string => {
  // Check if we're in development (localhost)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'https://api.kunalpatil.me'; // Still use production API even in dev
    }
  }
  
  // Always use production API
  return 'https://api.kunalpatil.me';
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  ENDPOINTS: {
    AI_CHAT: '/api/ai-chat',
    HEALTH: '/api/ai-chat/health',
    CAPABILITIES: '/api/ai-chat/capabilities',
  }
};

export default API_CONFIG;