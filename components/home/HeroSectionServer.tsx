import { getHeroImages } from '@/lib/data';
import HeroSection from './HeroSection';

export default async function HeroSectionServer() {
  const heroImages = await getHeroImages();
  return <HeroSection heroImages={heroImages} />;
}
