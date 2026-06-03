import type { NextConfig } from 'next';

const apiDestination =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://tripi-tropa-production.up.railway.app';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const base = apiDestination.replace(/\/$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${base}/:path*`,
      },
    ];
  },
};

export default nextConfig;
