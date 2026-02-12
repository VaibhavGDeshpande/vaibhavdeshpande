import { useEffect, useState } from 'react';
import { Photo } from '@/lib/data';

/* eslint-disable @next/next/no-img-element */

interface LightboxProps {
  photo: Photo | null;
  onClose: () => void;
}

function DownloadWarning({
  photo,
  onCancel,
}: {
  photo: Photo;
  onCancel: () => void;
}) {
  const handleConfirm = () => {
    window.location.href = `/api/download/${photo.id}`;
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-md px-4">
      <div
        className="w-full max-w-md bg-neutral-900/95 border border-neutral-800
          rounded-xl p-8 text-center shadow-2xl animate-fade-in"
      >
        {/* Title */}
        <h3 className="text-xl font-serif text-white mb-3">
          Watermarked Download
        </h3>

        {/* Description */}
        <p className="text-sm text-neutral-400 leading-relaxed mb-4">
          This photo will be downloaded with a visible watermark:
        </p>

        {/* Watermark name */}
        <p className="mb-6 text-neutral-200 italic tracking-wide">
          “Vaibhav Deshpande”
        </p>

        {/* Licensing CTA */}
        <div className="mb-8">
          <a
            href="mailto:deshpande.vaibhav1012@gmail.com?subject=Photo%20Licensing%20Request"
            className="inline-flex items-center gap-2 text-sm
              text-neutral-400 hover:text-white transition underline underline-offset-4"
          >
            Contact for high quality and licensed image
          </a>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-5 py-2 text-xs uppercase tracking-widest
              text-neutral-400 hover:text-white transition"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            className="px-6 py-2 text-xs uppercase tracking-widest
              bg-white text-black rounded-md
              hover:bg-neutral-200 transition"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Lightbox({ photo, onClose }: LightboxProps) {
  const [showWarning, setShowWarning] = useState(false);

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

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-full max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photo.image_url}
          alt={photo.title}
          className="max-h-[80vh] sm:max-h-[85vh] w-auto object-contain shadow-2xl"
        />

        {/* Action buttons */}
        <div className="mt-6 flex justify-center gap-6">
          <button
            onClick={() => setShowWarning(true)}
            className="text-xs uppercase tracking-widest
              px-5 py-2 border border-neutral-700
              text-neutral-300 hover:text-white hover:border-neutral-500 transition"
          >
            Download
          </button>

          <button
            onClick={onClose}
            className="text-xs uppercase tracking-widest
              px-5 py-2 text-neutral-400 hover:text-white transition"
          >
            Close
          </button>
        </div>
      </div>

      {showWarning && (
        <DownloadWarning
          photo={photo}
          onCancel={() => setShowWarning(false)}
        />
      )}
    </div>
  );
} 