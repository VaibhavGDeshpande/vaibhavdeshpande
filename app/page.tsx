import Header from '../components/layout/Header';
import HeroSection from '../components/home/HeroSection';
import AboutSection from '../components/home/AboutSection';
import CollectionsPreview from '../components/home/CollectionsPreview';

export default function HomePage() {
  return (
    <div>
      <Header />
      <main>
        <HeroSection /> 
         <AboutSection /> 
         <CollectionsPreview />
      </main>
    </div>
  );
}