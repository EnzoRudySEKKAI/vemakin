import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div
    className={`animate-pulse bg-gray-200 dark:bg-white/10 rounded ${className}`}
    style={{ willChange: 'opacity' }}
  />
);

export const SkeletonText: React.FC<SkeletonProps & { lines?: number }> = ({ 
  className = '', 
  lines = 1 
}) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className={`h-4 w-full ${className}`} />
    ))}
  </div>
);

export const SkeletonCard: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-[#16181D] rounded-2xl p-6 ${className}`}>
    <Skeleton className="h-6 w-32 mb-4" />
    <div className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

export const SkeletonAvatar: React.FC<SkeletonProps & { size?: 'sm' | 'md' | 'lg' }> = ({ 
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  
  return (
    <Skeleton className={`rounded-full ${sizeClasses[size]} ${className}`} />
  );
};

export const SkeletonButton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <Skeleton className={`h-10 w-24 rounded-xl ${className}`} />
);

export const SkeletonHeader: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="flex gap-2">
        <SkeletonButton />
        <SkeletonButton />
      </div>
    </div>
  </div>
);
