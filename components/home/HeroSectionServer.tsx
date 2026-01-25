import { getHeroImages, mobileGetHeroImages } from '@/lib/data';
import HeroSection from './HeroSection';

export default async function HeroSectionServer() {
  const desktopImages = await getHeroImages();
  const mobileImages = await mobileGetHeroImages();

  return (
    <HeroSection
      desktopImages={desktopImages}
      mobileImages={mobileImages}
    />
  );
}
