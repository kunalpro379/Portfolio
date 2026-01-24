import React from 'react';

interface GeminiIconProps {
  className?: string;
  size?: number;
}

const GeminiIcon: React.FC<GeminiIconProps> = ({ className = "", size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="gemini-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="25%" stopColor="#9C27B0" />
          <stop offset="50%" stopColor="#FF5722" />
          <stop offset="75%" stopColor="#FFC107" />
          <stop offset="100%" stopColor="#4CAF50" />
        </linearGradient>
      </defs>
      
      {/* Gemini constellation pattern */}
      <path
        d="M12 2L14.5 8.5L21 9L16 14L17.5 21L12 18L6.5 21L8 14L3 9L9.5 8.5L12 2Z"
        fill="url(#gemini-gradient)"
        opacity="0.8"
      />
      
      {/* Inner sparkle */}
      <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.6" />
      
      {/* Outer sparkles */}
      <circle cx="8" cy="8" r="1" fill="currentColor" opacity="0.4" />
      <circle cx="16" cy="8" r="1" fill="currentColor" opacity="0.4" />
      <circle cx="8" cy="16" r="1" fill="currentColor" opacity="0.4" />
      <circle cx="16" cy="16" r="1" fill="currentColor" opacity="0.4" />
    </svg>
  );
};

export default GeminiIcon;