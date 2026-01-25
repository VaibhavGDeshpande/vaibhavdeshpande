'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Collection } from '@/lib/data';

interface CollectionsPreviewProps {
  collections: Collection[];
}

export default function CollectionsPreview({ collections }: CollectionsPreviewProps) {
  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-neutral-200 mb-12 sm:mb-16 text-center">
          Collections
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 lg:gap-12">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/gallery?filter=${collection.id}`}
              className="group block"
            >
              <div className="relative aspect-[3/4] mb-6 overflow-hidden bg-neutral-900">
                <Image
                  src={collection.coverImage}
                  alt={collection.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition duration-1000 group-hover:scale-105 opacity-90"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition duration-700" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg sm:text-xl font-serif text-neutral-200">
                  {collection.name}
                </h3>

                <p className="text-sm text-neutral-500 line-clamp-2 max-w-[85%] mx-auto">
                  {collection.description}
                </p>

                <span className="block text-[10px] uppercase tracking-[0.2em] text-neutral-600 pt-3">
                  {collection.photoCount} Photographs
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
