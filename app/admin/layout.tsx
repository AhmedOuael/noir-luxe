import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Truck, Users, Settings } from "lucide-react";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/logistics", label: "Logistics", icon: Truck },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink text-white flex font-body">
      <aside className="w-64 fixed left-0 top-0 h-screen bg-ink-panel border-r border-ink-border flex flex-col py-8">
        <div className="px-6 mb-10">
          <h1 className="font-display text-2xl">NOIR</h1>
          <p className="text-[10px] tracking-label uppercase text-white/40 mt-1">Admin Controller</p>
        </div>
        <nav className="flex-1 flex flex-col gap-1 px-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-3 rounded-md text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-6 pt-6 border-t border-ink-border">
          <p className="text-xs text-white/40">Admin Profile</p>
          <p className="text-sm">System Controller</p>
          <Link href="/" className="text-xs text-white/50 hover:text-white underline mt-3 inline-block">
            View Store
          </Link>
        </div>
      </aside>
      <main className="flex-1 ml-64 p-10">{children}</main>
    </div>
  );
}
