"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { createCategory, deleteProduct, saveProduct, type SaveProductResult } from "@/lib/admin/products";
import type { ActionResult } from "@/lib/admin/orders";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, createImageUpload, isStorageConfigured } from "@/lib/storage";

// Admin-only: every action re-checks the role (actions are reachable by direct POST).

function refreshStorefront(slugs: string[]) {
  revalidatePath("/");
  revalidatePath("/products");
  for (const slug of slugs) revalidatePath(`/products/${slug}`);
}

export async function saveProductAction(productId: string | null, input: unknown): Promise<SaveProductResult> {
  await requireUser("ADMIN");
  const result = await saveProduct(typeof productId === "string" ? productId : null, input);
  if (result.ok) {
    refreshStorefront(result.slugs ?? []);
    revalidatePath("/admin/products");
  }
  return result;
}

export async function deleteProductAction(productId: string): Promise<ActionResult & { archived?: boolean }> {
  await requireUser("ADMIN");
  const result = await deleteProduct(String(productId));
  if (result.ok) {
    refreshStorefront(result.slug ? [result.slug] : []);
    revalidatePath("/admin/products");
  }
  return result.ok ? { ok: true, archived: result.archived } : result;
}

export async function createCategoryAction(name: unknown) {
  await requireUser("ADMIN");
  return createCategory(name);
}

/** Signed URL for uploading one photo straight from the browser to R2. */
export async function createUploadAction(
  folder: unknown,
  contentType: unknown,
  size: unknown
): Promise<{ ok: true; key: string; uploadUrl: string } | { ok: false; error: string }> {
  await requireUser("ADMIN");
  if (!isStorageConfigured()) {
    return { ok: false, error: "Photo upload isn't set up yet (Cloudflare R2 keys are missing)." };
  }
  if (typeof contentType !== "string" || !ALLOWED_IMAGE_TYPES[contentType]) {
    return { ok: false, error: "Use JPG, PNG, WebP or AVIF photos." };
  }
  if (typeof size !== "number" || !Number.isInteger(size) || size <= 0 || size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "Photos must be under 15 MB." };
  }
  const safeFolder = typeof folder === "string" && /^[a-z0-9-]{1,80}$/.test(folder) ? folder : "unsorted";
  const { key, uploadUrl } = await createImageUpload(safeFolder, contentType, size);
  return { ok: true, key, uploadUrl };
}
