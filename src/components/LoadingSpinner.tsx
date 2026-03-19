import LoadingAnimation from './LoadingAnimation';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
}

export default function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  return (
    <div className="flex w-full items-center justify-center">
      <LoadingAnimation className={sizeClasses[size]} />
    </div>
  );
}
