'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export function UserMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (!session?.user) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 glass-card rounded-lg hover:shadow-glow transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent-pink to-accent-lavender flex items-center justify-center text-sm font-bold text-surface-base">
          {session.user.name?.charAt(0) || 'U'}
        </div>
        <span className="text-sm font-semibold text-text-primary hidden sm:inline">
          {session.user.name}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 glass-card rounded-lg shadow-glow z-50 overflow-hidden">
          <div className="p-3 border-b border-glass">
            <p className="text-sm font-semibold text-text-primary">{session.user.name}</p>
            <p className="text-xs text-text-secondary">{session.user.email}</p>
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
              signOut({ callbackUrl: '/auth/login' });
            }}
            className="w-full px-4 py-2 text-left text-sm text-danger hover:bg-danger/10 transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
