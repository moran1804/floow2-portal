import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Plus, Smartphone } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCustomer } from "@/contexts/CustomerContext";

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-1 py-2 text-sm">
    <dt className="font-semibold text-portal-text">{label}</dt>
    <dd className="md:col-span-2 text-portal-muted break-all whitespace-pre-line">{value || "—"}</dd>
  </div>
);

const AppsPage = () => {
  const { selectedCustomerId } = useCustomer();
  const [open, setOpen] = useState<string | null>(null);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const { data: apps = [], isLoading, error } = useQuery({
    queryKey: ["apps", selectedCustomerId],
    enabled: !!selectedCustomerId,
    queryFn: async () => {
      const { data, error } = await supabase.from("apps").select("*").eq("customer_id", selectedCustomerId!).order("name");
      if (error) throw error;
      return data;
    },
  });
  const pages = Math.max(1, Math.ceil(apps.length / perPage));
  const shown = apps.slice(page * perPage, page * perPage + perPage);

  return (
    <AdminLayout title="Apps" crumbs={[{ label: "Home", to: "/admin/overview" }, { label: "Developer tools", to: "/admin/developer" }, { label: "Apps" }]}>
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-portal-navy">Your apps</h2>
          <Button asChild variant="outline" className="border-portal-navy text-portal-navy">
            <Link to="/admin/developer/apps/add">Add App <Plus className="w-4 h-4" /></Link>
          </Button>
        </div>
        {isLoading && <p className="text-portal-muted">Loading…</p>}
        {error && <p role="alert" className="text-destructive">Apps could not be loaded.</p>}
        {!isLoading && !error && apps.length === 0 && (
          <div className="bg-portal-panel border border-portal-border rounded-md p-6 text-portal-muted">No apps yet. Use Add App to create one.</div>
        )}
        <div className="space-y-3">
          {shown.map((a) => (
            <div key={a.id} className="bg-portal-panel border border-portal-border rounded-md">
              <button type="button" onClick={() => setOpen(open === a.id ? null : a.id)} className="w-full flex items-center gap-3 p-5 text-left" aria-expanded={open === a.id}>
                <span className="w-9 h-9 rounded bg-portal-panel-header flex items-center justify-center text-portal-navy"><Smartphone className="w-5 h-5" /></span>
                <span className="flex-1 font-bold text-portal-text">{a.name}</span>
                {open === a.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {open === a.id && (
                <dl className="border-t border-portal-border px-5 py-3">
                  <Row label="App ID" value={a.id} />
                  <Row label="App type" value={a.app_type === "floow_managed" ? "The Floow managed end user application" : "Self managed end user application"} />
                  {a.app_type === "floow_managed" ? (
                    <>
                      <Row label="Callback URLs" value={a.callback_urls.join("\n")} />
                      <Row label="Allowed signout URLs" value={a.signout_urls.join("\n")} />
                    </>
                  ) : (
                    <>
                      <Row label="OIDC Issuer url" value={a.oidc_issuer_url ?? ""} />
                      <Row label="Expected aud claim" value={a.aud_claim ?? ""} />
                      <Row label="JWT userId claim" value={a.user_id_claim || "sub"} />
                    </>
                  )}
                </dl>
              )}
            </div>
          ))}
        </div>
        {apps.length > 0 && (
          <div className="flex items-center gap-4 mt-4 text-sm text-portal-muted">
            <label className="flex items-center gap-2">Items per page:
              <select value={perPage} onChange={(e) => { setPerPage(+e.target.value); setPage(0); }} className="border border-portal-border rounded px-2 py-1 bg-portal-panel">
                {[10, 25, 50].map((n) => <option key={n}>{n}</option>)}
              </select>
            </label>
            <span>{page * perPage + 1} - {Math.min(apps.length, (page + 1) * perPage)} of {apps.length} items</span>
            {pages > 1 && (
              <span className="flex gap-2">
                <Button size="sm" variant="ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
                <Button size="sm" variant="ghost" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>Next</Button>
              </span>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AppsPage;