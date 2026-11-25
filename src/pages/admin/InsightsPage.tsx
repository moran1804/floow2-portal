import { useUnits } from "@/hooks/useUnits";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subMonths } from "date-fns";
import { Clock3, Filter, Gauge, Route, TrendingUp, Users } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import AdminLayout from "@/components/admin/AdminLayout";
import InsightPanel from "@/components/admin/InsightPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCustomer } from "@/contexts/CustomerContext";
import { supabase } from "@/integrations/supabase/client";
import { makeSampleJourneys } from "@/lib/insightsSample";

const colors = {
  ios: "hsl(var(--chart-ios))", android: "hsl(var(--chart-android))",
  other: "hsl(var(--chart-other))", unknown: "hsl(var(--chart-unknown))", time: "hsl(var(--chart-time))",
  border: "hsl(var(--portal-border))", text: "hsl(var(--portal-muted))",
};
const components = [
  { key: "task", label: "Time on task", color: colors.ios, dash: undefined },
  { key: "smooth", label: "Smooth", color: colors.android, dash: "6 4" },
  { key: "speed", label: "Speed", color: colors.unknown, dash: "2 3" },
  { key: "mobile", label: "Mobile use", color: colors.other, dash: "6 3 2 3" },
  { key: "time", label: "Time of day", color: colors.time, dash: "2 2" },
];
const axis = { fontSize: 10, fill: colors.text };

function OperatingSystems({ ios, android }: { ios: number; android: number }) {
  const total = ios + android;
  const pct = (n: number) => total ? (n / total * 100).toFixed(1) : "0";
  const entries = [{ label: "iOS", value: ios, color: colors.ios }, { label: "Android", value: android, color: colors.android }, { label: "Other", value: 0, color: colors.other }, { label: "Unknown", value: 0, color: colors.unknown }];
  return <>
    <svg viewBox="0 0 100 4" className="mb-2 h-4 w-full rounded-sm" role="img" aria-label={`iOS ${pct(ios)}%, Android ${pct(android)}%`} preserveAspectRatio="none">
      <rect width="100" height="4" fill="hsl(var(--portal-surface))" />
      <rect width={total ? ios / total * 100 : 0} height="4" fill={colors.ios} />
      <rect x={total ? ios / total * 100 : 0} width={total ? android / total * 100 : 0} height="4" fill={colors.android} />
    </svg>
    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">{entries.map(e => <div key={e.label} className="flex items-center gap-1.5"><svg width="8" height="8" className="shrink-0"><rect width="8" height="8" fill={e.color} /></svg><span>{e.label}</span><strong className="ml-auto whitespace-nowrap">{e.value} ({pct(e.value)}%)</strong></div>)}</div>
  </>;
}

export default function InsightsPage() {
  const { speed, speedValue, speedLabel, distance } = useUnits();
  const { selectedCustomerId } = useCustomer();
  const [today] = useState(() => new Date());
  const defaults = { product: "all", from: format(subMonths(today, 1), "yyyy-MM-dd"), to: format(today, "yyyy-MM-dd") };
  const [draft, setDraft] = useState(defaults);
  const [applied, setApplied] = useState(defaults);
  const [visible, setVisible] = useState(components.map(c => c.key));
  const { data: products = [], isError } = useQuery({
    queryKey: ["insights-products", selectedCustomerId], enabled: Boolean(selectedCustomerId),
    queryFn: async () => {
      if (!selectedCustomerId) return [];
      const { data, error } = await supabase.from("products").select("id, code, name").eq("customer_id", selectedCustomerId).order("code");
      if (error) throw error;
      return data;
    },
  });
  const sample = useMemo(() => makeSampleJourneys(products.map(p => p.id), today), [products, today]);
  const rows = sample.filter(r => r.date >= applied.from && r.date <= applied.to && (applied.product === "all" || r.productId === applied.product));
  const count = rows.length;
  const ios = rows.filter(r => r.os === "iOS").length;
  const userIds = new Set(rows.map(r => r.user));
  const iosUsers = [...userIds].filter(u => u < 5).length;
  const duration = Math.round(rows.reduce((sum, r) => sum + r.minutes, 0));
  const hours = Array.from({ length: 24 }, (_, h) => ({ hour: String(h).padStart(2, "0"), journeys: rows.filter(r => r.hour === h).length }));
  const scores = Array.from({ length: 101 }, (_, score) => {
    const journeys = rows.filter(r => r.score === score).length;
    return { score, journeys, task: journeys, smooth: rows.filter(r => Math.min(100, r.score + r.id % 9) === score).length,
      speed: rows.filter(r => Math.min(100, r.score + r.id % 18) === score).length,
      mobile: rows.filter(r => (r.id % 3 === 0 ? 100 : Math.min(100, r.score + 10)) === score).length,
      time: rows.filter(r => Math.min(100, r.score + r.id % 6) === score).length };
  });
  const stages = [{ label: "Recorded", n: count }, { label: "Pre-processed", n: rows.filter(r => r.processed).length }, { label: "Mode of transport determined", n: rows.filter(r => r.transport).length }, { label: "Finalised", n: rows.filter(r => r.finalised).length }];
  const invalid = !draft.from || !draft.to || draft.from > draft.to;
  return <AdminLayout title="Overview" crumbs={[{ label: "Home", to: "/admin/overview" }, { label: "Insights" }]}>
    <div className="max-w-5xl space-y-3">
      <InsightPanel title="Filter usage" icon={Filter}>
        <form onSubmit={e => { e.preventDefault(); if (!invalid) setApplied(draft); }} className="flex flex-wrap items-end gap-3">
          <div className="min-w-40 flex-1"><label htmlFor="insight-product" className="mb-2 block text-xs font-semibold">Products</label>
            <Select value={draft.product} onValueChange={product => setDraft({ ...draft, product })}><SelectTrigger id="insight-product"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All products</SelectItem>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.code} — {p.name}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="min-w-40 flex-1"><label htmlFor="insight-from" className="mb-2 block text-xs font-semibold">From</label><Input id="insight-from" type="date" value={draft.from} onChange={e => setDraft({ ...draft, from: e.target.value })} required /></div>
          <div className="min-w-40 flex-1"><label htmlFor="insight-to" className="mb-2 block text-xs font-semibold">To</label><Input id="insight-to" type="date" value={draft.to} onChange={e => setDraft({ ...draft, to: e.target.value })} required /></div>
          <div className="flex gap-2"><Button type="button" variant="ghost" onClick={() => { setDraft(defaults); setApplied(defaults); }}>Reset all</Button><Button type="submit" disabled={invalid}>Search</Button></div>
        </form>
        {invalid && <p role="alert" className="mt-2 text-xs text-destructive">Choose an end date on or after the start date.</p>}
        {isError && <p role="alert" className="mt-2 text-xs text-destructive">Products could not be loaded.</p>}
        <p className="mt-3 text-xs text-portal-muted">Sample data · {format(new Date(`${applied.from}T12:00:00`), "dd MMM yyyy")} – {format(new Date(`${applied.to}T12:00:00`), "dd MMM yyyy")}</p>
      </InsightPanel>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <InsightPanel title="Journeys" icon={Route}>
          <dl className="space-y-3 text-xs"><div className="flex justify-between"><dt>Total journeys recorded</dt><dd className="font-bold">{count}</dd></div><div className="flex justify-between"><dt>Total distance driven</dt><dd className="font-bold">{distance(Math.round(rows.reduce((s, r) => s + r.miles, 0)), 0)}</dd></div><div className="flex justify-between"><dt>Total driving duration</dt><dd className="font-bold">{Math.floor(duration / 60)}h {duration % 60}m</dd></div></dl>
          <p className="mb-2 mt-7 text-xs">Journeys by operating system</p><OperatingSystems ios={ios} android={count - ios} />
        </InsightPanel>
        <InsightPanel title="Users" icon={Users} className="flex flex-col">
          <dl className="text-xs"><div className="flex justify-between"><dt>Total active users</dt><dd className="font-bold">{userIds.size}</dd></div></dl>
          <div className="mt-auto pt-7"><p className="mb-2 text-xs">Active users by operating system</p><OperatingSystems ios={iosUsers} android={userIds.size - iosUsers} /></div>
        </InsightPanel>
        <InsightPanel title="Journey processing" icon={Filter}>
          <svg viewBox="0 0 400 200" className="h-64 w-full" role="img" aria-label="Journey processing stages">
            {stages.map((s, i) => <g key={s.label}><polygon points={[
              "0,0 400,0 364,48 36,48", "36,50 364,50 382,98 18,98", "18,100 382,100 358,148 42,148", "42,150 358,150 358,198 42,198",
            ][i]} fill={["hsl(var(--portal-navy))", "hsl(var(--portal-accent))", "hsl(var(--portal-sidebar-active))", "hsl(var(--portal-panel-header))"][i]} />
              <text x="200" y={21 + i * 50} textAnchor="middle" fill={i < 2 ? "hsl(var(--primary-foreground))" : "hsl(var(--portal-text))"} fontSize="10" fontWeight="bold"><tspan x="200">{s.label}</tspan><tspan x="200" dy="13">{s.n}{i > 0 ? ` (${count ? (s.n / count * 100).toFixed(1) : 0}% of recorded)` : ""}</tspan></text></g>)}
          </svg>
        </InsightPanel>
        <InsightPanel title="Journeys by time of day" icon={Clock3} help="Number of sample journeys starting in each hour.">
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><RadarChart data={hours} outerRadius="74%"><PolarGrid stroke={colors.border} /><PolarAngleAxis dataKey="hour" tick={axis} /><Radar dataKey="journeys" name="Journeys" stroke={colors.ios} fill={colors.ios} fillOpacity={0.22} dot={{ r: 2 }} isAnimationActive={false} /><Tooltip /></RadarChart></ResponsiveContainer></div>
        </InsightPanel>
      </div>
      <InsightPanel title="Overall score distribution" icon={TrendingUp} help="Journey counts for each overall score, from 0 to 100.">
        <p className="mb-2 text-xs text-portal-muted">Journeys</p><div className="h-56"><ResponsiveContainer width="100%" height="100%"><AreaChart data={scores} margin={{ top: 5, right: 12, bottom: 20, left: 0 }}><CartesianGrid vertical={false} stroke={colors.border} /><XAxis dataKey="score" tick={axis} tickLine={false} ticks={[0,10,20,30,40,50,60,70,80,90,100]} label={{ value: "Score", position: "bottom", ...axis }} /><YAxis tick={axis} allowDecimals={false} width={32} tickLine={false} /><Tooltip /><Area type="monotone" dataKey="journeys" name="Journeys" stroke={colors.ios} fill={colors.ios} fillOpacity={0.12} strokeWidth={1.5} isAnimationActive={false} /></AreaChart></ResponsiveContainer></div>
      </InsightPanel>
      <InsightPanel title="Score component distribution" icon={Gauge} help="Distribution of individual sample score components.">
        <p className="mb-2 text-xs text-portal-muted">Journeys</p><div className="h-56"><ResponsiveContainer width="100%" height="100%"><LineChart data={scores} margin={{ top: 5, right: 12, bottom: 20, left: 0 }}><CartesianGrid vertical={false} stroke={colors.border} /><XAxis dataKey="score" tick={axis} tickLine={false} ticks={[0,10,20,30,40,50,60,70,80,90,100]} label={{ value: "Score", position: "bottom", ...axis }} /><YAxis tick={axis} width={32} allowDecimals={false} tickLine={false} /><Tooltip />{components.filter(c => visible.includes(c.key)).map(c => <Line key={c.key} type="monotone" dataKey={c.key} name={c.label} stroke={c.color} strokeDasharray={c.dash} dot={false} strokeWidth={1.5} isAnimationActive={false} />)}</LineChart></ResponsiveContainer></div>
        <p className="mb-2 mt-4 text-xs text-portal-muted">Show score components</p><div className="flex flex-wrap gap-x-5 gap-y-3">{components.map(c => <label key={c.key} className="flex cursor-pointer items-center gap-2 text-xs"><Checkbox checked={visible.includes(c.key)} onCheckedChange={checked => setVisible(v => checked ? [...v, c.key] : v.filter(k => k !== c.key))} aria-label={c.label} /><svg width="20" height="6"><line x1="0" x2="20" y1="3" y2="3" stroke={c.color} strokeWidth="2" strokeDasharray={c.dash} /></svg>{c.label}</label>)}</div>
      </InsightPanel>
    </div>
  </AdminLayout>;
}