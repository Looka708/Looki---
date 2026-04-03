'use client';

import React, { createContext, useContext, useState } from 'react';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (message: string, type: ToastMessage['type'], duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastMessage['type'], duration = 4000) => {
    const id = Date.now().toString();
    const newToast = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

interface ToastProps extends ToastMessage {
  onClose: () => void;
}

function Toast({ id, type, message, onClose }: ToastProps) {
  const typeStyles = {
    success: {
      bg: 'bg-mint/10',
      border: 'border-mint/30 border-l-4 border-l-mint',
      icon: '✓',
      color: 'text-mint',
    },
    error: {
      bg: 'bg-rose/10',
      border: 'border-rose/30 border-l-4 border-l-rose',
      icon: '✕',
      color: 'text-rose',
    },
    info: {
      bg: 'bg-sky/10',
      border: 'border-sky/30 border-l-4 border-l-sky',
      icon: 'ℹ',
      color: 'text-sky',
    },
    warning: {
      bg: 'bg-lemon/10',
      border: 'border-lemon/30 border-l-4 border-l-lemon',
      icon: '⚠',
      color: 'text-lemon',
    },
  };

  const style = typeStyles[type];

  return (
    <div
      className={`
        glass-card ${style.bg} ${style.border}
        flex items-start gap-3 p-4 pointer-events-auto
        animate-slide-in-right
      `}
    >
      <span className={`text-lg font-bold flex-shrink-0 ${style.color}`}>
        {style.icon}
      </span>
      <p className="text-sm text-text-primary flex-1">{message}</p>
      <button
        onClick={onClose}
        className="text-text-secondary hover:text-text-primary transition-colors"
      >
        ✕
      </button>
    </div>
  );
}
