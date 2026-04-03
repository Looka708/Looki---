'use client';

import React from 'react';

interface BadgeProps {
  type?: 'ban' | 'kick' | 'mute' | 'warn' | 'note' | 'tempban' | 'success' | 'danger' | 'warning' | 'info';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ type = 'info', children, className = '' }: BadgeProps) {
  const badgeStyles = {
    ban: 'bg-rose/15 text-rose border border-rose/30',
    kick: 'bg-lemon/15 text-lemon border border-lemon/30',
    mute: 'bg-lavender/15 text-lavender border border-lavender/30',
    warn: 'bg-peach/15 text-peach border border-peach/30',
    note: 'bg-sky/15 text-sky border border-sky/30',
    tempban: 'bg-rose/10 text-rose border border-rose/30 border-dashed',
    success: 'bg-mint/15 text-mint border border-mint/30',
    danger: 'bg-rose/15 text-rose border border-rose/30',
    warning: 'bg-lemon/15 text-lemon border border-lemon/30',
    info: 'bg-sky/15 text-sky border border-sky/30',
  };

  return (
    <span
      className={`
        inline-flex items-center px-3 py-1
        font-mono text-xs font-semibold
        rounded-full
        uppercase
        tracking-widest
        transition-all duration-200
        ${badgeStyles[type]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

interface StatCardProps {
  icon?: string | React.ReactNode;
  label: string;
  value: string | number;
  trend?: number;
  variant?: 'default' | 'success' | 'danger' | 'info';
  className?: string;
}

export function StatCard({
  icon,
  label,
  value,
  trend,
  variant = 'default',
  className = '',
}: StatCardProps) {
  const variantStyles = {
    default: 'bg-gradient-to-br from-pink/10 to-lavender/10',
    success: 'bg-gradient-to-br from-mint/10 to-pink/10',
    danger: 'bg-gradient-to-br from-rose/10 to-lemon/10',
    info: 'bg-gradient-to-br from-sky/10 to-pink/10',
  };

  return (
    <div className={`glass-card ${variantStyles[variant]} p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-body text-text-secondary mb-2">{label}</p>
          <p className="text-3xl font-display font-bold text-pink">{value}</p>
          {trend !== undefined && (
            <p className={`text-xs font-body mt-2 ${trend > 0 ? 'text-mint' : 'text-rose'}`}>
              {trend > 0 ? '📈' : '📉'} {Math.abs(trend)}% from last week
            </p>
          )}
        </div>
        {icon && (
          <div className="text-4xl opacity-50 flex-shrink-0 ml-4">
            {typeof icon === 'string' ? <span>{icon}</span> : icon}
          </div>
        )}
      </div>
    </div>
  );
}
