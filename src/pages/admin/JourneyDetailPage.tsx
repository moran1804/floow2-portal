import { PermissionGate } from "@/components/admin/RoleAccess";
import { useUnits } from "@/hooks/useUnits";
import { useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Car, ChevronRight, Clock, FileText, Pencil, Route } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import UserScoreTile from "@/components/admin/UserScoreTile";
import { JourneyMap } from "@/components/admin/UserJourneysSection";
import { journeyFullDateLabel, journeyInfluences } from "@/lib/userJourneys";
import { TRANSPORT_OPTIONS } from "@/lib/journeyTransport";
import { useExampleJourneyTags } from "@/hooks/useExampleJourneyTags";
import JourneyTransportDialog from "@/components/admin/JourneyTransportDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function Card({ icon, title, action, children, className = "" }: { icon: ReactNode; title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`rounded-md border border-portal-border/60 bg-background p-6 shadow-sm ${className}`}>
    <header className="mb-6 flex items-center justify-between gap-3"><h2 className="flex items-center gap-3 text-lg font-semibold"><span className="flex h-10 w-10 items-center justify-center rounded-md bg-portal-accent text-primary-foreground">{icon}</span>{title}</h2>{action}</header>
    {children}
  </section>;
}
function Rows({ rows }: { rows: [string, ReactNode][] }) {
  return <dl className="space-y-5 text-sm">{rows.map(([k, v]) => <div key={k} className="flex items-start justify-between gap-4"><dt>{k}</dt><dd className="break-all text-right font-semibold">{v}</dd></div>)}</dl>;
}

export default function JourneyDetailPage() {
  const { speed, speedValue, speedLabel, distance } = useUnits();
  const { userId, journeyId } = useParams();
  const navigate = useNavigate();
  const [transportOpen, setTransportOpen] = useState(false);
  const { journeys, updateTags } = useExampleJourneyTags(userId);
  const [info, setInfo] = useState<string | null>(null);
  const journey = journeys.find((j) => j.id === journeyId);
  const base = `/admin/insurer/users/${userId}`;
  const crumbs = [{ label: "Search", to: "/admin/insurer/search" }, { label: "Users" }, { label: userId ?? "User", to: base }, { label: "Journeys", to: `${base}/journeys` }, { label: `Journey: ${journeyId}` }];
  if (!journey) return <AdminLayout title="Journey details" crumbs={crumbs}><p role="status">This journey was not found.</p></AdminLayout>;
  const mode = journey.mode;
  const ModeIcon = TRANSPORT_OPTIONS.find((option) => option.name === mode)?.icon ?? Car;
  const influences = journeyInfluences[journey.id];
  return <AdminLayout title="Journey details" subtitle={`Journey ID: ${journey.id}`} crumbs={crumbs}>
    <div className="mx-auto max-w-6xl space-y-5">
      <p className="text-xs text-portal-muted">Example journey only · No live journey data is connected for this user.</p>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <Card icon={<FileText className="h-5 w-5" />} title="User information"><Rows rows={[["User ID", <Link key="u" to={base} className="underline underline-offset-2">{userId}</Link>]]} /></Card>
          <Card icon={<Clock className="h-5 w-5" />} title="Time of journey"><Rows rows={[["Date", journeyFullDateLabel(journey.startedAt)], ["Start time", journey.start], ["End time", journey.end], ["Timezone", "Europe/London"]]} /></Card>
          <Card icon={<ModeIcon className="h-5 w-5" />} title="Mode of transport" action={<PermissionGate permission="journeys/mode_of_transport/write"><Button variant="outline" size="sm" className="gap-1 border-2 border-portal-navy text-portal-navy" onClick={() => setTransportOpen(true)}><Pencil className="h-3.5 w-3.5" />Edit</Button></PermissionGate>}>
            <Rows rows={[["Mode of transport", <span key="m" className="inline-flex items-center gap-1 text-xs"><ModeIcon className="h-4 w-4" />{mode}</span>], ["Tag set by", journey.tagSetBy], ["Locked for user edits since", "8:10 pm 06 November, 2026"]]} />
          </Card>
        </div>
        <Card icon={<Route className="h-5 w-5" />} title="Route overview" className="flex flex-col">
          <div className="mb-3 flex justify-end gap-4 text-xs font-semibold"><span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{journey.duration}</span><span className="flex items-center gap-1"><Route className="h-3.5 w-3.5" />{distance(journey.miles)}</span></div>
          <div className="lg:[&>div]:h-96"><JourneyMap route={journey.route} /></div>
          {journey.events !== null && <PermissionGate permission="journeys/events/read"><p className="bg-score-caution-track py-1 text-center text-sm">{journey.events} driving events</p></PermissionGate>}
          <div className="mt-auto flex justify-end pt-6"><Button className="gap-1 text-lg font-normal" onClick={() => navigate(`${base}/journeys/${journey.id}/route`)}>View route<ChevronRight className="h-4 w-4" /></Button></div>
        </Card>
      </div>
      <PermissionGate permission="scores/read"><Card icon={<FileText className="h-5 w-5" />} title="Journey Scores">
        {journey.score === null || !influences ? <p className="text-sm text-portal-muted">This journey was not scored.</p> :
        <div className="grid gap-2 xl:grid-cols-[250px_minmax(0,1fr)]">
          <div className="flex items-center justify-center bg-score-surface p-6"><div className="w-full max-w-[190px]"><UserScoreTile name="Driver score" score={journey.score} overall onOpen={() => setInfo("Driver score details are example content only.")} /></div></div>
          <div className="min-w-0 bg-score-surface p-6"><h3 className="text-2xl font-semibold">Driver Score Influences</h3><p className="mb-6 mt-3 text-xs">Select an influence to understand what affects the score.</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{influences.map(([name, score]) => <UserScoreTile key={name} name={name} score={score} onOpen={() => setInfo(`${name} details are example content only.`)} />)}</div></div>
        </div>}
      </Card></PermissionGate>
    </div>
    <PermissionGate permission="journeys/mode_of_transport/write"><JourneyTransportDialog open={transportOpen} onOpenChange={setTransportOpen} initialMode={mode} onConfirm={(next) => updateTags([journey.id], next)} /></PermissionGate>
    <Dialog open={info !== null} onOpenChange={(o) => !o && setInfo(null)}><DialogContent><DialogHeader><DialogTitle>Not connected yet</DialogTitle><DialogDescription>{info}</DialogDescription></DialogHeader></DialogContent></Dialog>
  </AdminLayout>;
}
