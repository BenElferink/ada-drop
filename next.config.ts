import type { NextConfig } from 'next'
import transpileModules from 'next-transpile-modules'

const withTM = transpileModules(['@odigos/ui-kit'])

const nextConfig: NextConfig = withTM({
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
})

export default nextConfig
