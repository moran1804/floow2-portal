import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, ChevronRight, Search } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useCustomer } from "@/contexts/CustomerContext";
import UserScoreTile from "@/components/admin/UserScoreTile";
import UserJourneysSection from "@/components/admin/UserJourneysSection";
import UserFilesSection from "@/components/admin/UserFilesSection";
import UserDeviceSection from "@/components/admin/UserDeviceSection";
import { sampleDeviceInfo } from "@/lib/sampleDeviceInfo";
import UserTermsAcceptanceSection from "@/components/admin/UserTermsAcceptanceSection";

const influences = [{ name: "Mobile use", score: 79 }, { name: "Smooth driving", score: 67 }, { name: "Speed", score: 82 }, { name: "Time of day", score: 91 }, { name: "Time on task", score: 80 }];
const exampleDetails: Record<string, string> = {
  "Driver score": "An overall indication of driving risk based on five driver score influences.",
  "Mobile use": "Mobile use considers phone interactions during a journey.",
  "Smooth driving": "Smooth driving considers acceleration and braking behaviour.",
  "Speed": "Speed considers driving speed in the context of the journey.",
  "Time of day": "Time of day considers when journeys take place.",
  "Time on task": "Time on task considers the duration of driving activity.",
};
function DetailRows({ rows }: { rows: [string, string][] }) {
  return <dl className="space-y-4 text-xs">{rows.map(([label, value]) => <div key={label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-3"><dt className="text-portal-muted">{label}</dt><dd className="break-words text-right font-semibold">{value}</dd></div>)}</dl>;
}
const initialImpactFilters = { severity: "Low", probability: "Low", start: "", end: "", archived: false };

export default function UserAccountPage() {
  const { userId, section } = useParams();
  const { selectedCustomerId, selectedCustomer } = useCustomer();
  const [period, setPeriod] = useState("Lifetime score");
  const [periodOpen, setPeriodOpen] = useState(false);
  const [scoreDetail, setScoreDetail] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialImpactFilters);
  const [impactMessage, setImpactMessage] = useState("");
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["insurer-user", selectedCustomerId, userId],
    enabled: Boolean(selectedCustomerId && userId),
    queryFn: async () => {
      const { data, error } = await supabase.from("insurer_users").select("*, products(code)").eq("customer_id", selectedCustomerId ?? "").eq("id", userId ?? "").maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const sectionTitle = section === "journeys" ? "Journeys" : section === "files" ? "User files" : section === "terms" ? "Terms & Conditions Acceptance" : "User overview";
  const base = `/admin/insurer/users/${userId}`;
  const nav = [[base, "User overview"], [`${base}/journeys`, "Journeys"], [`${base}/files`, "Files"], [`${base}/terms`, "Terms Acceptance"]];
  const productCode = user?.products?.code ?? "Not assigned";
  const device = sampleDeviceInfo(userId ?? "");
  return <AdminLayout title={sectionTitle} subtitle={`User ID: ${userId ?? ""}`} crumbs={[{ label: "Search", to: "/admin/insurer/search" }, { label: selectedCustomer?.name ?? "Client" }, { label: userId ?? "User" }]}>
    <div className="mx-auto max-w-6xl space-y-7">
      <nav className="flex flex-wrap gap-2 md:hidden" aria-label="User account sections"><Button variant="ghost" size="sm" asChild><Link to="/admin/insurer/search"><ArrowLeft />Users</Link></Button>{nav.map(([to, label]) => <Button key={to} asChild variant="outline" size="sm"><Link to={to}>{label}</Link></Button>)}</nav>
      {isLoading ? <p role="status">Loading user…</p> : error ? <p role="alert">Unable to load this user. Please try again.</p> : !user ? <p role="status">This user was not found in the selected client.</p> : section === "journeys" ? <UserJourneysSection /> : section === "files" ? <UserFilesSection /> : section === "terms" ? <UserTermsAcceptanceSection userId={userId} /> : section ? <section><h2 className="mb-4 text-xl font-semibold text-portal-navy">{sectionTitle}</h2><p className="border border-portal-border bg-portal-panel p-5 text-sm text-portal-muted">{`${sectionTitle} are not connected for this user yet.`}</p></section> : <>
        <section><h2 className="mb-4 text-2xl font-semibold text-portal-navy">User Details</h2><div className="grid gap-5 rounded-md border border-portal-border bg-portal-panel p-5 sm:grid-cols-2"><DetailRows rows={[["Product code", productCode], ["First name", user.first_name], ["Display name", user.display_name]]} /><div className="sm:border-l sm:border-portal-border sm:pl-5"><DetailRows rows={[["Email", user.email], ["Last name", user.last_name]]} />{user.policy_client_id && <div className="mt-4 grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-3 text-xs"><span className="text-portal-muted">Policy</span><Link to={`/admin/insurer/policies/${encodeURIComponent(user.policy_client_id)}`} className="group flex items-center justify-end gap-1 font-semibold text-portal-navy underline-offset-4 hover:underline">{user.policy_client_id}<ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></Link></div>}</div></div></section>
        <section><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-semibold text-portal-navy">Scores</h2><div className="flex flex-wrap items-center gap-3 text-xs"><span>Period:</span><strong>{period}</strong><Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={() => setPeriodOpen(true)}>Change period<CalendarDays className="h-3 w-3" /></Button></div></div>
          <p className="mb-4 text-xs text-portal-muted">Example scores only · No driving or scoring data is connected for this user.</p>
          <div className="bg-portal-panel p-4 sm:p-5">
            <div className="grid gap-2 xl:grid-cols-[190px_minmax(0,1fr)]">
              <div className="flex items-center justify-center bg-score-surface p-5"><div className="w-full max-w-[160px]"><UserScoreTile name="Driver score" score={76} overall onOpen={() => setScoreDetail("Driver score")} /></div></div>
              <div className="min-w-0 bg-score-surface p-4 sm:p-6"><h3 className="mb-5 mt-2 text-xl font-semibold">Driver Score Influences</h3><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{influences.map((item) => <UserScoreTile key={item.name} {...item} onOpen={() => setScoreDetail(item.name)} />)}</div></div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2"><dl className="space-y-4 text-xs"><div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-3"><dt className="text-portal-muted">Phone / OS</dt><dd className="text-right font-semibold">{device.model} · {device.os}{!device.compatible && <span className="ml-2 inline-flex items-center gap-1 rounded-sm bg-destructive/10 px-1.5 py-0.5 text-[10px] text-destructive">May not be compatible</span>}</dd></div><div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-3"><dt className="text-portal-muted">Total distance driven</dt><dd className="text-right font-semibold">Not connected</dd></div></dl><div className="sm:border-l sm:border-portal-border sm:pl-5"><DetailRows rows={[["Total scored journeys", "Not connected"], ["Total time spent driving", "Not connected"]]} /></div></div>
          </div>
        </section>
        <UserDeviceSection info={device} createdAt={new Date(user.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} />
        <section><h2 className="mb-4 text-2xl font-semibold text-portal-navy">Search for an impact</h2><form className="rounded-md border border-portal-border bg-portal-panel p-5" onSubmit={(event) => { event.preventDefault(); setImpactMessage(filters.start && filters.end && filters.start > filters.end ? "End date and time must be after start date and time." : "Live impact records are not connected for this user. No impact search was performed."); }}><h3 className="mb-5 flex items-center gap-3 text-sm font-semibold"><span className="rounded-sm bg-portal-panel-header p-2"><Search className="h-4 w-4" /></span>Search options</h3><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{([['severity', 'Minimum severity'], ['probability', 'Minimum probability']] as const).map(([key, label]) => <div key={key} className="space-y-2"><Label htmlFor={`user-impact-${key}`} className="text-xs">{label}</Label><Select value={filters[key]} onValueChange={(value) => setFilters({ ...filters, [key]: value })}><SelectTrigger id={`user-impact-${key}`}><SelectValue /></SelectTrigger><SelectContent>{["Low", "Medium", "High"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div>)}{([['start', 'Start date and time'], ['end', 'End date and time']] as const).map(([key, label]) => <div key={key} className="min-w-0 space-y-2"><Label htmlFor={`user-impact-${key}`} className="text-xs">{label}</Label><Input id={`user-impact-${key}`} type="datetime-local" value={filters[key]} onChange={(event) => setFilters({ ...filters, [key]: event.target.value })} className="min-w-0" /></div>)}</div><div className="mt-4 flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-2"><Checkbox id="user-archived-impacts" checked={filters.archived} onCheckedChange={(checked) => setFilters({ ...filters, archived: checked === true })} /><Label htmlFor="user-archived-impacts" className="text-xs">Include archived impacts</Label></div><div className="flex gap-3"><Button type="button" variant="ghost" onClick={() => { setFilters(initialImpactFilters); setImpactMessage(""); }}>Reset all</Button><Button type="submit" className="min-w-32">Search</Button></div></div></form>{impactMessage && <p role="status" className="mt-4 text-sm text-portal-muted">{impactMessage}</p>}
          <div className="mt-5 overflow-hidden rounded-md border border-portal-border bg-portal-panel"><h3 className="border-b border-portal-border p-4 font-semibold">Impact records unavailable</h3><div className="overflow-x-auto"><table className="w-full min-w-[540px] text-left text-xs"><thead className="bg-portal-panel-header"><tr>{["Impact ID", "Date", "Severity", "Probability", "Status"].map((heading) => <th key={heading} className="p-3">{heading}</th>)}</tr></thead><tbody><tr><td colSpan={5} className="p-5 text-center text-portal-muted">No live impact source is connected for this user.</td></tr></tbody></table></div></div>
        </section>
      </>}
    </div>
    <Dialog open={periodOpen} onOpenChange={setPeriodOpen}><DialogContent><DialogHeader><DialogTitle>Change period</DialogTitle><DialogDescription>Example scores only. Selecting a period does not retrieve live scoring data.</DialogDescription></DialogHeader><Select value={period} onValueChange={(value) => { setPeriod(value); setPeriodOpen(false); }}><SelectTrigger aria-label="Score period"><SelectValue /></SelectTrigger><SelectContent>{["Lifetime score", "Last 7 days", "Last 30 days", "Last 90 days"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></DialogContent></Dialog>
    <Dialog open={scoreDetail !== null} onOpenChange={(open) => { if (!open) setScoreDetail(null); }}><DialogContent><DialogHeader><DialogTitle>{scoreDetail}</DialogTitle><DialogDescription>Illustrative score explanation, not this user's driving history.</DialogDescription></DialogHeader><p className="text-sm">{scoreDetail ? exampleDetails[scoreDetail] : ""}</p><Button asChild variant="outline"><Link to="/admin/documentation/driver-score">Driver score documentation<ChevronRight className="h-4 w-4" /></Link></Button></DialogContent></Dialog>
  </AdminLayout>;
}