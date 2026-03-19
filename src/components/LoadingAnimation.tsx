import { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

interface LoadingAnimationProps {
  className?: string;
}

export default function LoadingAnimation({ className = 'w-24 h-24' }: LoadingAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const animation = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/loading.json'
    });

    return () => {
      animation.destroy();
    };
  }, []);

  return <div ref={containerRef} className={`${className} scale-[3] origin-center overflow-visible`} aria-label="Loading animation" />;
}
