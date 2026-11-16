'use client';

import { pickVariantWidth, variantPath } from './imageVariants';

const PUBLIC_SEGMENT = '/storage/v1/object/public/photos/';
const VARIANTS_ON = process.env.NEXT_PUBLIC_IMAGE_VARIANTS === 'on';

interface LoaderArgs {
  src: string;
  width: number;
  quality?: number;
}

/**
 * Custom next/image loader (next.config.ts -> images.loaderFile).
 * Next calls it once per srcset width; a Supabase photo is answered with the
 * nearest pre-made WebP copy, anything else is passed through.
 * With NEXT_PUBLIC_IMAGE_VARIANTS unset it serves the originals, as before.
 */
export default function imageLoader({ src, width }: LoaderArgs): string {
  const at = src.indexOf(PUBLIC_SEGMENT);

  if (at === -1) {
    // Local files (/name1.png) and other hosts: unchanged, width only keeps Next's srcset distinct.
    return src.startsWith('/') ? `${src}?w=${width}` : src;
  }

  if (!VARIANTS_ON) return src;

  const base = src.slice(0, at + PUBLIC_SEGMENT.length);
  const original = decodeURIComponent(src.slice(at + PUBLIC_SEGMENT.length).split('?')[0]);
  if (original.startsWith('variants/')) return src;

  return base + encodeURI(variantPath(original, pickVariantWidth(width)));
}
