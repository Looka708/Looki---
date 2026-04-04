'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { FiStar } from 'react-icons/fi';

interface Guild {
  id: string;
  name: string;
  icon: string | null;
}

interface TopnavProps {
  guildName?: string;
  guildIcon?: string | null;
  guildId?: string;
}

export function Topnav({ guildName, guildIcon, guildId }: TopnavProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isServerMenuOpen, setIsServerMenuOpen] = useState(false);
  const [guilds, setGuilds] = useState<Guild[]>([]);

  useEffect(() => {
    async function fetchGuilds() {
      if (!session) return;
      try {
        const res = await fetch('/api/guilds');
        if (res.ok) {
          const data = await res.json();
          setGuilds(data.guilds || []);
        }
      } catch (error) {
        console.error('Failed to fetch guilds', error);
      }
    }
    fetchGuilds();
  }, [session]);

  const handleGuildChange = (newGuildId: string) => {
    const currentPath = pathname?.replace(/\/dashboard\/[^/]+/, '') || '';
    router.push(`/dashboard/${newGuildId}${currentPath}`);
    setIsServerMenuOpen(false);
  };

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 h-[60px] z-40
        bg-bg-base/50 backdrop-blur-glass border-b border-border-subtle
        flex items-center justify-between px-6
      `}
    >
      {/* Left Section - Logo and Server Info */}
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl text-accent-pink">
            <FiStar />
          </span>
          <span className="text-2xl font-display font-bold">looki</span>
        </Link>

        {guildName && (
          <>
            <div className="w-px h-6 bg-border-subtle" />
            <div className="relative">
              <button
                onClick={() => setIsServerMenuOpen(!isServerMenuOpen)}
                className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                {guildIcon && (
                  guildIcon.startsWith('http') ? (
                    <img src={guildIcon} alt={guildName} className="w-6 h-6 rounded-full ring-1 ring-pink/20" />
                  ) : (
                    <span>{guildIcon}</span>
                  )
                )}
                <span className="text-text-primary font-medium">{guildName}</span>
                <span className="text-xs">▼</span>
              </button>

              {isServerMenuOpen && (
                <div className="absolute left-0 mt-2 w-56 glass-card rounded-lg animate-scale-in z-50 max-h-80 overflow-y-auto">
                  {guilds.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => handleGuildChange(g.id)}
                      className={`
                        w-full px-4 py-2 text-left text-sm flex items-center gap-2
                        hover:bg-pink-surface/50 transition-colors
                        ${g.id === guildId ? 'text-pink bg-pink-surface/30' : 'text-text-secondary'}
                      `}
                    >
                      {g.icon ? (
                        <img src={g.icon} alt={g.name} className="w-5 h-5 rounded-full" />
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-gradient-to-br from-pink to-lavender flex items-center justify-center text-xs">
                          🌸
                        </span>
                      )}
                      <span className="truncate">{g.name}</span>
                      {g.id === guildId && <span className="ml-auto text-pink">✓</span>}
                    </button>
                  ))}
                  <div className="border-t border-border-subtle mt-1">
                    <Link
                      href="/servers"
                      className="block px-4 py-2 text-sm text-pink hover:bg-pink-surface/30 transition-colors"
                      onClick={() => setIsServerMenuOpen(false)}
                    >
                      View All Servers
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Center Section - Search */}
      <div className="hidden md:block flex-1 max-w-md mx-8">
        <div className="relative">
          <input
            type="text"
            placeholder="search commands, users, cases..."
            className="glass-input w-full text-sm pl-4"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-tertiary">
            ⌘K
          </span>
        </div>
      </div>

      {/* Right Section - Notifications, Help, User Menu */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 hover:bg-bg-overlay rounded-lg transition-colors group">
          <span className="text-lg">🔔</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-pink rounded-full animate-pulse group-hover:animate-none" />
        </button>

        {/* Help */}
        <button className="p-2 hover:bg-bg-overlay rounded-lg transition-colors">
          <span className="text-lg">?</span>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-bg-overlay rounded-lg transition-colors group"
          >
            {session?.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="w-8 h-8 rounded-full group-hover:ring-2 ring-pink transition-all"
              />
            )}
            <span className="hidden sm:block text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
              {session?.user?.name}
            </span>
            <span className="text-xs text-text-tertiary">▼</span>
          </button>

          {/* User Menu Dropdown */}
          {isUserMenuOpen && (
            <div
              className={`
                absolute right-0 mt-2 w-48
                glass-card rounded-lg
                animate-scale-in
                z-50
              `}
            >
              <Link
                href="/profile"
                className="block px-4 py-2 text-sm text-text-secondary hover:text-pink transition-colors border-b border-border-subtle"
              >
                View Profile
              </Link>
              <Link
                href="/servers"
                className="block px-4 py-2 text-sm text-text-secondary hover:text-pink transition-colors border-b border-border-subtle"
              >
                Switch Account
              </Link>
              <Link
                href="/docs"
                className="block px-4 py-2 text-sm text-text-secondary hover:text-pink transition-colors border-b border-border-subtle"
              >
                Documentation
              </Link>
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-rose hover:bg-rose/10 transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

interface BreadcrumbProps {
  items: Array<{ label: string; href?: string }>;
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="flex items-center gap-2 text-sm mt-4 ml-6">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-text-tertiary">/</span>}
          {item.href ? (
            <Link href={item.href} className="text-text-tertiary hover:text-text-primary transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-text-primary font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
