import React from 'react';

interface LoaderProps {
  size?: 'small' | 'medium' | 'large' | 'full';
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 'medium', 
  text = 'Loading...', 
  fullScreen = false,
  overlay = false 
}) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16',
    full: 'w-20 h-20'
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white z-50'
    : overlay
    ? 'absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-40'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center">
        <div className="relative">
          {/* Outer spinning ring */}
          <div className={`${sizeClasses[size]} rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin`}></div>
          
          {/* Inner pulsing dot - only for medium and larger */}
          {(size === 'medium' || size === 'large' || size === 'full') && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
        
        {text && (
          <p className="mt-4 text-gray-600 font-medium animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default Loader;

// Additional loading components for specific use cases

interface InlineLoaderProps {
  text?: string;
  className?: string;
}

export const InlineLoader: React.FC<InlineLoaderProps> = ({ text, className = '' }) => (
  <div className={`flex items-center justify-center space-x-2 ${className}`}>
    <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-blue-600 animate-spin"></div>
    {text && <span className="text-sm text-gray-600">{text}</span>}
  </div>
);

interface ButtonLoaderProps {
  text?: string;
}

export const ButtonLoader: React.FC<ButtonLoaderProps> = ({ text = 'Processing...' }) => (
  <div className="flex items-center justify-center space-x-2">
    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
    <span>{text}</span>
  </div>
);

interface SkeletonLoaderProps {
  lines?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ lines = 3, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <div
        key={index}
        className="h-4 bg-gray-200 rounded animate-pulse"
        style={{ width: `${100 - (index * 10)}%` }}
      ></div>
    ))}
  </div>
);

interface CardSkeletonProps {
  count?: number;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ count = 1 }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    ))}
  </>
);
