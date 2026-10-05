import { getCategories, getProducts } from "@/lib/catalog";
import ProductGrid from "./ProductGrid";

export const revalidate = 60;

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <div className="px-5 md:px-16 py-16">
      <div className="mb-12">
        <p className="text-xs tracking-label uppercase text-secondary mb-2">Collection &apos;26</p>
        <h1 className="font-display text-3xl md:text-5xl">Essential Catalog</h1>
      </div>

      <ProductGrid products={products} categories={categories} />
    </div>
  );
}
