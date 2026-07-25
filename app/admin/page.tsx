import { getAllProducts } from "@/lib/products";

export default function AdminOverview() {
  const products = getAllProducts();
  const lowStock = products.filter((p) =>
    Object.values(p.sizes).some((qty) => qty > 0 && qty <= 5)
  );

  const stats = [
    { label: "Total Products", value: products.length },
    { label: "Low Stock Alerts", value: lowStock.length },
    { label: "Orders Today", value: "—" },
    { label: "Revenue (30d)", value: "—" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl mb-2">Overview</h1>
      <p className="text-white/50 mb-10">Welcome back. Here&apos;s what&apos;s happening with your store.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {stats.map((s) => (
          <div key={s.label} className="bg-ink-panel border border-ink-border rounded-lg p-6">
            <p className="text-xs text-white/40 uppercase tracking-label mb-2">{s.label}</p>
            <p className="text-2xl font-display">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-ink-panel border border-ink-border rounded-lg p-6">
        <h2 className="text-sm font-medium mb-4">Setup checklist — phase 2</h2>
        <ul className="space-y-3 text-sm text-white/60">
          <li>☐ Connect a database (Postgres/Prisma) so products, orders & customers persist</li>
          <li>☐ Add authentication so only the brand owner can reach /admin</li>
          <li>☐ Wire product image upload (Cloudflare R2 / S3)</li>
          <li>☐ Connect Yalidine API for shipping labels & tracking</li>
          <li>☐ Connect BaridiMob / CIB / eCCP payment gateway</li>
        </ul>
      </div>
    </div>
  );
}
