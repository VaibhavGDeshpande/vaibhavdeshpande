import type { Metadata } from 'next';
import { Inter, EB_Garamond } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans' });
const serif = EB_Garamond({ subsets: ['latin'], variable: '--font-serif' });

export const metadata: Metadata = {
  title: {
    default: 'Vaibhav | Photographer',
    template: '%s | Vaibhav',
  },
  description: 'A quiet gallery of visual works by Vaibhav Deshpande',
  metadataBase: new URL('https://vgdphotography.vercel.app'),

  openGraph: {
    title: 'Vaibhav | Photographer',
    description: 'A gallery of visual works.',
    url: 'https://vgdphotography.vercel.app',
    siteName: 'Vaibhav Photography',
    images: [
      {
        url: '/vgd.png', 
        width: 1200,
        height: 630,
        alt: 'Vaibhav Photography – Portfolio',
      },
    ],
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Vaibhav | Photographer',
    description: 'A quiet gallery of visual works.',
    images: ['/vgd.png'],
  },

  icons: {
    icon: '/vgd.png',
    shortcut: '/vgd.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="bg-neutral-950 text-neutral-400 antialiased">
        <Header />
        <main className="min-h-screen fade-in">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}