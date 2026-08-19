import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { formats: ["image/avif", "image/webp"] },
  devIndicators: false,
  allowedDevOrigins: ["192.168.18.22", "localhost:3000"],
};

export default nextConfig;
