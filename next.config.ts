import type { NextConfig } from 'next'
import transpileModules from 'next-transpile-modules'

const withTM = transpileModules(['@odigos/ui-kit', '@xyflow/react', '@sidan-lab/sidan-csl-rs-nodejs'])

const nextConfig: NextConfig = withTM({
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  compiler: {
    styledComponents: true,
  },
  webpack: (config) => {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    }

    // Ensure CSS from transpiled node_modules works
    config.module.rules.push({
      test: /\.css$/,
      include: /node_modules[\\/](@odigos\/ui-kit|@xyflow\/react)/,
      use: ['style-loader', 'css-loader'],
    })

    return config
  },
})

export default nextConfig
