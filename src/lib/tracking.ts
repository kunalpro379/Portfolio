// Track page view
export async function trackPageView(path: string) {
  try {
    const referrer = document.referrer || '';
    
    await fetch('https://api.kunalpatil.me/api/views/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path,
        referrer,
      }),
    });
  } catch (error) {
    // Silently fail - don't disrupt user experience
    console.debug('Tracking failed:', error);
  }
}
