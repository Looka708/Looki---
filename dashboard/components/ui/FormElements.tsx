'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export function Input({
  label,
  error,
  helperText,
  icon,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">{icon}</div>}
        <input
          className={`
            glass-input w-full
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-rose focus:border-rose focus:shadow-[0_0_0_3px_rgba(255,158,174,0.12)]' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-rose mt-1">{error}</p>}
      {helperText && !error && <p className="text-xs text-text-tertiary mt-1">{helperText}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Textarea({
  label,
  error,
  helperText,
  className = '',
  ...props
}: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-2">
          {label}
        </label>
      )}
      <textarea
        className={`
          glass-input w-full resize-none rounded-md
          ${error ? 'border-rose focus:border-rose focus:shadow-[0_0_0_3px_rgba(255,158,174,0.12)]' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-rose mt-1">{error}</p>}
      {helperText && !error && <p className="text-xs text-text-tertiary mt-1">{helperText}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export function Select({
  label,
  error,
  options,
  className = '',
  ...props
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-2">
          {label}
        </label>
      )}
      <select
        className={`
          glass-input appearance-none w-full bg-no-repeat
          ${error ? 'border-rose focus:border-rose' : ''}
          ${className}
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23FFB6C1' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
          backgroundPosition: 'right 12px center',
          paddingRight: '36px',
        }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-bg-elevated text-text-primary">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-rose mt-1">{error}</p>}
    </div>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11
          items-center rounded-full
          transition-all duration-250
          ${checked
            ? 'bg-gradient-to-r from-pink to-pink-dim shadow-glow-pink'
            : 'bg-bg-elevated border border-border-subtle'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span
          className={`
            inline-block h-5 w-5 transform
            rounded-full bg-white shadow-sm
            transition-all duration-250
            ${checked ? 'translate-x-5' : 'translate-x-0.5'}
            ${checked ? 'shadow-glow-pink' : ''}
          `}
        />
      </button>
      {label && (
        <label
          onClick={() => !disabled && onChange(!checked)}
          className={`text-sm font-medium ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} text-text-secondary`}
        >
          {label}
        </label>
      )}
    </div>
  );
}
