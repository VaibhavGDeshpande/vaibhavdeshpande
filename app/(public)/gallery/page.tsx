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
    <div className="min-h-screen pt-32 px-6 md:px-12 bg-neutral-950">
      <div className="h-32 animate-pulse bg-neutral-900/40 rounded-lg" />
    </div>
  );
}
