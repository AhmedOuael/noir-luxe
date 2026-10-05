import Link from "next/link";
import Image from "next/image";
import type { CatalogProduct } from "@/lib/catalog";
import { formatDZD } from "@/lib/format";

export default function ProductCard({ product }: { product: CatalogProduct }) {
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="aspect-3/4 overflow-hidden mb-4 bg-surface-container relative">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 80vw, 340px"
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-secondary text-xs tracking-label uppercase">
            {product.name}
          </div>
        )}
        {product.limited && (
          <span className="absolute top-3 left-3 bg-primary text-on-primary text-[10px] tracking-label uppercase px-2 py-1">
            Limited
          </span>
        )}
      </div>
      {/* Name gets the full width; color and price share a line from sm up and
          stack on phones, so a wrapping name never pushes the price out of line. */}
      <h4 className="font-display text-lg leading-snug">{product.name}</h4>
      <div className="mt-1.5 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
        <p className="text-secondary text-xs tracking-label uppercase">{product.colorName}</p>
        <span className="text-sm font-semibold whitespace-nowrap">{formatDZD(product.price)}</span>
      </div>
    </Link>
  );
}
