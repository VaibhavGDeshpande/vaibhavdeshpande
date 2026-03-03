interface OptimizeImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'origin' | 'webp' | 'avif';
}

const SUPABASE_PUBLIC_SEGMENT = '/storage/v1/object/public/photos/';

export function getOptimizedImageUrl(
  src: string,
  options: OptimizeImageOptions = {}
): string {
  try {
    const url = new URL(src);

    if (!url.pathname.includes(SUPABASE_PUBLIC_SEGMENT)) return src;

    if (options.width) url.searchParams.set('width', String(options.width));
    if (options.height) url.searchParams.set('height', String(options.height));

    url.searchParams.set('quality', String(options.quality ?? 72));
    url.searchParams.set('format', options.format ?? 'webp');

    return url.toString();
  } catch {
    return src;
  }
}
