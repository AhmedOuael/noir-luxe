import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { DEFAULT_PERIOD, PERIODS, algiersDate, getOverview, isPeriod, type PeriodKey } from "@/lib/admin/stats";
import { formatDZD } from "@/lib/format";
import { RankedBars, TrendColumns, TrendLine } from "@/components/admin/charts";

const card = "border border-outline-variant bg-surface p-5";
const tileLink = `${card} block transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`;
const label = "text-sm text-secondary";
const SCOPE: Record<PeriodKey, string> = {
  today: "today",
  "7d": "last 7 days",
  "30d": "last 30 days",
  month: "this month",
  "12m": "last 12 months",
  all: "all time",
};
const pct = (v: number | null) => (v == null ? "—" : `${Math.round(v * 100)}%`);

function ChartCard({ title, subtitle, children, table }: { title: string; subtitle: string; children: React.ReactNode; table: React.ReactNode }) {
  return (
    <section className={card}>
      <h2 className="font-body text-base font-semibold">{title}</h2>
      <p className="text-xs text-secondary mt-0.5 mb-4">{subtitle}</p>
      {children}
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-xs text-secondary hover:text-primary">View as table</summary>
        <div className="mt-2 max-h-72 overflow-y-auto">{table}</div>
      </details>
    </section>
  );
}

function DataTable({ head, rows }: { head: [string, string]; rows: [string, string][] }) {
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-xs text-secondary">
        <tr>
          <th className="py-1 font-medium">{head[0]}</th>
          <th className="py-1 font-medium text-right">{head[1]}</th>
        </tr>
      </thead>
      <tbody className="tabular-nums">
        {rows.map(([a, b], i) => (
          <tr key={i} className="border-t border-outline-variant">
            <td className="py-1.5">{a}</td>
            <td className="py-1.5 text-right">{b}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default async function OverviewPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  await requireUser("ADMIN"); // revenue is owner-level; staff are sent to Orders
  const sp = await searchParams;
  const period: PeriodKey = isPeriod(sp.period) ? sp.period : DEFAULT_PERIOD;
  const o = await getOverview(period);
  const today = algiersDate(new Date());
  const scope = SCOPE[period];
  const bucketWord = o.bucket === "day" ? "per day" : "per month";
  const splitTotal = o.split.home + o.split.stopDesk;
  const homeShare = splitTotal ? o.split.home / splitTotal : 0;

  return (
    <div className="max-w-7xl">
      <h1 className="font-display text-3xl mb-6">Overview</h1>

      {/* One filter row; it scopes everything below except tiles marked "right now" */}
      <nav aria-label="Period" className="flex flex-wrap gap-2 mb-8">
        {PERIODS.map((p) => (
          <Link
            key={p.key}
            href={p.key === DEFAULT_PERIOD ? "/admin" : `/admin?period=${p.key}`}
            aria-current={p.key === period ? "page" : undefined}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              p.key === period ? "bg-primary text-on-primary border-primary" : "border-outline-variant text-secondary hover:border-primary hover:text-primary"
            }`}
          >
            {p.label}
          </Link>
        ))}
      </nav>

      {/* Headline numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Link href="/admin/orders?status=DELIVERED" className={`${tileLink} sm:col-span-2`}>
          <p className={label}>Revenue, {scope}</p>
          <p className="mt-2 text-5xl font-semibold tracking-tight">{formatDZD(o.revenue.amount)}</p>
          <p className="mt-3 text-sm text-secondary">
            From {o.revenue.delivered} delivered order{o.revenue.delivered === 1 ? "" : "s"}
            {o.revenue.delivered > 0 && <> · average {formatDZD(o.revenue.average)}</>}
          </p>
          <p className="mt-1 text-xs text-secondary">
            Products only. Delivery fees collected for the courier: {formatDZD(o.revenue.deliveryFees)}
          </p>
        </Link>
        <Link href={o.fromDate ? `/admin/orders?from=${o.fromDate}` : "/admin/orders"} className={tileLink}>
          <p className={label}>Orders, {scope}</p>
          <p className="mt-2 text-3xl font-semibold">{o.orders.period.toLocaleString("en-US")}</p>
          <p className="mt-3 text-sm text-secondary">{o.orders.allTime.toLocaleString("en-US")} all time</p>
        </Link>
        <Link href={`/admin/orders?from=${today}&to=${today}`} className={tileLink}>
          <p className={label}>Orders today</p>
          <p className="mt-2 text-3xl font-semibold">{o.orders.today.toLocaleString("en-US")}</p>
          <p className="mt-3 text-sm text-secondary">Since midnight, Algeria time</p>
        </Link>
      </div>

      {/* Operations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Link href="/admin/orders?stage=to-call" className={tileLink}>
          <p className={label}>Needs a call, right now</p>
          <p className="mt-2 text-3xl font-semibold">{o.needsCall}</p>
          <p className="mt-3 text-xs text-secondary">New, called or unreachable</p>
        </Link>
        <Link href="/admin/orders?stage=on-the-road" className={tileLink}>
          <p className={label}>On the road, right now</p>
          <p className="mt-2 text-2xl font-semibold whitespace-nowrap">{formatDZD(o.onTheRoad.amount)}</p>
          <p className="mt-3 text-xs text-secondary">{o.onTheRoad.orders} order{o.onTheRoad.orders === 1 ? "" : "s"} out for delivery or at the stop-desk</p>
        </Link>
        <div className={card}>
          <p className={label}>Confirmation rate</p>
          <p className="mt-2 text-3xl font-semibold">{pct(o.confirmation.rate)}</p>
          <p className="mt-3 text-xs text-secondary">{o.confirmation.confirmed} of {o.confirmation.decided} called orders confirmed</p>
        </div>
        <div className={card}>
          <p className={label}>Delivery success</p>
          <p className="mt-2 text-3xl font-semibold">{pct(o.delivery.successRate)}</p>
          <p className="mt-3 text-xs text-secondary">
            Return rate {pct(o.delivery.returnRate)} ({o.delivery.refusedOrReturned} refused or returned)
          </p>
        </div>
        <div className={card}>
          <p className={label}>Home vs stop-desk</p>
          {splitTotal === 0 ? (
            <p className="mt-2 text-3xl font-semibold">—</p>
          ) : (
            <>
              <div className="mt-4 flex h-2 gap-0.5" aria-hidden="true">
                <div className="rounded-l-full" style={{ width: `${homeShare * 100}%`, background: "#2a78d6" }} />
                <div className="flex-1 rounded-r-full" style={{ background: "#eb6834" }} />
              </div>
              <ul className="mt-3 space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm" style={{ background: "#2a78d6" }} aria-hidden="true" />
                  Home <span className="ml-auto font-semibold">{pct(homeShare)}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm" style={{ background: "#eb6834" }} aria-hidden="true" />
                  Stop-desk <span className="ml-auto font-semibold">{pct(1 - homeShare)}</span>
                </li>
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Trends: two charts, never one with two scales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard
          title="Revenue"
          subtitle={`Products sold in delivered orders, ${bucketWord}, by delivery date`}
          table={<DataTable head={["Period", "Revenue"]} rows={o.trend.map((p) => [p.label, formatDZD(p.revenue)])} />}
        >
          <TrendColumns data={o.trend} dataKey="revenue" kind="dzd" unitLabel="Revenue" />
        </ChartCard>
        <ChartCard
          title="Orders"
          subtitle={`All orders placed, ${bucketWord}`}
          table={<DataTable head={["Period", "Orders"]} rows={o.trend.map((p) => [p.label, String(p.orders)])} />}
        >
          <TrendLine data={o.trend} dataKey="orders" kind="count" unitLabel="Orders" />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard
          title="Revenue by product"
          subtitle={`Top products in delivered orders, ${scope}`}
          table={<DataTable head={["Product", "Revenue · sold"]} rows={o.byProduct.map((p) => [p.name, `${formatDZD(p.revenue)} · ${p.units}`])} />}
        >
          {o.byProduct.length ? (
            <RankedBars data={o.byProduct} dataKey="revenue" kind="dzd" unitLabel="Revenue" />
          ) : (
            <p className="py-10 text-center text-sm text-secondary">No delivered orders in this period yet.</p>
          )}
        </ChartCard>
        <ChartCard
          title="Top wilayas"
          subtitle={`Orders placed (excluding canceled), ${scope}`}
          table={<DataTable head={["Wilaya", "Orders"]} rows={o.byWilaya.map((w) => [w.name, String(w.orders)])} />}
        >
          {o.byWilaya.length ? (
            <RankedBars data={o.byWilaya} dataKey="orders" kind="count" unitLabel="Orders" />
          ) : (
            <p className="py-10 text-center text-sm text-secondary">No orders in this period yet.</p>
          )}
        </ChartCard>
      </div>

      {/* Low stock */}
      <section className={card}>
        <h2 className="font-body text-base font-semibold">Low stock, right now</h2>
        <p className="text-xs text-secondary mt-0.5 mb-4">Sizes on sale with 3 or fewer left (after open orders)</p>
        {o.lowStock.length === 0 ? (
          <p className="text-sm text-secondary">Every size on sale has more than 3 left.</p>
        ) : (
          <ul className="divide-y divide-outline-variant">
            {o.lowStock.map((s, i) => (
              <li key={i}>
                <Link href={`/admin/products/${s.productId}`} className="flex items-center gap-3 py-2.5 hover:bg-surface-container-low -mx-2 px-2">
                  <span className="flex-1 min-w-0 truncate">
                    {s.product} <span className="text-secondary">· {s.variant}</span>
                  </span>
                  <span className={`text-sm font-semibold tabular-nums ${s.available === 0 ? "text-error" : ""}`}>
                    {s.available === 0 ? "Sold out" : `${s.available} left`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
