import { NextResponse } from 'next/server';
import sharp from 'sharp';
import supabase from '@/lib/supabase';
import { NextRequest } from 'next/server';

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


    if (buffer.length > MAX_FILE_SIZE) {
      return new NextResponse('Image too large', { status: 413 });
    }


    let image = sharp(buffer);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      return new NextResponse('Invalid image', { status: 500 });
    }

    let width = metadata.width;
    let height = metadata.height;


    const shouldResize = width > DOWNLOAD_MAX_DIMENSION || height > DOWNLOAD_MAX_DIMENSION;
    
    if (shouldResize) {
      const scale = Math.min(1, DOWNLOAD_MAX_DIMENSION / Math.max(width, height));
      width = Math.round(width * scale);
      height = Math.round(height * scale);
      image = image.resize(width, height, {
        kernel: sharp.kernel.lanczos3, 
        withoutEnlargement: true,
      });
    }

    // 6. Create watermark using SVG (Serverless friendly)
    const activeDimension = Math.max(width, height);
    const fontSize = Math.floor(activeDimension / 20);
    const text = 'vgdphotography';
    
    // Calculate pattern repetition
    // We create a large enough grid to cover the image even when rotated
    const patternWidth = fontSize * 10;
    const patternHeight = fontSize * 4;
    const cols = Math.ceil(activeDimension * 1.5 / patternWidth) + 2;
    const rows = Math.ceil(activeDimension * 1.5 / patternHeight) + 2;

    let svgContent = '';
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Offset every other row
        const x = c * patternWidth + (r % 2 ? patternWidth / 2 : 0);
        const y = r * patternHeight;
        svgContent += `<text x="${x}" y="${y}" fill="rgba(255,255,255,0.3)" font-family="Arial" font-weight="bold" font-size="${fontSize}" transform="rotate(-30, ${x}, ${y})">${text}</text>`;
      }
    }

    const svgImage = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <style>
          .watermark { 
            fill: rgba(255, 255, 255, 0.3); 
            font-size: ${fontSize}px; 
            font-family: Arial, sans-serif; 
            font-weight: bold;
          }
        </style>
        <g transform="translate(-${width * 0.2}, -${height * 0.2})"> 
             ${svgContent}
        </g>
      </svg>
    `;

    const watermarkBuffer = Buffer.from(svgImage);

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