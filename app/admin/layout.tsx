'use client';

import Sidebar from '@/components/admin/Sidebar';
import AdminFooter from '@/components/admin/AdminFooter';
import { usePathname } from 'next/navigation';
import '../darkroom/admin.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === '/admin/login') {
    return <div className="admin-login-shell darkroom admin">{children}</div>;
  }

  return (
    <div className="admin-shell darkroom admin">
      {/* Sidebar.tsx now renders the top bar: four destinations do not earn a sidebar */}
      <Sidebar />
      <main id="admin-main">
        {children}
        <AdminFooter />
      </main>
    </div>
  );
}
