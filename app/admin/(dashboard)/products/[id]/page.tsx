import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getProductForm, listCategories } from "@/lib/admin/products";
import { isStorageConfigured } from "@/lib/storage";
import ProductForm from "../ProductForm";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; archived?: string }>;
}) {
  await requireUser("ADMIN");
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [product, categories] = await Promise.all([getProductForm(id), listCategories()]);
  if (!product) notFound();

  return (
    <div>
      <Link href="/admin/products" className="text-xs tracking-label uppercase text-secondary hover:text-primary">
        ← All products
      </Link>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mt-3 mb-8">
        <h1 className="font-display text-3xl">{product.name}</h1>
        {product.active && (
          <Link href={`/products/${product.slug}`} target="_blank" className="text-sm underline underline-offset-4 text-secondary hover:text-primary">
            View in shop
          </Link>
        )}
      </div>
      {sp.created && <p className="mb-6 p-3 bg-emerald-50 text-emerald-800 text-sm ring-1 ring-inset ring-emerald-200">Product created.</p>}
      {sp.archived && (
        <p className="mb-6 p-3 bg-amber-50 text-amber-800 text-sm ring-1 ring-inset ring-amber-200">
          This product has orders, so it was hidden from the shop instead of deleted. Its order history is kept.
        </p>
      )}
      <ProductForm key={product.id} initial={product} categories={categories} storageReady={isStorageConfigured()} />
    </div>
  );
}
