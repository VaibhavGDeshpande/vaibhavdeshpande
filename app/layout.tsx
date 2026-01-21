import type { Metadata } from 'next';
import { Inter, EB_Garamond } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans' });
const serif = EB_Garamond({ subsets: ['latin'], variable: '--font-serif' });

export const metadata: Metadata = {
  title: 'Vaibhav | Photographer',
  description: 'A quiet gallery of visual works.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="bg-neutral-950 text-neutral-400 antialiased selection:bg-neutral-800 selection:text-white">
        <Header />
        <main className="min-h-screen flex flex-col fade-in">{children}</main>
        <Footer />
      </body>
    </html>
  );
}