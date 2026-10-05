"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart, type CartItem } from "@/components/cart/useCart";
import { useCartSync } from "@/components/cart/useCartSync";
import { CartLine } from "../cart/CartView";
import type { WilayaOption } from "@/lib/delivery";
import { placeOrder, quoteDelivery } from "./actions";
import { formatDZD } from "@/lib/format";

type DeliveryType = "HOME" | "STOP_DESK";
type Field = "fullName" | "phone" | "wilaya" | "deliveryType" | "items";

const DELIVERY_OPTIONS: { value: DeliveryType; label: string; hint: string }[] = [
  { value: "HOME", label: "Home delivery", hint: "Delivered to your door" },
  { value: "STOP_DESK", label: "Stop-desk", hint: "Pick up at the delivery office" },
];

const inputClass =
  "w-full bg-transparent border border-outline-variant px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors";

/**
 * Checks out the bag, or with `buyNow` just that one item ("Buy now" on a
 * product page). Buy-now leaves the bag untouched.
 */
export default function CheckoutForm({ wilayas, buyNow }: { wilayas: WilayaOption[]; buyNow?: CartItem }) {
  const router = useRouter();
  const cart = useCart();
  const sync = useCartSync(!buyNow);
  const items = buyNow ? [buyNow] : cart.items;
  const subtotal = buyNow ? buyNow.price * buyNow.quantity : cart.subtotal;
  const hydrated = buyNow ? true : cart.hydrated;
  const { syncing, notice } = sync;

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [wilayaId, setWilayaId] = useState("");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("HOME");
  const [website, setWebsite] = useState(""); // honeypot

  const [fees, setFees] = useState<Partial<Record<DeliveryType, number | null>>>({});
  const [quoting, setQuoting] = useState(false);
  const quoteRequest = useRef(0);

  const [error, setError] = useState<{ message: string; field?: Field } | null>(null);
  const [placed, setPlaced] = useState(false);
  const [submitting, startSubmit] = useTransition();

  // Quote both delivery types for the chosen wilaya.
  const handleWilayaChange = (id: string) => {
    setWilayaId(id);
    const request = ++quoteRequest.current;
    setQuoting(true);
    quoteDelivery(id)
      .then((quote) => {
        if (request !== quoteRequest.current) return; // ignore answers for an older pick
        setFees(quote);
        // A disabled radio stays checked, so move off a type this wilaya doesn't offer.
        setDeliveryType((current) => {
          const other: DeliveryType = current === "HOME" ? "STOP_DESK" : "HOME";
          return quote[current] === null && quote[other] !== null ? other : current;
        });
      })
      .catch(() => {
        if (request === quoteRequest.current) setFees({});
      })
      .finally(() => {
        if (request === quoteRequest.current) setQuoting(false);
      });
  };

  const fee = wilayaId ? fees[deliveryType] : undefined;
  const total = typeof fee === "number" ? subtotal + fee : null;
  const noDelivery = !!wilayaId && !quoting && fees.HOME === null && fees.STOP_DESK === null;

  if (!hydrated || placed) return <p className="text-secondary py-24 text-center">Loading…</p>;

  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-secondary mb-8">Your bag is empty.</p>
        <Link
          href="/products"
          className="inline-block bg-primary text-on-primary px-10 py-4 rounded-full text-sm font-medium tracking-label uppercase hover:opacity-90 transition-opacity"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startSubmit(async () => {
      try {
        const result = await placeOrder({
          fullName,
          phone,
          wilayaId,
          deliveryType,
          website,
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        });
        if (result.ok) {
          setPlaced(true);
          if (!buyNow) cart.clear();
          router.replace(`/checkout/success?order=${result.orderId}`);
        } else {
          setError({ message: result.error, field: result.field });
        }
      } catch {
        setError({ message: "Something went wrong. Please check your connection and try again." });
      }
    });
  };

  const fieldError = (field: Field) =>
    error?.field === field ? <p className="text-error text-xs mt-2">{error.message}</p> : null;
  const borderFor = (field: Field) => (error?.field === field ? "border-error" : "");

  return (
    <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 lg:gap-20">
      <div className="space-y-10">
        <section>
          <h2 className="text-xs font-medium tracking-label uppercase mb-6">Your details</h2>
          <div className="space-y-5">
            <label className="block">
              <span className="text-sm mb-2 block">Full name</span>
              <input
                className={`${inputClass} ${borderFor("fullName")}`}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                required
                maxLength={80}
              />
              {fieldError("fullName")}
            </label>
            <label className="block">
              <span className="text-sm mb-2 block">Phone number</span>
              <input
                className={`${inputClass} ${borderFor("phone")}`}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="05 / 06 / 07 XX XX XX XX"
                required
                maxLength={20}
              />
              {fieldError("phone")}
            </label>
            <label className="block">
              <span className="text-sm mb-2 block">Wilaya</span>
              <select
                className={`${inputClass} ${borderFor("wilaya")}`}
                value={wilayaId}
                onChange={(e) => handleWilayaChange(e.target.value)}
                required
              >
                <option value="" disabled>
                  Choose your wilaya
                </option>
                {wilayas.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.code} – {w.name}
                  </option>
                ))}
              </select>
              {fieldError("wilaya")}
            </label>

            {/* Honeypot: hidden from people, bots tend to fill it in. */}
            <div aria-hidden="true" className="absolute left-[-9999px] w-px h-px overflow-hidden">
              <label>
                Website
                <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </label>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-medium tracking-label uppercase mb-6">Delivery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DELIVERY_OPTIONS.map((opt) => {
              const optFee = fees[opt.value];
              const unavailable = !!wilayaId && !quoting && optFee === null;
              return (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 border p-4 cursor-pointer transition-colors ${
                    deliveryType === opt.value ? "border-primary" : "border-outline-variant hover:border-primary"
                  } ${unavailable ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="radio"
                    name="deliveryType"
                    value={opt.value}
                    checked={deliveryType === opt.value}
                    onChange={() => setDeliveryType(opt.value)}
                    disabled={unavailable}
                    className="mt-1 accent-primary"
                  />
                  <span className="flex-1">
                    <span className="flex justify-between gap-2 text-sm font-medium">
                      {opt.label}
                      <span className="font-semibold whitespace-nowrap">
                        {!wilayaId ? "" : quoting ? "…" : typeof optFee === "number" ? formatDZD(optFee) : "Unavailable"}
                      </span>
                    </span>
                    <span className="block text-xs text-secondary mt-1">{opt.hint}</span>
                  </span>
                </label>
              );
            })}
          </div>
          {fieldError("deliveryType")}
          <p className="text-xs text-secondary mt-4">
            Our team will call you to confirm your order and your exact delivery address.
          </p>
        </section>
      </div>

      <aside className="lg:sticky lg:top-28 h-fit bg-surface-container-low p-6 md:p-8">
        <h2 className="text-xs font-medium tracking-label uppercase mb-2">Your order</h2>
        {notice && <p className="my-4 p-3 bg-surface-container text-xs">{notice}</p>}
        <div>
          {items.map((item) => (
            <CartLine key={item.variantId} item={item} editable={false} />
          ))}
        </div>
        <div className="pt-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-secondary">Subtotal</span>
            <span>{formatDZD(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary">Delivery</span>
            <span>{typeof fee === "number" ? formatDZD(fee) : "Choose your wilaya"}</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-outline-variant text-base font-semibold">
            <span>Total</span>
            <span>{total !== null ? formatDZD(total) : "—"}</span>
          </div>
        </div>

        {error && !["fullName", "phone", "wilaya", "deliveryType"].includes(error.field ?? "") && (
          <p className="text-error text-sm mt-6">
            {error.message}{" "}
            {error.field === "items" && (
              <Link href={buyNow ? `/products/${buyNow.slug}` : "/cart"} className="underline">
                {buyNow ? "Back to the product" : "Review your bag"}
              </Link>
            )}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || syncing || quoting || noDelivery}
          className="mt-8 w-full bg-primary text-on-primary py-4 rounded-full text-sm font-medium tracking-label uppercase hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {submitting ? "Placing order…" : "Place order"}
        </button>
        {noDelivery ? (
          <p className="text-xs text-error text-center mt-4">We can&apos;t deliver to this wilaya at the moment.</p>
        ) : (
          <p className="text-xs text-secondary text-center mt-4">Pay in cash when you receive your order</p>
        )}
      </aside>
    </form>
  );
}
