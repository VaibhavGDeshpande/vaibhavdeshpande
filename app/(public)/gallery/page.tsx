import { Suspense } from 'react';
import { getPhotos } from '@/lib/data';
import GalleryClient from '@/components/gallery/GalleryClient';

export default async function GalleryPage() {
  const photos = await getPhotos();

  return (
    <Suspense fallback={<GallerySkeleton />}>
      <GalleryClient photos={photos} />
    </Suspense>
  );
}

function GallerySkeleton() {
  return (
    <div className="section-wrap py-28">
      <div className="glass-panel h-56 animate-pulse rounded-3xl" />
    </div>
  );
}
