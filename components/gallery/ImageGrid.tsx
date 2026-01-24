'use client';

import Image from 'next/image';
import { Photo } from '@/lib/data';

interface ImageGridProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
}

export default function ImageGrid({ photos, onPhotoClick }: ImageGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {photos.map((photo) => (
        <button
          key={photo.id}
          onClick={() => onPhotoClick(photo)}
          className="group relative aspect-4/5 overflow-hidden cursor-pointer"
        >
          <Image
            src={photo.image_url}
            alt={photo.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="text-white text-sm font-light tracking-wide mb-1">
              {photo.title}
            </h3>
          </div>
        </button>
      ))}
    </div>
  );
}
