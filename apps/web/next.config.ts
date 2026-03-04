import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Disabled due to react-leaflet v4.2.1 incompatibility with React 19 Strict
  // Mode double-mount. Re-enable when react-leaflet supports it.
  reactStrictMode: false,
  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  transpilePackages: ["@fintelligence/shared"],

  experimental: {
    turbopackFileSystemCacheForDev: true,
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "date-fns",
      "framer-motion",
    ],
  },
};

export default withNextIntl(nextConfig);
