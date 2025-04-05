import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  compiler: {
    styledComponents: true,
  },
  webpack: (config) => {
    // Enable support for async WebAssembly and layers
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    }

    return config
  },
}

export default nextConfig
