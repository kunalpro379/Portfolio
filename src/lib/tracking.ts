import CONFIG from '../../config.shared.js';

// Track page view
export async function trackPageView(path: string) {
  try {
    const referrer = document.referrer || '';
    
    const response = await fetch(`${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.views}/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path,
        referrer,
      }),
    });

    // Don't throw error if tracking fails
    if (!response.ok) {
      console.debug('Tracking endpoint not available yet');
    }
  } catch (error) {
    // Silently fail - don't disrupt user experience
    console.debug('Tracking failed:', error);
  }
}
