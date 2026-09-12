import type { NextConfig } from "next";

import { getLegacyDirectRedirects } from "./lib/legacy-routes";

const nextConfig: NextConfig = {
  async redirects() {
    return getLegacyDirectRedirects();
  },
};

export default nextConfig;
