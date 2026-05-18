import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import FloatingAssistantWrapper from '../components/FloatingAssistantWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Investment Comparator - Milestone 2 Prototype',
  description: 'Interactive comparator of cryptocurrencies and traditional assets (2014-2024). Milestone 2 prototype for COM-480 Data Visualization.',
  keywords: 'crypto, bitcoin, ethereum, investment, comparison, S&P 500, gold, real estate, data visualization',
  authors: [{ name: 'COM-480 Group Burek' }],
  icons: {
    icon: [
      { url: '/favicon_io/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon_io/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon_io/favicon.ico', sizes: 'any' },
    ],
    apple: [{ url: '/favicon_io/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/favicon_io/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon_io/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon_io/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon_io/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon_io/apple-touch-icon.png" />
        <link rel="manifest" href="/favicon_io/site.webmanifest" />
        <meta name="theme-color" content="#1e293b" />
      </head>
      <body className={inter.className}>
        {children}
        <FloatingAssistantWrapper />
      </body>
    </html>
  );
}
