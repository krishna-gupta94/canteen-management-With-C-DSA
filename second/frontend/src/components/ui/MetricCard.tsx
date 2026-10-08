import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  loading?: boolean;
  trend?: string;
  trendUp?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

export function MetricCard({ title, value, icon: Icon, loading, trend, trendUp, color = 'primary' }: MetricCardProps) {
  const colorMap = {
    primary: 'text-primary bg-primary/10',
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    error: 'text-error bg-error/10',
    info: 'text-info bg-info/10',
  };

  return (
    <div className="bg-surface p-6 rounded-container shadow-sm border border-text-disabled/20 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-text-secondary font-medium text-sm">{title}</h3>
        <div className={`p-2 rounded-ui ${colorMap[color]}`}>
          <Icon size={20} />
        </div>
      </div>
      <div>
        {loading ? (
          <div className="h-8 w-24 bg-surface-bg rounded animate-pulse" />
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-poppins font-bold text-text-primary">{value}</span>
            {trend && (
              <span className={`text-xs font-medium ${trendUp ? 'text-success' : 'text-error'}`}>
                {trend}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
