"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Search, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/useCart";

const links = [
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function CartLink({ count, onClick }: { count: number; onClick?: () => void }) {
  return (
    <Link href="/cart" aria-label="Cart" onClick={onClick} className="relative text-primary hover:scale-95 active:scale-90 transition-transform">
      <ShoppingBag size={20} />
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-primary text-on-primary text-[9px] w-4 h-4 flex items-center justify-center rounded-full">
          {count}
        </span>
      )}
    </Link>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const { count: cartCount } = useCart();

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant/40">
      <nav className="flex items-center justify-between px-5 md:px-16 py-4">
        {/* Left: links (desktop) */}
        <div className="hidden md:flex items-center gap-8 flex-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-xs font-medium tracking-label uppercase text-secondary hover:text-primary transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-primary"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Center: logo */}
        <Link href="/" className="flex-none text-center font-display text-2xl md:text-4xl tracking-tighter text-primary">
          NOIR
        </Link>

        {/* Mobile: cart stays reachable without opening the menu */}
        <div className="md:hidden">
          <CartLink count={cartCount} />
        </div>

        {/* Right: actions */}
        <div className="hidden md:flex items-center justify-end gap-6 flex-1">
          <button aria-label="Search" className="text-primary hover:scale-95 active:scale-90 transition-transform">
            <Search size={20} />
          </button>
          <CartLink count={cartCount} />
        </div>
      </nav>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden flex flex-col gap-6 px-5 py-8 border-t border-outline-variant/40 bg-surface">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium tracking-label uppercase text-primary"
            >
              {l.label}
            </Link>
          ))}
          <div className="flex items-center gap-6 pt-4 border-t border-outline-variant/40">
            <Search size={20} />
            <CartLink count={cartCount} onClick={() => setOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}
