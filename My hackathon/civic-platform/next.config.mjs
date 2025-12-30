/** @type {import('next').NextConfig} */
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
  // During CI builds we may want to ignore ESLint so lint warnings/errors
  // don't block production builds. Disable linting during build here.
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;

