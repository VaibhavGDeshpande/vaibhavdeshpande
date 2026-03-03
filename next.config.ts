import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
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
