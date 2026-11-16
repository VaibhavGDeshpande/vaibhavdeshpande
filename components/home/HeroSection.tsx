'use client';

import Image from 'next/image';
import Link from 'next/link';
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

  const heroImages = isMobile && mobileImages.length ? mobileImages : desktopImages;

  useEffect(() => {
    setCurrentIndex(0);
  }, [isMobile]);

  if (!heroImages.length) return null;

  const active = Math.min(currentIndex, heroImages.length - 1);
  const currentPhoto = heroImages[active];

  return (
    <section className="darkroom hero" aria-labelledby="hero-title">
      <div className="hero__print" id="hero-print" aria-live="polite">
        {heroImages.map((photo, i) => (
          <Image
            key={photo.id}
            src={getOptimizedImageUrl(photo.image_url, { width: 2400, quality: 76 })}
            alt={photo.title}
            fill
            priority={i === 0}
            sizes="100vw"
            className="hero__img"
            data-active={i === active}
            aria-hidden={i !== active}
          />
        ))}
      </div>

      <div className="container hero__grid">
        <div className="hero__text">
          <h1 id="hero-title">Vaibhav Deshpande</h1>
          <p className="lead hero__lede">
            A Pune photographer of city streets, open skies and textured details.
          </p>
          <div className="hero__actions">
            <Link href="/gallery" className="btn btn--primary">
              Open the archive
            </Link>
            <a href="mailto:deshpande.vaibhav1012@gmail.com" className="btn">
              Get in touch
            </a>
          </div>
        </div>

        <div className="hero__picker">
          <ol
            className="frames"
            aria-label="Frames"
            style={{ '--active': active, '--count': heroImages.length } as React.CSSProperties}
          >
            {heroImages.map((photo, i) => (
              <li key={photo.id}>
                <button
                  type="button"
                  className="frames__row"
                  aria-pressed={i === active}
                  aria-controls="hero-print"
                  onClick={() => setCurrentIndex(i)}
                  onMouseEnter={() => setCurrentIndex(i)}
                  onFocus={() => setCurrentIndex(i)}
                >
                  <span className="frames__num num">{i + 1}</span>
                  <span className="frames__name">{photo.category}</span>
                  <span className="frames__title">{photo.title}</span>
                </button>
              </li>
            ))}
          </ol>
          <Link
            key={currentPhoto.category}
            href={`/gallery?filter=${currentPhoto.category}`}
            className="link hero__more"
          >
            More from {currentPhoto.category}
          </Link>
        </div>
      </div>
    </section>
  );
}
