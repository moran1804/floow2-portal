import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCustomer } from "@/contexts/CustomerContext";

const CredentialsPage = () => {
  const { selectedCustomerId } = useCustomer();
  const qc = useQueryClient();
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const { data: creds = [], isLoading, error } = useQuery({
    queryKey: ["api_credentials", selectedCustomerId],
    enabled: !!selectedCustomerId,
    queryFn: async () => {
      const { data, error } = await supabase.from("api_credentials").select("*").eq("customer_id", selectedCustomerId!).order("created_at");
      if (error) throw error;
      return data;
    },
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("api_credentials").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["api_credentials"] }),
  });
  const pages = Math.max(1, Math.ceil(creds.length / perPage));
  const shown = creds.slice(page * perPage, page * perPage + perPage);
  const Pager = () => (
    <div className="flex items-center gap-4 px-4 py-3 text-sm text-portal-text">
      <label className="flex items-center gap-2">Items per page:
        <select value={perPage} onChange={(e) => { setPerPage(+e.target.value); setPage(0); }} className="border border-portal-border rounded px-2 py-1 bg-portal-panel">
          {[10, 25, 50].map((n) => <option key={n}>{n}</option>)}
        </select>
      </label>
      <span className="border-l border-portal-border pl-4">{creds.length ? page * perPage + 1 : 0} - {Math.min(creds.length, (page + 1) * perPage)} of {creds.length} items</span>
      {pages > 1 && (<span className="flex gap-2">
        <Button size="sm" variant="ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
        <Button size="sm" variant="ghost" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>Next</Button>
      </span>)}
    </div>
  );
  return (
    <AdminLayout title="REST API Access" crumbs={[{ label: "Home", to: "/admin/overview" }, { label: "Developer tools", to: "/admin/developer" }, { label: "REST API", to: "/admin/developer/rest-api" }, { label: "Credentials" }]}>
      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-portal-navy">API credentials</h2>
          <Button asChild variant="outline" className="border-portal-navy text-portal-navy"><Link to="/admin/developer/rest-api/credentials/add">Create new credentials</Link></Button>
        </div>
        <div className="bg-portal-panel border border-portal-border rounded-md">
          <Pager />
          <div className="bg-portal-panel-header px-6 py-3 font-semibold">Name</div>
          {isLoading && <p className="px-6 py-3 text-portal-muted">Loading…</p>}
          {error && <p role="alert" className="px-6 py-3 text-destructive">Credentials could not be loaded.</p>}
          {!isLoading && !error && creds.length === 0 && <p className="px-6 py-3 text-portal-muted">No credentials yet.</p>}
          {shown.map((c, i) => (
            <div key={c.id} className={i % 2 ? "bg-portal-surface" : ""}>
              <button type="button" onClick={() => setOpen(open === c.id ? null : c.id)} className="w-full flex items-center justify-between px-6 py-3 text-left">
                <span className="text-sm font-semibold text-portal-navy underline">{c.name}</span>
                {open === c.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {open === c.id && (
                <div className="px-6 pb-4 text-sm space-y-2">
                  <div><span className="font-semibold">Client ID: </span><code>{c.client_id}</code></div>
                  <div><span className="font-semibold">Scopes: </span>{c.scopes.join(", ") || "—"}</div>
                  <Button size="sm" variant="outline" disabled={del.isPending} onClick={() => { if (confirm(`Delete credentials "${c.name}"?`)) del.mutate(c.id); }}>Delete</Button>
                </div>
              )}
            </div>
          ))}
          <Pager />
        </div>
      </div>
    </AdminLayout>
  );
};
export default CredentialsPage;
