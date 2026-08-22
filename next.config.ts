import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Applications include up to 4 uploaded documents (Aadhaar + marksheets).
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
