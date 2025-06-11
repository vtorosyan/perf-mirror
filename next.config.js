/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use standalone output for Docker builds
  ...(process.env.DOCKER_BUILD === 'true' && { output: 'standalone' }),
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // appDir is now stable in Next.js 14, no longer needed
  },
  // Disable static generation for all API routes
  async rewrites() {
    return []
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig 