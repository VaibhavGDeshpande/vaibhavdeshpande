/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useMemo } from 'react';
import supabase from '@/lib/supabase';
import { useUser } from '@/lib/useUser';
import { FolderPlus, FileCode, CheckCircle2, AlertCircle, Info } from 'lucide-react';

type Dimensions = { w: number; h: number };

const DEFAULT_CATEGORIES = [
  'Animals',
  'Bike',
  'Nature',
  'Moon',
  'Sky',
  'Space',
  'Sun',
  'Pune Grand Tour',
];

function slugifyFileName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function formatCategoryName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return 'Uncategorized';
  return trimmed;
}

export default function UploadImage() {
  const user = useUser();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);

  const [title, setTitle] = useState('');
  const [categoriesList, setCategoriesList] = useState<string[]>(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>('Nature');
  const [customCategory, setCustomCategory] = useState('');
  const [customFileName, setCustomFileName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /* ---------------------------------------------
     Fetch existing distinct categories from DB
  --------------------------------------------- */
  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase.from('photos').select('category');
        if (!error && data) {
          const dbCategories = Array.from(
            new Set(data.map((p) => p.category).filter(Boolean))
          );
          const merged = Array.from(new Set([...DEFAULT_CATEGORIES, ...dbCategories]));
          setCategoriesList(merged);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    }
    fetchCategories();
  }, []);

  /* ---------------------------------------------
     Preview + initial dimension detection
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

  /* ---------------------------------------------
     Derived active category & slugified preview
  --------------------------------------------- */
  const activeCategory = useMemo(() => {
    if (selectedCategory === '__NEW__') {
      return formatCategoryName(customCategory);
    }
    return selectedCategory;
  }, [selectedCategory, customCategory]);

  const slugifiedName = useMemo(() => {
    if (!customFileName.trim()) return '';
    return slugifyFileName(customFileName);
  }, [customFileName]);

  const storagePathPreview = useMemo(() => {
    const cat = activeCategory || 'Category';
    const filename = slugifiedName ? `${slugifiedName}.jpg` : `[Auto Number].jpg`;
    return `${cat}/${filename}`;
  }, [activeCategory, slugifiedName]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-neutral-500">
        Login required
      </div>
    );
  }

  /* ---------------------------------------------
     Convert to JPG (no crop, no resize)
  --------------------------------------------- */
  const convertToJpg = async (file: File): Promise<Blob> => {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(bitmap, 0, 0);

    return new Promise((resolve) =>
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.92)
    );
  };

  /* ---------------------------------------------
     Get dimensions from a Blob (authoritative)
  --------------------------------------------- */
  const getBlobDimensions = async (blob: Blob): Promise<Dimensions> => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.src = url;

    await new Promise((res) => (img.onload = res));
    URL.revokeObjectURL(url);

    return { w: img.width, h: img.height };
  };

  /* ---------------------------------------------
     Upload Handler
  --------------------------------------------- */
  const handleUpload = async () => {
    if (!file) return;

    const categoryToUse = activeCategory;
    if (!categoryToUse || categoryToUse === 'Uncategorized') {
      setStatusMessage({ type: 'error', text: 'Please specify a valid category.' });
      return;
    }

    setLoading(true);
    setProgress(10);
    setStatusMessage(null);

    try {
      /* -----------------------------
         Determine storage file path
      ----------------------------- */
      let fileName = '';

      const { data: existingPhotos } = await supabase
        .from('photos')
        .select('image_url')
        .eq('category', categoryToUse);

      const existingUrls = existingPhotos?.map((p) => p.image_url) ?? [];

      if (customFileName.trim()) {
        const baseSlug = slugifyFileName(customFileName) || 'photo';
        let candidateName = `${baseSlug}.jpg`;
        let counter = 1;

        while (existingUrls.includes(`${categoryToUse}/${candidateName}`)) {
          candidateName = `${baseSlug}-${counter}.jpg`;
          counter++;
        }
        fileName = candidateName;
      } else {
        const numbers = existingUrls.map((url) => {
          const m = url.match(/(\d+)\.jpg$/);
          return m ? parseInt(m[1], 10) : 0;
        });
        const nextNumber = numbers.length ? Math.max(...numbers) + 1 : 1;
        fileName = `${nextNumber}.jpg`;
      }

      const filePath = `${categoryToUse}/${fileName}`;
      setProgress(40);

      /* -----------------------------
         Convert + re-read dimensions
      ----------------------------- */
      const jpgBlob = await convertToJpg(file);
      const { w, h } = await getBlobDimensions(jpgBlob);

      const orientation =
        w === h ? 'square' : w > h ? 'landscape' : 'portrait';

      setProgress(70);

      /* -----------------------------
         Upload to Supabase Storage
      ----------------------------- */
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, jpgBlob, {
          upsert: false,
          contentType: 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      setProgress(90);

      /* -----------------------------
         Insert DB record
      ----------------------------- */
      const photoTitle = title.trim() || customFileName.trim() || fileName.replace(/\.jpg$/, '');

      const { error: insertError } = await supabase
        .from('photos')
        .insert({
          title: photoTitle,
          category: categoryToUse,
          image_url: filePath,
          width: w,
          height: h,
          aspect_ratio: w / h,
          orientation,
        });

      if (insertError) throw insertError;

      // Revalidate main website cache so new categories & photos appear immediately
      try {
        await fetch('/api/revalidate', { method: 'POST' });
      } catch (e) {
        console.error('Revalidation error:', e);
      }

      setProgress(100);
      setStatusMessage({
        type: 'success',
        text: `Successfully uploaded "${photoTitle}" to storage at "${filePath}" 🎉`,
      });

      // Update local categories list if new category was created
      if (!categoriesList.includes(categoryToUse)) {
        setCategoriesList((prev) => [...prev, categoryToUse]);
        setSelectedCategory(categoryToUse);
        setCustomCategory('');
      }

      // Reset form fields
      setFile(null);
      setTitle('');
      setCustomFileName('');
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message ?? 'Upload failed. Please check your storage & database permissions.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="pt-28 pb-16 px-6 md:px-12 bg-neutral-950 min-h-screen">
      {/* HEADER */}
      <header className="mb-10 max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-serif text-neutral-200">
          Upload Photography
        </h1>
        <p className="text-sm text-neutral-500 mt-2">
          Add photographs to your portfolio with customizable categories and file naming conventions.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* LEFT — FORM */}
        <div className="space-y-6">
          {/* Status Alert */}
          {statusMessage && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              )}
              <div>{statusMessage.text}</div>
            </div>
          )}

          {/* FILE INPUT */}
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-medium">
              Image File
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setStatusMessage(null);
                setFile(e.target.files?.[0] ?? null);
              }}
              className="mt-2 block w-full text-sm text-neutral-300
                         file:mr-4 file:py-2.5 file:px-4
                         file:rounded-lg file:border-0
                         file:bg-neutral-800 file:text-neutral-200
                         hover:file:bg-neutral-700 transition"
            />
          </label>

          {/* TITLE INPUT */}
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-medium">
              Photo Title
            </span>
            <input
              type="text"
              placeholder="e.g. Sunset Over Fort"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 w-full p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition text-sm"
            />
          </label>

          {/* CATEGORY SELECT & CREATION */}
          <div className="space-y-3">
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-neutral-400 font-medium flex items-center gap-1.5">
                <FolderPlus size={14} className="text-neutral-500" />
                Category
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="mt-2 w-full p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-600 transition text-sm"
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__NEW__" className="text-amber-400 font-medium">
                  + Create New Category...
                </option>
              </select>
            </label>

            {/* Custom Category Input when selectedCategory === '__NEW__' */}
            {selectedCategory === '__NEW__' && (
              <div className="p-4 bg-neutral-900/80 border border-neutral-800 rounded-xl space-y-2">
                <span className="text-xs text-amber-400 font-medium block">
                  New Category Name
                </span>
                <input
                  type="text"
                  placeholder="e.g. Architecture, Wildlife"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full p-3 bg-neutral-950 border border-neutral-700 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500/50 transition text-sm"
                />
                <p className="text-[11px] text-neutral-500">
                  This will create a new collection category and folder in storage.
                </p>
              </div>
            )}
          </div>

          {/* CUSTOM FILENAME INPUT */}
          <div className="space-y-2">
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-neutral-400 font-medium flex items-center gap-1.5">
                <FileCode size={14} className="text-neutral-500" />
                Custom Storage Filename (Optional)
              </span>
              <input
                type="text"
                placeholder="e.g. sunset-in-pune"
                value={customFileName}
                onChange={(e) => setCustomFileName(e.target.value)}
                className="mt-2 w-full p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition text-sm"
              />
            </label>
            <p className="text-[11px] text-neutral-500">
              Leave blank to use default sequential numbering (e.g. <code className="text-neutral-400">1.jpg</code>, <code className="text-neutral-400">2.jpg</code>).
            </p>
          </div>

          {/* STORAGE PATH PREVIEW BADGE */}
          <div className="p-3.5 bg-neutral-900/60 border border-neutral-800 rounded-xl flex items-start gap-2.5 text-xs text-neutral-400">
            <Info size={16} className="text-neutral-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-neutral-300">Storage Naming Convention:</span>
              <div className="mt-1 font-mono text-emerald-400 bg-neutral-950 px-2.5 py-1 rounded border border-neutral-800/80 inline-block text-[12px]">
                photos/{storagePathPreview}
              </div>
            </div>
          </div>

          {loading && (
            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-white h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="w-full mt-2 py-3.5 bg-white text-black font-medium text-xs uppercase tracking-widest rounded-lg disabled:opacity-40 hover:bg-neutral-200 transition"
          >
            {loading ? `Uploading (${progress}%)…` : 'Upload Photograph'}
          </button>
        </div>

        {/* RIGHT — PREVIEW */}
        <div className="flex flex-col items-center justify-start">
          <span className="text-xs uppercase tracking-widest text-neutral-500 mb-2 w-full text-left font-medium">
            Image Preview
          </span>
          {previewUrl ? (
            <div className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col items-center">
              <div className="relative w-full max-h-[400px] flex items-center justify-center overflow-hidden rounded-lg bg-neutral-950">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-[380px] w-auto object-contain rounded-md"
                />
              </div>

              {dimensions && (
                <div className="mt-4 flex items-center justify-between w-full text-xs text-neutral-400 border-t border-neutral-800 pt-3">
                  <span>Dimensions:</span>
                  <span className="font-mono text-neutral-200">
                    {dimensions.w} × {dimensions.h} px
                  </span>
                </div>
              )}

              <button
                onClick={() => setFile(null)}
                className="mt-3 text-xs uppercase tracking-widest text-neutral-400 hover:text-white transition"
              >
                Replace File
              </button>
            </div>
          ) : (
            <div className="w-full h-72 border border-dashed border-neutral-800 rounded-xl flex flex-col items-center justify-center text-neutral-500 p-6 text-center text-sm">
              <p className="text-neutral-400 font-medium">No image selected</p>
              <p className="text-xs text-neutral-600 mt-1">Select an image file on the left to preview it here.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

