import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { logoutAction } from "../actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const nav = [
    { href: "/admin/orders", label: "Orders" },
    ...(user.role === "ADMIN" ? [{ href: "/admin/users", label: "Team" }] : []),
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-outline-variant">
        <div className="flex items-center justify-between gap-4 px-5 md:px-10 h-16">
          <div className="flex items-center gap-6 md:gap-10 min-w-0">
            <Link href="/admin/orders" className="font-display text-2xl tracking-tighter shrink-0">
              NOIR <span className="text-xs font-sans tracking-label uppercase text-secondary align-middle">Admin</span>
            </Link>
            <nav className="flex items-center gap-5">
              {nav.map((item) => (
                <Link key={item.href} href={item.href} className="text-xs font-medium tracking-label uppercase text-secondary hover:text-primary">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4 min-w-0">
            <span className="hidden sm:block text-xs text-secondary truncate">{user.name || user.email}</span>
            <form action={logoutAction}>
              <button className="text-xs font-medium tracking-label uppercase hover:underline">Log out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="px-5 md:px-10 py-8">{children}</main>
    </>
  );
}
