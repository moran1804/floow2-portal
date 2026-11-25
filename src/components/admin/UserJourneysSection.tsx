import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock, Route, Car, Bike, Flag } from "lucide-react";
import { MapContainer, TileLayer, Polyline, CircleMarker } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export type Journey = { id: string; date: string; score: number | null; duration: string; miles: string; mode: "Car" | "Bike"; start: string; end: string; events: number | null; route: LatLngTuple[] };
const a: LatLngTuple[] = [[53.7065, -1.7835], [53.7052, -1.7848], [53.7038, -1.7862], [53.7010, -1.7866], [53.6985, -1.7864], [53.6972, -1.7852], [53.6978, -1.7838]];
const b: LatLngTuple[] = [[53.6960, -1.7866], [53.6985, -1.7860], [53.7010, -1.7855], [53.7030, -1.7870], [53.7048, -1.7852], [53.7072, -1.7845]];
export const sampleJourneys: Journey[] = [
  { id: "j1", date: "Tuesday 03 November", score: 75, duration: "5m 34s", miles: "1.14 miles", mode: "Car", start: "8:00 pm", end: "8:05 pm", events: 16, route: a },
  { id: "j2", date: "Tuesday 03 November", score: 77, duration: "5m 17s", miles: "1.15 miles", mode: "Car", start: "7:35 pm", end: "7:41 pm", events: 9, route: b },
  { id: "j3", date: "Tuesday 03 November", score: 79, duration: "7m 42s", miles: "1.18 miles", mode: "Car", start: "5:38 pm", end: "5:46 pm", events: 11, route: a },
  { id: "j4", date: "Tuesday 03 November", score: null, duration: "9m 40s", miles: "0.91 miles", mode: "Bike", start: "5:25 pm", end: "5:34 pm", events: null, route: b },
];

function ScoreRing({ score }: { score: number }) {
  const r = 21, c = 2 * Math.PI * r;
  return <svg viewBox="0 0 48 48" className="h-12 w-12 shrink-0" role="img" aria-label={`Journey score ${score}`}>
    <circle cx="24" cy="24" r={r} fill="none" strokeWidth="3" className="stroke-score-good-track" />
    <circle cx="24" cy="24" r={r} fill="none" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(score / 100) * c} ${c}`} transform="rotate(-90 24 24)" className="stroke-score-good" />
    <text x="24" y="28.5" textAnchor="middle" className="fill-score-good text-[13px] font-semibold">{score}</text>
  </svg>;
}

export function JourneyMap({ route }: { route: LatLngTuple[] }) {
  const start = route[0], end = route[route.length - 1];
  if (!start || !end) return null;
  return <div className="relative z-0 h-64 overflow-hidden" aria-label="Sample journey map">
    <MapContainer bounds={route} boundsOptions={{ padding: [30, 30] }} scrollWheelZoom={false} zoomControl={false} className="h-full w-full">
      <TileLayer attribution='&copy; OpenStreetMap' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Polyline positions={route} pathOptions={{ color: "hsl(var(--portal-accent, var(--primary)))", weight: 4, opacity: 0.85 }} />
      <CircleMarker center={start} radius={6} pathOptions={{ color: "hsl(var(--foreground))", fillColor: "hsl(var(--foreground))", fillOpacity: 1 }} />
      <CircleMarker center={end} radius={6} pathOptions={{ color: "hsl(var(--foreground))", fillColor: "hsl(var(--background))", fillOpacity: 1, weight: 2 }} />
    </MapContainer>
  </div>;
}

export default function UserJourneysSection() {
  const [before, setBefore] = useState("2026-11-25T23:59");
  const [dateOpen, setDateOpen] = useState(false);
  const navigate = useNavigate();
  const { userId } = useParams();
  const label = new Date(before).toLocaleString("en-GB", { hour: "numeric", minute: "2-digit", day: "numeric", month: "long", year: "numeric" });
  const navBtn = "h-12 gap-1 rounded-md border-2 border-portal-navy bg-background px-4 text-lg font-normal text-portal-navy hover:bg-portal-surface";
  return <section className="space-y-6">
    <p className="text-xs text-portal-muted">Example journeys only · No live journey data is connected for this user.</p>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <Button variant="outline" className={navBtn}><ChevronLeft className="h-5 w-5" />Earlier journeys</Button>
      <div className="text-center text-base"><p>Showing {sampleJourneys.length} journeys started before {label}</p><button type="button" className="underline underline-offset-2" onClick={() => setDateOpen(true)}>Change date</button></div>
      <Button variant="outline" className={navBtn}>Later journeys<ChevronRight className="h-5 w-5" /></Button>
    </div>
    {sampleJourneys.map((j) => <article key={j.id} className="grid gap-3 rounded-md border border-portal-border bg-background p-6 shadow-sm lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col">
        <div className="flex items-start justify-between gap-4 pb-6">
          <div className="flex items-center gap-4">{j.score !== null ? <ScoreRing score={j.score} /> : <span className="w-12" />}<h3 className="text-base font-semibold">{j.date}</h3></div>
          <ul className="space-y-2 text-right text-xs font-semibold">
            <li className="flex items-center justify-end gap-1"><Clock className="h-3.5 w-3.5" />{j.duration}</li>
            <li className="flex items-center justify-end gap-1"><Route className="h-3.5 w-3.5" />{j.miles}</li>
            <li className="flex items-center justify-end gap-1">{j.mode === "Car" ? <Car className="h-3.5 w-3.5" /> : <Bike className="h-3.5 w-3.5" />}{j.mode}</li>
          </ul>
        </div>
        <div className="flex items-center gap-3 border-t border-portal-border pt-6 text-xs">
          <span>{j.start}</span><span className="h-3.5 w-3.5 rounded-full border-[3px] border-foreground bg-foreground ring-2 ring-background" />
          <span className="relative flex flex-1 items-center justify-center"><span className="absolute inset-x-0 top-1/2 h-px bg-portal-border" />{j.events !== null && <span className="relative bg-score-caution-track px-4 py-1">{j.events} events</span>}</span>
          <Flag className="h-4 w-4" /><span>{j.end}</span>
        </div>
      </div>
      <div className="space-y-3">
        <JourneyMap route={j.route} />
        <Button className="h-9 gap-1 rounded-md px-4 text-lg font-normal" onClick={() => navigate(`/admin/insurer/users/${userId}/journeys/${j.id}`)}>View journey details<ChevronRight className="h-4 w-4" /></Button>
      </div>
    </article>)}
    <Dialog open={dateOpen} onOpenChange={setDateOpen}><DialogContent><DialogHeader><DialogTitle>Change date</DialogTitle><DialogDescription>Show journeys started before this date and time. Example data only.</DialogDescription></DialogHeader><Input type="datetime-local" value={before} onChange={(e) => e.target.value && setBefore(e.target.value)} /></DialogContent></Dialog>
  </section>;
}
