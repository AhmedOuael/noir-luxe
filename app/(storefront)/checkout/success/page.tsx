import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Order received | NOIR" };

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  const orderNumber = order && /^\d+$/.test(order) ? order : null;

  return (
    <div className="px-5 md:px-16 py-24 md:py-32 text-center max-w-xl mx-auto">
      <p className="text-xs tracking-label uppercase text-secondary mb-4">Thank you</p>
      <h1 className="font-display text-3xl md:text-5xl mb-6">Order received</h1>
      {orderNumber && <p className="text-sm mb-6">Order number <span className="font-semibold">#{orderNumber}</span></p>}
      <p className="text-on-surface-variant mb-12">
        Our team will call you shortly to confirm your order and delivery address. Please keep your phone nearby.
        You&apos;ll pay in cash when your order arrives.
      </p>
      <Link
        href="/products"
        className="inline-block bg-primary text-on-primary px-10 py-4 rounded-full text-sm font-medium tracking-label uppercase hover:opacity-90 transition-opacity"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
