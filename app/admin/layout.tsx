import Sidebar from '@/components/admin/Sidebar';
import AdminFooter from '@/components/admin/AdminFooter';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-neutral-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
          <AdminFooter />
        </main>
      </div>
    </div>
  );
}
