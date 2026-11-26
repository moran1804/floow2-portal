import { useRolePreview } from "@/contexts/RolePreviewContext";
import { useUnits } from "@/hooks/useUnits";
import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { addDays, addSeconds, format } from "date-fns";
import { AlertTriangle, ArrowLeft, ChartNoAxesCombined, Check, ChevronRight, Clock, ExternalLink, FileText, Gauge, HelpCircle, MapPin, Pencil, PersonStanding, Route, Signpost } from "lucide-react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import AdminLayout from "@/components/admin/AdminLayout";
import ImpactJourneyMap from "@/components/admin/ImpactJourneyMap";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCustomer } from "@/contexts/CustomerContext";
import { afterJourneys, beforeJourneys, likelihoodLabels, sampleImpacts, SampleJourney } from "@/lib/impactSamples";

function Panel({ title, icon: Icon, children }: { title: string; icon: typeof FileText; children: ReactNode }) {
  return <section className="min-w-0 rounded-md border border-portal-border bg-portal-panel p-5"><h3 className="mb-5 flex items-center gap-3 text-sm font-semibold"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-portal-panel-header text-portal-navy"><Icon className="h-4 w-4" /></span>{title}</h3>{children}</section>;
}
function Fields({ rows }: { rows: [string, string][] }) {
  return <dl className="space-y-4 text-xs">{rows.map(([label, value]) => <div key={label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-3"><dt>{label}</dt><dd className="break-words text-right font-semibold">{value}</dd></div>)}</dl>;
}
function Statistics({ values }: { values: [string, string][] }) {
  return <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{values.map(([label, value]) => <div key={label} className="flex min-h-24 flex-col justify-between gap-4 rounded-md bg-portal-panel-header p-4"><span className="text-xs">{label}</span><strong className="text-xl">{value}</strong></div>)}</div>;
}
function SpeedDetails({ speed }: { speed: number }) {
  const u = useUnits();
  return <div className="space-y-5 text-xs"><div className="flex items-center justify-between gap-3 rounded-sm bg-portal-surface p-4"><div><strong>Estimated speed on impact</strong><p className="mt-1 text-[11px] text-portal-muted">Estimated speed when the impact was detected.</p></div><strong className="whitespace-nowrap text-xl">{u.speed(speed)}</strong></div><div className="px-4"><Fields rows={[["Highest journey speed", u.speed(speed)], ["Average journey speed", u.speed(2)]]} /></div></div>;
}

export default function ImpactReportPage() {
  const { allows } = useRolePreview();
  const { speed, speedValue, speedLabel, distance } = useUnits();
  const { impactId } = useParams();
  const { pathname } = useLocation();
  const { selectedCustomer } = useCustomer();
  const impact = sampleImpacts.find((item) => item.id === impactId);
  const factors = pathname.includes("/contributing-factors");
  const timeline = pathname.includes("/timeline-events");
  const speedTab = pathname.endsWith("/speed");
  const after = pathname.endsWith("/after");
  const base = `/admin/insurer/impacts/${impactId}`;
  const title = factors ? "Contributing factors" : timeline ? "Timeline of events" : "Impact detail";
  const [editStatus, setEditStatus] = useState(false);
  const [status, setStatus] = useState("NEW");
  const [draftStatus, setDraftStatus] = useState("NEW");
  const [extra, setExtra] = useState<"policy" | SampleJourney | null>(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => { setStatus(impact?.archived ? "ARCHIVED" : "NEW"); setSaved(false); }, [impactId, selectedCustomer?.id, impact?.archived]);
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  if (!impact) return <AdminLayout title="Impact not found"><Button asChild><Link to="/admin/insurer/impacts"><ArrowLeft />Impacts detected</Link></Button></AdminLayout>;
  const date = new Date(impact.date);
  const impactTime = format(date, "hh:mm:ss a");
  const journeyStart = format(addSeconds(date, -18), "hh:mm:ss a");
  const journeyEnd = format(addSeconds(date, 135), "hh:mm:ss a");
  const speedData = Array.from({ length: 78 }, (_, i) => ({ time: format(addSeconds(date, i * 2 - 6), "HH:mm:ss"), speed: i < 4 ? impact.speed - i : i === 4 ? 27 : i === 5 ? 26 : i === 9 || i === 40 || i === 50 ? 2 : 0 }));
  const journeys = after ? afterJourneys : beforeJourneys;
  const journeyButton = (journey: SampleJourney) => <Button size="sm" className="mt-4 rounded-sm" onClick={() => setExtra(journey)}>View Journey Details<ChevronRight className="h-4 w-4" /></Button>;

  return <AdminLayout title={title} crumbs={[{ label: "Impacts detected", to: "/admin/insurer/impacts" }, { label: selectedCustomer?.name ?? "Client" }, { label: impact.id }]} actions={!factors && !timeline ? <span className="rounded-sm bg-destructive/10 px-2 py-1 text-xs font-semibold text-destructive">{status}</span> : undefined}>
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><Button asChild variant="ghost" size="sm" className="md:hidden"><Link to="/admin/insurer/impacts"><ArrowLeft />Impacts detected</Link></Button><p className="text-xs text-portal-muted">Sample crash report · Not connected to live client records</p>{!factors && !timeline && allows("impacts/case_status/write") && <Button variant="secondary" size="sm" onClick={() => { setDraftStatus(status); setEditStatus(true); }}><Pencil className="h-4 w-4" />Edit status</Button>}</div>
      <nav className="flex flex-wrap gap-2 md:hidden" aria-label="Report sections">{[[base, "Impact detail"], [`${base}/contributing-factors/phone-use`, "Contributing factors"], [`${base}/timeline-events/before`, "Timeline of events"]].map(([to, label]) => <Button key={to} asChild variant="outline" size="sm"><Link to={to}>{label}</Link></Button>)}</nav>
      {saved && <p role="status" className="flex items-center gap-2 text-sm text-portal-muted"><Check className="h-4 w-4" />Sample status updated for this view only. No live record was changed.</p>}

      {!factors && !timeline && <>
        <section><h2 className="mb-5 text-xl font-semibold text-portal-navy">Policy and time of impact</h2><div className="grid gap-5 sm:grid-cols-2"><Panel title="Policy information" icon={FileText}><Fields rows={[["First name", "Alex"], ["Last name", "Morgan"], ["Email address", "alex.morgan@example.com"], ["Username", "sample-driver-001"]]} />{allows("policies/read") && <Button size="sm" className="mt-5 rounded-sm" onClick={() => setExtra("policy")}>View Policy Details<ChevronRight className="h-4 w-4" /></Button>}</Panel><Panel title="Time of impact" icon={Clock}><Fields rows={[["Date", format(date, "EEEE do MMMM yyyy")], ["Time", impactTime]]} /></Panel></div></section>
        <section className="border-t border-portal-border pt-7"><h2 className="mb-5 text-xl font-semibold text-portal-navy">Likelihood and speed</h2><div className="grid gap-5 sm:grid-cols-2"><Panel title="Likelihood" icon={HelpCircle}><div className="mt-8 flex h-2 overflow-hidden rounded-full"><span className="w-1/3 bg-destructive/10" /><span className="w-1/3 bg-destructive/40" /><span className="w-1/3 bg-destructive" /></div><div className="mt-4 grid grid-cols-3 text-center text-xs"><span className="text-portal-muted">Unlikely</span><span>Likely</span><strong className="flex items-center justify-center gap-1"><AlertTriangle className="h-3 w-3 text-destructive" />{likelihoodLabels[impact.likelihood]}</strong></div><p className="mx-auto mt-8 max-w-64 text-center text-xs leading-relaxed">Based on journey data, how likely the impact detected could have led to an incident.</p></Panel><Panel title="Speed" icon={Gauge}><SpeedDetails speed={impact.speed} /></Panel></div></section>
        <section className="border-t border-portal-border pt-7"><h2 className="mb-5 text-xl font-semibold text-portal-navy">Impact location and road information</h2><div className="grid gap-5 sm:grid-cols-2"><Panel title="Location of impact" icon={MapPin}><Fields rows={[["City", "—"], ["County", "—"], ["Country", "—"], ["Postcode", "—"], ["GPS Latitude", "57.654695"], ["GPS Longitude", "-2.536652"], ["what3words", "—"]]} /></Panel><Panel title="Road information" icon={Signpost}><Fields rows={[["Road", "—"], ["Estimated speed limit", "—"], ["Direction of travel", "South West"], ["Quadrant", "S 47 W"]]} /></Panel></div></section>
        <Panel title="Journey and impact location" icon={Route}><div className="grid gap-5 sm:grid-cols-2"><ImpactJourneyMap /><div className="p-5"><div className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-portal-accent font-semibold">84</span><strong className="text-sm">{format(date, "EEEE do MMMM yyyy")}</strong></div><div className="mt-4 flex gap-3 text-xs text-portal-muted"><span>2m 33s</span><span>{distance(0.1, 1)}</span></div><ol className="mt-8 space-y-5 border-l border-portal-border pl-4 text-xs"><li>Journey start · {journeyStart}</li><li className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4 text-destructive" />Impact · {impactTime}</li><li>Journey end · {journeyEnd}</li></ol>{beforeJourneys[0] && journeyButton(beforeJourneys[0])}</div></div></Panel>
        <Panel title="Impact location on Google Street View" icon={PersonStanding}><div className="grid gap-5 sm:grid-cols-2"><ImpactJourneyMap /><div className="flex min-h-64 flex-col items-center justify-center gap-5 bg-portal-surface p-6 text-center"><PersonStanding className="h-8 w-8 text-portal-muted" /><p className="text-sm text-portal-muted">Street View is not connected.</p><Button asChild variant="outline"><a href="https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=57.654695,-2.536652" target="_blank" rel="noopener noreferrer">Open sample location<ExternalLink className="h-4 w-4" /></a></Button></div></div></Panel>
      </>}

      {factors && <>
        <Tabs key={pathname} value={speedTab ? "speed" : "phone"}><TabsList className="h-12 bg-portal-panel-header"><TabsTrigger value="phone" asChild><Link to={`${base}/contributing-factors/phone-use`}>Phone use</Link></TabsTrigger><TabsTrigger value="speed" asChild><Link to={`${base}/contributing-factors/speed`}>Speed</Link></TabsTrigger></TabsList></Tabs>
        {!speedTab ? <><section><h2 className="mb-2 text-xl font-semibold text-portal-navy">Statistics</h2><p className="mb-5 text-xs text-portal-muted">Statistics relating to phone use throughout this entire journey.</p><Statistics values={[["Total phone calls", "0"], ["Total time spent on calls", "0s"], ["Total distance driven whilst on calls", distance(0, 1)], ["Call duration directly before impact", "0s"]]} /></section><section className="border-t border-portal-border pt-7"><h2 className="mb-5 text-xl font-semibold text-portal-navy">Timeline</h2><div className="rounded-md border border-portal-border bg-portal-panel px-5 py-10 text-center text-xs font-semibold"><p>Journey Start - {journeyStart}</p><p className="mx-auto my-6 max-w-sm rounded-md bg-portal-panel-header p-5">No phone activity for 2m 33s.</p><p>Journey End - {journeyEnd}</p></div></section></> : <><div className="grid sm:grid-cols-2"><Panel title="Speed details (GPS data)" icon={Gauge}><SpeedDetails speed={impact.speed} /></Panel></div><Panel title="Speed chart" icon={ChartNoAxesCombined}><div className="h-80 sm:h-96"><ResponsiveContainer width="100%" height="100%"><LineChart data={speedData.map((d) => ({ ...d, speed: speedValue(d.speed) }))} margin={{ top: 15, right: 10, bottom: 30, left: 0 }}><CartesianGrid stroke="hsl(var(--portal-border))" /><XAxis dataKey="time" interval={12} tick={{ fontSize: 10, fill: "hsl(var(--portal-muted))" }} label={{ value: "Time", position: "bottom", fill: "hsl(var(--portal-muted))" }} /><YAxis width={44} tick={{ fontSize: 10, fill: "hsl(var(--portal-muted))" }} label={{ value: `Speed (${speedLabel.toUpperCase()})`, angle: -90, position: "insideLeft", fill: "hsl(var(--portal-muted))", fontSize: 11 }} /><Tooltip /><ReferenceLine x={format(date, "HH:mm:ss")} stroke="hsl(var(--destructive))" strokeDasharray="4 4" label={{ value: "Impact", fill: "hsl(var(--destructive))", position: "insideTopRight" }} /><Line dataKey="speed" name={`Speed (${speedLabel})`} stroke="hsl(var(--portal-navy))" strokeWidth={2} dot={false} isAnimationActive={false} /></LineChart></ResponsiveContainer></div></Panel></>}
      </>}

      {timeline && <>
        <Tabs key={pathname} value={after ? "after" : "before"}><TabsList className="h-12 bg-portal-panel-header"><TabsTrigger value="before" asChild><Link to={`${base}/timeline-events/before`}>Before the impact</Link></TabsTrigger><TabsTrigger value="after" asChild><Link to={`${base}/timeline-events/after`}>After the impact</Link></TabsTrigger></TabsList></Tabs>
        <section><h2 className="mb-2 text-xl font-semibold text-portal-navy">Statistics</h2><p className="mb-5 text-xs text-portal-muted">Statistics for the 24 hour period <em>{after ? "after" : "before"}</em> the impact was detected.</p><Statistics values={[["Calls answered whilst driving", after ? "1" : "0"], ["Total time spent driving", after ? "26m 24s" : "16m 52s"], ["Total distance driven", distance(after ? 13 : 6.3, 1)], ["Driving behaviour events", after ? "6" : "1"]]} /></section>
        <section className="space-y-5 border-t border-portal-border pt-7"><h2 className="text-xl font-semibold text-portal-navy">Timeline</h2>{journeys.map((journey) => <article key={journey.id} className="grid gap-5 rounded-md border border-portal-border bg-portal-panel p-5 sm:grid-cols-2"><div><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-portal-accent text-xs font-semibold">{journey.score}</span><strong className="text-sm">{format(addDays(date, journey.offset), "EEEE do MMMM yyyy")}</strong></div><div className="shrink-0 text-right text-[11px] text-portal-muted"><p>{journey.duration}</p><p>{distance(journey.miles, 1)}</p></div></div><div className="mt-6 flex items-center gap-2 border-t border-portal-border pt-6 text-[11px]"><span>{journey.impact ? journeyStart : journey.start}</span><span className="h-2 w-2 shrink-0 rounded-full bg-portal-text" /><span className="h-px flex-1 bg-portal-border" />{journey.events > 0 && <span className="bg-portal-panel-header px-2 py-1">{journey.events} events</span>}<span className="h-2 w-2 shrink-0 rounded-full border border-portal-text" /><span>{journey.impact ? journeyEnd : journey.end}</span></div>{journey.impact && <p className="mt-5 inline-flex items-center gap-1 rounded-sm bg-destructive/10 px-2 py-1 text-[11px] text-destructive"><AlertTriangle className="h-3 w-3" />Impact detected at {impactTime}</p>}</div><div><ImpactJourneyMap compact local={journey.impact === true} />{journeyButton(journey)}</div></article>)}<p className="py-4 text-center text-xs text-portal-muted">You have reached the end.</p></section>
      </>}
    </div>

    <Dialog open={editStatus} onOpenChange={setEditStatus}><DialogContent><DialogHeader><DialogTitle>Edit status</DialogTitle><DialogDescription>Sample report only. Changes are temporary and do not update a live crash report.</DialogDescription></DialogHeader><Label htmlFor="report-status">Status</Label><Select value={draftStatus} onValueChange={setDraftStatus}><SelectTrigger id="report-status"><SelectValue /></SelectTrigger><SelectContent>{["NEW", "IN REVIEW", "CLOSED", "ARCHIVED"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select><div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setEditStatus(false)}>Cancel</Button><Button onClick={() => { setStatus(draftStatus); setSaved(true); setEditStatus(false); }}>Save sample status</Button></div></DialogContent></Dialog>
    <Dialog open={extra !== null} onOpenChange={(open) => { if (!open) setExtra(null); }}><DialogContent><DialogHeader><DialogTitle>{extra === "policy" ? "Policy details" : "Journey details"}</DialogTitle><DialogDescription>Sample information · No live client record is connected.</DialogDescription></DialogHeader>{extra === "policy" ? <Fields rows={[["Policy client ID", "SAMPLE-POLICY-001"], ["Driver", "Alex Morgan"], ["Email", "alex.morgan@example.com"]]} /> : extra && <><Fields rows={[["Date", format(addDays(date, extra.offset), "EEEE do MMMM yyyy")], ["Journey score", String(extra.score)], ["Duration", extra.duration], ["Distance", distance(extra.miles, 1)], ["Driving behaviour events", String(extra.events)]]} /><ImpactJourneyMap compact local={extra.impact === true} /></>}</DialogContent></Dialog>
  </AdminLayout>;
}