import type { NextConfig } from "next";
import path from "path";
import transpileModules from "next-transpile-modules";

const withTM = transpileModules(["@xyflow/react"]);

const nextConfig: NextConfig = withTM({
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  compiler: {
    styledComponents: true,
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@odigos/ui-kit": path.resolve(__dirname, "src/odigos-ui-kit"),
    };

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

    // Custom CSS loaders disable Next's built-in CSS support, so cover all needed paths here
    config.module.rules.push({
      test: /\.css$/,
      include: [
        /node_modules[\\/]@xyflow\/react/,
        path.resolve(__dirname, "src/odigos-ui-kit"),
      ],
      use: ["style-loader", "css-loader"],
    });

    return config;
  },
});

export default nextConfig;
