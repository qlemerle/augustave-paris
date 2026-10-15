import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Les images produits Shopify sont servies par cdn.shopify.com
    remotePatterns: [{ protocol: "https", hostname: "cdn.shopify.com" }],
  },
};

export default nextConfig;
