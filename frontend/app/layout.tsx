import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Strategic Industrial Intelligence',
  description: 'Open-source intelligence dashboard for U.S. industrial base health and supply chain dependencies across national security sectors.',
  metadataBase: new URL('https://strategic-intel-flax.vercel.app'),
  openGraph: {
    title: 'Strategic Industrial Intelligence',
    description: 'Map-first dashboard for U.S. critical mineral supply chains, defense industrial base, and cross-sector dependencies.',
    type: 'website',
    siteName: 'Strategic Industrial Intelligence',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Strategic Industrial Intelligence',
    description: 'Map-first dashboard for U.S. critical mineral supply chains and defense industrial base health.',
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="h-screen w-screen overflow-hidden bg-[#f8f9fa] font-sans">
        {children}
      </body>
    </html>
  );
}
