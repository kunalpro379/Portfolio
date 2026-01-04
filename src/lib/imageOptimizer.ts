// Image optimization utilities
export const getOptimizedImageProps = (src: string, priority: boolean = false) => {
  return {
    loading: priority ? ('eager' as const) : ('lazy' as const),
    decoding: 'async' as const,
    fetchpriority: priority ? ('high' as const) : ('auto' as const),
  };
};

// Preload critical images
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    
    if (img.decode) {
      img.decode()
        .then(() => resolve())
        .catch(() => resolve()); // Resolve anyway to not block
    } else {
      img.onload = () => resolve();
      img.onerror = () => resolve(); // Resolve anyway to not block
    }
  });
};

// Intersection Observer for lazy loading
export const createImageObserver = (callback: (entry: IntersectionObserverEntry) => void) => {
  if (typeof IntersectionObserver === 'undefined') {
    return null;
  }

  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback(entry);
        }
      });
    },
    {
      rootMargin: '50px',
      threshold: 0.01,
    }
  );
};
