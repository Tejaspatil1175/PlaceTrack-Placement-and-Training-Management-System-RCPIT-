import React from 'react';
import { Award, AlertCircle, Building2, Calendar } from 'lucide-react';

export function DriveEligibilityChips({ drive }) {
  const minCgpa = drive?.minCgpa || 6.5;
  const maxBacklogs = drive?.maxBacklogs !== undefined ? drive.maxBacklogs : 0;
  const allowedBranches = drive?.allowedBranches || ['Computer', 'IT', 'AI&DS'];
  const minSemester = drive?.minSemester || 7;

  return (
    <div className="flex flex-wrap gap-1.5 text-[11px] font-medium text-text-secondary">
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-primary-100/70 text-primary-900 border border-primary-500/20">
        <Award className="w-3 h-3 text-accent-500 shrink-0" />
        <span>CGPA ≥ {minCgpa}</span>
      </span>

      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-bg-base text-text-primary border border-border-subtle">
        <AlertCircle className="w-3 h-3 text-warning-600 shrink-0" />
        <span>Max Backlogs: {maxBacklogs}</span>
      </span>

      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-bg-base text-text-primary border border-border-subtle">
        <Building2 className="w-3 h-3 text-primary-700 shrink-0" />
        <span>{allowedBranches.join(', ')}</span>
      </span>

      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-bg-base text-text-muted border border-border-subtle">
        <Calendar className="w-3 h-3 shrink-0" />
        <span>Min Sem {minSemester}</span>
      </span>
    </div>
  );
}
