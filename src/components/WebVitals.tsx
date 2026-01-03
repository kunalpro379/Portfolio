import { useEffect } from 'react';

export function WebVitals() {
  useEffect(() => {
    // Web Vitals tracking for React app
    if ('web-vitals' in window) {
      // You can add web vitals tracking here if needed
      console.log('Web Vitals tracking enabled');
    }
  }, []);

  return null;
}
