import { FormEvent, useState } from "react";
import { format } from "date-fns";
import { AlertTriangle, ArrowDown, ArrowUp, ArrowUpDown, ChevronRight, Info, RefreshCw, Search } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCustomer } from "@/contexts/CustomerContext";

// Presentation-only records, never loaded into or written to client telemetry.
const sampleImpacts = [
  { id: "sample-1", date: "2025-10-19T11:05:04", speed: 35, likelihood: 3, archived: false },
  { id: "sample-2", date: "2025-10-13T04:50:28", speed: 41, likelihood: 3, archived: false },
  { id: "sample-3", date: "2025-11-03T21:18:43", speed: 43, likelihood: 3, archived: false },
  { id: "sample-4", date: "2025-11-13T13:01:12", speed: 37, likelihood: 3, archived: false },
  { id: "sample-5", date: "2025-11-19T11:54:18", speed: 40, likelihood: 3, archived: false },
  { id: "sample-6", date: "2025-10-10T09:30:00", speed: 28, likelihood: 2, archived: true },
];
type Impact = typeof sampleImpacts[number];
type Filters = { start: string; end: string; likelihood: string; archived: boolean };
const defaults: Filters = { start: "", end: "", likelihood: "3", archived: false };
const likelihoodLabels: Record<number, string> = { 1: "Possible", 2: "Likely", 3: "Very Likely" };
type SortKey = "date" | "speed" | "likelihood" | "archived";

const ImpactsPage = () => {
  const { selectedCustomer } = useCustomer();
  const [filters, setFilters] = useState(defaults);
  const [applied, setApplied] = useState(defaults);
  const [selected, setSelected] = useState<string[]>([]);
  const [detail, setDetail] = useState<Impact | null>(null);
  const [error, setError] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; descending: boolean }>({ key: "archived", descending: true });
  const rows = sampleImpacts.filter((row) =>
    (applied.archived || !row.archived) && row.likelihood >= Number(applied.likelihood) &&
    (!applied.start || new Date(row.date) >= new Date(applied.start)) &&
    (!applied.end || new Date(row.date) <= new Date(applied.end))
  ).sort((a, b) => {
    const comparison = sort.key === "date" ? a.date.localeCompare(b.date) : Number(a[sort.key]) - Number(b[sort.key]);
    return sort.descending ? -comparison : comparison;
  });
  const selectedCount = rows.filter((row) => selected.includes(row.id)).length;
  const search = (event: FormEvent) => {
    event.preventDefault();
    if (filters.start && filters.end && new Date(filters.start) > new Date(filters.end)) {
      setError("End date and time must be after start date and time.");
      return;
    }
    setError(""); setApplied(filters); setSelected([]);
  };
  const reset = () => { setFilters(defaults); setApplied(defaults); setSelected([]); setError(""); };
  const sortColumn = (key: SortKey, label: string) => (
    <Button variant="ghost" className="h-auto gap-2 px-0 py-2 text-xs font-semibold hover:bg-transparent" onClick={() => setSort({ key, descending: sort.key === key ? !sort.descending : false })}>
      {label}{sort.key === key ? (sort.descending ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3" />}
    </Button>
  );

  return (
    <AdminLayout title="Impacts detected" crumbs={[{ label: "Insurer Portal", to: "/admin/insurer" }, { label: selectedCustomer?.name ?? "Impacts detected" }]}>
      <div className="mx-auto max-w-4xl space-y-5">
        <form onSubmit={search} className="rounded-md border border-portal-border bg-portal-panel p-5">
          <h2 className="mb-6 flex items-center gap-3 text-base font-semibold"><span className="flex h-9 w-9 items-center justify-center rounded-sm bg-portal-panel-header text-portal-navy"><Search className="h-5 w-5" /></span>Search for an impact</h2>
          <div className="grid gap-5 md:grid-cols-3">
            <div className="min-w-0 space-y-2"><Label htmlFor="impact-start">Start date and time</Label><Input id="impact-start" type="datetime-local" value={filters.start} onChange={(e) => setFilters({ ...filters, start: e.target.value })} className="min-w-0 rounded-sm" /></div>
            <div className="min-w-0 space-y-2"><Label htmlFor="impact-end">End date and time</Label><Input id="impact-end" type="datetime-local" value={filters.end} onChange={(e) => setFilters({ ...filters, end: e.target.value })} className="min-w-0 rounded-sm" /></div>
            <div className="space-y-2"><Label htmlFor="impact-likelihood" className="flex items-center gap-2"><Info className="h-3 w-3 text-portal-muted" aria-hidden="true" />Minimum likelihood</Label><Select value={filters.likelihood} onValueChange={(likelihood) => setFilters({ ...filters, likelihood })}><SelectTrigger id="impact-likelihood" className="rounded-sm"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(likelihoodLabels).map(([value, label]) => <SelectItem value={value} key={value}>{label}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="mt-5 grid items-center gap-4 md:grid-cols-3"><Button type="submit" className="rounded-sm">Search</Button><Button type="button" variant="ghost" onClick={reset} className="justify-self-start px-0">Reset all</Button><div className="flex items-center gap-2 md:justify-end"><Checkbox id="archived-impacts" checked={filters.archived} onCheckedChange={(checked) => setFilters({ ...filters, archived: checked === true })} /><Label htmlFor="archived-impacts" className="text-xs">Include archived impacts</Label></div></div>
          {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
        </form>

        <section aria-label="Impact results" className="overflow-hidden rounded-md border border-portal-border bg-portal-panel">
          <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4"><span className="text-xs font-semibold" aria-live="polite">{selectedCount} of {rows.length} row(s) selected.</span><div className="flex items-center gap-3"><span className="text-xs text-portal-muted">Sample data · Not connected to live impacts</span><Button variant="ghost" size="icon" title="Refresh results" aria-label="Refresh results" onClick={() => { setApplied({ ...applied }); setSelected([]); }}><RefreshCw className="h-4 w-4" /></Button></div></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[690px] text-left text-xs">
              <thead className="bg-portal-panel-header"><tr><th className="w-12 px-5 py-3"><Checkbox aria-label="Select all impacts" checked={rows.length > 0 && selectedCount === rows.length ? true : selectedCount > 0 ? "indeterminate" : false} disabled={!rows.length} onCheckedChange={(checked) => setSelected(checked ? rows.map((row) => row.id) : [])} /></th>{([['date', 'Date and time'], ['speed', 'Estimated speed'], ['likelihood', 'Likelihood'], ['archived', 'Status']] as [SortKey, string][]).map(([key, label]) => <th key={key} aria-sort={sort.key === key ? (sort.descending ? "descending" : "ascending") : "none"} className="px-3">{sortColumn(key, label)}</th>)}<th className="relative w-12"><span className="sr-only">Details</span></th></tr></thead>
              <tbody>{rows.map((row) => <tr key={row.id} className={`border-t border-portal-border ${selected.includes(row.id) ? "bg-portal-surface" : ""}`}><td className="px-5 py-4"><Checkbox aria-label={`Select impact ${row.id}`} checked={selected.includes(row.id)} onCheckedChange={(checked) => setSelected(checked ? [...selected, row.id] : selected.filter((id) => id !== row.id))} /></td><td className="px-3"><Button variant="link" className="h-auto p-0 text-xs font-semibold underline" onClick={() => setDetail(row)}>{format(new Date(row.date), "do MMMM yyyy, hh:mm:ss a")}</Button></td><td className="px-3">{row.speed} mph</td><td className="px-3"><span className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-3 w-3 text-destructive" />{likelihoodLabels[row.likelihood]}</span></td><td className="px-3"><span className={`rounded-sm px-2 py-1 text-[10px] font-semibold ${row.archived ? "bg-muted text-muted-foreground" : "bg-destructive/10 text-destructive"}`}>{row.archived ? "ARCHIVED" : "NEW"}</span></td><td className="pr-5"><Button size="icon" className="h-7 w-7 rounded-sm" aria-label={`View impact ${row.id}`} onClick={() => setDetail(row)}><ChevronRight className="h-4 w-4" /></Button></td></tr>)}{!rows.length && <tr><td colSpan={6} className="p-10 text-center text-portal-muted">No sample impacts match your filters.</td></tr>}</tbody>
            </table>
          </div>
          <div className="border-t border-portal-border px-5 py-4 text-xs text-portal-muted">{rows.length ? `Showing 1–${rows.length} of ${rows.length} impacts` : "0 impacts"}</div>
        </section>
      </div>
      <Dialog open={detail !== null} onOpenChange={(open) => { if (!open) setDetail(null); }}><DialogContent><DialogHeader><DialogTitle>Impact details</DialogTitle></DialogHeader>{detail && <div className="space-y-4 text-sm"><p className="text-portal-muted">Sample impact · Not a live client record</p><dl className="grid grid-cols-2 gap-4"><dt>Date and time</dt><dd>{format(new Date(detail.date), "do MMMM yyyy, HH:mm:ss")}</dd><dt>Estimated speed</dt><dd>{detail.speed} mph</dd><dt>Likelihood</dt><dd>{likelihoodLabels[detail.likelihood]}</dd><dt>Status</dt><dd>{detail.archived ? "Archived" : "New"}</dd></dl></div>}</DialogContent></Dialog>
    </AdminLayout>
  );
};
export default ImpactsPage;