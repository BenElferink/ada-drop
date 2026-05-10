import type { NextConfig } from "next";
import transpileModules from "next-transpile-modules";

const withTM = transpileModules(["@odigos/ui-kit", "@xyflow/react"]);

const nextConfig: NextConfig = withTM({
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  compiler: {
    styledComponents: true,
  },
  webpack: (config, { isServer }) => {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    if (!isServer) {
      const webpack = require("webpack");

      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: require.resolve("buffer/"),
        crypto: false,
        process: require.resolve("process/browser"),
      };

      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^node:/,
          (resource: { request: string }) => {
            resource.request = resource.request.replace(/^node:/, "");
          },
        ),
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: "process/browser",
        }),
      );
    }

    // Ensure CSS from transpiled node_modules works
    config.module.rules.push({
      test: /\.css$/,
      include: /node_modules[\\/](@odigos\/ui-kit|@xyflow\/react)/,
      use: ["style-loader", "css-loader"],
    });

    return config;
  },
});

export default nextConfig;
