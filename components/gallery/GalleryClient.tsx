'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Photo } from '@/lib/data';
import Lightbox from '@/components/gallery/Lightbox';
import CategoryFilter, { FilterCategory } from '@/components/gallery/CategoryFilter';
import { getOptimizedImageUrl } from '@/lib/image';

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

  const filteredPhotos = filter === 'All' ? photos : photos.filter((p) => p.category === filter);

  return (
    <section className="relative z-10 pb-20">
      <div className="section-wrap pt-10 sm:pt-14">
        <div className="glass-panel rounded-3xl p-5 sm:p-8">
          <div className="mb-6 text-center sm:mb-8">
            <p className="eyebrow">Archive</p>
            <h1 className="headline-serif mt-2 text-3xl sm:text-5xl">{filter}</h1>
            <p className="mt-2 text-xs uppercase tracking-[0.24em] text-stone-500">{filteredPhotos.length} photographs</p>
          </div>

          <CategoryFilter activeCategory={filter} onCategoryChange={handleFilterChange} />
        </div>

        <div className="mt-8 columns-1 gap-4 sm:columns-2 sm:gap-6 lg:columns-3">
          {filteredPhotos.map((photo, index) => (
            <article
              key={photo.id}
              className="group mb-4 break-inside-avoid cursor-zoom-in overflow-hidden rounded-2xl border border-white/10 bg-black/25 sm:mb-6"
              onClick={() => setSelectedPhoto(photo)}
            >
              <Image
                src={getOptimizedImageUrl(photo.image_url, { width: 1280, quality: 72 })}
                alt={photo.title}
                width={photo.width}
                height={photo.height}
                priority={index < 6}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="h-auto w-full object-cover transition duration-500 group-hover:scale-[1.02]"
              />
              <div className="flex items-center justify-between gap-2 border-t border-white/10 px-3 py-3 sm:px-4">
                <p className="truncate text-xs uppercase tracking-[0.16em] text-stone-300">{photo.title}</p>
                <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500">{photo.category}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <Lightbox photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
    </section>
  );
}
