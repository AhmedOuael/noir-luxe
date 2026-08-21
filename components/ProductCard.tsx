import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
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
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-display text-lg mb-1">{product.name}</h4>
          <p className="text-secondary text-xs tracking-label uppercase">{product.colorName}</p>
        </div>
        <span className="text-sm font-semibold whitespace-nowrap">
          {product.price.toLocaleString()} DZD
        </span>
      </div>
    </Link>
  );
}
