/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
  },
  // Add output config to ensure proper static file handling
  output: 'standalone',
  // Ensure public path is set correctly
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  // Disable source maps in development to reduce complexity
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.devtool = 'eval-source-map';
    }
    return config;
  },
};

module.exports = nextConfig; 