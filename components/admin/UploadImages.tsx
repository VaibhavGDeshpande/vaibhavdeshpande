/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';
import { useUser } from '@/lib/useUser';

export default function UploadImage() {
  const user = useUser();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Nature');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  /* ---------------------------------------------
     Preview + dimension detection
  --------------------------------------------- */
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      setDimensions(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    const img = new Image();
    img.src = url;
    img.onload = () => {
      setDimensions({ w: img.width, h: img.height });
    };

    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-neutral-500">
        Login required
      </div>
    );
  }

  /* ---------------------------------------------
     Convert to JPG (no crop)
  --------------------------------------------- */
  const convertToJpg = async (file: File): Promise<Blob> => {
    const img = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    return new Promise((resolve) =>
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.92)
    );
  };

  /* ---------------------------------------------
     Upload
  --------------------------------------------- */
  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setProgress(0);

    try {
      const { data } = await supabase
        .from('photos')
        .select('image_url')
        .eq('category', category);

      const numbers =
        data?.map((p) => {
          const m = p.image_url.match(/(\d+)\.jpg$/);
          return m ? parseInt(m[1], 10) : 0;
        }) ?? [];

      const nextNumber = numbers.length ? Math.max(...numbers) + 1 : 1;
      const filePath = `${category}/${nextNumber}.jpg`;

      const jpgBlob = await convertToJpg(file);

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, jpgBlob, {
          upsert: false,
        });

      // Simulate progress completion
      setProgress(100);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from('photos').insert({
        title,
        category,
        image_url: filePath,
      });

      if (insertError) throw insertError;

      alert('Upload successful 🎉');
      setFile(null);
      setTitle('');
      setProgress(0);
    } catch (err: any) {
      console.error(err);
      alert(err.message ?? 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="pt-32 px-6 md:px-12 bg-neutral-950 min-h-screen">
      {/* HEADER SPACE */}
      <header className="mb-12">
        <h1 className="text-3xl md:text-4xl font-serif text-neutral-200">
          Upload Image
        </h1>
        <p className="text-sm text-neutral-500 mt-2">
          Add photographs to your collection
        </p>
      </header>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* LEFT — FORM */}
        <div className="space-y-6">
          {/* FILE INPUT */}
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-neutral-500">
              Image File
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-2 block w-full text-sm text-neutral-300
                         file:mr-4 file:py-2 file:px-4
                         file:rounded file:border-0
                         file:bg-neutral-800 file:text-neutral-200
                         hover:file:bg-neutral-700"
            />
          </label>

          {/* TITLE */}
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-neutral-500">
              Title
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 w-full p-3 bg-neutral-900 border border-neutral-800 text-white"
            />
          </label>

          {/* CATEGORY */}
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-neutral-500">
              Category
            </span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-2 w-full p-3 bg-neutral-900 border border-neutral-800 text-white"
            >
              <option>Animals</option>
              <option>Bike</option>
              <option>Nature</option>
              <option>Moon</option>
              <option>Sky</option>
              <option>Space</option>
              <option>Sun</option>
              <option>Pune Grand Tour</option>
            </select>
          </label>

          {/* PROGRESS */}
          {loading && (
            <div className="w-full bg-neutral-800 h-1 overflow-hidden">
              <div
                className="bg-white h-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* ACTION */}
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="mt-4 px-6 py-3 bg-white text-black text-sm uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? 'Uploading…' : 'Upload Image'}
          </button>
        </div>

        {/* RIGHT — PREVIEW */}
        <div className="flex flex-col items-center justify-start">
          {previewUrl ? (
            <>
              <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-auto object-contain"
                />
              </div>

              {dimensions && (
                <p className="mt-3 text-xs text-neutral-500 tracking-wide">
                  {dimensions.w} × {dimensions.h}px
                </p>
              )}

              <button
                onClick={() => setFile(null)}
                className="mt-4 text-xs uppercase tracking-widest text-neutral-400 hover:text-white"
              >
                Replace image
              </button>
            </>
          ) : (
            <div className="w-full max-w-md border border-dashed border-neutral-700 p-12 text-center text-neutral-500">
              Image preview will appear here
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
