/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Backgrounds - Landing Theme (Soft Noir Sakura) */
        'landing-void': 'var(--void)',
        'landing-abyss': 'var(--abyss)',
        'landing-depth': 'var(--depth)',
        'landing-surface': 'var(--surface)',
        'landing-raised': 'var(--raised)',
        'landing-mist': 'var(--mist)',

        'sakura-100': 'var(--sakura-100)',
        'sakura-200': 'var(--sakura-200)',
        'sakura-300': 'var(--sakura-300)',
        'sakura-400': 'var(--sakura-400)',
        'sakura-500': 'var(--sakura-500)',
        'sakura-600': 'var(--sakura-600)',

        'landing-text-0': 'var(--text-0)',
        'landing-text-1': 'var(--text-1)',
        'landing-text-2': 'var(--text-2)',
        'landing-text-3': 'var(--text-3)',
        'landing-text-4': 'var(--text-4)',
        'landing-text-accent': 'var(--text-accent)',

        /* Backgrounds - Light Theme Dashboard (Existing) */
        'bg-void': '#FFFFFF',
        'bg-base': '#F8F7FB',
        'bg-surface': '#FFFFFF',
        'bg-elevated': '#F5F3F9',
        'bg-overlay': '#EFEFEF',
        'bg-input': '#FAFAF9',

        /* Primary Accents */
        'pink': '#E85D75',
        'pink-dim': '#D94861',

        /* Secondary Accents */
        'lavender': '#9B6BA8',
        'peach': '#E8A85C',
        'mint': '#4ECB71',
        'rose': '#E8697E',
        'sky': '#5BA3C7',
        'lemon': '#F5C468',

        /* Text */
        'text-primary': '#2D2D2D',
        'text-secondary': '#6B6B6B',
        'text-tertiary': '#949494',

        /* Semantic */
        'success': '#4ECB71',
        'warning': '#F5C468',
        'danger': '#E8697E',
        'info': '#5BA3C7',

        /* Legacy aliases for compatibility */
        'surface-base': '#F8F7FB',
        'surface-card': '#FFFFFF',
        'surface-elevated': '#F5F3F9',
        'accent-pink': '#E85D75',
        'accent-lavender': '#9B6BA8',
        'accent-peach': '#E8A85C',
        'pink-border': 'rgba(232, 93, 117, 0.2)',
        'pink-glow': 'rgba(232, 93, 117, 0.15)',
      },
      borderColor: {
        'landing-0': 'var(--border-0)',
        'landing-1': 'var(--border-1)',
        'landing-2': 'var(--border-2)',
        'landing-3': 'var(--border-3)',
        'landing-hot': 'var(--border-hot)',
        
        'glass': 'rgba(232,93,117,0.2)',
        'subtle': 'rgba(232,93,117,0.08)',
        'strong': 'rgba(232,93,117,0.3)',
        'focus': 'rgba(232,93,117,0.5)',
      },
      boxShadow: {
        'sm': '0 2px 8px rgba(0,0,0,0.06)',
        'md': '0 4px 20px rgba(0,0,0,0.08), 0 0 0 1px rgba(232,93,117,0.08)',
        'lg': '0 8px 40px rgba(0,0,0,0.12), 0 0 30px rgba(232,93,117,0.15)',
        'glow': '0 0 40px rgba(232,93,117,0.15), 0 0 80px rgba(232,93,117,0.08)',
        'glow-sm': '0 0 20px rgba(232,93,117,0.12)',
        'glow-pink': '0 0 40px rgba(232,93,117,0.15)',
        'glow-rose': '0 0 20px rgba(232,105,126,0.15)',
        'glow-mint': '0 0 20px rgba(78,203,113,0.15)',
        'glow-peach': '0 0 20px rgba(232,168,92,0.15)',
      },
      backdropBlur: {
        'glass': 'blur(24px)',
      },
      fontFamily: {
        // Landing Page specific
        'garamond': ['var(--font-garamond)', 'Georgia', 'serif'],
        'syne': ['var(--font-syne)', 'sans-serif'],
        'dm-mono': ['var(--font-dm-mono)', 'monospace'],
        'italiana': ['var(--font-italiana)', 'serif'],
        
        // Existing Dashboard
        'display': ['Playfair Display', 'Georgia', 'serif'],
        'body': ['DM Sans', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
        'script': ['Dancing Script', 'cursive'],
      },
      fontSize: {
        'xs': ['11px', { lineHeight: '1.2' }],
        'sm': ['13px', { lineHeight: '1.5' }],
        'base': ['14px', { lineHeight: '1.5' }],
        'md': ['15px', { lineHeight: '1.5' }],
        'lg': ['17px', { lineHeight: '1.5' }],
        'xl': ['20px', { lineHeight: '1.2' }],
        '2xl': ['24px', { lineHeight: '1.2' }],
        '3xl': ['30px', { lineHeight: '1.2' }],
        '4xl': ['38px', { lineHeight: '1.2' }],
      },
      letterSpacing: {
        'tight': '-0.02em',
        'normal': '0em',
        'wide': '0.04em',
        'wider': '0.08em',
        'widest': '0.15em',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        'sidebar': '240px',
        'sidebar-collapsed': '64px',
        'topnav': '60px',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '28px',
      },
      width: {
        'sidebar': '240px',
        'sidebar-collapsed': '64px',
      },
      height: {
        'topnav': '60px',
      },
      maxWidth: {
        'content': '1320px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in-down': 'slideInDown 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        slideInDown: {
          'from': { transform: 'translateY(-20px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInUp: {
          'from': { transform: 'translateY(20px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          'from': { transform: 'translateX(100%)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          'from': { transform: 'scale(0.92)', opacity: '0' },
          'to': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 40px rgba(255,182,193,0.18)' },
          '50%': { boxShadow: '0 0 60px rgba(255,182,193,0.18)' },
        },
      },
    },
  },
  plugins: [],
};