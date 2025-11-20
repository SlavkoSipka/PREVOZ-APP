/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      root: __dirname,
    },
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
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
}

module.exports = nextConfig

