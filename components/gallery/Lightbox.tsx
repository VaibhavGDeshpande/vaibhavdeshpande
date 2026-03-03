import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { Photo } from '@/lib/data';
import { getOptimizedImageUrl } from '@/lib/image';
import CameraLoader from '@/components/ui/CameraLoader';

interface LightboxProps {
  photo: Photo | null;
  onClose: () => void;
}

function DownloadWarning({ photo, onCancel }: { photo: Photo; onCancel: () => void }) {
  const handleConfirm = () => {
    window.location.href = `/api/download/${photo.id}`;
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 text-center sm:p-8">
        <p className="eyebrow">Before download</p>
        <h3 className="mt-2 font-serif text-3xl text-stone-100">Watermarked image</h3>
        <p className="mt-4 text-sm leading-relaxed text-stone-300">
          This preview download includes a visible watermark. Contact for high-resolution licensed images.
        </p>

        <a
          href="mailto:deshpande.vaibhav1012@gmail.com?subject=Photo%20Licensing%20Request"
          className="mt-6 inline-flex text-sm text-stone-200 underline underline-offset-4 hover:text-white"
        >
          Request licensed file
        </a>

        <div className="mt-8 flex justify-center gap-3">
          <button onClick={onCancel} className="btn-soft">
            Cancel
          </button>
          <button onClick={handleConfirm} className="btn-accent">
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Lightbox({ photo, onClose }: LightboxProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [loadedPhotoId, setLoadedPhotoId] = useState<string | null>(null);

  useEffect(() => {
    if (!photo) return;

    document.body.style.overflow = 'hidden';
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [photo, onClose]);

  if (!photo) return null;

  const imageLoaded = loadedPhotoId === photo.id;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 px-4 backdrop-blur-md" onClick={onClose}>
      <div className="fade-up max-h-[90vh] w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
        <div className="glass-panel rounded-3xl p-3 sm:p-4">
          {!imageLoaded && (
            <div className="flex min-h-[42vh] items-center justify-center rounded-2xl border border-white/10 bg-black/40">
              <CameraLoader label="Loading photo" compact />
            </div>
          )}

          <Image
            src={getOptimizedImageUrl(photo.image_url, { width: 2200, quality: 82 })}
            alt={photo.title}
            width={photo.width}
            height={photo.height}
            priority
            sizes="100vw"
            onLoad={() => setLoadedPhotoId(photo.id)}
            className={`max-h-[72vh] w-full rounded-2xl object-contain sm:max-h-[76vh] ${
              imageLoaded ? 'block' : 'hidden'
            }`}
          />

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{photo.category}</p>
              <h4 className="mt-1 font-serif text-3xl text-stone-100">{photo.title}</h4>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setShowWarning(true)} className="btn-accent">
                Download
              </button>
              <button onClick={onClose} className="btn-soft">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {showWarning && <DownloadWarning photo={photo} onCancel={() => setShowWarning(false)} />}
    </div>
  );
}
