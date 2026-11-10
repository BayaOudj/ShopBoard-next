import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  distDir: process.env.SHOPBOARD_TEST_MODE === '1' ? '.next-test' : '.next',
  turbopack: { root: import.meta.dirname },
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/api/products.json', destination: '/api/catalog' },
      ],
    }
  },
  cacheComponents: true,
  partialPrefetching: true,
}

export default nextConfig
