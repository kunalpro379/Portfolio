import { RefreshCw } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
}

export default function LoadingSpinner({ size = 'md', text = 'Loading' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-40 h-40',
    md: 'w-56 h-56',
    lg: 'w-72 h-72',
    xl: 'w-96 h-96'
  };

  const iconSizes = {
    sm: 80,
    md: 112,
    lg: 144,
    xl: 192
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative flex items-center justify-center">
        {/* Rotating refresh icon */}
        <RefreshCw 
          size={iconSizes[size]} 
          strokeWidth={2.5}
          className="text-black animate-spin"
          style={{ animationDuration: '1.5s' }}
        />
        
        {/* Loading text in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${textSizes[size]} font-medium text-black text-center px-2`}>
            {text}
          </span>
        </div>
      </div>
    </div>
  );
}
