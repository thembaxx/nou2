import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.cdntoyota.co.za",
        pathname: "/toyotacms23/attachments/**",
        search: "",
      },
    ],
    qualities: [65, 85, 90],
    deviceSizes: [320, 480, 640, 960, 1280, 1600, 2400, 3200],
    imageSizes: [96, 192],
    minimumCacheTTL: 86400,
  },
};
export default nextConfig;
