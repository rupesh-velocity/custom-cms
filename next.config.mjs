/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  serverExternalPackages: ['@prisma/client', 'prisma'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/:slug.md',
        destination: '/api/md',
      },
    ];
  },
};

export default nextConfig;
