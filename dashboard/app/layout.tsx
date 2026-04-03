import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Looki Dashboard - your server, but make it cute ✦',
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
        <meta name="theme-color" content="#08070B" />
      </head>
      <body className="bg-bg-void text-text-primary font-body overflow-x-hidden">
        <div className="gradient-mesh" />
        <div className="noise-texture" />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}