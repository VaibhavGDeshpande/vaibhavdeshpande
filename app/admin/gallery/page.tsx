// app/admin/gallery/page.tsx
import { getPhotos } from '@/lib/data';
import AdminDashboard from '@/components/admin/AdminDashboard'; // This is the gallery component

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string; q?: string }>;
}) {
  const [photos, params] = await Promise.all([getPhotos(), searchParams]);
  return (
    <AdminDashboard
      photos={photos}
      initialCategory={params.collection}
      initialSearch={params.q}
    />
  );
}
