/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useMemo } from 'react';
import supabase from '@/lib/supabase';
import { useUser } from '@/lib/useUser';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { VARIANT_WIDTHS, variantPath } from '@/lib/imageVariants';

type Dimensions = { w: number; h: number };

/** Resize in the browser and upload one WebP copy per width, beside the original. */
async function uploadVariants(source: Blob, originalPath: string) {
  const bitmap = await createImageBitmap(source);
  try {
    for (const width of VARIANT_WIDTHS) {
      const w = Math.min(width, bitmap.width);
      const h = Math.round((bitmap.height * w) / bitmap.width);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(bitmap, 0, 0, w, h);
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('WebP encode failed'))), 'image/webp', 0.74)
      );
      const { error } = await supabase.storage
        .from('photos')
        .upload(variantPath(originalPath, width), blob, {
          upsert: true,
          contentType: 'image/webp',
          cacheControl: '31536000',
        });
      if (error) throw error;
    }
  } finally {
    bitmap.close();
  }
}

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
      <div className="a-wait">
        Sign in to upload photographs.
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

      /* -----------------------------
         Pre-made WebP copies (lib/imageVariants.ts)
         Best effort: the original is already saved, so a failed copy
         only means the site serves the original for that size.
      ----------------------------- */
      setProgress(80);
      try {
        await uploadVariants(jpgBlob, filePath);
      } catch (variantError) {
        console.error('WebP copy upload failed:', variantError);
      }

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
        text: `Uploaded “${photoTitle}” to photos/${filePath}.`,
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
    <section className="a-page" aria-labelledby="upload-title">
      <header className="a-head">
        <div>
          <h1 id="upload-title">Upload</h1>
          <p>Add a photograph to a collection. It appears on the site once saved.</p>
        </div>
      </header>

      <div className="a-split">
        {/* FORM */}
        <div className="a-stack">
          {statusMessage && (
            <div role="status" className={`a-status a-status--${statusMessage.type}`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 size={16} strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <AlertCircle size={16} strokeWidth={1.5} aria-hidden="true" />
              )}
              <span className="a-status__text">{statusMessage.text}</span>
            </div>
          )}

          <label className="a-field">
            <span className="a-label">Image file</span>
            <input
              type="file"
              accept="image/*"
              className="a-file"
              onChange={(e) => {
                setStatusMessage(null);
                setFile(e.target.files?.[0] ?? null);
              }}
            />
          </label>

          <label className="a-field">
            <span className="a-label">Title</span>
            <input
              type="text"
              className="a-input"
              placeholder="e.g. Sunset over the fort"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label className="a-field">
            <span className="a-label">Collection</span>
            <select
              className="a-input"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="__NEW__">Create a collection…</option>
            </select>
          </label>

          {selectedCategory === '__NEW__' && (
            <label className="a-field">
              <span className="a-label">New collection name</span>
              <input
                type="text"
                className="a-input"
                placeholder="e.g. Architecture"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
              />
              <span className="a-help">This creates a new collection and a folder in storage.</span>
            </label>
          )}

          <label className="a-field">
            <span className="a-label">Storage file name (optional)</span>
            <input
              type="text"
              className="a-input"
              placeholder="e.g. sunset-in-pune"
              value={customFileName}
              onChange={(e) => setCustomFileName(e.target.value)}
            />
            <span className="a-help">Leave blank to number it after the last photograph in the collection.</span>
          </label>

          <div className="a-path">
            <span className="a-help">Saved as</span>
            <code>photos/{storagePathPreview}</code>
          </div>

          {loading && (
            <div
              className="a-progress"
              role="progressbar"
              aria-label="Upload progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <span style={{ transform: `scaleX(${progress / 100})` }} />
            </div>
          )}

          <div>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || loading}
              aria-busy={loading}
              className="a-btn a-btn--primary"
            >
              {loading ? `Uploading, ${progress}%` : 'Upload photograph'}
            </button>
          </div>
        </div>

        {/* PREVIEW */}
        <div className="a-preview">
          <span className="a-label">Preview</span>
          {previewUrl ? (
            <>
              <div className="a-preview__frame">
                <img src={previewUrl} alt="Preview of the selected file" />
              </div>
              {dimensions && (
                <dl>
                  <dt>Dimensions</dt>
                  <dd>
                    {dimensions.w} × {dimensions.h} px
                  </dd>
                </dl>
              )}
              <div>
                <button type="button" onClick={() => setFile(null)} className="a-btn a-btn--sm">
                  Replace file
                </button>
              </div>
            </>
          ) : (
            <div className="a-empty">
              <p>No image selected</p>
              <p>Choose a file to see it here before you upload.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
