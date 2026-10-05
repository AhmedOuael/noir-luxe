// Single source of truth for remote image hosts: next.config.ts allows exactly
// these for next/image, and imageUrl() refuses anything else.
export const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL?.replace(/\/$/, "") ?? "";

export const REMOTE_IMAGE_HOSTS: string[] = [
  ...(IMAGE_BASE_URL ? [new URL(IMAGE_BASE_URL).hostname] : []), // Cloudflare CDN
  "lh3.googleusercontent.com", // demo product gallery
  "images.unsplash.com",
];
