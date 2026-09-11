import React from 'react';

export function StatusBadge({ status }) {
  const normalized = (status || 'Unplaced').toLowerCase();

  switch (normalized) {
    case 'selected':
    case 'placed':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-100 text-success-600 border border-success-600/20">
          Placed
        </span>
      );

    case 'shortlisted':
    case 'interview':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-warning-100 text-warning-600 border border-warning-600/20">
          {status}
        </span>
      );

    case 'applied':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-info-100 text-info-600 border border-info-600/20">
          Applied
        </span>
      );

    case 'rejected':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-error-100 text-error-600 border border-error-600/20">
          Rejected
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-bg-base text-text-secondary border border-border-subtle">
          Unplaced
        </span>
      );
  }
}
