// @ts-ignore
import CONFIG from '../../config.shared.js';

// Track page view - always use production API
export async function trackPageView(path: string) {
  try {
    const referrer = document.referrer || '';
    
    const response = await fetch(`https://api.kunalpatil.me/api/views/track`, {
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
