import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      // UploadThing CDN (current — ufs.sh)
      {
        protocol: "https",
        hostname: "ufs.sh",
        pathname: "/f/**",
      },
      {
        protocol: "https",
        hostname: "*.ufs.sh",
        pathname: "/f/**",
      },
      // UploadThing CDN (legacy — utfs.io)
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "/f/**",
      },
      {
        protocol: "https",
        hostname: "*.utfs.io",
        pathname: "/f/**",
      },
    ],
  },
};

export default nextConfig;
