'use client';

import { useState } from 'react';
import Image from 'next/image';
import supabase from '@/lib/supabase';
import { Photo } from '@/lib/data';

export default function AdminDashboard({ photos }: { photos: Photo[] }) {
  const [items, setItems] = useState(photos);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (photo: Photo) => {
    const confirm = window.confirm('Delete this image?');
    if (!confirm) return;

    setLoadingId(photo.id);

    // 1️⃣ Delete from storage
    const path = photo.image_url.split('/photos/')[1];

    await supabase.storage
      .from('photos')
      .remove([path]);

    // 2️⃣ Delete from DB
    await supabase
      .from('photos')
      .delete()
      .eq('id', photo.id);

    // 3️⃣ Update UI
    setItems((prev) => prev.filter((p) => p.id !== photo.id));
    setLoadingId(null);
  };

  return (
    <section className="p-12 bg-neutral-950 min-h-screen">
      <h1 className="text-3xl font-serif text-white mb-8 mt-10">Image Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {items.map((photo) => (
          <div key={photo.id} className="relative group">
            <Image
              src={photo.image_url}
              alt={photo.title}
              width={200}
              height={200}
              className="object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition" />

            {/* Actions */}
            <button
              onClick={() => handleDelete(photo)}
              disabled={loadingId === photo.id}
              className="absolute bottom-3 left-3 text-xs bg-red-600 text-white px-3 py-1"
            >
              {loadingId === photo.id ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
