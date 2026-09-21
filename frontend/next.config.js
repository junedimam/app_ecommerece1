/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:5001/api/auth/:path*',
      },
      {
        source: '/api/products/:path*',
        destination: 'http://localhost:5002/api/products/:path*',
      },
      {
        source: '/api/cart/:path*',
        destination: 'http://localhost:5003/api/cart/:path*',
      },
      {
        source: '/api/payments/:path*',
        destination: 'http://localhost:5005/api/payments/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
