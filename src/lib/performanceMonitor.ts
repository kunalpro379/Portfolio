// Performance monitoring utilities
export const reportWebVitals = (metric: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(metric);
  }
  
  // You can send to analytics here
  // Example: sendToAnalytics(metric);
};

// Debounce scroll events
export const debounceScroll = (fn: Function, delay: number = 100) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

// Throttle resize events
export const throttleResize = (fn: Function, delay: number = 200) => {
  let lastCall = 0;
  return (...args: any[]) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
};

// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Optimize animations based on device capabilities
export const shouldUseReducedAnimations = (): boolean => {
  if (typeof window === 'undefined') return true;
  
  // Check for reduced motion preference
  if (prefersReducedMotion()) return true;
  
  // Check for low-end devices (less than 4 cores or low memory)
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;
  const deviceMemory = (navigator as any).deviceMemory || 4;
  
  return hardwareConcurrency < 4 || deviceMemory < 4;
};
