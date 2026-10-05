// Product images are stored in the DB as a path/key (e.g. "products/hoodie/1.jpg")
// and resolved against the CDN here. Until the Cloudflare CDN is set up,
// NEXT_PUBLIC_IMAGE_BASE_URL is unset and paths resolve to /public.
const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL?.replace(/\/$/, "") ?? "";

export function imageUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const clean = path.replace(/^\//, "");
  return base ? `${base}/${clean}` : `/${clean}`;
}
