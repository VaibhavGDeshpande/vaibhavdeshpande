// app/admin/gallery/page.tsx
import { getPhotos } from '@/lib/data';
import AdminDashboard from '@/components/admin/AdminDashboard'; // This is the gallery component

export default async function GalleryPage() {
  const photos = await getPhotos();
  return <AdminDashboard photos={photos} />;
}
