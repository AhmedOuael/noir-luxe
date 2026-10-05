import type { NextConfig } from "next";
import { REMOTE_IMAGE_HOSTS } from "./lib/image-hosts";

const nextConfig: NextConfig = {
  images: {
    // Kept in sync with imageUrl() via lib/image-hosts.ts.
    remotePatterns: REMOTE_IMAGE_HOSTS.map((hostname) => ({ protocol: "https" as const, hostname })),
    // Next 16 only serves listed qualities: 75 is the default for everything,
    // 90 is used by the hero, where compression artifacts show the most.
    qualities: [75, 90],
  },
};

export default nextConfig;
