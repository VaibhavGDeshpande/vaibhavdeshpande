import { NextResponse } from 'next/server';
import sharp from 'sharp';
import supabase from '@/lib/supabase';
import { NextRequest } from 'next/server';
import { createCanvas } from 'canvas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const MAX_DIMENSION = 4000;
const DOWNLOAD_MAX_DIMENSION = 2000; // Compress download images
const JPEG_QUALITY = 70; // Lower quality for better compression

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    // 1. Fetch photo metadata
    const { data: photo, error } = await supabase
      .from('photos')
      .select('image_url, title')
      .eq('id', id)
      .single();

    if (error || !photo) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const path = photo.image_url;

    if (!path) {
      return new NextResponse('Invalid image path', { status: 500 });
    }

    // 2. Download original image
    const { data: file, error: storageError } =
      await supabase.storage.from('photos').download(path);

    if (storageError || !file) {
      console.error('Storage error:', storageError);
      return new NextResponse('Failed to download image', { status: 500 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 3. Check file size
    if (buffer.length > MAX_FILE_SIZE) {
      return new NextResponse('Image too large', { status: 413 });
    }

    // 4. Read image metadata using sharp
    let image = sharp(buffer);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      return new NextResponse('Invalid image', { status: 500 });
    }

    let width = metadata.width;
    let height = metadata.height;

    // 5. Resize for download (compress dimensions)
    const shouldResize = width > DOWNLOAD_MAX_DIMENSION || height > DOWNLOAD_MAX_DIMENSION;
    
    if (shouldResize) {
      const scale = Math.min(1, DOWNLOAD_MAX_DIMENSION / Math.max(width, height));
      width = Math.round(width * scale);
      height = Math.round(height * scale);
      image = image.resize(width, height, {
        kernel: sharp.kernel.lanczos3, // High-quality downscaling
        withoutEnlargement: true,
      });
    }

    // 6. Create watermark using Canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Calculate font size and spacing
// Calculate font size and spacing
const fontSize = Math.max(width, height) / 16; // Slightly smaller for cleaner look
const spacingX = fontSize * 8; // Horizontal spacing
const spacingY = fontSize * 3; // Less vertical spacing (reduced from 8)
const text = 'vgdphotography';

// Set font properties
ctx.font = `bold ${fontSize}px Arial, sans-serif`;
ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
ctx.textBaseline = 'top';

// Measure text width for better positioning
const textMetrics = ctx.measureText(text);
const textWidth = textMetrics.width;
const textHeight = fontSize * 1.2; // Approximate text height

// Save context state
ctx.save();

// Move to center and rotate
ctx.translate(width / 2, height / 2);
ctx.rotate(-30 * Math.PI / 180);

// Calculate grid boundaries
const diagonal = Math.sqrt(width * width + height * height);
const startX = -diagonal;
const endX = diagonal;
const startY = -diagonal;
const endY = diagonal;

// Draw repeating watermark pattern with controlled spacing
let rowOffset = 0;
for (let y = startY; y < endY; y += spacingY) {
  for (let x = startX + rowOffset; x < endX; x += spacingX) {
    ctx.fillText(text, x, y);
  }
  // Alternate row offset for brick pattern (prevents vertical alignment)
  rowOffset = rowOffset === 0 ? spacingX / 2 : 0;
}

// Restore context
ctx.restore();

    // Convert canvas to buffer
    const watermarkBuffer = canvas.toBuffer('image/png');

    // 7. Composite watermark onto original image with compression
    const watermarkedImage = await image
      .composite([
        {
          input: watermarkBuffer,
          blend: 'over',
        },
      ])
      .jpeg({ 
        quality: JPEG_QUALITY, 
        progressive: true, 
        mozjpeg: true, 
        chromaSubsampling: '4:2:0', 
        optimizeCoding: true, 
      })
      .toBuffer();

    // 8. Return compressed watermarked image
    return new NextResponse(new Uint8Array(watermarkedImage), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${photo.title || 'photo'}.jpg"`,
        'Content-Length': watermarkedImage.length.toString(),
        'Cache-Control': 'no-store',
      },
    });

  } catch (err) {
    console.error('Image processing error:', {
      id,
      error: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined
    });
    return new NextResponse('Failed to process image', { status: 500 });
  }
}