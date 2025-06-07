/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["images.unsplash.com", "picsum.photos"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
