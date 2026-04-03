'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { Button, Navbar } from '@/components/ui';
import { motion } from 'framer-motion';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're not loading and session exists
    if (status === 'authenticated' && session) {
      router.push('/servers');
    }
  }, [status, session, router]);

  // Show loading state while checking auth
  if (status === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-border-subtle border-t-pink animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col relative z-10 pt-20">
      <Navbar />

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 text-center py-20 relative">
        {/* Animated Avatar */}
        <div className="mb-8 animate-pulse-glow">
          <div className="w-32 h-32 mx-auto mb-6 text-7xl bg-gradient-to-br from-pink/20 to-lavender/20 rounded-full flex items-center justify-center">
            🌸
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl font-display font-bold mb-4 max-w-2xl leading-tight">
          your server, but make it cute{' '}
          <span className="text-pink">✦</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-text-secondary mb-8 max-w-xl font-body">
          The most aesthetic Discord dashboard ever built. Moderation, levels, roles — wrapped in a soft pink bow.
        </p>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-6 mb-6"
        >
          <Link href="/auth/login">
            <Button variant="primary" size="lg" className="px-8 shadow-glow-pink hover:shadow-glow font-bold w-full sm:w-auto">
              Login with Discord
            </Button>
          </Link>
          <a
            href="https://discord.gg/looki"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" size="lg" className="px-8 w-full sm:w-auto border-border-strong hover:border-pink">
              Join Discord Server
            </Button>
          </a>
        </motion.div>

        {/* Note */}
        <p className="text-sm text-text-tertiary">
          ✦ free to use · no credit card · just vibes
        </p>

        {/* Scrolling Ticker */}
        <div className="mt-16 w-full overflow-hidden">
          <div className="inline-flex animate-scroll gap-8 whitespace-nowrap">
            <span className="text-sm text-text-tertiary">✦ moderation</span>
            <span className="text-sm text-text-tertiary">· leveling</span>
            <span className="text-sm text-text-tertiary">· reaction roles</span>
            <span className="text-sm text-text-tertiary">· giveaways</span>
            <span className="text-sm text-text-tertiary">· music</span>
            <span className="text-sm text-text-tertiary">· welcome</span>
            <span className="text-sm text-text-tertiary">· automod</span>
            <span className="text-sm text-text-tertiary">· analytics</span>
            <span className="text-sm text-text-tertiary">✦ moderation</span>
            <span className="text-sm text-text-tertiary">· leveling</span>
            <span className="text-sm text-text-tertiary">· reaction roles</span>
            <span className="text-sm text-text-tertiary">· giveaways</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-display font-bold text-center mb-16">
            what makes looki special
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div
              className="glass-card p-8 text-center hover:shadow-lg transition-all transform hover:scale-105"
              style={{ perspective: '1000px' }}
            >
              <div className="text-5xl mb-4">🎀</div>
              <h3 className="text-xl font-display font-semibold mb-3">Impossibly Beautiful</h3>
              <p className="text-text-secondary">
                Soft cyberpunk kawaii aesthetic that's so stunning, you'll want to screenshot every setting.
              </p>
            </div>

            {/* Feature 2 */}
            <div
              className="glass-card p-8 text-center hover:shadow-lg transition-all transform hover:scale-105"
              style={{ perspective: '1000px' }}
            >
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-display font-semibold mb-3">Incredibly Powerful</h3>
              <p className="text-text-secondary">
                Full moderation suite, advanced leveling, reaction roles, giveaways, music, and more.
              </p>
            </div>

            {/* Feature 3 */}
            <div
              className="glass-card p-8 text-center hover:shadow-lg transition-all transform hover:scale-105"
              style={{ perspective: '1000px' }}
            >
              <div className="text-5xl mb-4">✦</div>
              <h3 className="text-xl font-display font-semibold mb-3">Type Nothing</h3>
              <p className="text-text-secondary">
                A dashboard so intuitive, you'll never need to type a command again. Just click and save.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-display font-bold mb-10">
            manage everything without leaving your browser
          </h2>
          <div className="glass-card p-8 rounded-2xl bg-gradient-to-br from-pink/5 to-lavender/5 border-2 border-pink/20 shadow-lg">
            <div className="bg-bg-elevated rounded-lg p-8 text-center">
              <div className="text-9xl mb-4 opacity-30">📊</div>
              <p className="text-text-secondary">Dashboard preview coming soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border-subtle text-center text-text-secondary text-sm">
        <div className="max-w-6xl mx-auto">
          <p className="mb-4">made with ♡ by looki team</p>
          <div className="flex justify-center gap-6">
            <a href="#" className="hover:text-pink transition-colors">
              GitHub
            </a>
            <a href="#" className="hover:text-pink transition-colors">
              Discord
            </a>
            <a href="#" className="hover:text-pink transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-pink transition-colors">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}