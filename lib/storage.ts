import "server-only";
import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Product photos live in Cloudflare R2 (S3-compatible). The browser uploads
// straight to R2 with a short-lived signed URL, so files never pass through
// our server (Vercel caps request bodies at 4.5 MB).
//
// Env: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET,
// and NEXT_PUBLIC_IMAGE_BASE_URL (the bucket's public URL) to display them.

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

const env = {
  accountId: process.env.R2_ACCOUNT_ID,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  bucket: process.env.R2_BUCKET,
  publicBase: process.env.NEXT_PUBLIC_IMAGE_BASE_URL,
};

export function isStorageConfigured() {
  return Boolean(env.accountId && env.accessKeyId && env.secretAccessKey && env.bucket && env.publicBase);
}

let client: S3Client | null = null;
function r2() {
  client ??= new S3Client({
    region: "auto",
    endpoint: `https://${env.accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: env.accessKeyId!, secretAccessKey: env.secretAccessKey! },
    // R2 doesn't accept the checksum headers newer SDK versions add by default.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  return client;
}

/** A signed PUT URL valid for 5 minutes, locked to this exact type and size. */
export async function createImageUpload(folder: string, contentType: string, size: number) {
  const ext = ALLOWED_IMAGE_TYPES[contentType];
  const key = `products/${folder}/${randomUUID()}.${ext}`;
  const uploadUrl = await getSignedUrl(
    r2(),
    new PutObjectCommand({ Bucket: env.bucket, Key: key, ContentType: contentType, ContentLength: size }),
    { expiresIn: 300, signableHeaders: new Set(["content-type", "content-length"]) }
  );
  return { key, uploadUrl };
}

/** Best effort: a leftover file only costs storage, never breaks the site. */
export async function deleteImage(key: string) {
  if (!isStorageConfigured() || key.startsWith("/") || /^[a-z]+:/i.test(key)) return;
  try {
    await r2().send(new DeleteObjectCommand({ Bucket: env.bucket, Key: key }));
  } catch (error) {
    console.error("R2 delete failed for", key, error);
  }
}
