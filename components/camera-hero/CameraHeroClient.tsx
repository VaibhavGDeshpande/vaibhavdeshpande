'use client';

import dynamic from 'next/dynamic';

const CameraScene = dynamic(
  () => import('@/components/camera-hero/CameraScene'),
  {
    ssr: false,
    loading: () => (
      <div className="camera-hero__loader">Loading 3D scene…</div>
    ),
  }
);

export default function CameraHeroClient({ photos }: { photos: string[] }) {
  return <CameraScene photos={photos} />;
}
