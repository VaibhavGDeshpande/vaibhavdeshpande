'use client';

import { useState } from 'react';
import Image from 'next/image';
import { photos, Photo } from '@/lib/data';
import Lightbox from '@/components/gallery/Lightbox';
import CategoryFilter, { FilterCategory } from '@/components/gallery/CategoryFilter';

export default function GalleryPage() {
  // 1. Use the FilterCategory type to allow 'All'
  const [filter, setFilter] = useState<FilterCategory>('All');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // 2. Filter Logic
  const filteredPhotos = filter === 'All' 
    ? photos 
    : photos.filter(p => p.category === filter);

  return (
    <div className="min-h-screen pt-32 px-6 md:px-12 bg-neutral-950">
      
      {/* 1. Header & Controls */}
      <div className="flex flex-col items-center space-y-8 border-b border-neutral-900/50">
        <div className="text-center space-y-2">
          <h1 className="font-serif text-3xl md:text-4xl text-neutral-200 tracking-tight">
            {filter}
          </h1>
          <p className="font-sans text-[10px] text-neutral-500 tracking-[0.2em] uppercase">
            {filteredPhotos.length} Photographs
          </p>
        </div>
        
        {/* Replaced manual buttons with the Component */}
        <CategoryFilter 
          activeCategory={filter} 
          onCategoryChange={setFilter} 
        />
      </div>

      {/* 2. The Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 max-w-1600px mx-auto min-h-[50vh]">
        {filteredPhotos.map((photo) => (
          <article 
            key={photo.id} 
            className="group cursor-zoom-in flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-700 fill-mode-both"
            onClick={() => setSelectedPhoto(photo)}
          >
            {/* Image Container */}
            <div className="relative aspect-3/4 overflow-hidden bg-neutral-900">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover transition-all duration-1000 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              
              {/* Subtle overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </div>
            
            {/* Meta Data */}
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

      {/* 3. Lightbox Overlay */}
      <Lightbox 
        photo={selectedPhoto} 
        onClose={() => setSelectedPhoto(null)} 
      />
    </div>
  );
}