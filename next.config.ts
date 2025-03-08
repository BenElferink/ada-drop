import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  compiler: {
    styledComponents: true,
  },
  webpack: function (config) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    }
    return config
  },
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'OPTIONS,GET,POST' },
        ],
      },
    ]
  },
}

export default nextConfig
