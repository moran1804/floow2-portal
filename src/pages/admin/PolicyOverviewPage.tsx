import { PermissionGate } from "@/components/admin/RoleAccess";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import UserScoreTile from "@/components/admin/UserScoreTile";
import { supabase } from "@/integrations/supabase/client";
import { useCustomer } from "@/contexts/CustomerContext";
import { averageScores, sampleDriverScores } from "@/lib/sampleScores";
import { sampleDeviceInfo } from "@/lib/sampleDeviceInfo";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

function DetailRows({ rows }: { rows: [string, string][] }) {
  return <dl className="space-y-4 text-xs">{rows.map(([l, v]) => <div key={l} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-3"><dt className="text-portal-muted">{l}</dt><dd className="break-words text-right font-semibold">{v}</dd></div>)}</dl>;
}

function MiniDial({ name, score, overall = false }: { name: string; score: number; overall?: boolean }) {
  const caution = score < 70;
  return <div className="flex min-w-0 flex-col items-center gap-1 rounded-md bg-portal-panel px-2 py-2 transition hover:-translate-y-0.5 hover:shadow-score-tile-hover motion-reduce:transform-none">
    <svg viewBox="0 0 80 80" className={`h-11 w-11 ${caution ? "text-score-caution" : "text-score-good"}`} role="img" aria-label={`${name} example score ${score}`}>
      <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" className={caution ? "text-score-caution-track" : "text-score-good-track"} strokeWidth="8" />
      <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="8" pathLength="100" strokeDasharray={`${score} 100`} transform="rotate(-90 40 40)" />
      <text x="40" y="49" textAnchor="middle" fill="currentColor" className="text-2xl font-bold">{score}</text>
    </svg>
    <span className={`text-center text-[10px] leading-tight ${overall ? "font-bold text-portal-navy" : "font-semibold"}`}>{name}</span>
  </div>;
}

export default function PolicyOverviewPage() {
  const { policyId = "" } = useParams();
  const { selectedCustomerId, selectedCustomer } = useCustomer();
  const { data: drivers = [], isLoading, error } = useQuery({
    queryKey: ["policy-drivers", selectedCustomerId, policyId],
    enabled: Boolean(selectedCustomerId && policyId),
    queryFn: async () => {
      const { data, error } = await supabase.from("insurer_users").select("*, products(code)")
        .eq("customer_id", selectedCustomerId ?? "").eq("policy_client_id", policyId).order("first_name");
      if (error) throw error;
      return data;
    },
  });
  const scored = drivers.map((d) => ({ d, s: sampleDriverScores(d.id) }));
  const policy = averageScores(scored.map((x) => x.s));
  const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const created = drivers.length ? fmt(drivers.map((d) => d.created_at).sort()[0]) : "—";
  const devices = drivers.map((d) => ({ d, info: sampleDeviceInfo(d.id) }));
  const resetInfo = devices.map((x) => x.info.reset).find(Boolean) ?? null;
  const withIssues = devices.filter((x) => x.info.permissions.some((p) => !p.ok) || !x.info.compatible);
  const paused = devices.filter((x) => x.info.pause.on);
  const products = [...new Set(drivers.map((d) => d.products?.code).filter(Boolean))].join(", ") || "Not assigned";

  return <AdminLayout title="Policy overview" subtitle={`Policy Client ID: ${policyId}`} crumbs={[{ label: "Search", to: "/admin/insurer/search" }, { label: selectedCustomer?.name ?? "Client" }, { label: policyId }]}>
    <div className="mx-auto max-w-6xl space-y-7">
      {isLoading ? <p role="status">Loading policy…</p> : error ? <p role="alert">Unable to load this policy. Please try again.</p> : !drivers.length ? <p role="status">No drivers were found on this policy in the selected client.</p> : <>
        <section><h2 className="mb-4 text-2xl font-semibold text-portal-navy">Policy Details</h2>
          <div className="grid gap-5 rounded-md border border-portal-border bg-portal-panel p-5 sm:grid-cols-2">
            <DetailRows rows={[["Policy Client ID", policyId], ["Product code", products]]} />
            <div className="sm:border-l sm:border-portal-border sm:pl-5"><DetailRows rows={[["Drivers on policy", String(drivers.length)], ["Postal code", drivers[0].postal_code ?? "—"]]} /></div>
          </div>
        </section>
        {policy && <PermissionGate permission="scores/read"><section><h2 className="mb-4 text-2xl font-semibold text-portal-navy">Policy Scores</h2>
          <p className="mb-4 text-xs text-portal-muted">Example scores only · Policy score is the average of its drivers. No live scoring data is connected.</p>
          <div className="grid gap-2 bg-portal-panel p-4 sm:p-5 xl:grid-cols-[190px_minmax(0,1fr)]">
            <div className="flex items-center justify-center bg-score-surface p-5"><div className="w-full max-w-[160px]"><UserScoreTile name="Policy score" score={policy.overall} overall /></div></div>
            <div className="min-w-0 bg-score-surface p-4 sm:p-6"><h3 className="mb-5 mt-2 text-xl font-semibold">Policy Score Influences</h3><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{policy.influences.map((i) => <UserScoreTile key={i.name} {...i} />)}</div></div>
          </div>
        </section></PermissionGate>}
        <section><h2 className="mb-2 text-2xl font-semibold text-portal-navy">Policy Account</h2>
          <p className="mb-4 text-xs text-portal-muted">Example status, journey, reset and device data · Only the created date comes from saved records.</p>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-md border border-portal-border bg-portal-panel p-5"><h3 className="mb-4 text-sm font-semibold text-portal-navy">Policy status</h3><DetailRows rows={[["Status", "Active"], ["Created", created], ["Deactivated", "—"], ["First recorded journey", devices[0].info.firstJourney], ["Most recent journey", devices[0].info.lastJourney]]} /></div>
            <PermissionGate permission="users/usage_reset/read"><div className="rounded-md border border-portal-border bg-portal-panel p-5"><h3 className="mb-4 text-sm font-semibold text-portal-navy">Score reset</h3>{resetInfo ? <DetailRows rows={[["Last reset", resetInfo.lastResetAt], ["Policy score before reset", String(resetInfo.scoreBefore)], ["Scores counted from", resetInfo.visibleFrom]]} /> : <p className="text-xs text-portal-muted">This policy's score has never been reset.</p>}<p className="mt-4 text-[11px] text-portal-muted">In Floow 2 a reset counts journeys from a date forward; earlier journeys stay visible but don't count towards the score.</p></div></PermissionGate>
            <div className="rounded-md border border-portal-border bg-portal-panel p-5 lg:col-span-2"><h3 className="mb-4 text-sm font-semibold text-portal-navy">Driver device health</h3>
              <p className={`mb-4 flex items-center gap-2 rounded-sm p-2 text-xs font-semibold ${withIssues.length ? "bg-destructive/10 text-destructive" : "bg-portal-surface text-portal-navy"}`}>{withIssues.length ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}{withIssues.length ? `${withIssues.length} of ${drivers.length} drivers have a permission or phone issue` : "All drivers' phones are set up correctly"}{paused.length ? ` · ${paused.length} paused` : ""}</p>
              <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-xs"><thead className="bg-portal-panel-header"><tr>{["Driver", "Phone / OS", "Permissions", "Wi-Fi only upload", "Battery", "Pause"].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead><tbody>{devices.map(({ d, info }) => { const bad = info.permissions.filter((p) => !p.ok).length; return <tr key={d.id} className="border-t border-portal-border"><td className="p-3 font-semibold">{d.display_name}</td><td className="p-3">{info.model} · {info.os}{!info.compatible && <span className="ml-2 rounded-sm bg-destructive/10 px-1.5 py-0.5 text-[10px] text-destructive">May not be compatible</span>}</td><td className={`p-3 ${bad ? "text-destructive" : ""}`}>{bad ? `${bad} issue${bad > 1 ? "s" : ""}` : "All correct"}</td><td className="p-3">{info.wifiOnlyUpload ? "Yes" : "No"}</td><td className="p-3">{info.battery}</td><td className="p-3">{info.pause.on ? "On" : "Off"}</td></tr>; })}</tbody></table></div>
            </div>
          </div>
        </section>
        <section><h2 className="mb-4 text-2xl font-semibold text-portal-navy">Drivers</h2>
          <div className="grid gap-3 lg:grid-cols-2">{scored.map(({ d, s }) => <article key={d.id} className="rounded-md border border-portal-border bg-portal-panel p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="min-w-0"><h3 className="truncate text-sm font-semibold text-portal-navy">{d.display_name}</h3><p className="truncate text-[11px] text-portal-muted">{d.email}</p></div>
              <Button asChild size="sm" className="h-7 px-2 text-xs"><Link to={`/admin/insurer/users/${d.id}`}>View driver<ChevronRight /></Link></Button>
            </div>
            <PermissionGate permission="scores/read"><div className="grid grid-cols-6 gap-1.5 rounded-md bg-score-surface p-1.5"><MiniDial name="Overall" score={s.overall} overall />{s.influences.map((i) => <MiniDial key={i.name} {...i} />)}</div></PermissionGate>
          </article>)}</div>
        </section>
      </>}
    </div>
  </AdminLayout>;
}
