'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Collection } from '@/lib/data';

interface CollectionsPreviewProps {
  collections: Collection[];
}

export default function CollectionsPreview({ collections }: CollectionsPreviewProps) {
  return (
    <section className="py-32 px-6">
      <div className="container mx-auto max-w-7xl">
        <h2 className="text-3xl md:text-4xl font-serif text-neutral-200 mb-16 text-center tracking-tight">
          Collections
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/gallery?filter=${collection.id}`}
              className="group block"
            >
              <div className="relative aspect-3/4 mb-6 overflow-hidden bg-neutral-900">
                <Image
                  src={collection.coverImage}
                  alt={collection.name}
                  fill
                  className="object-cover transition-all duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700" />
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-xl font-serif text-neutral-200 group-hover:text-white transition-colors">
                  {collection.name}
                </h3>
                
                <p className="text-sm text-neutral-500 font-sans leading-relaxed line-clamp-2 max-w-[80%] mx-auto">
                  {collection.description}
                </p>
                
                <div className="pt-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-600 group-hover:text-neutral-400 transition-colors border-t border-neutral-800 pt-2 inline-block px-4">
                    {collection.photoCount} Photographs
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
