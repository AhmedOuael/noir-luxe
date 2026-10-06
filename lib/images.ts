import { IMAGE_BASE_URL, REMOTE_IMAGE_HOSTS } from "./image-hosts";

// How stored image values resolve:
//   "/images/hero.jpg"            a file in /public (leading slash)
//   "products/hoodie/8f3a.jpg"    a key in Cloudflare R2, served from NEXT_PUBLIC_IMAGE_BASE_URL
//   "https://host/x.jpg"          a full URL, only from hosts next/image allows
// Anything else returns null so the UI shows its placeholder instead of breaking.
export function imageUrl(path: string): string | null {
  if (/^[a-z][a-z\d+.-]*:/i.test(path) || path.startsWith("//")) {
    try {
      const url = new URL(path);
      return url.protocol === "https:" && REMOTE_IMAGE_HOSTS.includes(url.hostname) ? url.href : null;
    } catch {
      return null;
    }
  }
  if (path.startsWith("/")) return path.length > 1 ? path : null;
  if (!path) return null;
  // A storage key: needs the CDN to be configured.
  return IMAGE_BASE_URL ? `${IMAGE_BASE_URL}/${path}` : null;
}
