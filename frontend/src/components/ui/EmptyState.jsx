import React from 'react';
import { FolderOpen } from 'lucide-react';

export function EmptyState({
  title = 'No data available',
  description = 'There are currently no records to display.',
  icon: Icon = FolderOpen,
  action,
}) {
  return (
    <div className="py-10 px-6 text-center bg-bg-surface border border-border-subtle rounded-xl flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-full bg-primary-100/60 text-primary-700 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-heading text-sm font-semibold text-text-primary mb-1">
        {title}
      </h3>
      <p className="text-text-muted text-xs max-w-sm leading-relaxed mb-4">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
