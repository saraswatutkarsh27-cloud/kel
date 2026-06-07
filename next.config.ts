import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@monaco-editor/react"],
  experimental: {
    optimizePackageImports: ["lucide-react", "@xterm/xterm"],
  },
};

export default nextConfig;
