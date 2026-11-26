import { useUnits } from "@/hooks/useUnits";
import { useRolePreview } from "@/contexts/RolePreviewContext";
import { useMemo, useState } from "react";
import { format, parseISO, startOfMonth, subMonths } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import { Bike, Calendar as CalendarIcon, Car, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { MapContainer, TileLayer, Polyline, CircleMarker } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  EVENT_STATES,
  MODES,
  SCORE_BANDS,
  SORTS,
  TAG_SOURCES,
  dayString,
  defaultJourneyFilters,
  filterJourneys,
  formatDateRange,
  isDefaultFilters,
  sampleJourneys,
  journeyInfluences,
  type JourneyFilters,
} from "@/lib/userJourneys";

export type { Journey } from "@/lib/userJourneys";
export { sampleJourneys } from "@/lib/userJourneys";

export function JourneyMap({ route, height = 260 }: { route: LatLngTuple[]; height?: number }) {
  const center = route[Math.floor(route.length / 2)] as LatLngTuple;
  return (
    <div className="isolate overflow-hidden rounded-md border border-portal-border" style={{ height }}>
      <MapContainer center={center} zoom={15} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Polyline positions={route} pathOptions={{ color: "hsl(var(--portal-navy))", weight: 4 }} />
        <CircleMarker center={route[0]} radius={6} pathOptions={{ color: "hsl(var(--portal-navy))", fillColor: "#ffffff", fillOpacity: 1, weight: 2 }} />
        <CircleMarker center={route[route.length - 1]} radius={6} pathOptions={{ color: "hsl(var(--portal-navy))", fillColor: "hsl(var(--portal-accent))", fillOpacity: 1, weight: 2 }} />
      </MapContainer>
    </div>
  );
}

function MiniRing({ score, size = 30 }: { score: number | null; size?: number }) {
  const r = size / 2 - 3;
  const c = 2 * Math.PI * r;
  const color = score === null ? "hsl(var(--portal-border))" : score >= 70 ? "hsl(var(--score-good))" : "hsl(var(--score-caution))";
  const big = size > 40;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }} className="shrink-0 -rotate-90" role="img" aria-label={score === null ? "Not scored" : `Score ${score}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--score-surface))" strokeWidth={big ? 4 : 3} />
      {score !== null && <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={big ? 4 : 3} strokeLinecap="round" strokeDasharray={`${(score / 100) * c} ${c}`} />}
      <text x={size / 2} y={size / 2} transform={`rotate(90 ${size / 2} ${size / 2})`} textAnchor="middle" dominantBaseline="central" className={`fill-score-ink font-semibold ${big ? "text-[13px]" : "text-[8px]"}`}>{score ?? "–"}</text>
    </svg>
  );
}

function endAt(startedAt: string, duration: string) {
  const m = /(\d+)m\s*(\d+)s/.exec(duration);
  const secs = m ? Number(m[1]) * 60 + Number(m[2]) : 0;
  return new Date(new Date(startedAt).getTime() + secs * 1000);
}
const fmt = (d: Date) => format(d, "MMMM d yyyy, h:mm a");

const PRESETS: [number, string][] = [[7, "Last 7 days"], [30, "Last 30 days"], [90, "Last 90 days"]];

/** One filter for the whole date window: a calendar where you pick a start and an end day. */
function DateRangeFilter({ from, to, onChange }: { from: string; to: string; onChange: (next: { from: string; to: string }) => void }) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const selected = from || to ? { from: from ? parseISO(from) : undefined, to: to ? parseISO(to) : undefined } : undefined;

  const pickPreset = (days: number) => {
    const start = new Date(today);
    start.setDate(start.getDate() - (days - 1));
    onChange({ from: dayString(start), to: dayString(today) });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Filter journeys by date range"
          aria-expanded={open}
          className="min-w-0 rounded-lg border border-portal-border bg-portal-surface px-3 pb-1.5 pt-2 text-left transition-colors hover:border-portal-accent focus-visible:border-portal-accent focus-visible:outline-none"
        >
          <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-portal-muted">
            <CalendarIcon className="h-3 w-3" />Date range
          </span>
          <span className={`block truncate text-sm ${from || to ? "font-medium text-portal-navy" : "text-portal-muted"}`}>{formatDateRange(from, to)}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={selected}
          defaultMonth={to ? startOfMonth(parseISO(to)) : subMonths(startOfMonth(today), 1)}
          fromMonth={subMonths(startOfMonth(today), 24)}
          toMonth={today}
          disabled={(d) => d > today}
          onSelect={(range) => {
            if (!range?.from) { onChange({ from: "", to: "" }); return; }
            const start = dayString(range.from);
            onChange({ from: start, to: range.to ? dayString(range.to) : start });
          }}
          className="pointer-events-auto p-3"
        />
        <div className="flex flex-wrap items-center gap-2 border-t border-portal-border px-3 py-2">
          {PRESETS.map(([days, label]) => (
            <Button key={label} type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => pickPreset(days)}>{label}</Button>
          ))}
          <Button type="button" variant="ghost" size="sm" className="ml-auto h-7 text-xs underline underline-offset-4" onClick={() => { onChange({ from: "", to: "" }); setOpen(false); }}>All dates</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function UserJourneysSection() {
  const { allows } = useRolePreview();
  const { distance } = useUnits();
  const navigate = useNavigate();
  const { userId } = useParams();
  const [filters, setFilters] = useState<JourneyFilters>(defaultJourneyFilters);
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(0);
  const rows = useMemo(() => filterJourneys(sampleJourneys, { ...filters, tags: [] }), [filters]);
  const set = (patch: Partial<JourneyFilters>) => { setPage(0); setFilters((f) => ({ ...f, ...patch })); };
  const reset = () => { setPage(0); setFilters(defaultJourneyFilters); };
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const shown = rows.slice(page * pageSize, page * pageSize + pageSize);
  const active = [Boolean(filters.from || filters.to), filters.score !== "any", filters.mode !== "any", filters.events !== "any", filters.tagSetBy !== "any", filters.sort !== "newest"].filter(Boolean).length;

  const selects: [keyof JourneyFilters, string, Record<string, string>][] = [
    ["score", "Score", SCORE_BANDS], ["mode", "Mode", MODES], ["events", "Driving events", EVENT_STATES], ["tagSetBy", "Tag set by", TAG_SOURCES], ["sort", "Sort by", SORTS],
  ];

  return (
    <div className="space-y-5">
      <p className="text-xs text-portal-muted">Example journeys only · No live journey data is connected for this user.</p>

      <section aria-label="Filter journeys" className="rounded-xl border border-portal-border bg-portal-panel p-5 shadow-sm">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-base font-semibold text-portal-navy">
            <SlidersHorizontal className="h-4 w-4" /> Filter
            {active > 0 && <span className="rounded-full bg-portal-navy px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">{active} active</span>}
          </h3>
          <Button type="button" variant="ghost" size="sm" onClick={reset} disabled={isDefaultFilters({ ...filters, tags: [] })} className="text-xs">Reset all</Button>
        </header>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <DateRangeFilter from={filters.from} to={filters.to} onChange={set} />
          {selects.filter(([key]) => key === "events" ? allows("journeys/events/read") : key === "score" ? allows("scores/read") : true).map(([k, label, opts]) => (
            <div key={k} className="rounded-lg border border-portal-border bg-portal-surface px-3 pb-1.5 pt-2 focus-within:border-portal-accent">
              <Label htmlFor={`journey-${k}`} className="text-[11px] font-semibold uppercase tracking-wide text-portal-muted">{label}</Label>
              <Select value={filters[k] as string} onValueChange={(v) => set({ [k]: v })}>
                <SelectTrigger id={`journey-${k}`} className="h-7 border-0 bg-transparent p-0 text-sm shadow-none focus:ring-0"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(opts).map(([value, l]) => <SelectItem key={value} value={value}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-portal-border bg-portal-panel px-5 py-3 shadow-sm">
        <div className="flex items-center gap-3 text-xs text-portal-muted">
          Show
          {[25, 50, 100].map((n, i) => (
            <span key={n} className="flex items-center gap-3">
              {i > 0 && <span className="h-4 w-px bg-portal-border" />}
              <button type="button" aria-pressed={pageSize === n} onClick={() => { setPageSize(n); setPage(0); }} className={`text-sm text-portal-accent ${pageSize === n ? "font-semibold underline underline-offset-4" : "hover:underline"}`}>{n}</button>
            </span>
          ))}
        </div>
        <p className="text-sm font-semibold text-portal-navy" aria-live="polite">{rows.length} journey{rows.length === 1 ? "" : "s"}</p>
      </section>

      <div className="overflow-x-auto rounded-xl border border-portal-border bg-portal-panel shadow-sm">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-portal-panel-header text-left text-portal-navy">
            <tr>{["Start date and time", "End date and time", "Distance", "Duration", "Type", "Tag set by", "Scores", ""].map((h) => <th key={h} className="px-5 py-4 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {shown.map((j) => {
              const infl = journeyInfluences[j.id];
              const open = () => navigate(`/admin/insurer/users/${userId}/journeys/${j.id}`);
              return (
                <tr key={j.id} onClick={open} className="cursor-pointer border-t border-portal-border transition-colors even:bg-portal-surface/60 hover:bg-portal-surface">
                  <td className="px-5 py-4">{fmt(new Date(j.startedAt))}</td>
                  <td className="px-5 py-4">{fmt(endAt(j.startedAt, j.duration))}</td>
                  <td className="px-5 py-4">{distance(j.miles)}</td>
                  <td className="px-5 py-4">{j.duration}</td>
                  <td className="px-5 py-4"><span className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-portal-surface">{j.mode === "Car" ? <Car className="h-3.5 w-3.5" /> : <Bike className="h-3.5 w-3.5" />}</span>{j.mode}</span></td>
                  <td className="px-5 py-4 text-portal-navy">{j.tagSetBy}</td>
                  <td className="px-5 py-4">
                    {allows("scores/read") && <div className="flex items-center gap-2" title={infl ? infl.map(([n, v]) => `${n}: ${v}`).join(" · ") : undefined}>
                      <MiniRing score={j.score} size={48} />
                      {infl ? infl.map(([n, v]) => <MiniRing key={n} score={v} />) : <span className="text-xs text-portal-muted">{j.score === null ? "Not scored" : ""}</span>}
                    </div>}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button size="icon" className="h-8 w-8" aria-label="View journey details" onClick={(e) => { e.stopPropagation(); open(); }}><ChevronRight className="h-4 w-4" /></Button>
                  </td>
                </tr>
              );
            })}
            {!shown.length && (
              <tr><td colSpan={8} className="p-10 text-center">
                <p role="status" className="text-portal-muted">No journeys match your filters.</p>
                <Button variant="ghost" onClick={reset} className="mt-2 text-xs underline underline-offset-4">Reset all filters</Button>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          Page {page + 1} of {pages}
          <Button variant="outline" size="sm" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      )}
    </div>
  );
}
