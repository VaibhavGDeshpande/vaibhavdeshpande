import { NextResponse } from 'next/server';
import sharp from 'sharp';
import supabase from '@/lib/supabase';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; 

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

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

  const { data: file, error: storageError } =
    await supabase.storage.from('photos').download(path);

  if (storageError || !file) {
    console.error(storageError);
    return new NextResponse('Failed to download image', { status: 500 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    // Read image metadata
    const image = sharp(buffer);
    const metadata = await image.metadata();

    const width = metadata.width || 1200;
    const height = metadata.height || 800;

    const fontSize = Math.max(width, height) / 14;
    const spacing = fontSize * 4;

    const watermarkSvg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern
      id="wm"
      patternUnits="userSpaceOnUse"
      width="${spacing}"
      height="${spacing}"
      patternTransform="rotate(-30)">
      <text
        x="0"
        y="${fontSize}"
        font-size="${fontSize}"
        fill="rgba(255,255,255,0.22)"
        font-family="Arial, Helvetica, sans-serif">
        vgdphotography
      </text>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#wm)" />
</svg>
`;

    // Create watermark and ensure it matches image dimensions
    const watermarkBuffer = await sharp(Buffer.from(watermarkSvg))
      .resize(width, height, {
        fit: 'fill',
        kernel: 'nearest'
      })
      .png()
      .toBuffer();

    // 7. Composite and output
const watermarkedImage = await image
  .composite([
    {
      input: watermarkBuffer,
      blend: 'over',
    },
  ])
  .jpeg({ quality: 85, mozjpeg: true })
  .toBuffer();


return new NextResponse(new Uint8Array(watermarkedImage), {
  headers: {
    'Content-Type': 'image/jpeg',
    'Content-Disposition': `attachment; filename="photo.jpg"`,
    'Cache-Control': 'no-store',
  },
});

    return new Response(new Uint8Array(watermarkedImage), {
  headers: {
    'Content-Type': 'image/jpeg',
    'Content-Disposition': `attachment; filename="'photo'.jpg"`,
    'Cache-Control': 'public, max-age=31536000, immutable',
  },
});

  } catch (err) {
    console.error('Image processing error:', err);
    return new NextResponse('Failed to process image', { status: 500 });
  }
}