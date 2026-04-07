import type { Metadata } from 'next';
import CameraHeroClient from '@/components/camera-hero/CameraHeroClient';
import { getPhotos } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Camera | Vaibhav',
  description: 'An interactive 3D camera experience by Vaibhav Deshpande',
};

export default async function CameraPage() {
  const photosData = await getPhotos();
  const photoUrls = photosData.map(p => p.image_url);

  return <CameraHeroClient photos={photoUrls} />;
}
