'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Topnav } from '@/components/layout/Topnav';
import { Sidebar } from '@/components/layout/Sidebar';
import { FiAlertTriangle, FiX, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import { Button } from '@/components/ui';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  submenu?: NavItem[];
}

const navItems: NavItem[] = [
  {
    label: 'Overview',
    href: '',
    icon: '📊',
  },
  {
    label: 'Server Management',
    href: '/manage',
    icon: '🌸',
  },
  {
    label: 'Moderation',
    href: '/moderation',
    icon: '🛡️',
    submenu: [
      { label: 'Actions', href: '/moderation/actions', icon: '' },
      { label: 'Warnings', href: '/moderation/warnings', icon: '' },
      { label: 'AutoMod', href: '/moderation/automod', icon: '' },
    ],
  },
  {
    label: 'Leveling',
    href: '/leveling',
    icon: '📈',
    submenu: [
      { label: 'Leaderboard', href: '/leveling/leaderboard', icon: '' },
      { label: 'Settings', href: '/leveling/settings', icon: '' },
    ],
  },
  {
    label: 'Roles',
    href: '/roles',
    icon: '🏷️',
    submenu: [
      { label: 'Reaction Roles', href: '/roles/reaction', icon: '' },
      { label: 'Auto Roles', href: '/roles/auto', icon: '' },
      { label: 'Button Roles', href: '/roles/button', icon: '' },
    ],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: '⚙️',
    submenu: [
      { label: 'General', href: '/settings/general', icon: '' },
      { label: 'Logs', href: '/settings/logs', icon: '' },
      { label: 'Permissions', href: '/settings/permissions', icon: '' },
      { label: 'Danger Zone', href: '/settings/danger', icon: '' },
    ],
  },
];

export default function GuildLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const guildId = params?.guildId as string;
  
  const [guild, setGuild] = useState<{ name: string; icon: string | null } | null>(null);
  const [loadingGuild, setLoadingGuild] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Track previous guildId to avoid flickering when we already have the guild data
  const prevGuildId = useRef<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    async function validateGuild() {
      if (!session || !guildId) {
        setLoadingGuild(false);
        return;
      }
      
      // If we are already loading this specific guild AND we have it, don't show flicker
      if (prevGuildId.current === guildId && guild) {
        setLoadingGuild(false);
        return;
      }

      try {
        setError('');
        // Only show full-page loader if it's a new guildId OR the first time
        if (prevGuildId.current !== guildId) {
          setLoadingGuild(true);
          setGuild(null);
        }

        console.log(`Validating guild: ${guildId}`);
        const res = await fetch(`/api/guilds/${guildId}`);
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error(`Guild validation error (${res.status}):`, errorData);
          setError(errorData.message || 'Failed to load server');
          setGuild(null);
        } else {
          const data = await res.json();
          if (data.guild) {
            console.log('Guild loaded:', data.guild);
            setGuild({
              name: data.guild.name,
              icon: data.guild.icon,
            });
            prevGuildId.current = guildId;
          }
        }
      } catch (error) {
        console.error('Guild validation failed:', error);
        setError('Failed to load server. Please check your connection.');
      } finally {
        setLoadingGuild(false);
      }
    }
    
    if (status === 'authenticated' && guildId) {
      validateGuild();
    }
  }, [session, status, guildId, guild]);

  // Handle loading state
  if (status === 'loading' || (loadingGuild && !guild && !error)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-border-subtle border-t-pink rounded-full animate-spin shadow-glow-pink mx-auto mb-4" />
          <p className="text-text-primary font-medium">Entering Server...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  // Show error state if guild validation failed
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-md p-8 rounded-3xl border border-border-subtle bg-bg-base/50 shadow-xl backdrop-blur-xl">
          <div className="w-20 h-20 bg-pink/10 rounded-full flex items-center justify-center mx-auto mb-6">
             <FiAlertTriangle className="text-4xl text-pink" />
          </div>
          <h1 className="text-2xl font-display font-bold text-text-primary mb-3">Access Problem</h1>
          <p className="text-text-secondary mb-8 leading-relaxed">{error}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
             <Button variant="ghost" className="w-full sm:w-auto" onClick={() => router.push('/servers')}>
                <FiArrowLeft className="mr-2" /> Back to Servers
             </Button>
             <Button variant="primary" className="w-full sm:w-auto shadow-glow-pink" onClick={() => window.location.reload()}>
                <FiRefreshCw className="mr-2" /> Retry
             </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show error if guild wasn't loaded but error was missed
  if (!guild && !loadingGuild) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <FiX className="text-5xl text-pink mb-4 mx-auto" />
          <h1 className="text-2xl font-display font-bold text-text-primary mb-2">Server Not Found</h1>
          <p className="text-text-secondary mb-6">The server you're looking for doesn't exist or you don't have access to it.</p>
          <Button variant="primary" onClick={() => router.push('/servers')}>
             Browse Your Servers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base flex flex-col relative z-5">
      {/* Dynamic Topnav */}
      <Topnav 
        guildId={guildId}
        guildName={guild?.name || 'Unknown Server'} 
        guildIcon={guild?.icon || null} 
      />

      {/* Main Layout */}
      <div className="flex flex-1 mt-[60px]">
        {/* Sidebar */}
        <Sidebar guildId={guildId} navItems={navItems} />

        {/* Content */}
        <main className="flex-1 ml-64 transition-all duration-300">
          <div className="min-h-[calc(100vh-60px)] relative">
             {/* Subtle layout transition when navigating sub-pages? */}
             <div className="absolute inset-0 bg-aww pointer-events-none opacity-20 mix-blend-multiply" />
             <div className="relative z-10">
                {children}
             </div>
          </div>
        </main>
      </div>
    </div>
  );
}
