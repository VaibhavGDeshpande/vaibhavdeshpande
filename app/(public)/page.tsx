import HeroSection from '@/components/home/HeroSectionServer';
import HighlightsBar from '@/components/home/HighlightsBar';
import AboutSection from '@/components/home/AboutSection';
import CollectionsPreview from '@/components/home/CollectionsPreviewServer';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HighlightsBar />
      <AboutSection />
      <CollectionsPreview />
    </>
  );
}
