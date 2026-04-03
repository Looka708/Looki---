'use client';

import { ReactNode } from 'react';

export function GlassCard({ children, className = '', ...props }: { children: ReactNode; className?: string; [key: string]: any }) {
  return (
    <div
      className={`glass-card rounded-xl p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function StatCard({ icon, label, value, trend, variant = 'default' }: { icon: string; label: string; value: string | number; trend?: number; variant?: 'default' | 'success' | 'danger' }) {
  const variants = {
    default: 'bg-gradient-to-br from-accent-pink/10 to-accent-lavender/10',
    success: 'bg-gradient-to-br from-success/10 to-accent-pink/10',
    danger: 'bg-gradient-to-br from-danger/10 to-warning/10',
  };

  return (
    <GlassCard className={`${variants[variant]} flex items-center justify-between`}>
      <div>
        <p className="text-text-secondary text-sm mb-1">{label}</p>
        <p className="text-3xl font-bold text-accent-pink">{value}</p>
        {trend && (
          <p className={`text-xs mt-2 ${trend > 0 ? 'text-success' : 'text-danger'}`}>
            {trend > 0 ? '📈' : '📉'} {Math.abs(trend)}% from last week
          </p>
        )}
      </div>
      <div className="text-5xl opacity-50">{icon}</div>
    </GlassCard>
  );
}

export function Badge({ type = 'default', children }: { type?: 'ban' | 'kick' | 'mute' | 'warn' | 'success' | 'info' | 'primary' | 'default'; children: ReactNode }) {
  const variants: Record<string, string> = {
    ban: 'bg-danger/20 text-danger',
    kick: 'bg-warning/20 text-warning',
    mute: 'bg-accent-lavender/20 text-accent-lavender',
    warn: 'bg-accent-peach/20 text-accent-peach',
    success: 'bg-success/20 text-success',
    info: 'bg-accent-pink/20 text-accent-pink',
    primary: 'bg-accent-lavender/20 text-accent-lavender',
    default: 'bg-accent-pink/20 text-accent-pink',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${variants[type] || variants.default}`}>
      {children}
    </span>
  );
}

export function UserChip({ avatar, name, id }: { avatar?: string; name: string; id: string }) {
  return (
    <div className="flex items-center gap-2">
      {avatar && (
        <img
          src={avatar}
          alt={name}
          className="w-8 h-8 rounded-full"
        />
      )}
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-text-primary">{name}</span>
        <span className="text-xs text-text-secondary font-mono">{id}</span>
      </div>
    </div>
  );
}

export function ToggleSwitch({ checked = false, onChange, label }: { checked?: boolean; onChange?: (state: boolean) => void; label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange?.(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-accent-pink' : 'bg-surface-card'
        }`}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
      {label && <span className="text-sm text-text-primary">{label}</span>}
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent-pink border-r-accent-lavender animate-spin" />
      </div>
    </div>
  );
}