import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
    unoptimized: true, // MVP 阶段使用本地图片，无需优化
  },
  serverExternalPackages: ["fluent-ffmpeg"],
};

export default nextConfig;
