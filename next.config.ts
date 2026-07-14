import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.15.34",
    "192.168.15.34:3000",
  ],
};

export default nextConfig;
