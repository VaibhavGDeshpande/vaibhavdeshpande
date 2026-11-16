import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import '../darkroom/home.css';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="relative z-10 min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
