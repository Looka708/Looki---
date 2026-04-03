'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

// Cute animated header with particles
export function CuteHeader({ title, subtitle, emoji, icon }: { title: string; subtitle?: string; emoji?: string; icon?: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex items-center gap-3 mb-2">
        {icon && <span className="text-4xl text-accent-pink">{icon}</span>}
        {emoji && <span className="text-4xl">{emoji}</span>}
        <h1 className="text-4xl font-bold bg-gradient-to-r from-accent-pink via-accent-lavender to-accent-peach bg-clip-text text-transparent">
          {title}
        </h1>
      </div>
      {subtitle && <p className="text-text-secondary ml-12">{subtitle}</p>}
    </motion.div>
  );
}

// Cute animated section card
export function CuteSection({ title, emoji, icon, children, className = '' }: { title: string; emoji?: string; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`glass-card rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 border border-accent-pink/20 backdrop-blur-2xl ${className}`}
    >
      <div className="flex items-center gap-3 mb-6">
        {icon && <span className="text-2xl text-accent-pink">{icon}</span>}
        {emoji && <span className="text-2xl">{emoji}</span>}
        <h2 className="text-xl font-bold text-accent-pink">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

// Cute toggle with animation
export function CuteToggle({ enabled = false, onChange, label, icon }: { enabled?: boolean; onChange?: (state: boolean) => void; label: string; icon?: string }) {
  return (
    <motion.div
      initial={false}
      whileHover={{ scale: 1.02 }}
      className="flex items-center justify-between p-4 rounded-xl bg-surface-card/50 border border-accent-pink/10 hover:border-accent-pink/30 transition-colors"
    >
      <div className="flex items-center gap-3">
        {icon && <span className="text-xl">{icon}</span>}
        <span className="text-text-primary font-medium">{label}</span>
      </div>
      <button
        onClick={() => onChange?.(!enabled)}
        className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
          enabled ? 'bg-gradient-to-r from-accent-pink to-accent-lavender' : 'bg-surface-elevated'
        }`}
      >
        <motion.div
          animate={{ x: enabled ? 24 : 4 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
        />
      </button>
    </motion.div>
  );
}

// Cute input field
export function CuteInput({ label, icon, placeholder = '', value = '', onChange, type = 'text' }: { label?: string; icon?: string; placeholder?: string; value?: string; onChange?: (e: any) => void; type?: string }) {
  return (
    <motion.div
      initial={false}
      whileHover={{ scale: 1.01 }}
      className="flex flex-col gap-2"
    >
      {label && (
        <label className="text-sm font-semibold text-text-primary flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="px-4 py-3 rounded-xl bg-surface-card border border-accent-pink/20 text-text-primary placeholder-text-tertiary focus:border-accent-pink/50 focus:outline-none focus:ring-2 focus:ring-accent-pink/20 transition-all duration-300"
      />
    </motion.div>
  );
}

// Cute button with multiple styles
export function CuteButton({ 
  children, 
  variant = 'primary', 
  icon, 
  onClick, 
  disabled = false,
  loading = false, 
  className = '' 
}: { 
  children: ReactNode; 
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'; 
  icon?: ReactNode; 
  onClick?: () => void; 
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}) {
  const variants = {
    primary: 'bg-gradient-to-r from-accent-pink to-accent-lavender text-white hover:shadow-lg hover:shadow-accent-pink/50',
    secondary: 'bg-surface-elevated border border-accent-lavender/50 text-accent-lavender hover:border-accent-lavender',
    danger: 'bg-gradient-to-r from-danger to-warning text-white hover:shadow-lg hover:shadow-danger/50',
    success: 'bg-gradient-to-r from-success to-mint text-white hover:shadow-lg hover:shadow-success/50',
    ghost: 'bg-transparent border border-accent-pink/30 text-accent-pink hover:bg-accent-pink/10',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {loading && <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="text-lg">⏳</motion.div>}
      {icon && !loading && <span className="text-lg">{icon}</span>}
      {children}
    </motion.button>
  );
}

// Cute status badge with animation
export function CuteStatusBadge({ status, label }: { status: 'online' | 'offline' | 'idle' | 'away'; label?: string }) {
  const statusColors = {
    online: 'from-success to-mint',
    offline: 'from-text-secondary to-text-tertiary',
    idle: 'from-warning to-accent-peach',
    away: 'from-info to-sky',
  };

  return (
    <motion.div
      animate={{ y: [0, -2, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${statusColors[status]} text-white bg-opacity-20 border border-white/20`}
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-2 h-2 rounded-full bg-white"
      />
      {label || status.charAt(0).toUpperCase() + status.slice(1)}
    </motion.div>
  );
}

// Cute info box with icon
export function CuteInfoBox({ type = 'info', title, message }: { type?: 'info' | 'warning' | 'success' | 'error'; title?: string; message: string }) {
  const typeStyles = {
    info: 'from-info/20 to-sky/20 border-info/30 text-info',
    warning: 'from-warning/20 to-accent-peach/20 border-warning/30 text-warning',
    success: 'from-success/20 to-mint/20 border-success/30 text-success',
    error: 'from-danger/20 to-rose/20 border-danger/30 text-danger',
  };

  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    success: '✨',
    error: '❌',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex gap-3 p-4 rounded-xl bg-gradient-to-r ${typeStyles[type]} border backdrop-blur-sm`}
    >
      <span className="text-lg">{icons[type]}</span>
      <div>
        {title && <p className="font-semibold">{title}</p>}
        <p className="text-sm opacity-90">{message}</p>
      </div>
    </motion.div>
  );
}

// Cute select dropdown
export function CuteSelect({ label, icon, options, value = '', onChange }: { label?: string; icon?: string; options: Array<{ value: string; label: string; icon?: string }>; value?: string; onChange?: (val: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-semibold text-text-primary flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="px-4 py-3 rounded-xl bg-surface-card border border-accent-pink/20 text-text-primary focus:border-accent-pink/50 focus:outline-none focus:ring-2 focus:ring-accent-pink/20 transition-all duration-300 appearance-none"
      >
        <option value="">Select an option...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.icon ? `${opt.icon} ${opt.label}` : opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Cute stat display
export function CuteStat({ emoji, icon, label, value, change }: { emoji?: string; icon?: ReactNode; label: string; value: string | number; change?: number }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="p-4 rounded-xl bg-gradient-to-br from-accent-pink/10 to-accent-lavender/10 border border-accent-pink/20 text-center"
    >
      <div className="text-3xl mb-2">
        {icon ? <span className="text-accent-pink">{icon}</span> : emoji}
      </div>
      <p className="text-text-secondary text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold text-accent-pink mt-1">{value}</p>
      {change !== undefined && (
        <p className={`text-xs mt-2 ${change >= 0 ? 'text-success' : 'text-danger'}`}>
          {change >= 0 ? '📈' : '📉'} {Math.abs(change)}%
        </p>
      )}
    </motion.div>
  );
}

// Cute divider
export function CuteDivider() {
  return <div className="h-px bg-gradient-to-r from-transparent via-accent-pink/30 to-transparent my-6" />;
}

// Cute empty state
export function CuteEmptyState({ emoji, icon, title, message }: { emoji?: string; icon?: ReactNode; title: string; message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 gap-3"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-6xl text-accent-pink"
      >
        {icon || emoji}
      </motion.div>
      <h3 className="text-xl font-bold text-text-primary">{title}</h3>
      <p className="text-text-secondary text-sm max-w-xs text-center">{message}</p>
    </motion.div>
  );
}

// Cute settings item
export function CuteSettingsItem({ icon, title, description, action }: { icon?: ReactNode | string; title: string; description: string; action: ReactNode }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="flex items-center justify-between p-4 rounded-xl bg-surface-card/50 border border-accent-pink/10 hover:border-accent-pink/30 transition-colors"
    >
      <div className="flex items-center gap-4">
        <span className={`text-2xl ${typeof icon !== 'string' ? 'text-accent-pink' : ''}`}>{icon}</span>
        <div>
          <h3 className="font-semibold text-text-primary">{title}</h3>
          <p className="text-sm text-text-secondary">{description}</p>
        </div>
      </div>
      {action}
    </motion.div>
  );
}

// Cute table component
interface CuteTableColumn {
  key: string;
  label: string;
  icon?: ReactNode;
  width?: string;
  render?: (value: any, row: any) => ReactNode;
}

interface CuteTableProps {
  columns: CuteTableColumn[];
  data: any[];
  rowClassName?: string;
  onRowClick?: (row: any) => void;
  emptyMessage?: string;
  striped?: boolean;
}

export function CuteTable({ columns, data, rowClassName = '', onRowClick, emptyMessage = 'No data available', striped = true }: CuteTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-accent-pink/20 overflow-hidden backdrop-blur-sm bg-white/50 dark:bg-bg-base/30"
    >
      {data.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-text-secondary">{emptyMessage}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-accent-pink/20 bg-gradient-to-r from-accent-pink/5 to-accent-lavender/5">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    className="text-left py-4 px-6 text-text-secondary font-semibold flex items-center gap-2"
                  >
                    {col.icon && <span className="text-lg">{col.icon}</span>}
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-accent-pink/10 hover:bg-gradient-to-r hover:from-accent-pink/10 hover:to-accent-lavender/10 transition-all duration-200 ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${striped && idx % 2 !== 0 ? 'bg-accent-pink/5' : ''} ${rowClassName}`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{ width: col.width }}
                      className="py-4 px-6 text-text-primary"
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
