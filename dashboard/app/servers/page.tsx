'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { GlassCard, Button, Navbar } from '@/components/ui';
import { motion } from 'framer-motion';

interface Guild {
  id: string;
  name: string;
  icon?: string;
  owner: boolean;
  permissions: number;
  looki?: boolean;
}

export default function ServersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only redirect if status is not loading and there's no session
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    // Fetch user guilds when authenticated
    if (status === 'authenticated') {
      fetchGuilds();
    }
  }, [status, router]);

  const fetchGuilds = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/guilds', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        console.error('Failed to fetch guilds:', res.status, res.statusText);
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.guilds) {
        setGuilds(data.guilds);
      }
    } catch (error) {
      console.error('Failed to fetch guilds:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking auth
  if (status === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-border-subtle border-t-pink animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">authenticating...</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-24 relative z-10">
      <Navbar />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-display font-bold mb-2">
            welcome back, {session.user?.name} 🌸
          </h1>
          <p className="text-lg text-text-secondary">
            which server are we managing today?
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="w-12 h-12 rounded-full border-2 border-border-subtle border-t-pink animate-spin" />
            </div>
            <p className="text-text-secondary mt-4">loading your servers...</p>
          </div>
        )}

        {/* Servers Grid */}
        {!loading && (
          <>
            {guilds.length > 0 ? (
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 flex-1"
              >
                {guilds.map((guild) => (
                  <motion.div key={guild.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                    <ServerCard guild={guild} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="glass-card p-12 text-center mb-8">
                <div className="text-5xl mb-4">🌸</div>
                <p className="text-text-secondary">looki isn't in any servers yet</p>
                <Button variant="ghost" className="mt-4">
                  Invite Looki
                </Button>
              </div>
            )}

            {/* Add Server Button */}
            <div className="text-center">
              <p className="text-sm text-text-tertiary mb-4">can't find your server?</p>
              <a
                href={`${process.env.NEXT_PUBLIC_BOT_INVITE_URL || '#'}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="primary">+ Invite Looki to Another Server</Button>
              </a>
            </div>
          </>
        )}
      </motion.div>
    </main>
  );
}

interface ServerCardProps {
  guild: Guild;
}

function ServerCard({ guild }: ServerCardProps) {
  const getGuildIconUrl = (guildId: string, icon: string) => {
    if (!icon) {
      return `https://cdn.discordapp.com/embed/avatars/${Math.floor(Math.random() * 5)}.png`;
    }
    return `https://cdn.discordapp.com/icons/${guildId}/${icon}.webp`;
  };

  if (guild.looki) {
    return (
      <Link href={`/dashboard/${guild.id}`}>
        <GlassCard className="p-6 h-full flex flex-col items-center text-center group bg-bg-surface/50 border-pink/30 hover:border-pink glow-transition">
          <img
            src={getGuildIconUrl(guild.id, guild.icon || '')}
            alt={guild.name}
            className="w-16 h-16 rounded-full mb-4 shadow-glow-sm"
          />
          <h3 className="font-semibold text-base mb-2 line-clamp-2 text-text-primary">{guild.name}</h3>
          <p className="text-sm text-text-secondary mb-4">Click to manage</p>
          <div className="mt-auto inline-flex items-center gap-2 px-3 py-1.5 bg-mint/10 border border-mint/30 text-mint text-xs rounded-full font-medium shadow-[0_0_10px_rgba(181,234,215,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
            Active
          </div>
        </GlassCard>
      </Link>
    );
  }

  return (
    <GlassCard className="p-6 h-full flex flex-col items-center text-center opacity-70 hover:opacity-100 transition-all cursor-pointer hover:border-text-secondary">
      <img
        src={getGuildIconUrl(guild.id, guild.icon || '')}
        alt={guild.name}
        className="w-16 h-16 rounded-full mb-4 grayscale opacity-50 transition-all hover:grayscale-0 hover:opacity-100"
      />
      <h3 className="font-semibold text-base mb-2 line-clamp-2 text-text-primary">{guild.name}</h3>
      <p className="text-sm text-text-secondary mb-4">No Looki here</p>
      <div className="mt-auto">
        <a href={process.env.NEXT_PUBLIC_BOT_INVITE_URL || '#'} target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="sm" className="border-border-strong hover:border-white text-white">
            Add Looki
          </Button>
        </a>
      </div>
    </GlassCard>
  );
}
