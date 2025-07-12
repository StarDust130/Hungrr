/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "ik.imagekit.io", pathname: "**" },
      { protocol: "https", hostname: "source.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ Ignores TypeScript errors
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ Ignores ESLint warnings/errors
  },
};

module.exports = nextConfig;
