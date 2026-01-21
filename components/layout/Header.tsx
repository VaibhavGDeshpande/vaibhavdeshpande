'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { name: 'Work', href: '/gallery' },
    { name: 'Profile', href: '/#about' },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-out
        bg-white border-b border-white/10
        ${scrolled ? 'h-16' : 'h-15'}
      `}
    >
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between mt-1">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/assets/name.png"
            alt="Vaibhav Deshpande"
            width={scrolled ? 120 : 250}
            height={scrolled ? 80 : 100}
            className="transition-all duration-500"
            priority
          />
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-10 md:gap-14">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`group relative text-[11px] uppercase tracking-[0.35em] transition-colors duration-300
                  ${
                    isActive
                      ? 'text-neutral-100'
                      : 'text-neutral-400 hover:text-neutral-100'
                  }`}
              >
                <span>{link.name}</span>

                {/* Underline */}
                <span
                  className={`absolute left-0 -bottom-2 h-px bg-neutral-100 transition-all duration-300
                    ${
                      isActive
                        ? 'w-full opacity-100'
                        : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'
                    }`}
                />
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
