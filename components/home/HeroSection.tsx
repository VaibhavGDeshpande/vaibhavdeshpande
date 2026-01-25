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

  useEffect(() => {
    if (!heroImages.length) return;
    const interval = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % heroImages.length);
      setDirection((d) => d * -1);
    }, 7000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  if (!heroImages.length) return null;

  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-neutral-950">
      {heroImages.map((photo, index) => {
        const active = index === currentIndex;

        return (
          <div
            key={photo.id}
            className={`absolute inset-0 transition-opacity duration-2000 ${
              active ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <Image
              src={photo.image_url}
              alt={photo.title}
              fill
              priority={index === 0}
              className={`object-cover opacity-80 transition-transform duration-[8000ms] ${
                active
                  ? direction > 0
                    ? 'scale-110'
                    : 'scale-100'
                  : direction > 0
                  ? 'scale-100'
                  : 'scale-110'
              }`}
              sizes="100vw"
            />

            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />

            <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
              <div
                className={`transition duration-1500 delay-300 ${
                  active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                <h1 className="text-3xl sm:text-5xl md:text-8xl font-serif text-white/90 mb-4">
                  {photo.category}
                </h1>
                <p className="text-[10px] sm:text-xs tracking-[0.4em] uppercase text-white/70">
                  — {photo.title} —
                </p>
              </div>
            </div>
          </div>
        );
      })}

      <button
        onClick={() =>
          document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
        }
        className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 text-white/60 hover:text-white animate-bounce p-4"
      >
        ↓
      </button>
    </section>
  );
}
