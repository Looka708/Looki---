import type { Metadata } from 'next';
import { Cormorant_Garamond, Syne, DM_Mono, Italiana } from 'next/font/google';
import './globals.css';
import './landing.css';
import BackgroundAww from './components/BackgroundAww';
import FallingPetals from './components/FallingPetals';
import { Providers } from './providers';

// Define fonts
const cormorant = Cormorant_Garamond({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-garamond'
});

const syne = Syne({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne' 
});

const dm_mono = DM_Mono({ 
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono' 
});

const italiana = Italiana({ 
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-italiana' 
});

export const metadata: Metadata = {
  title: 'Looki ✦ the most beautiful Discord bot ever',
  description: 'The most aesthetic Discord dashboard ever built',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#fbcfe8" />
      </head>
      <body className={`${cormorant.variable} ${syne.variable} ${dm_mono.variable} ${italiana.variable}`}>
        {/* We moved global backgrounds inside page-specific layouts or removed them for the landing page */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
