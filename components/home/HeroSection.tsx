'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { Photo } from '@/lib/data';
import { getOptimizedImageUrl } from '@/lib/image';

interface HeroSectionProps {
  desktopImages: Photo[];
  mobileImages: Photo[];
}

export default function HeroSection({ desktopImages, mobileImages }: HeroSectionProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const heroImages = isMobile ? mobileImages : desktopImages;

  useEffect(() => {
    if (!heroImages.length) return;

    const interval = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % heroImages.length);
    }, 5200);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  if (!heroImages.length) return null;

  const currentPhoto = heroImages[currentIndex];

  return (
    <section className="relative -mt-20 h-[100svh] w-full overflow-hidden sm:-mt-24">
      <div key={currentPhoto.id} className="absolute inset-0 transition-opacity duration-[900ms]">
        <Image
          src={getOptimizedImageUrl(currentPhoto.image_url, { width: 2400, quality: 76 })}
          alt={currentPhoto.title}
          fill
          priority
          className="object-cover transition-transform duration-[6000ms] scale-105"
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/15 to-black/85" />

        <div className="section-wrap relative z-10 flex h-full items-end pb-16 sm:items-center sm:pb-0">
          <div className="fade-up max-w-2xl">
            <p className="eyebrow mb-4">Visual stories by Vaibhav Deshpande</p>
            <h1 className="headline-serif text-4xl leading-[0.92] text-stone-100 sm:text-6xl md:text-8xl">
              {currentPhoto.category}
            </h1>
            <p className="mt-4 text-xs uppercase tracking-[0.24em] text-stone-300 sm:text-sm">{currentPhoto.title}</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
        className="btn-soft absolute bottom-6 left-1/2 z-20 -translate-x-1/2 sm:bottom-10"
      >
        Explore
      </button>
    </section>
  );
}
