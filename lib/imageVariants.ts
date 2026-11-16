/**
 * Pre-made WebP copies of every photo in the `photos` bucket.
 *
 * Supabase image transformations are not enabled on this project, so the
 * bucket holds resized copies next to the originals:
 *
 *   photos/<Category>/<name>.jpg                    original (unchanged)
 *   photos/variants/<width>/<Category>/<name>.webp  resized copy
 *
 * scripts/make-image-variants.mjs backfills them (it repeats these constants),
 * the admin upload creates them, and lib/imageLoader.ts serves them.
 */

export const VARIANT_WIDTHS = [480, 960, 1600, 2400] as const;
export const VARIANT_PREFIX = 'variants';

/** The smallest variant at least `width` wide, or the largest one. */
export function pickVariantWidth(width: number): number {
  return VARIANT_WIDTHS.find((w) => w >= width) ?? VARIANT_WIDTHS[VARIANT_WIDTHS.length - 1];
}

/** `Sky/8.jpg` -> `variants/960/Sky/8.webp` */
export function variantPath(originalPath: string, width: number): string {
  const clean = originalPath.replace(/^\/+/, '');
  return `${VARIANT_PREFIX}/${width}/${clean.replace(/\.[^./]+$/, '')}.webp`;
}

/** Every variant path of one original, for moving or deleting them together. */
export function allVariantPaths(originalPath: string): string[] {
  return VARIANT_WIDTHS.map((w) => variantPath(originalPath, w));
}
