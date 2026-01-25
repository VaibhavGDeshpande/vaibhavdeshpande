'use client';

import { useEffect } from 'react';
import { Photo } from '@/lib/data';

/* eslint-disable @next/next/no-img-element */

interface LightboxProps {
  photo: Photo | null;
  onClose: () => void;
}

export default function Lightbox({ photo, onClose }: LightboxProps) {
  useEffect(() => {
    if (!photo) return;

    document.body.style.overflow = 'hidden';
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [photo, onClose]);

  if (!photo) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-full max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photo.image_url}
          alt={photo.title}
          className="max-h-[80vh] sm:max-h-[85vh] w-auto object-contain shadow-2xl"
        />
      </div>

      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6
          px-3 py-2 text-xs uppercase tracking-widest
          text-neutral-400 hover:text-white transition"
      >
        Close ✕
      </button>
    </div>
  );
}
