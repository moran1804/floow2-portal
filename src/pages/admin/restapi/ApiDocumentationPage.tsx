import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronDown } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { useCustomer } from "@/contexts/CustomerContext";

type Param = { name: string; type: string; desc?: string; required?: boolean };
type Op = { id: string; title: string; summary: string; method: "GET" | "PUT" | "POST"; path: string; query?: Param[]; pathParams?: Param[]; codes: number[]; sample: unknown };
type Tag = { tag: string; desc: string; ops: Op[] };

const impact = { id: "497f6eca-6276-4993-bfeb-53cbbbba6f08", scopeId: "string", userId: "string", journeyId: "d04b7aa3-4e63-4739-8fd9-ed2779b24d2c", productCode: "test-1234", timestamp: "2019-08-24T14:15:22Z", latitude: 53.308737110591274, longitude: -1.3685751272457152, severity: 80, classificationScore: 0.762, speed: 13.4, modeOfTransport: "Car", caseStatus: "string" };
const hdr: Param[] = [];
const page: Param[] = [
  { name: "page", type: "integer >= 0", desc: "Default: 0. The page to be returned." },
  { name: "size", type: "integer >= 1", desc: "Default: 20. The size of the page to be returned." },
  { name: "sort", type: "Array of strings", desc: "Sorting criteria in the format: property,(asc|desc). Default sort order is ascending." },
];
const idParam: Param[] = [{ name: "id", type: "string <uuid>", required: true }];

const TAGS: Tag[] = [
  { tag: "Impacts", desc: "Potential impacts detected in recorded journeys.", ops: [
    { id: "getAllImpacts", title: "List", summary: "Request a filtered list of impacts.", method: "GET", path: "/impacts", codes: [200, 400, 401, 403, 500], sample: [impact], query: [
      { name: "scopeId", type: "string", desc: "Optional, only includes impacts with an exact match to the Floow 1 scope identifier." },
      { name: "userId", type: "string", desc: "Optional, only includes impacts with an exact match to the Floow 1 user identifier." },
      { name: "journeyId", type: "string", desc: "Optional, only includes impacts with an exact match to the journey identifier." },
      { name: "after", type: "string <date-time>", desc: "Optional, only includes impacts that occurred on or after this time threshold." },
      { name: "before", type: "string <date-time>", desc: "Optional, only includes impacts that occurred before this time threshold." },
      { name: "severityThreshold", type: "number <float> [0 .. 100]", desc: "Optional, only includes impacts with a severity equal or larger than this threshold." },
      { name: "classificationScoreThreshold", type: "number <float> [0 .. 1]", desc: "Optional, only includes impacts with a classification score equal or larger than this threshold." },
      ...page] },
    { id: "getImpact", title: "Retrieve", summary: "Retrieve a specific impact", method: "GET", path: "/impacts/{id}", pathParams: idParam, codes: [200, 400, 401, 403, 404, 500], sample: impact },
    { id: "updateImpactStatus", title: "Update status", summary: "Update status of a specific impact", method: "PUT", path: "/impacts/{id}/case-status", pathParams: idParam, codes: [204, 400, 401, 403, 404, 500], sample: { caseStatus: "string" } },
  ] },
  { tag: "Journeys", desc: "Recorded journeys.", ops: [
    { id: "updateJourneyMode", title: "Update mode of transport", summary: "Amend the mode of transport on a journey.", method: "PUT", path: "/journeys/{id}/mode-of-transport", pathParams: idParam, codes: [204, 400, 401, 403, 404, 500], sample: { modeOfTransport: "Car" } },
  ] },
  { tag: "Policies", desc: "Client policies.", ops: [
    { id: "getPolicies", title: "List", summary: "Request a list of policies.", method: "GET", path: "/policies", query: page, codes: [200, 401, 403, 500], sample: [{ id: "string", policyNumber: "string", userId: "string" }] },
  ] },
  { tag: "Products", desc: "Client products.", ops: [
    { id: "getProducts", title: "List", summary: "Request a list of products.", method: "GET", path: "/products", codes: [200, 401, 403, 500], sample: [{ productCode: "test-1234", name: "string" }] },
  ] },
  { tag: "Reports", desc: "Client reports.", ops: [
    { id: "getReports", title: "List", summary: "Request a list of reports.", method: "GET", path: "/reports", query: page, codes: [200, 401, 403, 500], sample: [{ id: "string", name: "string", createdAt: "2019-08-24T14:15:22Z" }] },
  ] },
  { tag: "Score", desc: "Entity scores.", ops: [
    { id: "getScore", title: "Retrieve", summary: "Retrieve the score for an entity.", method: "GET", path: "/scores/{id}", pathParams: idParam, codes: [200, 401, 403, 404, 500], sample: { id: "string", overall: 82, components: { speeding: 78, braking: 85 } } },
  ] },
  { tag: "User", desc: "Users of the app.", ops: [
    { id: "getUser", title: "Retrieve", summary: "Retrieve a specific user.", method: "GET", path: "/users/{id}", pathParams: idParam, codes: [200, 401, 403, 404, 500], sample: { id: "string", productCode: "test-1234", createdAt: "2019-08-24T14:15:22Z" } },
  ] },
  { tag: "UserJourneys", desc: "Journeys belonging to a user.", ops: [
    { id: "getUserJourneys", title: "List", summary: "Request a list of journeys for a user.", method: "GET", path: "/users/{id}/journeys", pathParams: idParam, query: page, codes: [200, 401, 403, 404, 500], sample: [{ id: "string", startTime: "2019-08-24T14:15:22Z", distance: 12.4 }] },
  ] },
];

const codeLabel: Record<number, string> = { 200: "OK", 204: "No Content", 400: "Bad Request", 401: "Unauthorized", 403: "Forbidden", 404: "Not found", 500: "Internal Server Error" };
const ok = (c: number) => c < 300;

const Params = ({ title, items }: { title: string; items: Param[] }) => (
  <div className="mb-6">
    <h4 className="text-xs font-semibold uppercase tracking-wide text-portal-muted border-b border-portal-border pb-1 mb-2">{title}</h4>
    {items.map((p) => (
      <div key={p.name} className="grid grid-cols-[minmax(0,14rem)_1fr] gap-4 py-3 border-b border-portal-border/60 text-sm">
        <div className="font-mono">{p.name}{p.required && <div className="text-destructive text-xs">required</div>}</div>
        <div><div className="text-portal-muted text-xs">{p.type}</div>{p.desc}</div>
      </div>
    ))}
  </div>
);

const OpSection = ({ op }: { op: Op }) => {
  const [code, setCode] = useState(op.codes[0]);
  const json = ok(code) ? JSON.stringify(op.sample, null, 2) : JSON.stringify({ status: code, error: codeLabel[code], message: "string" }, null, 2);
  return (
    <section id={op.id} className="grid lg:grid-cols-[1fr_minmax(0,26rem)] border-t border-portal-border scroll-mt-4">
      <div className="p-8">
        <h3 className="text-2xl font-semibold mb-2">{op.title}</h3>
        <p className="text-sm mb-6">{op.summary}</p>
        <p className="text-xs font-semibold uppercase text-portal-muted mb-4">Authorizations: <span className="italic normal-case font-normal text-portal-text">ClientApiAccess</span></p>
        {op.pathParams && <Params title="Path parameters" items={op.pathParams} />}
        {op.query && <Params title="Query parameters" items={op.query} />}
        <Params title="Header parameters" items={[{ name: "X-Correlation-ID", type: "string", desc: "Unique UUID value to track the request" }, ...hdr]} />
        <h4 className="font-semibold mb-2">Responses</h4>
        <div className="space-y-1">
          {op.codes.map((c) => (
            <div key={c} className={`flex items-center gap-1 px-4 py-2 rounded text-sm ${ok(c) ? "bg-portal-accent/10 text-portal-accent" : "bg-destructive/10 text-destructive"}`}>
              <ChevronRight className="w-4 h-4" /><b>{c}</b> {codeLabel[c]}
            </div>
          ))}
        </div>
      </div>
      <div className="bg-portal-navy text-portal-navy-foreground p-6">
        <div className="flex items-center gap-3 bg-portal-navy-foreground/10 rounded px-4 py-3 font-mono text-sm mb-4">
          <span className={`px-2 py-0.5 rounded text-xs ${op.method === "GET" ? "bg-portal-accent" : "bg-portal-accent"}`}>{op.method}</span>{op.path}<ChevronDown className="w-4 h-4 ml-auto" />
        </div>
        <h4 className="font-semibold mb-3">{op.method === "GET" ? "Response samples" : "Request samples"}</h4>
        <div className="flex flex-wrap gap-2 mb-3">
          {op.codes.map((c) => (
            <button key={c} type="button" onClick={() => setCode(c)} className={`px-3 py-1 rounded text-xs font-semibold ${code === c ? "bg-portal-panel text-portal-text" : "bg-portal-navy-foreground/10"} ${ok(c) ? "" : "text-destructive"}`}>{c}</button>
          ))}
        </div>
        <div className="text-xs mb-2 opacity-80">Content type: application/json</div>
        <div className="flex justify-end mb-1"><button type="button" className="text-xs opacity-80 hover:opacity-100" onClick={() => navigator.clipboard?.writeText(json)}>Copy</button></div>
        <pre className="text-xs font-mono overflow-x-auto bg-portal-navy-foreground/5 rounded p-3">{json}</pre>
      </div>
    </section>
  );
};

const ApiDocumentationPage = () => {
  const { selectedCustomerId } = useCustomer();
  const [openTag, setOpenTag] = useState<string | null>("Impacts");
  const download = () => {
    const spec = { openapi: "3.0.1", info: { title: "Floow2 API", version: "0.1.252" }, paths: Object.fromEntries(TAGS.flatMap((t) => t.ops.map((o) => [o.path, { [o.method.toLowerCase()]: { tags: [t.tag], operationId: o.id, summary: o.summary } }]))) };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(spec, null, 2)], { type: "application/json" }));
    a.download = "floow2-openapi.json"; a.click();
  };
  return (
    <AdminLayout title="REST API documentation" crumbs={[{ label: "Home", to: "/admin/overview" }, { label: "Developer tools", to: "/admin/developer" }, { label: "REST API", to: "/admin/developer/rest-api" }, { label: "Documentation" }]}>
      <div className="flex -m-8 bg-portal-panel">
        <aside className="hidden md:block w-60 shrink-0 bg-portal-surface border-r border-portal-border text-sm sticky top-0 self-start max-h-screen overflow-y-auto">
          {TAGS.map((t) => (
            <div key={t.tag}>
              <button type="button" onClick={() => setOpenTag(openTag === t.tag ? null : t.tag)} className="w-full flex items-center justify-between px-5 py-3 hover:bg-portal-sidebar-active/50">
                {t.tag}{openTag === t.tag ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {openTag === t.tag && t.ops.map((o) => (
                <a key={o.id} href={`#${o.id}`} className="flex items-center gap-2 pl-8 pr-4 py-2 hover:bg-portal-sidebar-active/50">
                  <span className="text-[10px] font-bold text-portal-accent w-8">{o.method}</span>{o.title}
                </a>
              ))}
            </div>
          ))}
        </aside>
        <div className="flex-1 min-w-0">
          <div className="p-8 max-w-3xl">
            <h2 className="text-2xl font-semibold mb-3">Floow2 API (v0.1.252)</h2>
            <p className="text-sm mb-6">Download OpenAPI specification: <Button size="sm" variant="outline" className="border-portal-navy text-portal-navy ml-1" onClick={download}>Download</Button></p>
            <h3 className="text-lg font-semibold mb-2">Client Id</h3>
            <p className="text-sm mb-6">Many of the API endpoints use the <code className="text-destructive border border-portal-border px-1">clientId</code> parameter in the URL paths, your clientId is <code className="text-destructive border border-portal-border px-1 break-all">{selectedCustomerId}</code>.</p>
            <h3 className="text-lg font-semibold mb-2">Security</h3>
            <p className="text-sm">These REST APIs are secured using OAuth2 authentication and all requests require an Authorization header with a value of <code className="text-destructive border border-portal-border px-1">Bearer {"{access_token}"}</code>. An access token can be retrieved using the credentials from an API app created in the <Link to="/admin/developer/rest-api/credentials" className="text-portal-accent underline">credentials</Link> section.</p>
          </div>
          {TAGS.map((t) => (
            <div key={t.tag}>
              <div className="px-8 py-10 border-t border-portal-border"><h2 className="text-2xl font-semibold mb-4">{t.tag}</h2><p className="text-sm">{t.desc}</p></div>
              {t.ops.map((o) => <OpSection key={o.id} op={o} />)}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};
export default ApiDocumentationPage;
