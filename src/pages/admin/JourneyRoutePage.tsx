import { useRolePreview } from "@/contexts/RolePreviewContext";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Circle, CornerUpLeft, Filter, Gauge, AlertCircle, Smartphone, Route as RouteIcon, type LucideIcon } from "lucide-react";
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, Marker, Tooltip, ZoomControl, useMap } from "react-leaflet";
import { Check } from "lucide-react";
import L, { type LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import { renderToStaticMarkup } from "react-dom/server";
import AdminLayout from "@/components/admin/AdminLayout";
import { sampleJourneys } from "@/lib/userJourneys";

type EventType = "braking" | "acceleration" | "cornering" | "phone";
type RouteEvent = { label: string; time: string; icon: LucideIcon; at: number; type?: EventType };
const EVENT_TYPES: { type: EventType; label: string; icon: LucideIcon }[] = [
  { type: "acceleration", label: "Acceleration", icon: Gauge },
  { type: "braking", label: "Braking", icon: AlertCircle },
  { type: "cornering", label: "Cornering", icon: CornerUpLeft },
  { type: "phone", label: "Phone use", icon: Smartphone },
];
const sampleEvents: RouteEvent[] = [
  { label: "Journey started", time: "8:00:14 pm", icon: Circle, at: 0 },
  { label: "Display on", time: "8:01:07 pm", icon: Smartphone, at: 0.15, type: "phone" },
  { label: "Display off", time: "8:01:12 pm", icon: Smartphone, at: 0.2, type: "phone" },
  { label: "Medium cornering (left)", time: "8:01:29 pm", icon: CornerUpLeft, at: 0.3, type: "cornering" },
  { label: "Medium braking", time: "8:01:42 pm", icon: AlertCircle, at: 0.4, type: "braking" },
  { label: "Medium acceleration", time: "8:01:48 pm", icon: Gauge, at: 0.48, type: "acceleration" },
  { label: "Medium braking", time: "8:02:45 pm", icon: AlertCircle, at: 0.6, type: "braking" },
  { label: "Display on", time: "8:04:20 pm", icon: Smartphone, at: 0.85, type: "phone" },
  { label: "Display off", time: "8:05:12 pm", icon: Smartphone, at: 0.95, type: "phone" },
  { label: "Journey ended", time: "8:05:48 pm", icon: Circle, at: 1 },
];

function pointAt(route: LatLngTuple[], t: number): LatLngTuple {
  const f = t * (route.length - 1), i = Math.min(Math.floor(f), route.length - 2), r = f - i;
  const [a, b] = [route[i], route[i + 1]];
  return [a[0] + (b[0] - a[0]) * r, a[1] + (b[1] - a[1]) * r];
}
function FitRoute({ route }: { route: LatLngTuple[] }) {
  const map = useMap();
  useEffect(() => {
    const fit = () => { map.invalidateSize(); map.fitBounds(L.latLngBounds(route), { padding: [60, 60] }); };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(map.getContainer());
    return () => ro.disconnect();
  }, [map, route]);
  return null;
}
function OpenPopup({ id }: { id: number | null }) {
  const map = useMap();
  useEffect(() => { if (id === null) map.closePopup(); }, [id, map]);
  return null;
}

const eventPinIcon = (Icon: LucideIcon, type: EventType, selected: boolean) => L.divIcon({
  className: `journey-event-pin${selected ? " is-selected" : ""}`,
  html: renderToStaticMarkup(<Icon className={`journey-event-pin-icon event-on-line event-${type}`} />),
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

export default function JourneyRoutePage() {
  const { allows } = useRolePreview();
  const canReadEvents = allows("journeys/events/read");
  const { userId, journeyId } = useParams();
  const [selected, setSelected] = useState<number | null>(null);
  const [satellite, setSatellite] = useState(false);
  const [shown, setShown] = useState<Record<EventType, boolean>>({ acceleration: true, braking: true, cornering: true, phone: true });
  const visible = (e: RouteEvent) => !e.type || shown[e.type];
  const journey = sampleJourneys.find((j) => j.id === journeyId);
  const base = `/admin/insurer/users/${userId}`;
  const crumbs = [{ label: "Search", to: "/admin/insurer/search" }, { label: "Users" }, { label: userId ?? "User", to: base }, { label: "Journeys", to: `${base}/journeys` }, { label: `Journey: ${journeyId}`, to: `${base}/journeys/${journeyId}` }, { label: "Journey route" }];
  if (!journey) return <AdminLayout title="Journey route" crumbs={crumbs}><p role="status">This journey was not found.</p></AdminLayout>;
  const route = journey.route;
    return <AdminLayout title="Journey route" subtitle={`Journey ID: ${journey.id}`} crumbs={crumbs}>
    <div className="mx-auto max-w-6xl space-y-4">
      <p className="text-xs text-portal-muted">Example route and events only · No live journey data is connected for this user.</p>
      <section className="rounded-md border border-portal-border/60 bg-background p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 flex items-center gap-3 text-lg font-semibold"><span className="flex h-10 w-10 items-center justify-center rounded-md bg-portal-accent text-primary-foreground"><RouteIcon className="h-5 w-5" /></span>Route detail</h2>
        <div className={`grid border border-portal-border ${canReadEvents ? "md:grid-cols-[256px_minmax(0,1fr)]" : ""}`}>
          {canReadEvents && <aside className="flex max-h-[600px] flex-col border-r border-portal-border">
            <div className="flex items-center justify-between bg-portal-surface px-3 py-3"><span className="font-semibold text-portal-navy">Events</span><Filter className="h-5 w-5 text-portal-navy" aria-hidden="true" /></div>
            <ul className="overflow-y-auto">{sampleEvents.map((e, i) => { if (!visible(e)) return null; const Icon = e.icon; const active = i === selected; return <li key={i}>
              <button type="button" onClick={() => setSelected(active ? null : i)} className={`flex w-full items-center gap-4 border-b border-l-4 border-b-portal-border px-3 py-2.5 text-left transition-colors hover:bg-portal-surface ${active ? "border-l-portal-navy bg-portal-surface" : "border-l-transparent"}`}>
                {e.type ? <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-background event-${e.type}`}><Icon className="h-4 w-4" /></span> : <Icon className={`h-6 w-6 shrink-0 ${i === 0 ? "fill-foreground" : ""}`} />}<span><span className="block">{e.label}</span><span className="block text-sm">{e.time}</span></span>
              </button></li>; })}</ul>
          </aside>}
          <div className="relative z-0 h-[420px] sm:h-[500px] lg:h-[600px]">
            <div className="absolute left-2 top-2 z-[500] flex overflow-hidden rounded-sm bg-background text-lg shadow">
              {(["Map", "Satellite"] as const).map((m) => <button key={m} type="button" onClick={() => setSatellite(m === "Satellite")} className={`px-4 py-2 ${(m === "Satellite") === satellite ? "font-semibold" : "text-portal-muted"}`}>{m}</button>)}
            </div>
            <MapContainer key={journey.id} bounds={route} boundsOptions={{ padding: [60, 60] }} zoomControl={false} className="h-full w-full">
              {satellite ? <TileLayer key="sat" attribution="Tiles &copy; Esri" url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                : <TileLayer key="map" attribution="&copy; OpenStreetMap" url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />}
              <Polyline positions={route} pathOptions={{ color: "hsl(var(--foreground))", weight: 3 }} />
              <CircleMarker center={route[0]} radius={8} pathOptions={{ color: "hsl(var(--foreground))", fillColor: "hsl(var(--foreground))", fillOpacity: 1 }}><Tooltip permanent direction="right" offset={[12, 0]} className="journey-end-label">START</Tooltip></CircleMarker>
              <CircleMarker center={route[route.length - 1]} radius={8} pathOptions={{ color: "hsl(var(--foreground))", fillColor: "hsl(var(--background))", fillOpacity: 1, weight: 3 }}><Tooltip permanent direction="left" offset={[-12, 0]} className="journey-end-label">END</Tooltip></CircleMarker>
              {canReadEvents && sampleEvents.map((e, i) => e.type && visible(e) ? <Marker key={`${i}-${i === selected}`} position={pointAt(route, e.at)} icon={eventPinIcon(e.icon, e.type, i === selected)} zIndexOffset={i === selected ? 1000 : 0} eventHandlers={{ click: () => setSelected(i), add: (ev) => { if (i === selected) ev.target.openPopup(); } }}>
                <Popup closeButton={false}><strong>{e.label}</strong><br />{e.time}</Popup>
              </Marker> : null)}
              <FitRoute route={route} />
              <OpenPopup id={selected} />
              <ZoomControl position="bottomright" />
            </MapContainer>
          </div>
        </div>
        {canReadEvents && <div className="flex flex-wrap items-center justify-center gap-3 border-x border-b border-portal-border px-3 py-4">
          <span className="text-sm font-semibold">Show events:</span>
          {EVENT_TYPES.map(({ type, label, icon: Icon }) => <button key={type} type="button" aria-pressed={shown[type]} onClick={() => { setShown((s) => ({ ...s, [type]: !s[type] })); setSelected(null); }} className={`flex items-center gap-2 rounded-full border border-portal-border px-3 py-1.5 text-sm transition hover:bg-portal-surface ${shown[type] ? "" : "opacity-50"}`}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-background event-${type}`}><Icon className="h-3.5 w-3.5" /></span>{label}<Check className={`h-4 w-4 ${shown[type] ? "" : "invisible"}`} />
          </button>)}
        </div>}
      </section>
    </div>
  </AdminLayout>;
}
