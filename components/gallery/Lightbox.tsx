'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import { Photo } from '@/lib/data';

interface LightboxProps {
  photo: Photo | null;
  onClose: () => void;
}

export default function Lightbox({ photo, onClose }: LightboxProps) {
  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (photo) {
      document.body.style.overflow = 'hidden';
      const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
      window.addEventListener('keydown', handleEsc);
      return () => {
        document.body.style.overflow = 'auto';
        window.removeEventListener('keydown', handleEsc);
      };
    }
  }, [photo, onClose]);

  if (!photo) return null;

  return (
    <div 
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div className="relative max-w-[90vw] max-h-[90vh]">
        <Image
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          className="object-contain max-h-[85vh] w-auto shadow-2xl"
          quality={100}
        />
        <div className="mt-4 text-center font-serif text-neutral-500 text-sm tracking-widest">
          {photo.title} <span className="mx-2">—</span> {photo.year}
        </div>
      </div>
      
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-neutral-500 hover:text-white text-xs uppercase tracking-widest transition-colors"
      >
        Close [Esc]
      </button>
    </div>
  );
}