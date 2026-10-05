import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBuyNowItem } from "@/lib/catalog";
import { getWilayas } from "@/lib/delivery";
import CheckoutForm from "../../CheckoutForm";

export const metadata: Metadata = { title: "Checkout | NOIR", robots: { index: false } };

// Price and stock must be current on every visit.
export const dynamic = "force-dynamic";

/** "Buy now": checks out a single size of a product, leaving the bag untouched. */
export default async function BuyNowPage({ params }: { params: Promise<{ variantId: string }> }) {
  const { variantId } = await params;
  const [item, wilayas] = await Promise.all([getBuyNowItem(variantId), getWilayas()]);
  if (!item) notFound();

  return (
    <div className="px-5 md:px-16 py-16">
      <div className="mb-12">
        <p className="text-xs tracking-label uppercase text-secondary mb-2">Cash on delivery</p>
        <h1 className="font-display text-3xl md:text-5xl">Checkout</h1>
      </div>
      {item.available > 0 ? (
        <CheckoutForm wilayas={wilayas} buyNow={item} />
      ) : (
        <div className="text-center py-24">
          <p className="text-secondary mb-8">
            {item.name}
            {item.size ? ` in ${item.size}` : ""} just sold out.
          </p>
          <Link
            href={`/products/${item.slug}`}
            className="inline-block bg-primary text-on-primary px-10 py-4 rounded-full text-sm font-medium tracking-label uppercase hover:opacity-90 transition-opacity"
          >
            Choose another size
          </Link>
        </div>
      )}
    </div>
  );
}
