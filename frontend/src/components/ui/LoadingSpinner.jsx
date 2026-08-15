import React from 'react';

/**
 * LoadingSpinner — multiple size and style variants
 */
function LoadingSpinner({ size = 'md', className = '', label = 'Loading...' }) {
  const sizes = {
    xs:  'w-3 h-3 border-[1.5px]',
    sm:  'w-4 h-4 border-2',
    md:  'w-6 h-6 border-2',
    lg:  'w-8 h-8 border-2',
    xl:  'w-12 h-12 border-[3px]',
  };

  return (
    <span
      role="status"
      aria-label={label}
      className={[
        'inline-block rounded-full border-primary-200 border-t-primary-600 animate-spin-slow',
        sizes[size] ?? sizes.md,
        className,
      ].join(' ')}
    />
  );
}

/**
 * PageLoader — full-page centered loading state
 */
export function PageLoader({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
      <LoadingSpinner size="xl" />
      <p className="text-sm text-secondary-400 animate-pulse-soft">{message}</p>
    </div>
  );
}

/**
 * CardSkeleton — shimmer placeholder for loading cards
 */
export function CardSkeleton({ lines = 3 }) {
  return (
    <div className="bg-surface rounded-lg border border-secondary-200 p-6 animate-pulse-soft">
      <div className="h-4 bg-secondary-200 rounded w-3/4 mb-3" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-3 bg-secondary-100 rounded mb-2 ${i === lines - 1 ? 'w-1/2' : 'w-full'}`} />
      ))}
    </div>
  );
}

/**
 * FeedCardSkeleton — shimmer for feed complaint cards
 */
export function FeedCardSkeleton() {
  return (
    <div className="bg-surface rounded-lg border border-secondary-200 p-4 animate-pulse-soft">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-secondary-200" />
        <div className="flex-1">
          <div className="h-3 bg-secondary-200 rounded w-1/3 mb-1.5" />
          <div className="h-2.5 bg-secondary-100 rounded w-1/4" />
        </div>
      </div>
      <div className="h-4 bg-secondary-200 rounded w-4/5 mb-2" />
      <div className="h-3 bg-secondary-100 rounded w-full mb-1" />
      <div className="h-3 bg-secondary-100 rounded w-3/4 mb-4" />
      <div className="h-28 bg-secondary-100 rounded mb-3" />
      <div className="flex gap-4">
        <div className="h-3 bg-secondary-100 rounded w-12" />
        <div className="h-3 bg-secondary-100 rounded w-12" />
        <div className="h-3 bg-secondary-100 rounded w-12" />
      </div>
    </div>
  );
}

export default LoadingSpinner;
