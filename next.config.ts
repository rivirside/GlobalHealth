import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["recharts", "leaflet.markercluster"],
  },
};

export default nextConfig;
