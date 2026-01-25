// app/admin/page.tsx
import { getPhotos } from '@/lib/data';
import AdminDashboard from '@/components/admin/AdminDashboard';

export default async function AdminPage() {
  const photos = await getPhotos();
  return <AdminDashboard photos={photos} />;
}
