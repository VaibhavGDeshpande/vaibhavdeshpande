import type { Metadata } from 'next';
import { Manrope, Cormorant_Garamond } from 'next/font/google';
import './globals.css';

const sans = Manrope({ subsets: ['latin'], variable: '--font-sans' });
const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-serif',
});

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
        alt: 'Vaibhav Photography - Portfolio',
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
      <body className="antialiased">
        <main className="site-frame min-h-screen">{children}</main>
      </body>
    </html>
  );
}
