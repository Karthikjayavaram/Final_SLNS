import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StickyContact from '@/components/StickyContact';
import ContentProtection from '@/components/ContentProtection';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Sri Lakshmi Narashimha Suppliers & Decorators (SLNS Decorators)',
    template: '%s | SLNS Decorators',
  },
  description:
    'SLNS Decorators creates luxurious wedding stages, floral mandaps, themed birthday parties, engagement ceremonies, and premium event decorations in Siruguppa, Ballari.',
  keywords: [
    'Wedding Decoration',
    'Birthday Decoration',
    'Stage Decoration',
    'Event Decoration',
    'SLNS Decorators',
    'Siruguppa Decorators',
    'Ballari Event Decorators',
    'Karnataka Event Decoration Services'
  ],
  authors: [{ name: 'SLNS Decorators' }],
  creator: 'SLNS Decorators',
  publisher: 'SLNS Decorators',
  robots: 'index, follow',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0A0A0A',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} scroll-smooth`}
    >
      <body className="antialiased min-h-screen flex flex-col bg-background text-foreground font-sans protected-media">
        <ContentProtection />
        <Navbar />
        <main className="flex-grow pt-0 pb-20 md:pb-0">{children}</main>
        <Footer />
        <StickyContact />
      </body>
    </html>
  );
}
