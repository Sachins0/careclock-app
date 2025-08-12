/** @type {import('next').NextConfig} */
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      // Cache API routes
      {
        urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images',
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          },
        },
      },
      // Cache API routes for CareClock
      {
        urlPattern: /^\/api\/graphql$/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 60 * 60, // 1 hour
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      // Cache authentication routes
      {
        urlPattern: /^\/api\/auth\//,
        handler: 'NetworkOnly',
      },
      // Cache static assets
      {
        urlPattern: /\.(?:js|css|woff2?|ttf|eot)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-assets',
        },
      },
    ],
  },
  fallbacks: {
    document: '/offline',
    image: '/images/offline-image.png',
  },
});

const nextConfig = {
  // Move to root level (fixed from earlier error)
  serverExternalPackages: ['@prisma/client'],
  images: {
    domains: ['localhost'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // ✅ Disable TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ensure proper build output
  output: 'standalone',
};

module.exports = withPWA(nextConfig);
