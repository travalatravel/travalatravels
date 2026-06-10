import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.travala.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "statics.travala.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.travelapi.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
