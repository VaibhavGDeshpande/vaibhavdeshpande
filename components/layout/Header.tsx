'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Work', href: '/gallery' },
    { name: 'About', href: '/#about' },
  ];

  return (
    <header className="relative z-40 px-3 py-3 sm:px-6 sm:py-4">
      <div className="glass-panel mx-auto flex h-14 w-full max-w-7xl items-center justify-between rounded-full px-3 shadow-2xl shadow-black/20 sm:px-5">
        <Link href="/" className="relative flex shrink-0 items-center">
          <Image
            src="/name1.png"
            alt="Vaibhav Deshpande"
            width={180}
            height={38}
            priority
            className="h-auto w-auto max-w-[140px] sm:max-w-[180px]"
          />
        </Link>

        <nav className="flex items-center gap-3 sm:gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href === '/gallery' && pathname.startsWith('/gallery'));

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`rounded-full px-3 py-2 text-[10px] uppercase tracking-[0.28em] transition sm:text-xs ${
                  isActive
                    ? 'bg-white/15 text-stone-100 ring-1 ring-white/35'
                    : 'text-stone-300 hover:bg-white/10 hover:text-stone-100'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
