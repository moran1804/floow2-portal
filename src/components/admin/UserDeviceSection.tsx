import { PermissionGate } from "@/components/admin/RoleAccess";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { DeviceInfo } from "@/lib/sampleDeviceInfo";

function Rows({ rows }: { rows: [string, React.ReactNode][] }) {
  return <dl className="space-y-4 text-xs">{rows.map(([l, v]) => <div key={l} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-3"><dt className="text-portal-muted">{l}</dt><dd className="break-words text-right font-semibold">{v}</dd></div>)}</dl>;
}
const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => <div className="rounded-md border border-portal-border bg-portal-panel p-4 sm:p-5"><h3 className="mb-4 text-sm font-semibold text-portal-navy">{title}</h3>{children}</div>;

export default function UserDeviceSection({ info, createdAt, active = true }: { info: DeviceInfo; createdAt: string; active?: boolean }) {
  const issues = info.permissions.filter((p) => !p.ok).length;
  return <section>
    <h2 className="mb-2 text-2xl font-semibold text-portal-navy">Account &amp; Device</h2>
    <p className="mb-4 text-xs text-portal-muted">Example device, permission and settings data · The app's device information is not connected yet.</p>
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Account status"><Rows rows={[
        ["Status", <span className={`rounded-sm px-2 py-0.5 text-[10px] ${active ? "bg-score-good/15 text-portal-navy" : "bg-muted text-muted-foreground"}`}>{active ? "ACTIVE" : "DEACTIVATED"}</span>],
        ["Created", createdAt],
        ["Deactivated", active ? "—" : "Not recorded"],
        ["First recorded journey", info.firstJourney],
        ["Most recent journey", info.lastJourney],
      ]} /></Panel>
      <Panel title="App settings"><Rows rows={[
        ["Upload over Wi-Fi only", info.wifiOnlyUpload ? "Yes" : "No"],
        ["Battery preference", info.battery],
        ["Pause", info.pause.on ? <span className="text-destructive">On</span> : "Off"],
        ["Last pause set", `${info.pause.lastSetAt} · for ${info.pause.duration}`],
      ]} /></Panel>
      <Panel title="Permissions">
        <p className={`mb-4 flex items-center gap-2 rounded-sm p-2 text-xs font-semibold ${issues ? "bg-destructive/10 text-destructive" : "bg-portal-surface text-portal-navy"}`}>
          {issues ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}{issues ? `${issues} permission${issues > 1 ? "s" : ""} not set correctly` : "All critical permissions set correctly"}
        </p>
        <ul className="space-y-3 text-xs">{info.permissions.map((p) => <li key={p.name} className="flex items-center justify-between gap-3"><span className="text-portal-muted">{p.name}</span><span className="flex items-center gap-1.5 font-semibold">{p.detail}{p.ok ? <CheckCircle2 aria-label="Correct" className="h-4 w-4 text-score-good" /> : <XCircle aria-label="Issue" className="h-4 w-4 text-destructive" />}</span></li>)}</ul>
      </Panel>
      <PermissionGate permission="users/usage_reset/read"><Panel title="Score reset">{info.reset ? <Rows rows={[
        ["Last reset", info.reset.lastResetAt],
        ["Score before reset", String(info.reset.scoreBefore)],
        ["Scores counted from", info.reset.visibleFrom],
      ]} /> : <p className="text-xs text-portal-muted">This user's score has never been reset.</p>}
        <p className="mt-4 text-[11px] text-portal-muted">In Floow 2 a reset counts journeys from a date forward; earlier journeys stay visible but don't count towards the score.</p>
      </Panel></PermissionGate>
    </div>
  </section>;
}
