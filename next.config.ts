import type { NextConfig } from "next";
import { REMOTE_IMAGE_HOSTS } from "./lib/image-hosts";

const nextConfig: NextConfig = {
  images: {
    // Kept in sync with imageUrl() via lib/image-hosts.ts.
    remotePatterns: REMOTE_IMAGE_HOSTS.map((hostname) => ({ protocol: "https" as const, hostname })),
  },
};

export default nextConfig;
