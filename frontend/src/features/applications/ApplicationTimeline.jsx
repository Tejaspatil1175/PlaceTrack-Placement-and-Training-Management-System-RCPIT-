import React from 'react';
import { Check, X } from 'lucide-react';

const STAGES = ['Applied', 'Shortlisted', 'Interview', 'Selected'];

export function ApplicationTimeline({ currentStatus = 'Applied' }) {
  const isRejected = currentStatus.toLowerCase() === 'rejected';

  const getStageIndex = (status) => {
    const s = status.toLowerCase();
    if (s === 'applied') return 0;
    if (s === 'shortlisted') return 1;
    if (s === 'interview') return 2;
    if (s === 'selected' || s === 'placed') return 3;
    return 0;
  };

  const currentIndex = getStageIndex(currentStatus);

  if (isRejected) {
    return (
      <div className="p-3 bg-error-100/50 border border-error-600/30 rounded-lg flex items-center space-x-2 text-xs text-error-600 font-semibold">
        <X className="w-4 h-4 text-error-600 shrink-0" />
        <span>Application Status: Rejected during screening</span>
      </div>
    );
  }

  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between relative">
        {/* Background Connecting Line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-border-subtle z-0"></div>

        {/* Dynamic Highlight Progress Line */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary-700 transition-all duration-300 z-0"
          style={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
        ></div>

        {STAGES.map((stage, idx) => {
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={stage} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                  isPassed
                    ? 'bg-success-600 text-white'
                    : isCurrent
                    ? 'bg-primary-900 text-white ring-4 ring-primary-100 font-extrabold'
                    : 'bg-bg-surface text-text-muted border border-border-subtle'
                }`}
              >
                {isPassed ? <Check className="w-3.5 h-3.5" /> : idx + 1}
              </div>
              <span
                className={`text-[10px] font-semibold mt-1 ${
                  isCurrent ? 'text-primary-900 font-bold' : isPassed ? 'text-success-600' : 'text-text-muted'
                }`}
              >
                {stage}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
