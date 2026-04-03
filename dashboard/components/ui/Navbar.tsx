'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from './Button';
import { motion } from 'framer-motion';

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 w-full z-50 py-4 px-6 md:px-12 backdrop-blur-glass bg-bg-void/40 border-b border-border-subtle"
    >
      <div className="max-w-content mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div 
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            className="text-2xl"
          >
            🌸
          </motion.div>
          <span className="text-xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink to-lavender group-hover:from-lavender group-hover:to-pink transition-all duration-300">
            looki
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          {status === 'loading' ? (
            <div className="w-24 h-10 rounded-full bg-bg-elevated animate-pulse" />
          ) : session ? (
            <div className="flex items-center gap-4">
              <Link href="/servers" className="text-sm font-medium text-text-secondary hover:text-pink transition-colors">
                Servers
              </Link>
              <div className="h-6 w-px bg-border-strong" />
              <div className="flex items-center gap-3">
                <img 
                  src={session.user?.image || 'https://cdn.discordapp.com/embed/avatars/0.png'} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full border border-pink/30 hover:border-pink transition-colors"
                />
                <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
                  Logout
                </Button>
              </div>
            </div>
          ) : (
            <Link href="/auth/login">
              <Button variant="primary" size="sm" className="shadow-sm shadow-pink-glow hover:shadow-md hover:shadow-pink-glow">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
