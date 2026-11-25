import { useUnits } from "@/hooks/useUnits";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Bike, Car, ChevronLeft, ChevronRight, Clock, Flag, Route, SlidersHorizontal, X } from "lucide-react";
import { MapContainer, TileLayer, Polyline, CircleMarker } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  EVENT_STATES,
  JOURNEY_TAGS,
  MODES,
  SCORE_BANDS,
  SORTS,
  defaultJourneyFilters,
  filterJourneys,
  isDefaultFilters,
  journeyDateLabel,
  journeyWindowLabel,
  sampleJourneys,
  shiftDate,
  type JourneyFilters,
} from "@/lib/userJourneys";

export type { Journey } from "@/lib/userJourneys";
export { sampleJourneys } from "@/lib/userJourneys";

function ScoreRing({ score }: { score: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const color = score >= 70 ? "hsl(var(--score-good))" : "hsl(var(--score-caution))";
  return (
    <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90" role="img" aria-label={`Score ${score}`}>
      <circle cx="28" cy="28" r={r} fill="none" stroke="hsl(var(--score-caution-track))" strokeWidth="5" />
      <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeDasharray={`${(score / 100) * c} ${c}`} />
      <text x="28" y="28" transform="rotate(90 28 28)" textAnchor="middle" dominantBaseline="central" className="fill-score-ink text-[15px] font-semibold">{score}</text>
    </svg>
  );
}

export function JourneyMap({ route, height = 260 }: { route: LatLngTuple[]; height?: number }) {
  const center = route[Math.floor(route.length / 2)] as LatLngTuple;
  return (
    <div className="overflow-hidden rounded-md border border-portal-border" style={{ height }}>
      <MapContainer center={center} zoom={15} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Polyline positions={route} pathOptions={{ color: "hsl(var(--portal-navy))", weight: 4 }} />
        <CircleMarker center={route[0]} radius={6} pathOptions={{ color: "hsl(var(--portal-navy))", fillColor: "#ffffff", fillOpacity: 1, weight: 2 }} />
        <CircleMarker center={route[route.length - 1]} radius={6} pathOptions={{ color: "hsl(var(--portal-navy))", fillColor: "hsl(var(--portal-accent))", fillOpacity: 1, weight: 2 }} />
      </MapContainer>
    </div>
  );
}

export default function UserJourneysSection() {
  const { distance } = useUnits();
  const navigate = useNavigate();
  const { userId } = useParams();
  const [filters, setFilters] = useState<JourneyFilters>(defaultJourneyFilters);
  const [dateOpen, setDateOpen] = useState(false);
  const rows = useMemo(() => filterJourneys(sampleJourneys, filters), [filters]);
  const set = (patch: Partial<JourneyFilters>) => setFilters((f) => ({ ...f, ...patch }));
  const toggleTag = (tag: string) => setFilters((f) => ({ ...f, tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag] }));
  const reset = () => setFilters(defaultJourneyFilters);
  const times = sampleJourneys.map((j) => new Date(j.startedAt).getTime());
  const earliest = Math.min(...times);
  const latest = Math.max(...times);
  const toTime = filters.to ? new Date(filters.to).getTime() : null;
  const canGoEarlier = toTime === null || toTime > earliest;
  const canGoLater = toTime === null || toTime < latest;
  const shift = (days: number) => setFilters((f) => ({ ...f, to: shiftDate(f.to, days), from: f.from ? shiftDate(f.from, days) : f.from }));

  return (
    <div className="space-y-5">
      <p className="text-xs text-portal-muted">Example journeys only · No live journey data is connected for this user.</p>

      <section aria-label="Filter journeys" className="rounded-md border border-portal-border bg-portal-panel p-5">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-3 text-base font-semibold text-portal-navy">
            <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-portal-panel-header text-portal-navy"><SlidersHorizontal className="h-5 w-5" /></span>
            Filter journeys
          </h3>
          <Button type="button" variant="ghost" onClick={reset} disabled={isDefaultFilters(filters)} className="px-0 text-xs">Reset all</Button>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="min-w-0 space-y-2"><Label htmlFor="journey-from">Date from</Label><Input id="journey-from" type="datetime-local" value={filters.from} onChange={(e) => set({ from: e.target.value })} className="min-w-0 rounded-sm" /></div>
          <div className="min-w-0 space-y-2"><Label htmlFor="journey-to">Date to</Label><Input id="journey-to" type="datetime-local" value={filters.to} onChange={(e) => set({ to: e.target.value })} className="min-w-0 rounded-sm" /></div>
          <div className="space-y-2"><Label htmlFor="journey-score">Score</Label>
            <Select value={filters.score} onValueChange={(score) => set({ score })}><SelectTrigger id="journey-score" className="rounded-sm"><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(SCORE_BANDS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label htmlFor="journey-mode">Mode of transport</Label>
            <Select value={filters.mode} onValueChange={(mode) => set({ mode })}><SelectTrigger id="journey-mode" className="rounded-sm"><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(MODES).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label htmlFor="journey-events">Driving events</Label>
            <Select value={filters.events} onValueChange={(events) => set({ events })}><SelectTrigger id="journey-events" className="rounded-sm"><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(EVENT_STATES).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label htmlFor="journey-sort">Sort by</Label>
            <Select value={filters.sort} onValueChange={(sort) => set({ sort })}><SelectTrigger id="journey-sort" className="rounded-sm"><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(SORTS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-5 space-y-2">
          <Label className="text-xs text-portal-muted">Tags — shows journeys with any selected tag</Label>
          <div className="flex flex-wrap gap-2">
            {JOURNEY_TAGS.map((tag) => {
              const on = filters.tags.includes(tag);
              return (
                <button key={tag} type="button" aria-pressed={on} onClick={() => toggleTag(tag)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${on ? "border-portal-navy bg-portal-navy text-primary-foreground" : "border-portal-border bg-portal-surface text-portal-muted hover:border-portal-accent hover:text-portal-navy"}`}>
                  {tag}
                </button>
              );
            })}
          </div>
          {!!filters.tags.length && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-portal-muted">
              {filters.tags.map((tag) => (
                <button key={tag} type="button" onClick={() => toggleTag(tag)} className="flex items-center gap-1 rounded-sm bg-portal-panel-header px-2 py-1 font-semibold text-portal-navy">
                  {tag}<X className="h-3 w-3" />
                </button>
              ))}
              <button type="button" onClick={() => set({ tags: [] })} className="underline underline-offset-2">Clear tags</button>
            </div>
          )}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold" aria-live="polite">{journeyWindowLabel(rows.length, filters)}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1 border-2 border-portal-navy text-portal-navy" disabled={!canGoEarlier} onClick={() => shift(-7)}>
            <ChevronLeft className="h-4 w-4" />Earlier journeys
          </Button>
          <Button variant="outline" size="sm" className="gap-1 border-2 border-portal-navy text-portal-navy" disabled={!canGoLater} onClick={() => shift(7)}>
            Later journeys<ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-xs underline underline-offset-4" onClick={() => setDateOpen(true)}>Change date</Button>
        </div>
      </div>

      {!!rows.length ? rows.map((j) => (
        <article key={j.id} className="rounded-md border border-portal-border bg-portal-panel p-6">
          <div className="flex flex-wrap items-center gap-6">
            <ScoreRing score={j.score ?? 0} />
            <div>
              <h3 className="text-lg font-semibold">{journeyDateLabel(j.startedAt)}</h3>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{j.duration}</span>
                <span className="flex items-center gap-1"><Route className="h-3.5 w-3.5" />{distance(j.miles)}</span>
                <span className="flex items-center gap-1">{j.mode === "Car" ? <Car className="h-3.5 w-3.5" /> : <Bike className="h-3.5 w-3.5" />}{j.mode}</span>
              </div>
            </div>
            <div className="ml-auto flex flex-col items-end gap-1 text-xs font-semibold">
              <span className="flex items-center gap-1 text-portal-navy"><Flag className="h-3.5 w-3.5" />{j.start}</span>
              <span className="text-portal-muted">to</span>
              <span className="flex items-center gap-1 text-portal-navy"><Flag className="h-3.5 w-3.5" />{j.end}</span>
            </div>
          </div>
          {j.events !== null && <p className="mt-4 bg-score-caution-track py-1 text-center text-sm">{j.events} driving events</p>}
          {!!j.tags.length && (
            <div className="mt-3 flex flex-wrap gap-2">
              {j.tags.map((tag) => <span key={tag} className="rounded-full bg-portal-surface px-2.5 py-1 text-[11px] font-semibold text-portal-muted">{tag}</span>)}
            </div>
          )}
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="lg:[&>div]:h-64"><JourneyMap route={j.route as LatLngTuple[]} height={256} /></div>
            <div className="flex items-end justify-end">
              <Button className="gap-1 text-lg font-normal" onClick={() => navigate(`/admin/insurer/users/${userId}/journeys/${j.id}`)}>View journey details<ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </article>
      )) : (
        <div className="rounded-md border border-portal-border bg-portal-panel p-10 text-center">
          <p role="status" className="text-portal-muted">No journeys match your filters.</p>
          <Button variant="ghost" onClick={reset} className="mt-3 px-0 text-xs underline underline-offset-4">Reset all filters</Button>
        </div>
      )}

      <Dialog open={dateOpen} onOpenChange={(o) => !o && setDateOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Change date</DialogTitle><DialogDescription>Choose the date and time to show journeys started before.</DialogDescription></DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="journey-window">Show journeys started before</Label>
            <Input id="journey-window" type="datetime-local" value={filters.to} onChange={(e) => set({ to: e.target.value })} className="rounded-sm" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDateOpen(false)}>Cancel</Button>
            <Button onClick={() => setDateOpen(false)}>Apply</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
