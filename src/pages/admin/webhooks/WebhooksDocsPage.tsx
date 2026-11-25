import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

type Field = { name: string; type: string; desc: string; required?: boolean; pattern?: string; limits?: string[]; children?: Field[] };
type EventDef = { type: string; desc: string; payload: Field[]; example: Record<string, unknown> };

const link: Field = { name: "links", type: "array[object]", desc: "Links to other entities.", required: true, children: [
  { name: "rel", type: "string", desc: "Relationship of the linked entity.", required: true },
  { name: "href", type: "string<uri>", desc: "URL of the linked entity.", required: true },
] };
const loc = (label: string): Field => ({ name: `${label}Location`, type: "object", desc: `${label === "start" ? "Start" : "End"} location of the journey.`, required: true, children: [
  { name: "latitude", type: "number<double>", desc: "Latitude.", required: true },
  { name: "longitude", type: "number<double>", desc: "Longitude.", required: true },
] });
const r = (name: string, type: string, desc: string, extra: Partial<Field> = {}): Field => ({ name, type, desc, required: true, ...extra });
const journeyId = (d: string) => r("journeyId", "string<uuid>", d);
const start = r("startTime", "string<date-time>", "When the recording started.");
const end = r("endTime", "string<date-time>", "When the recording stopped.");
const mot = r("modeOfTransport", "string", "What mode of transport was used to make the journey.");
const dist = r("distance", "integer<int32>", "The total distance travelled in meters.");
const dur = r("duration", "integer<int32>", "How long the journey lasted in seconds.");
const user = r("userId", "string", "Universally unique identifier for the user who recorded the journey.");
const tz = r("timezone", "string", "Timezone in which the journey was recorded.");
const scoreFields: Field[] = [
  journeyId("Id of the journey related to this score."), start, end, dist, dur, user, tz, loc("start"), loc("end"), mot,
  { name: "overallScore", type: "number<float>", desc: "Overall score for the journey.", limits: [">= 0", "<= 100"] },
  r("componentScores", "array[object]", "List of Journey component scores.", { children: [r("component", "string", "Name of the score component."), r("score", "number<float>", "Score for the component.", { limits: [">= 0", "<= 100"] })] }),
  link,
];

const EVENTS: EventDef[] = [
  { type: "telematics.journey.recorded", desc: "An event produced whenever a journey has been recorded.", payload: [journeyId("Id of the journey that was recorded."), start, user, link],
    example: { journeyId: "d04b7aa3-4e63-4739-8fd9-ed2779b24d2c", startTime: "2026-08-24T14:15:22Z", userId: "user-123", links: [{ rel: "journey", href: "https://api.example.com/journeys/d04b7aa3" }] } },
  { type: "telematics.journey.processed", desc: "An event produced whenever a journey has been processed.", payload: [journeyId("Id of the journey that was recorded."), start, end, mot, dist, dur, user, tz, loc("start"), loc("end"), link],
    example: { journeyId: "d04b7aa3-4e63-4739-8fd9-ed2779b24d2c", startTime: "2026-08-24T14:15:22Z", endTime: "2026-08-24T14:42:10Z", modeOfTransport: "Car", distance: 18420, duration: 1608, userId: "user-123", timezone: "Europe/London", startLocation: { latitude: 53.3087, longitude: -1.3686 }, endLocation: { latitude: 53.3811, longitude: -1.4701 }, links: [] } },
  { type: "telematics.journey.scored", desc: "An event produced whenever a journey receives a new score.", payload: scoreFields,
    example: { journeyId: "d04b7aa3-4e63-4739-8fd9-ed2779b24d2c", overallScore: 82.5, componentScores: [{ component: "speeding", score: 78 }, { component: "braking", score: 85 }], links: [] } },
  { type: "telematics.journey.finalised", desc: "An event produced whenever a journey receives a new score.", payload: scoreFields,
    example: { journeyId: "d04b7aa3-4e63-4739-8fd9-ed2779b24d2c", overallScore: 82.5, componentScores: [{ component: "speeding", score: 78 }], links: [] } },
  { type: "telematics.entity.score_updated", desc: "An event produced whenever the aggregated score for an entity is updated.", payload: [
    r("entityType", "string", "Type of the entity the score is for."), r("entityRef", "string", "Reference of the entity the score is for."),
    r("productCode", "string", "Product code of the product from which the scoring configuration was taken."),
    r("periodStart", "string<date-time>", "The start of the aggregation period."), r("periodEnd", "string<date-time>", "The end of the aggregation period."),
    r("journeyCount", "integer<int32>", "The number of journeys that were included in the aggregation.", { limits: [">= 0"] }),
    r("totalDistance", "integer<int64>", "The combined distance of the journeys included in the score calculation measured in metres.", { limits: [">= 0"] }),
    r("totalDuration", "integer<int64>", "The combined duration of the journeys included in the score calculation measured in seconds.", { limits: [">= 0"] }),
    { name: "overallScore", type: "number<float>", desc: "Overall aggregated score.", limits: [">= 0", "<= 100"] }, link],
    example: { entityType: "user", entityRef: "user-123", productCode: "test-1234", periodStart: "2026-08-01T00:00:00Z", periodEnd: "2026-08-31T23:59:59Z", journeyCount: 42, totalDistance: 812340, totalDuration: 61200, overallScore: 79.1, links: [] } },
  { type: "telematics.impact.detected", desc: "An event produced whenever an impact has been detected.", payload: [
    r("impactId", "string<uuid>", "Id of the impact that was detected."), journeyId("Id of the journey for which the impact was detected."),
    r("classificationScore", "number<float>", "Classification score of the impact."), { name: "severity", type: "number<float>", desc: "Severity of the impact." },
    r("timestamp", "string<date-time>", "Time of the impact."), r("latitude", "number<double>", "Latitude."), r("longitude", "number<double>", "Longitude."), link],
    example: { impactId: "497f6eca-6276-4993-bfeb-53cbbbba6f08", journeyId: "d04b7aa3-4e63-4739-8fd9-ed2779b24d2c", classificationScore: 0.762, severity: 80, timestamp: "2026-08-24T14:15:22Z", latitude: 53.3087, longitude: -1.3686, links: [] } },
];

const envelope = (e: EventDef): Field[] => [
  r("id", "string<uuid>", "Unique identifier for this event."),
  r("eventType", "string", "The type of event that occurred.", { pattern: "^[a-z]+\\.[a-z]+\\.[a-z]+$" }),
  r("metadata", "object", "Metadata about this event.", { children: [r("correlationId", "string", "CorrelationId from the request that triggered this event.")] }),
  r("payload", "object", "", { children: e.payload }),
];

const toSchema = (fields: Field[]): Record<string, unknown> => ({
  type: "object",
  required: fields.filter((f) => f.required).map((f) => f.name),
  properties: Object.fromEntries(fields.map((f) => [f.name, f.children ? (f.type.startsWith("array") ? { type: "array", description: f.desc, items: toSchema(f.children) } : { ...toSchema(f.children), description: f.desc }) : { type: f.type.split("<")[0], ...(f.type.includes("<") ? { format: f.type.split("<")[1].replace(">", "") } : {}), description: f.desc, ...(f.pattern ? { pattern: f.pattern } : {}) }])),
});

const FieldRow = ({ f, depth }: { f: Field; depth: number }) => {
  const [open, setOpen] = useState(depth === 0);
  return (
    <div className={depth > 0 ? "border-l border-portal-border pl-6 relative" : "relative"}>
      <div className="py-2">
        <div className="flex items-center gap-2 text-xs">
          {f.children && <button type="button" onClick={() => setOpen(!open)} className="absolute -left-4 text-portal-muted" aria-label={open ? "Collapse" : "Expand"}>{open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}</button>}
          <span className="font-mono font-bold">{f.name}</span><span className="text-portal-muted">{f.type}</span>
          {f.required && <span className="ml-auto text-destructive text-[11px]">required</span>}
        </div>
        {f.desc && <p className="text-xs mt-1">{f.desc}</p>}
        {f.pattern && <p className="text-[11px] text-portal-muted mt-1">Match pattern: <code className="border border-portal-border px-1">{f.pattern}</code></p>}
        {f.limits && <div className="flex gap-1 mt-1">{f.limits.map((l) => <code key={l} className="text-[11px] border border-portal-border px-1">{l}</code>)}</div>}
      </div>
      {f.children && open && <div className="ml-2">{f.children.map((c) => <FieldRow key={c.name} f={c} depth={depth + 1} />)}</div>}
    </div>
  );
};

const EventCard = ({ e }: { e: EventDef }) => {
  const [tab, setTab] = useState<"Description" | "Example" | "Schema">("Description");
  const fields = envelope(e);
  const json = tab === "Example"
    ? { id: "3fa85f64-5717-4562-b3fc-2c963f66afa6", eventType: e.type, metadata: { correlationId: "c0a8012e-7d1f-4b9e-9a3e-5f1d2e3c4b5a" }, payload: e.example }
    : toSchema(fields);
  return (
    <div id={e.type} className="bg-portal-panel border border-portal-border rounded-lg overflow-hidden scroll-mt-4">
      <div className="flex items-center justify-between bg-portal-surface px-6 py-4">
        <h3 className="font-semibold">{e.type}</h3>
        <div className="flex rounded overflow-hidden text-sm">
          {(["Description", "Example", "Schema"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={`px-2 py-1 ${tab === t ? "bg-portal-border" : "bg-portal-sidebar-active/40"}`}>{t}</button>
          ))}
        </div>
      </div>
      <div className="px-6 py-4">
        {tab === "Description" ? (
          <><p className="text-xs mb-1">{e.desc}</p>{fields.map((f) => <FieldRow key={f.name} f={f} depth={0} />)}</>
        ) : (
          <pre className="text-xs font-mono overflow-x-auto bg-portal-navy text-portal-navy-foreground rounded p-4">{JSON.stringify(json, null, 2)}</pre>
        )}
      </div>
    </div>
  );
};

const WebhooksDocsPage = () => (
  <AdminLayout title="Documentation" crumbs={[{ label: "Home", to: "/admin/overview" }, { label: "Developer tools", to: "/admin/developer" }, { label: "Webhooks", to: "/admin/developer/webhooks" }, { label: "Documentation" }]}>
    <div className="flex gap-4 items-start">
      <aside className="hidden lg:block w-72 shrink-0 bg-portal-panel border border-portal-border rounded-lg p-6 sticky top-4">
        <nav className="space-y-2 text-sm">
          <a href="#introduction" className="block font-semibold text-portal-navy">Introduction</a>
          <a href="#verifying" className="block font-semibold text-portal-navy">Verifying webhooks</a>
          <a href="#event-types" className="block font-semibold text-portal-navy">Event types</a>
          <div className="pt-1 space-y-1">{EVENTS.map((e) => <a key={e.type} href={`#${e.type}`} className="block font-semibold underline">{e.type}</a>)}</div>
        </nav>
      </aside>
      <div className="flex-1 min-w-0 max-w-4xl space-y-6">
        <section id="introduction" className="scroll-mt-4">
          <h2 className="text-3xl font-bold text-portal-navy mb-4">Introduction</h2>
          <div className="bg-portal-panel border border-portal-border rounded-lg p-6">Webhooks allow you to receive events for your Floow data in near real time. Configure subscriptions to these events and provide a URL for where you wish them to be sent and we will make HTTP POST requests for each occurence of the selected event type(s).</div>
        </section>
        <section id="verifying" className="scroll-mt-4">
          <h2 className="text-3xl font-bold text-portal-navy mb-4">Verifying webhooks</h2>
          <div className="bg-portal-panel border border-portal-border rounded-lg p-6">
            <p className="mb-4">A cryptographically secure hash of the payload is sent in the header of each webhook, created using the secret for that subscription. By comparing the signature included in the webhook with the one you compute yourself when receiving it, you can verify the authenticity of the call.</p>
            <a href="https://www.standardwebhooks.com/" target="_blank" rel="noreferrer" className="text-portal-navy underline">Further details on payload verification.</a>
          </div>
        </section>
        <section id="event-types" className="scroll-mt-4 space-y-6">
          <h2 className="text-3xl font-bold text-portal-navy">Event types</h2>
          {EVENTS.map((e) => <EventCard key={e.type} e={e} />)}
        </section>
      </div>
    </div>
  </AdminLayout>
);
export default WebhooksDocsPage;
