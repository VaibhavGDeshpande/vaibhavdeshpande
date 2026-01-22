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
      className={`
        fixed top-0 inset-x-0 z-50
        transition-all duration-500 ease-out
        ${
          scrolled
            ? 'bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800'
            : 'bg-transparent'
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-2 h-14 flex items-center justify-between ">
        
        {/* Logo */}
        <Link href="/" className="relative flex items-center">
          <Image
            src="/assets/name1.png"
            alt="Vaibhav Deshpande"
            width={250}
            height={50}
            priority
            className={`
              transition-all duration-500 mt-3 pr-4
              ${scrolled ? 'opacity-90 scale-[0.9]' : 'opacity-100 scale-100'}
            `}
          />
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-10 md:gap-14">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href === '/gallery' && pathname.startsWith('/gallery'));

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`
                  group relative
                  text-[10px] md:text-[11px]
                  uppercase tracking-[0.35em]
                  transition-colors duration-300
                  ${
                    isActive
                      ? 'text-neutral-100'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }
                `}
              >
                {link.name}

                {/* Editorial underline */}
                <span
                  className={`
                    absolute left-0 -bottom-2 h-px bg-neutral-100
                    transition-all duration-500 ease-out
                    ${
                      isActive
                        ? 'w-full opacity-100'
                        : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'
                    }
                  `}
                />
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
