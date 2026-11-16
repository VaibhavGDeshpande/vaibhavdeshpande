import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // A custom loader instead of Vercel's optimizer (which rejected the large originals):
    // lib/imageLoader.ts points each srcset width at a pre-made WebP copy in Supabase.
    loader: 'custom',
    loaderFile: './lib/imageLoader.ts',
    deviceSizes: [480, 640, 750, 828, 1080, 1200, 1920, 2560],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'briysjozqxpqjtdyohje.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
