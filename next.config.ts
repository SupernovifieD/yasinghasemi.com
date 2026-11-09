import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // The default image loader is unavailable in a static export. Images are
  // optimized ahead of time (see scripts/) instead.
  images: { unoptimized: true },
};

export default nextConfig;
