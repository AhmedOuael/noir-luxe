import type { NextConfig } from "next";

// Cloudflare CDN host for product images, e.g. https://cdn.noir.dz
const imageBase = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      ...(imageBase ? [{ protocol: "https" as const, hostname: new URL(imageBase).hostname }] : []),
    ],
  },
};

export default nextConfig;
