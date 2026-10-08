import type { NextConfig } from "next";
import { REMOTE_IMAGE_HOSTS } from "./lib/image-hosts";

const isDev = process.env.NODE_ENV === "development";

// Product photo uploads go from the admin's browser straight to Cloudflare R2.
const r2Endpoint = process.env.R2_ACCOUNT_ID
  ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
  : "https://*.r2.cloudflarestorage.com";

// CSP without nonces (per the Next.js guide): nonces would force every page to
// render per request and lose the pre-built, cached product pages. Next.js and
// React still need inline scripts/styles, so the protection here comes from
// everything else being locked to our own origin.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:", // remote photos are served through /_next/image
  "font-src 'self'",
  `connect-src 'self' ${r2Endpoint}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Kept in sync with imageUrl() via lib/image-hosts.ts.
    remotePatterns: REMOTE_IMAGE_HOSTS.map((hostname) => ({ protocol: "https" as const, hostname })),
    // Next 16 only serves listed qualities: 75 is the default for everything,
    // 90 is used by the hero, where compression artifacts show the most.
    qualities: [75, 90],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
