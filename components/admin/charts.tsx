"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";

// Chart chrome (validated: series blue passes the categorical checks on the
// admin surface #f9f9f9). Data marks carry the series color; all text uses ink tokens.
const SERIES = "#2a78d6";
const SURFACE = "#f9f9f9";
const GRID = "#e1e0d9";
const AXIS = "#c3c2b7";
const MUTED = "#898781";
const INK = "#0b0b0b";
const INK_2 = "#52514e";

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const full = new Intl.NumberFormat("en-US");

export type ValueKind = "dzd" | "count";
const fmtFull = (v: number, kind: ValueKind) => (kind === "dzd" ? `${full.format(v)} DZD` : full.format(v));
const fmtTick = (v: number) => compact.format(v);

function ChartTooltip({ active, payload, label, kind, unitLabel }: TooltipContentProps<number, string> & { kind: ValueKind; unitLabel: string }) {
  if (!active || !payload?.length) return null;
  const value = Number(payload[0].value ?? 0);
  const extra = payload[0].payload?.units as number | undefined;
  return (
    <div className="rounded-md bg-white px-3 py-2 text-xs shadow-lg ring-1 ring-black/10">
      <div className="text-sm font-semibold" style={{ color: INK }}>{fmtFull(value, kind)}</div>
      <div className="flex items-center gap-1.5 mt-0.5" style={{ color: INK_2 }}>
        <span className="inline-block h-0.5 w-3 rounded" style={{ background: SERIES }} aria-hidden="true" />
        {unitLabel} · {label}
      </div>
      {extra != null && <div className="mt-0.5" style={{ color: INK_2 }}>{full.format(extra)} sold</div>}
    </div>
  );
}

const axisProps = {
  stroke: AXIS,
  tick: { fill: MUTED, fontSize: 11 },
  tickLine: false,
} as const;

/** Columns over time (one series). */
export function TrendColumns({ data, dataKey, kind, unitLabel }: { data: { label: string; [k: string]: string | number }[]; dataKey: string; kind: ValueKind; unitLabel: string }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" minTickGap={16} />
        <YAxis {...axisProps} axisLine={false} tickFormatter={fmtTick} width={44} allowDecimals={false} />
        <Tooltip cursor={{ fill: "rgba(11,11,11,0.04)" }} content={(p) => <ChartTooltip {...(p as TooltipContentProps<number, string>)} kind={kind} unitLabel={unitLabel} />} />
        <Bar dataKey={dataKey} fill={SERIES} maxBarSize={24} radius={[4, 4, 0, 0]} activeBar={{ fillOpacity: 0.8 }} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** A line over time (one series), 2px with ringed dots. */
export function TrendLine({ data, dataKey, kind, unitLabel }: { data: { label: string; [k: string]: string | number }[]; dataKey: string; kind: ValueKind; unitLabel: string }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" minTickGap={16} />
        <YAxis {...axisProps} axisLine={false} tickFormatter={fmtTick} width={44} allowDecimals={false} />
        <Tooltip cursor={{ stroke: AXIS, strokeWidth: 1 }} content={(p) => <ChartTooltip {...(p as TooltipContentProps<number, string>)} kind={kind} unitLabel={unitLabel} />} />
        <Line
          type="linear"
          dataKey={dataKey}
          stroke={SERIES}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          dot={data.length <= 14 ? { r: 4, fill: SERIES, stroke: SURFACE, strokeWidth: 2 } : false}
          activeDot={{ r: 5, fill: SERIES, stroke: SURFACE, strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Horizontal bars, value at the tip (ranked categories, one series). */
export function RankedBars({ data, dataKey, kind, unitLabel }: { data: { name: string; [k: string]: string | number }[]; dataKey: string; kind: ValueKind; unitLabel: string }) {
  const height = Math.max(120, data.length * 36 + 16);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 88, bottom: 0, left: 0 }} barCategoryGap={8}>
        <XAxis type="number" hide domain={[0, "dataMax"]} />
        <YAxis type="category" dataKey="name" {...axisProps} axisLine={false} width={150} tick={{ fill: INK_2, fontSize: 12 }} />
        <Tooltip cursor={{ fill: "rgba(11,11,11,0.04)" }} content={(p) => <ChartTooltip {...(p as TooltipContentProps<number, string>)} kind={kind} unitLabel={unitLabel} />} />
        <Bar dataKey={dataKey} fill={SERIES} maxBarSize={24} radius={[0, 4, 4, 0]} activeBar={{ fillOpacity: 0.8 }} isAnimationActive={false}>
          <LabelList dataKey={dataKey} position="right" formatter={(v: unknown) => (kind === "dzd" ? `${fmtTick(Number(v))} DZD` : full.format(Number(v)))} style={{ fill: INK_2, fontSize: 12 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
