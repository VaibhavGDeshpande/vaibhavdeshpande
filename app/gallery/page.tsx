'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { photos, Photo } from '@/lib/data';
import Lightbox from '@/components/gallery/Lightbox';
import CategoryFilter, { FilterCategory } from '@/components/gallery/CategoryFilter';

export default function GalleryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // 1️⃣ Read filter from URL
  const filter = useMemo<FilterCategory>(() => {
    const param = searchParams.get('filter');
    return (param as FilterCategory) ?? 'All';
  }, [searchParams]);

  // 2️⃣ Update URL when filter changes
  const handleFilterChange = (category: FilterCategory) => {
    const params = new URLSearchParams(searchParams.toString());

    if (category === 'All') {
      params.delete('filter');
    } else {
      params.set('filter', category);
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  // 3️⃣ Filter photos
  const filteredPhotos =
    filter === 'All'
      ? photos
      : photos.filter((p) => p.category === filter);

  return (
    <div className="min-h-screen pt-32 px-6 md:px-12 bg-neutral-950">
      
      {/* Header & Controls */}
      <div className="flex flex-col items-center space-y-8 border-b border-neutral-900/50">
        <div className="text-center space-y-2">
          <h1 className="font-serif text-3xl md:text-4xl text-neutral-200 tracking-tight">
            {filter}
          </h1>
          <p className="font-sans text-[10px] text-neutral-500 tracking-[0.2em] uppercase">
            {filteredPhotos.length} Photographs
          </p>
        </div>

        <CategoryFilter
          activeCategory={filter}
          onCategoryChange={handleFilterChange}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 max-w-1600px mx-auto min-h-[50vh]">
        {filteredPhotos.map((photo) => (
          <article
            key={photo.id}
            className="group cursor-zoom-in flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-700 fill-mode-both"
            onClick={() => setSelectedPhoto(photo)}
          >
            <div className="relative aspect-3/4 overflow-hidden bg-neutral-900">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover transition-all duration-1000 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </div>

            <div className="flex justify-between items-baseline opacity-60 group-hover:opacity-100 transition-opacity duration-500">
              <span className="font-serif text-sm text-neutral-300 tracking-wide">
                {photo.title}
              </span>
              <span className="font-sans text-[10px] text-neutral-500 tracking-widest uppercase">
                {photo.year}
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* Lightbox */}
      <Lightbox
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
    </div>
  );
}
