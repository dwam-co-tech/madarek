import type { NextConfig } from 'next'

const nextConfig: NextConfig = {

  images: {
    unoptimized: true,
  },

  async redirects() {
    return [
      { source: '/dashboard', destination: '/md-dash', permanent: false },
      { source: '/dashboard/:path*', destination: '/md-dash/:path*', permanent: false },
    ]
  },

  async rewrites() {
    return [
      { source: '/md-dash', destination: '/dashboard' },
      { source: '/md-dash/:path*', destination: '/dashboard/:path*' },
    ]
  },
}

export default nextConfig

