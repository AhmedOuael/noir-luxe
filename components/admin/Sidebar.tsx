"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Package, ShoppingBag, Users, UserCog, X, LogOut } from "lucide-react";

const NAV = [
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, adminOnly: false },
  { href: "/admin/products", label: "Products", icon: Package, adminOnly: true },
  { href: "/admin/clients", label: "Clients", icon: Users, adminOnly: false },
  { href: "/admin/users", label: "Team", icon: UserCog, adminOnly: true },
];

type Props = {
  user: { name: string; email: string; role: "ADMIN" | "STAFF" };
  logoutAction: () => Promise<void>;
};

export default function Sidebar({ user, logoutAction }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = NAV.filter((item) => !item.adminOnly || user.role === "ADMIN");

  // Close the mobile drawer after navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Lock page scroll behind the open drawer, close it with Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const nav = (
    <nav className="flex flex-col h-full">
      <Link href="/admin/orders" className="flex items-baseline gap-2 px-6 h-16 shrink-0 border-b border-outline-variant">
        <span className="font-display text-2xl tracking-tighter">NOIR</span>
        <span className="text-xs text-secondary">Admin</span>
      </Link>
      <ul className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                  active ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="shrink-0 border-t border-outline-variant px-6 py-4">
        <p className="text-sm truncate">{user.name || user.email}</p>
        <p className="text-xs text-secondary mb-3">{user.role === "ADMIN" ? "Admin" : "Staff"}</p>
        <form action={logoutAction}>
          <button className="flex items-center gap-2 text-sm text-secondary hover:text-primary">
            <LogOut size={16} aria-hidden="true" /> Log out
          </button>
        </form>
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop: fixed sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-60 bg-surface border-r border-outline-variant z-30">{nav}</aside>

      {/* Mobile: top bar + slide-in drawer */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-surface/95 backdrop-blur border-b border-outline-variant">
        <button onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} className="p-2 -ml-2">
          <Menu size={22} />
        </button>
        <span className="font-display text-xl tracking-tighter">NOIR</span>
        <span className="w-9" aria-hidden="true" />
      </header>
      {open && (
        <div className="lg:hidden fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label="Admin menu">
          <button className="absolute inset-0 bg-black/40" aria-label="Close menu" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-surface shadow-xl">
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-3 top-4 p-2">
              <X size={20} />
            </button>
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}
