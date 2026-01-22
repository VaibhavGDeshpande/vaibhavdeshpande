'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { photos, Photo } from '@/lib/data';
import Lightbox from '@/components/gallery/Lightbox';
import CategoryFilter, { FilterCategory } from '@/components/gallery/CategoryFilter';

export default function GalleryClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const filter = useMemo<FilterCategory>(() => {
    const param = searchParams.get('filter');
    return (param as FilterCategory) ?? 'All';
  }, [searchParams]);

  const handleFilterChange = (category: FilterCategory) => {
    const params = new URLSearchParams(searchParams.toString());

    if (category === 'All') {
      params.delete('filter');
    } else {
      params.set('filter', category);
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const filteredPhotos =
    filter === 'All'
      ? photos
      : photos.filter((p) => p.category === filter);

  return (
    <div className="min-h-screen pt-32 px-6 md:px-12 bg-neutral-950">
      {/* Header */}
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
            className="group cursor-zoom-in flex flex-col gap-3"
            onClick={() => setSelectedPhoto(photo)}
          >
            <div className="relative aspect-3/4 overflow-hidden bg-neutral-900">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </article>
        ))}
      </div>

      <Lightbox
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
    </div>
  );
}
