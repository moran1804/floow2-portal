import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useCustomer } from "@/contexts/CustomerContext";

type Filters = { from: string; to: string; userId: string };
const empty: Filters = { from: "", to: "", userId: "" };
const today = () => format(new Date(), "yyyy-MM-dd");

const TrackingFailuresPage = () => {
  const { selectedCustomerId } = useCustomer();
  const [draft, setDraft] = useState<Filters>(empty);
  const [applied, setApplied] = useState<Filters>(empty);
  const [perPage, setPerPage] = useState(25);
  const [page, setPage] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ["tracking-failures", selectedCustomerId, applied, perPage, page], enabled: !!selectedCustomerId,
    queryFn: async () => {
      let q = supabase.from("tracking_failures").select("*", { count: "exact" }).eq("customer_id", selectedCustomerId!).order("failed_at", { ascending: false });
      if (applied.from) q = q.gte("failed_at", new Date(applied.from).toISOString());
      if (applied.to) q = q.lte("failed_at", new Date(applied.to).toISOString());
      if (applied.userId.trim()) q = q.eq("user_id", applied.userId.trim());
      const { data, count, error } = await q.range(page * perPage, page * perPage + perPage - 1);
      if (error) throw error;
      return { rows: data, count: count ?? 0 };
    },
  });
  const rows = data?.rows ?? [];
  const total = data?.count ?? 0;
  const invalid = !!draft.from && !!draft.to && draft.from > draft.to;

  const pager = (
    <div className="flex flex-wrap items-center gap-4 px-4 py-3 text-sm text-portal-muted">
      <label className="flex items-center gap-2">Items per page:
        <select value={perPage} onChange={(e) => { setPerPage(+e.target.value); setPage(0); }} className="border border-portal-border rounded px-2 py-1 bg-portal-panel">
          {[25, 50, 100].map((n) => <option key={n}>{n}</option>)}
        </select>
      </label>
      {total > 0 && <span>{page * perPage + 1} - {Math.min(total, (page + 1) * perPage)} of {total} items</span>}
      {total > perPage && (
        <span className="flex gap-2">
          <Button size="sm" variant="ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
          <Button size="sm" variant="ghost" disabled={(page + 1) * perPage >= total} onClick={() => setPage(page + 1)}>Next</Button>
        </span>
      )}
    </div>
  );

  return (
    <AdminLayout title="Tracking Failures" crumbs={[{ label: "Home", to: "/admin/overview" }, { label: "Developer tools", to: "/admin/developer" }, { label: "Campaigns", to: "/admin/developer/campaigns" }, { label: "Tracking Failures" }]}>
      <div className="max-w-5xl space-y-6">
        <form className="bg-portal-panel border border-portal-border rounded-md p-6 grid md:grid-cols-4 gap-4 items-start" onSubmit={(e) => { e.preventDefault(); if (!invalid) { setApplied(draft); setPage(0); } }}>
          <div>
            <label htmlFor="tf-from" className="block text-sm font-semibold mb-2">Date from</label>
            <Input id="tf-from" type="datetime-local" value={draft.from} onChange={(e) => setDraft({ ...draft, from: e.target.value })} />
            <button type="button" className="text-sm underline mt-1" onClick={() => setDraft({ ...draft, from: `${today()}T00:00` })}>Start of day</button>
          </div>
          <div>
            <label htmlFor="tf-to" className="block text-sm font-semibold mb-2">Date to</label>
            <Input id="tf-to" type="datetime-local" value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} />
            <button type="button" className="text-sm underline mt-1" onClick={() => setDraft({ ...draft, to: `${today()}T23:59` })}>End of day</button>
          </div>
          <div>
            <label htmlFor="tf-user" className="block text-sm font-semibold mb-2">User ID</label>
            <Input id="tf-user" value={draft.userId} onChange={(e) => setDraft({ ...draft, userId: e.target.value })} />
          </div>
          <div className="md:pt-7 flex flex-col items-center gap-2">
            <Button type="submit" className="w-full" disabled={invalid}>Update results</Button>
            <button type="button" className="text-sm underline" onClick={() => { setDraft(empty); setApplied(empty); setPage(0); }}>Clear filters</button>
          </div>
          {invalid && <p role="alert" className="md:col-span-4 text-sm text-destructive">"Date to" must be after "Date from".</p>}
        </form>

        <section className="bg-portal-panel border border-portal-border rounded-md overflow-x-auto">
          {pager}
          <table className="w-full text-sm">
            <thead><tr className="bg-portal-panel-header text-left">
              {["ID", "Failed at", "Update Type", "Status code", "Error"].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}
            </tr></thead>
            <tbody>
              {isLoading && <tr><td colSpan={5} className="px-4 py-4 text-center text-portal-muted">Loading…</td></tr>}
              {error && <tr><td colSpan={5} className="px-4 py-4 text-center text-destructive">Failures could not be loaded.</td></tr>}
              {!isLoading && !error && rows.length === 0 && <tr><td colSpan={5} className="px-4 py-4 text-center">No failures found.</td></tr>}
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-portal-border">
                  <td className="px-4 py-3 break-all">{r.user_id}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{format(new Date(r.failed_at), "dd/MM/yyyy HH:mm")}</td>
                  <td className="px-4 py-3">{r.update_type}</td>
                  <td className="px-4 py-3">{r.status_code ?? "—"}</td>
                  <td className="px-4 py-3">{r.error ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {pager}
        </section>
      </div>
    </AdminLayout>
  );
};

export default TrackingFailuresPage;