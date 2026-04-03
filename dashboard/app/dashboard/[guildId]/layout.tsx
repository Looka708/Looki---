'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Topnav } from '@/components/layout/Topnav';
import { Sidebar } from '@/components/layout/Sidebar';
import { FiLoader, FiAlertTriangle, FiX } from 'react-icons/fi';

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
  params,
}: {
  children: React.ReactNode;
  params: { guildId: string };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [guildId, setGuildId] = useState<string>('');
  const [guild, setGuild] = useState<{ name: string; icon: string | null } | null>(null);
  const [loadingGuild, setLoadingGuild] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Resolve params and set guildId
  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await Promise.resolve(params);
      setGuildId(resolved?.guildId || '');
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    async function validateGuild() {
      if (!session || !guildId) {
        setLoadingGuild(false);
        return;
      }
      
      try {
        setError('');
        setLoadingGuild(true);
        console.log(`Validating guild: ${guildId}`);
        const res = await fetch(`/api/guilds/${guildId}`);
        
        if (!res.ok) {
          const errorData = await res.json();
          console.error('Guild validation error:', errorData);
          setError(errorData.message || 'Failed to load server');
          setGuild(null);
          
          // Redirect to servers page after 2 seconds
          setTimeout(() => router.push('/servers'), 2000);
        } else {
          const data = await res.json();
          if (data.guild) {
            console.log('Guild loaded:', data.guild);
            setGuild({
              name: data.guild.name,
              icon: data.guild.icon,
            });
          }
        }
      } catch (error) {
        console.error('Guild validation failed:', error);
        setError('Failed to load server');
      } finally {
        setLoadingGuild(false);
      }
    }
    
    if (status === 'authenticated' && guildId) {
      validateGuild();
    }
  }, [session, status, guildId, router]);

  // Show loading state while checking auth and validating guild
  if (status === 'loading' || loadingGuild) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="text-4xl text-[#E85D75] animate-spin mb-4 mx-auto" />
          <p className="text-[#2D2D2D]">Loading server...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Show error state if guild validation failed
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <FiAlertTriangle className="text-5xl text-[#E85D75] mb-4 mx-auto" />
          <h1 className="text-2xl font-bold text-[#E85D75] mb-2">Access Denied</h1>
          <p className="text-[#666] mb-4">{error}</p>
          <p className="text-sm text-[#999]">Redirecting to servers...</p>
        </div>
      </div>
    );
  }

  // Show error if guild wasn't loaded
  if (!guild) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <FiX className="text-5xl text-[#E85D75] mb-4 mx-auto" />
          <h1 className="text-2xl font-bold text-[#E85D75] mb-2">Server Not Found</h1>
          <p className="text-[#666]">The server you're looking for doesn't exist or you don't have access to it.</p>
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
        <main className="flex-1 ml-60 transition-all duration-300">
          <div className="min-h-[calc(100vh-60px)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
