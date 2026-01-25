'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
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
      <div className="mt-12 grid gap-8 sm:gap-10
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-3
        max-w-[1600px] mx-auto"
      >
        {filteredPhotos.map((photo) => (
          <article
            key={photo.id}
            className="group cursor-zoom-in"
            onClick={() => setSelectedPhoto(photo)}
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-neutral-900">
              <Image
                src={photo.image_url}
                alt={photo.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </article>
        ))}
      </div>

      <Lightbox photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
    </div>
  );
}
