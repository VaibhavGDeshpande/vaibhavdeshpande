import { NextResponse } from 'next/server';
import sharp from 'sharp';
import supabase from '@/lib/supabase';
import { NextRequest } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const DOWNLOAD_MAX_DIMENSION = 2000;
const JPEG_QUALITY = 70;

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    // 1️⃣ Get image record from Supabase
    const { data: photo, error } = await supabase
      .from('photos')
      .select('image_url, title')
      .eq('id', id)
      .single();

    if (error || !photo) {
      return new NextResponse('Image not found', { status: 404 });
    }

    if (!photo.image_url) {
      return new NextResponse('Invalid image path', { status: 500 });
    }

    // 2️⃣ Download image from Supabase Storage
    const { data: file, error: storageError } =
      await supabase.storage.from('photos').download(photo.image_url);

    if (storageError || !file) {
      console.error('Storage error:', storageError);
      return new NextResponse('Failed to download image', { status: 500 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (buffer.length > MAX_FILE_SIZE) {
      return new NextResponse('Image too large', { status: 413 });
    }

    // 3️⃣ Prepare base image
    let image = sharp(buffer);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      return new NextResponse('Invalid image', { status: 500 });
    }

    let width = metadata.width;
    let height = metadata.height;

    // Resize if too large
    const shouldResize =
      width > DOWNLOAD_MAX_DIMENSION || height > DOWNLOAD_MAX_DIMENSION;

    if (shouldResize) {
      const scale = Math.min(
        1,
        DOWNLOAD_MAX_DIMENSION / Math.max(width, height)
      );

      width = Math.round(width * scale);
      height = Math.round(height * scale);

      image = image.resize(width, height, {
        kernel: sharp.kernel.lanczos3,
        withoutEnlargement: true,
      });
    }

    // 4️⃣ Load watermark
    const watermarkPath = path.join(
      process.cwd(),
      'public',
      'name1.png'
    );

    let watermarkBuffer: Buffer;

    try {
      watermarkBuffer = await fs.readFile(watermarkPath);
    } catch (e) {
      console.error('Failed to load watermark image:', e);
      return new NextResponse('Watermark asset missing', { status: 500 });
    }

    // 5️⃣ Make watermark BIG (75% of image width)
    const watermarkWidth = Math.floor(width * 0.75);

    const resizedWatermark = await sharp(watermarkBuffer)
      .resize({ width: watermarkWidth })
      .png()
      .toBuffer();

    // 6️⃣ Apply opacity (25%)
    const watermarkWithOpacity = await sharp(resizedWatermark)
      .ensureAlpha()
      .modulate({ brightness: 1 }) // keeps original colors
      .toBuffer();

    // 7️⃣ Composite centered watermark
    const watermarkedImage = await image
      .composite([
        {
          input: watermarkWithOpacity,
          gravity: 'center', // 🔥 perfect center
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

    return new NextResponse(new Uint8Array(watermarkedImage), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${
          photo.title || 'photo'
        }.jpg"`,
        'Content-Length': watermarkedImage.length.toString(),
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('Image processing error:', {
      id,
      error: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined,
    });

    return new NextResponse('Failed to process image', { status: 500 });
  }
}