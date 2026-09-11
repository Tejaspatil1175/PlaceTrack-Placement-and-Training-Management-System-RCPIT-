import React from 'react';

export function Skeleton({ className = '', variant = 'text' }) {
  const baseClasses = 'animate-pulse bg-border-subtle/60 rounded-md';

  if (variant === 'circle') {
    return <div className={`${baseClasses} rounded-full ${className}`} />;
  }

  if (variant === 'card') {
    return (
      <div className={`p-5 bg-bg-surface border border-border-subtle rounded-xl space-y-3 ${className}`}>
        <div className="h-4 bg-border-subtle/80 rounded w-1/3 animate-pulse"></div>
        <div className="h-8 bg-border-subtle/60 rounded w-1/2 animate-pulse"></div>
        <div className="h-3 bg-border-subtle/40 rounded w-2/3 animate-pulse"></div>
      </div>
    );
  }

  return <div className={`${baseClasses} ${className}`} />;
}
