'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Collection } from '@/lib/data';
import { getOptimizedImageUrl } from '@/lib/image';

interface CollectionsPreviewProps {
  collections: Collection[];
}

export default function CollectionsPreview({ collections }: CollectionsPreviewProps) {
  return (
    <section className="relative z-10 py-20 sm:py-28">
      <div className="section-wrap">
        <div className="mb-10 flex items-end justify-between gap-4 sm:mb-14">
          <div>
            <p className="eyebrow">Portfolio</p>
            <h2 className="headline-serif mt-2 text-4xl sm:text-5xl">Collections</h2>
          </div>
          <Link href="/gallery" className="btn-soft hidden sm:inline-flex">
            Open archive
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/gallery?filter=${collection.id}`}
              className="glass-panel group overflow-hidden rounded-3xl"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={getOptimizedImageUrl(collection.coverImage, { width: 1000, quality: 70 })}
                  alt={collection.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <h3 className="font-serif text-3xl text-stone-100">{collection.name}</h3>
                  <p className="mt-2 text-xs uppercase tracking-[0.22em] text-stone-300">{collection.photoCount} photographs</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 sm:hidden">
          <Link href="/gallery" className="btn-soft">
            Open archive
          </Link>
        </div>
      </div>
    </section>
  );
}
