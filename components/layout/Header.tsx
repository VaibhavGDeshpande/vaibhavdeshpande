'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Work', href: '/gallery' },
    { name: 'About', href: '/#about' },
    { name: 'Camera', href: '/camera' },
  ];

  const isActive = (href: string) =>
    pathname === href || (href === '/gallery' && pathname.startsWith('/gallery'));

  const renderLink = (link: { name: string; href: string }) => (
    <Link
      key={link.name}
      href={link.href}
      className="mast__link"
      aria-current={isActive(link.href) ? 'page' : undefined}
    >
      {link.name}
    </Link>
  );

  return (
    <header className="darkroom mast">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <div className="container mast__bar">
        <nav className="mast__side" aria-label="Primary">
          {navLinks.slice(0, 2).map(renderLink)}
        </nav>

        <Link href="/" className="mast__mark" aria-label="Vaibhav Deshpande, home">
          <Image
            src="/name1.png"
            alt="Vaibhav Deshpande"
            width={180}
            height={38}
            priority
            className="mast__logo"
          />
        </Link>

        <nav className="mast__side mast__side--end" aria-label="More">
          {navLinks.slice(2).map(renderLink)}
          <a href="mailto:deshpande.vaibhav1012@gmail.com" className="mast__link">
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}
