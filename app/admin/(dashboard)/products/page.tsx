import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { listProducts } from "@/lib/admin/products";
import { formatDZD } from "@/lib/format";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireUser("ADMIN");
  const { q } = await searchParams;
  const products = await listProducts(q);

  const price = (p: { minPrice: number; maxPrice: number }) =>
    p.minPrice === p.maxPrice ? formatDZD(p.minPrice) : `${formatDZD(p.minPrice)} – ${formatDZD(p.maxPrice)}`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-3xl">Products</h1>
        <div className="flex flex-wrap-reverse md:flex-nowrap gap-2 w-full md:w-auto">
          <form action="/admin/products" className="flex gap-2 flex-1 min-w-0 basis-full md:basis-auto">
            <input
              name="q"
              defaultValue={q}
              placeholder="Name or SKU"
              className="flex-1 min-w-0 md:w-64 bg-transparent border border-outline-variant px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
            <button className="px-4 py-2 border border-outline-variant text-xs font-medium tracking-label uppercase hover:border-primary">Search</button>
          </form>
          <Link href="/admin/products/new" className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary text-on-primary text-xs font-medium tracking-label uppercase whitespace-nowrap basis-full md:basis-auto">
            <Plus size={14} aria-hidden="true" /> New product
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-secondary py-24 text-center">{q ? `No products matching "${q}".` : "No products yet. Create the first one."}</p>
      ) : (
        <ul className="border border-outline-variant divide-y divide-outline-variant">
          {products.map((p) => (
            <li key={p.id}>
              <Link href={`/admin/products/${p.id}`} className="flex items-center gap-4 p-3 hover:bg-surface-container-low">
                <div className="relative w-14 aspect-3/4 shrink-0 bg-surface-container overflow-hidden">
                  {p.image && <Image src={p.image} alt="" fill sizes="56px" className="object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium truncate">{p.name}</span>
                    {!p.active && <span className="text-[10px] font-semibold uppercase tracking-label px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 ring-1 ring-inset ring-zinc-200">Hidden</span>}
                    {p.limited && <span className="text-[10px] font-semibold uppercase tracking-label px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200">Limited</span>}
                  </div>
                  <p className="text-xs text-secondary mt-0.5 truncate">
                    {[p.categories.join(", ") || "No category", `${p.sizes} size${p.sizes === 1 ? "" : "s"}`].join(" · ")}
                  </p>
                </div>
                <div className="hidden sm:block text-sm text-right whitespace-nowrap">{p.sizes ? price(p) : "—"}</div>
                <div className={`w-24 text-right text-sm whitespace-nowrap ${p.available === 0 ? "text-error font-semibold" : ""}`}>
                  {p.available} in stock
                  {p.reserved > 0 && <div className="text-xs text-secondary">{p.reserved} reserved</div>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
