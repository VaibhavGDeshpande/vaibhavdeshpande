'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExternalLink, Image as ImageIcon, LayoutDashboard, Sparkles, Upload } from 'lucide-react';

const navItems = [
  { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Archive', href: '/admin/gallery', icon: ImageIcon },
  { name: 'Upload', href: '/admin/upload-image', icon: Upload },
  { name: 'Highlights', href: '/admin/highlights', icon: Sparkles },
];

/** The admin's top bar (kept under its old file name so imports stay put). */
export default function Sidebar() {
  const pathname = usePathname();

  return (
    <header className="a-bar">
      <div className="a-bar__inner">
        <Link href="/admin/dashboard" className="a-bar__mark" aria-label="Vaibhav, photography archive, overview">
          <b>Vaibhav</b>
          <span>Photography archive</span>
        </Link>

        <nav aria-label="Admin navigation" className="a-bar__nav">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className="a-bar__link"
              >
                <Icon size={16} strokeWidth={1.5} aria-hidden="true" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <Link href="/" className="a-bar__link a-bar__site">
          View website
          <ExternalLink size={16} strokeWidth={1.5} aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}
