'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Photo } from '@/lib/data';

interface HeroSectionProps {
  heroImages: Photo[];
}

export default function HeroSection({ heroImages }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); 

  const slides = heroImages;

  useEffect(() => {
    if (slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
      setDirection((prev) => prev * -1);
    }, 7000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const handleScrollDown = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  if (slides.length === 0) return null;

  return (
    <section className="relative h-screen w-full overflow-hidden bg-neutral-950">
      {slides.map((photo, index) => {
        const isActive = index === currentIndex;

        // fallback aspect logic (since DB version doesn’t store width/height)
        const isPortrait = false;

        return (
          <div
            key={photo.id}
            className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* IMAGE */}
            <Image
              src={photo.image_url}
              alt={photo.title}
              fill
              priority={index === 0}
              quality={90}
              className={`object-cover opacity-80 transition-transform duration-[8000ms] ease-linear ${
                isActive
                  ? direction > 0
                    ? 'scale-110'
                    : 'scale-100'
                  : direction > 0
                  ? 'scale-100'
                  : 'scale-110'
              }`}
              sizes="100vw"
            />

            {/* OVERLAY */}
            <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-b from-black/30 via-transparent to-black/80" />

            {/* TEXT */}
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center">
              <div
                className={`text-center transition-all duration-[1500ms] delay-300 ease-out ${
                  isActive
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-8 opacity-0'
                }`}
              >
                <h1 className="text-5xl md:text-8xl font-serif text-white/90 tracking-tighter mb-4 drop-shadow-lg mix-blend-overlay">
                  {photo.category}
                </h1>
                <p className="text-[10px] md:text-xs font-sans tracking-[0.4em] uppercase text-white/70">
                  — {photo.title} —
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {/* PROGRESS BAR */}
      <div className="absolute top-0 left-0 w-full h-1 z-50 flex">
        {slides.map((_, index) => (
          <div key={index} className="flex-1 h-full bg-white/10 relative overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full bg-white transition-all duration-[7000ms] ease-linear ${
                index === currentIndex ? 'w-full' : 'w-0'
              }`}
            />
          </div>
        ))}
      </div>

      {/* SCROLL */}
      <button
        onClick={handleScrollDown}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 text-white/50 hover:text-white transition-colors duration-300 animate-bounce p-4"
        aria-label="Scroll down"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-6 h-6 md:w-8 md:h-8 opacity-80"
        >
          <path d="M7 10L12 15L17 10" />
        </svg>
      </button>
    </section>
  );
}
