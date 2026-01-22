import { Suspense } from 'react';
import GalleryClient from '../../components/gallery/GalleryClient';

export default function GalleryPage() {
  return (
    <Suspense fallback={<GallerySkeleton />}>
      <GalleryClient />
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
