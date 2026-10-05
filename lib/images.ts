import { IMAGE_BASE_URL, REMOTE_IMAGE_HOSTS } from "./image-hosts";

// Product images are stored in the DB as a path/key (e.g. "products/hoodie/1.jpg")
// and resolved against the CDN here. Until the Cloudflare CDN is set up,
// NEXT_PUBLIC_IMAGE_BASE_URL is unset and paths resolve to /public.
//
// Full URLs are only accepted over https from the hosts next/image allows;
// anything else returns null so the UI shows its placeholder instead of breaking.
export function imageUrl(path: string): string | null {
  if (/^[a-z][a-z\d+.-]*:/i.test(path) || path.startsWith("//")) {
    try {
      const url = new URL(path);
      return url.protocol === "https:" && REMOTE_IMAGE_HOSTS.includes(url.hostname) ? url.href : null;
    } catch {
      return null;
    }
  }
  const clean = path.replace(/^\/+/, "");
  if (!clean) return null;
  return IMAGE_BASE_URL ? `${IMAGE_BASE_URL}/${clean}` : `/${clean}`;
}
