import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for Docker / Cloud Run
  output: "standalone",

  // Strict React mode
  reactStrictMode: true,
};

export default nextConfig;
