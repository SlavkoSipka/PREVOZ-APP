/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Turbo samo za dev, ne za production build
    ...(process.env.NODE_ENV === 'development' && {
      turbo: {
        root: __dirname,
      },
    }),
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
  },
  // Omogući file tracing samo na Netlify (Linux), isključi za Windows lokalno
  outputFileTracing: process.platform !== 'win32',
  // Generiši unique build ID za svaki deploy
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
  // Enable React strict mode for better performance
  reactStrictMode: true,
  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // Enable SWC minification
  swcMinify: true,
  // Optimize font loading
  optimizeFonts: true,
  // Cache headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

