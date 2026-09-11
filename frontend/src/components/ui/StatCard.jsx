import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function StatCard({
  label,
  value,
  subtitle,
  delta,
  deltaType = 'increase', // 'increase' | 'decrease' | 'neutral'
  icon: Icon,
  iconColor = 'text-primary-500',
  iconBg = 'bg-primary-100/60',
}) {
  return (
    <div className="p-5 bg-bg-surface border border-border-subtle rounded-xl shadow-2xs hover:shadow-xs transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          {label}
        </span>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-2">
        <span className="font-heading font-bold text-2xl text-text-primary">
          {value}
        </span>
        {delta && (
          <span
            className={`inline-flex items-center space-x-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
              deltaType === 'increase'
                ? 'bg-success-100 text-success-600'
                : deltaType === 'decrease'
                ? 'bg-error-100 text-error-600'
                : 'bg-info-100 text-info-600'
            }`}
          >
            {deltaType === 'increase' && <TrendingUp className="w-3 h-3" />}
            {deltaType === 'decrease' && <TrendingDown className="w-3 h-3" />}
            <span>{delta}</span>
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] text-text-muted mt-1.5 leading-snug">
          {subtitle}
        </p>
      )}
    </div>
  );
}
