import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["http://127.0.0.1:3002", "http://localhost:3002"],
};

export default nextConfig;
