/* eslint-disable @next/next/no-img-element */
'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Photo } from '@/lib/data';
import Lightbox from '@/components/gallery/Lightbox';
import CategoryFilter, { FilterCategory } from '@/components/gallery/CategoryFilter';

interface GalleryClientProps {
  photos: Photo[];
}

export default function GalleryClient({ photos }: GalleryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const filter = useMemo<FilterCategory>(() => {
    const param = searchParams.get('filter');
    return (param as FilterCategory) ?? 'All';
  }, [searchParams]);

  const handleFilterChange = (category: FilterCategory) => {
    const params = new URLSearchParams(searchParams.toString());

    if (category === 'All') params.delete('filter');
    else params.set('filter', category);

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const filteredPhotos =
    filter === 'All'
      ? photos
      : photos.filter((p) => p.category === filter);

  return (
    <div className="min-h-screen bg-neutral-950 pt-24 sm:pt-28 md:pt-32 px-4 sm:px-6 md:px-12">
      {/* Header */}
      <div className="flex flex-col items-center gap-8 pb-12 border-b border-neutral-900/50">
        <div className="text-center space-y-2">
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-neutral-200">
            {filter}
          </h1>
          <p className="text-[10px] sm:text-xs text-neutral-500 tracking-[0.2em] uppercase">
            {filteredPhotos.length} Photographs
          </p>
        </div>

        <CategoryFilter
          activeCategory={filter}
          onCategoryChange={handleFilterChange}
        />
      </div>

      {/* Grid */}
      <div className="mt-12 max-w-400 mx-auto
  columns-1
  sm:columns-2
  lg:columns-3
  gap-8 sm:gap-10"
      >

        {filteredPhotos.map((photo) => (
          <article
            key={photo.id}
            className="mb-8 break-inside-avoid group cursor-zoom-in"
            onClick={() => setSelectedPhoto(photo)}
          >
            <img
              src={photo.image_url}
              alt={photo.title}
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </article>

        ))}
      </div>

      <Lightbox photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
    </div>
  );
}
