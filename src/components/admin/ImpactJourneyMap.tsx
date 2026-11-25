import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";

const shortRoute: LatLngTuple[] = [[57.6551, -2.5307], [57.6548, -2.5313], [57.6542, -2.5325], [57.6535, -2.5340], [57.6530, -2.5353], [57.654695, -2.536652]];
const longRoute: LatLngTuple[] = [[57.612, -2.554], [57.620, -2.559], [57.628, -2.556], [57.637, -2.558], [57.644, -2.548], [57.653, -2.534]];

export default function ImpactJourneyMap({ compact = false, local = true }: { compact?: boolean; local?: boolean }) {
  const route = local ? shortRoute : longRoute;
  const start = route[0];
  const end = route[route.length - 1];
  if (!start || !end) return null;
  return (
    <div className={`relative z-0 overflow-hidden rounded-sm border border-portal-border ${compact ? "h-40" : "h-80 sm:h-96"}`} aria-label="Sample journey map">
      <MapContainer bounds={route} boundsOptions={{ padding: [25, 25] }} scrollWheelZoom={false} className="h-full w-full" attributionControl>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Polyline positions={route} pathOptions={{ color: "hsl(var(--portal-navy))", weight: 4 }} />
        <CircleMarker center={start} radius={5} pathOptions={{ color: "hsl(var(--portal-text))", fillColor: "hsl(var(--portal-panel))", fillOpacity: 1 }}><Popup>Sample journey start</Popup></CircleMarker>
        <CircleMarker center={end} radius={6} pathOptions={{ color: local ? "hsl(var(--destructive))" : "hsl(var(--portal-navy))", fillOpacity: 1 }}><Popup>{local ? "Sample impact location" : "Sample journey end"}</Popup></CircleMarker>
      </MapContainer>
    </div>
  );
}