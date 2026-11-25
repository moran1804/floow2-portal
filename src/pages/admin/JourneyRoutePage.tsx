import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Circle, CornerUpLeft, Filter, Gauge, AlertCircle, Smartphone, Route as RouteIcon, type LucideIcon } from "lucide-react";
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, Marker, ZoomControl, useMap } from "react-leaflet";
import L, { type LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import { renderToStaticMarkup } from "react-dom/server";
import AdminLayout from "@/components/admin/AdminLayout";
import { sampleJourneys } from "@/lib/userJourneys";

type RouteEvent = { label: string; time: string; icon: LucideIcon; at: number };
const sampleEvents: RouteEvent[] = [
  { label: "Journey started", time: "8:00:14 pm", icon: Circle, at: 0 },
  { label: "Display on", time: "8:01:07 pm", icon: Smartphone, at: 0.15 },
  { label: "Display off", time: "8:01:12 pm", icon: Smartphone, at: 0.2 },
  { label: "Medium cornering (left)", time: "8:01:29 pm", icon: CornerUpLeft, at: 0.3 },
  { label: "Medium braking", time: "8:01:42 pm", icon: AlertCircle, at: 0.4 },
  { label: "Medium acceleration", time: "8:01:48 pm", icon: Gauge, at: 0.48 },
  { label: "Medium braking", time: "8:02:45 pm", icon: AlertCircle, at: 0.6 },
  { label: "Display on", time: "8:04:20 pm", icon: Smartphone, at: 0.85 },
  { label: "Display off", time: "8:05:12 pm", icon: Smartphone, at: 0.95 },
  { label: "Journey ended", time: "8:05:48 pm", icon: Circle, at: 1 },
];

function pointAt(route: LatLngTuple[], t: number): LatLngTuple {
  const f = t * (route.length - 1), i = Math.min(Math.floor(f), route.length - 2), r = f - i;
  const [a, b] = [route[i], route[i + 1]];
  return [a[0] + (b[0] - a[0]) * r, a[1] + (b[1] - a[1]) * r];
}
function OpenPopup({ id }: { id: number | null }) {
  const map = useMap();
  useEffect(() => { if (id === null) map.closePopup(); }, [id, map]);
  return null;
}

const eventPinIcon = (Icon: LucideIcon) => L.divIcon({
  className: "journey-event-pin",
  html: renderToStaticMarkup(<Icon className="journey-event-pin-icon" />),
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -16],
});

export default function JourneyRoutePage() {
  const { userId, journeyId } = useParams();
  const [selected, setSelected] = useState<number | null>(null);
  const [satellite, setSatellite] = useState(false);
  const journey = sampleJourneys.find((j) => j.id === journeyId);
  const base = `/admin/insurer/users/${userId}`;
  const crumbs = [{ label: "Search", to: "/admin/insurer/search" }, { label: "Users" }, { label: userId ?? "User", to: base }, { label: "Journeys", to: `${base}/journeys` }, { label: `Journey: ${journeyId}`, to: `${base}/journeys/${journeyId}` }, { label: "Journey route" }];
  if (!journey) return <AdminLayout title="Journey route" crumbs={crumbs}><p role="status">This journey was not found.</p></AdminLayout>;
  const route = journey.route;
  const sel = selected !== null ? sampleEvents[selected] : null;
  return <AdminLayout title="Journey route" subtitle={`Journey ID: ${journey.id}`} crumbs={crumbs}>
    <div className="mx-auto max-w-6xl space-y-4">
      <p className="text-xs text-portal-muted">Example route and events only · No live journey data is connected for this user.</p>
      <section className="rounded-md border border-portal-border/60 bg-background p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-3 text-lg font-semibold"><span className="flex h-10 w-10 items-center justify-center rounded-md bg-portal-accent text-primary-foreground"><RouteIcon className="h-5 w-5" /></span>Route detail</h2>
        <div className="grid border border-portal-border md:grid-cols-[256px_minmax(0,1fr)]">
          <aside className="flex max-h-[600px] flex-col border-r border-portal-border">
            <div className="flex items-center justify-between bg-portal-surface px-3 py-3"><span className="font-semibold text-portal-navy">Events</span><Filter className="h-5 w-5 text-portal-navy" aria-label="Filter (not connected)" /></div>
            <ul className="overflow-y-auto">{sampleEvents.map((e, i) => { const Icon = e.icon; const active = i === selected; return <li key={i}>
              <button type="button" onClick={() => setSelected(active ? null : i)} className={`flex w-full items-center gap-4 border-b border-l-4 border-b-portal-border px-3 py-2.5 text-left transition-colors hover:bg-portal-surface ${active ? "border-l-portal-navy bg-portal-surface" : "border-l-transparent"}`}>
                <Icon className={`h-6 w-6 shrink-0 ${i === 0 ? "fill-foreground" : ""}`} /><span><span className="block">{e.label}</span><span className="block text-sm">{e.time}</span></span>
              </button></li>; })}</ul>
          </aside>
          <div className="relative z-0 h-[600px]">
            <div className="absolute left-2 top-2 z-[500] flex overflow-hidden rounded-sm bg-background text-lg shadow">
              {(["Map", "Satellite"] as const).map((m) => <button key={m} type="button" onClick={() => setSatellite(m === "Satellite")} className={`px-4 py-2 ${(m === "Satellite") === satellite ? "font-semibold" : "text-portal-muted"}`}>{m}</button>)}
            </div>
            <MapContainer bounds={route} boundsOptions={{ padding: [60, 60] }} zoomControl={false} className="h-full w-full">
              {satellite ? <TileLayer key="sat" attribution="Tiles &copy; Esri" url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                : <TileLayer key="map" attribution="&copy; OpenStreetMap" url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />}
              <Polyline positions={route} pathOptions={{ color: "hsl(var(--foreground))", weight: 3 }} />
              <CircleMarker center={route[0]} radius={8} pathOptions={{ color: "hsl(var(--foreground))", fillColor: "hsl(var(--foreground))", fillOpacity: 1 }} />
              <CircleMarker center={route[route.length - 1]} radius={8} pathOptions={{ color: "hsl(var(--foreground))", fillColor: "hsl(var(--background))", fillOpacity: 1, weight: 3 }} />
              {sel && <Marker key={selected} position={pointAt(route, sel.at)} icon={eventPinIcon(sel.icon)} eventHandlers={{ add: (ev) => ev.target.openPopup() }}>
                <Popup closeButton={false}><strong>{sel.label}</strong><br />{sel.time}</Popup>
              </Marker>}
              <OpenPopup id={selected} />
              <ZoomControl position="bottomright" />
            </MapContainer>
          </div>
        </div>
      </section>
    </div>
  </AdminLayout>;
}
