'use client';

import { motion } from 'framer-motion';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to servers if already logged in
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/servers');
    }
  }, [status, session, router]);

  // Show loading while checking auth status
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-border-subtle border-t-pink animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">checking login status...</p>
        </div>
      </div>
    );
  }

  const handleDiscordLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signIn('discord', {
        redirect: true,
        callbackUrl: '/servers',
      });
      if (result?.error) {
        console.error('Login error:', result.error);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-4"
      >
        <div className="glass-card p-10 space-y-8 rounded-3xl shadow-[0_0_50px_rgba(255,182,193,0.15)] relative overflow-hidden">
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-150%] animate-[slide-in-right_2s_ease-out_forwards] pointer-events-none" />
          
          {/* Logo & Branding */}
          <div className="text-center space-y-4 relative z-10">
            <div className="text-6xl font-display mb-2 drop-shadow-[0_0_15px_rgba(255,182,193,0.5)]">🌸</div>
            <h1 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink to-lavender">
              Looki
            </h1>
            <p className="text-text-secondary text-sm font-medium tracking-wide">
              your server, but make it cute ✦
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-pink/40 to-transparent" />

          {/* Auth Section */}
          <div className="space-y-4">
            <p className="text-sm text-text-secondary text-center leading-relaxed">
              Log in with your Discord account to manage your server with the power of cute
            </p>

            <motion.button
              onClick={handleDiscordLogin}
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.05 }}
              whileTap={{ scale: isLoading ? 1 : 0.95 }}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-pink to-lavender rounded-xl font-bold text-bg-void transition-all shadow-[0_0_20px_rgba(255,182,193,0.3)] hover:shadow-[0_0_30px_rgba(255,182,193,0.5)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-500 ease-out skew-x-12" />
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-transparent border-t-surface-base rounded-full animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.492c-1.53-.742-3.247-1.139-5.085-1.139a.75.75 0 00-.75.75v.5c0 .414.336.75.75.75a6.755 6.755 0 012.277.365v2.051a6.755 6.755 0 00-2.277-.365.75.75 0 00-.75.75v.5c0 .414.336.75.75.75 1.395 0 2.72.37 3.869 1.02v2.115c-1.149-.65-2.474-1.02-3.869-1.02a.75.75 0 00-.75.75v2c0 .414.336.75.75.75 1.838 0 3.554.397 5.085 1.139 1.53.742 2.9 1.85 3.899 3.256.998 1.406 1.795 3.09 2.271 4.922.476 1.832.717 3.834.717 5.898 0 .414-.336.75-.75.75H3.75c-.414 0-.75-.336-.75-.75 0-2.064.241-4.066.717-5.898.476-1.832 1.273-3.516 2.271-4.922.998-1.406 2.369-2.514 3.899-3.256z" />
                  </svg>
                  Login with Discord
                </>
              )}
            </motion.button>
          </div>

          {/* Footer Text */}
          <div className="pt-6 border-t border-border-subtle relative z-10">
            <p className="text-xs text-text-tertiary text-center font-medium">
              Made with ♡ • Keep it cute & safe 🌸
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}