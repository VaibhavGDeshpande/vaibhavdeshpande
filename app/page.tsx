import Header from '../components/layout/Header';
import HeroSection from '../components/home/HeroSectionServer';
import AboutSection from '../components/home/AboutSection';
import CollectionsPreview from '../components/home/CollectionsPreviewServer';

export default function HomePage() {
  return (
    <div>
      <Header />
      <main>
        <HeroSection  /> 
         <AboutSection /> 
         <CollectionsPreview />
      </main>
    </div>
  );
}