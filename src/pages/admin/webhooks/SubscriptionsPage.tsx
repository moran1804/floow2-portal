import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCustomer } from "@/contexts/CustomerContext";

const crumbs = [{ label: "Home", to: "/admin/overview" }, { label: "Developer tools", to: "/admin/developer" }, { label: "Webhooks", to: "/admin/developer/webhooks" }, { label: "Subscriptions" }];

const SubscriptionsPage = () => {
  const { selectedCustomerId } = useCustomer();
  const qc = useQueryClient();
  const { data: subs = [], isLoading, error } = useQuery({
    queryKey: ["webhook_subscriptions", selectedCustomerId],
    enabled: !!selectedCustomerId,
    queryFn: async () => {
      const { data, error } = await supabase.from("webhook_subscriptions").select("*").eq("customer_id", selectedCustomerId!).order("created_at");
      if (error) throw error;
      return data;
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["webhook_subscriptions"] });
  const toggle = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => { const { error } = await supabase.from("webhook_subscriptions").update({ is_active }).eq("id", id); if (error) throw error; },
    onSuccess: refresh,
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("webhook_subscriptions").delete().eq("id", id); if (error) throw error; },
    onSuccess: refresh,
  });
  const cols = "grid grid-cols-[1fr_1.4fr_1.2fr_0.5fr_0.8fr] gap-4 px-6";
  return (
    <AdminLayout title="Webhook Subscriptions" crumbs={crumbs}>
      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-portal-navy">Webhook subscriptions</h2>
          <Button asChild variant="outline" className="border-portal-navy text-portal-navy"><Link to="/admin/developer/webhooks/subscriptions/add">Add webhook +</Link></Button>
        </div>
        <div className="bg-portal-panel border border-portal-border rounded-md overflow-hidden">
          <div className={`${cols} bg-portal-panel-header py-3 font-semibold`}><span>Description</span><span>Target</span><span>Event Types</span><span>State</span><span>Actions</span></div>
          {isLoading && <p className="px-6 py-3 text-portal-muted">Loading…</p>}
          {error && <p role="alert" className="px-6 py-3 text-destructive">Subscriptions could not be loaded.</p>}
          {!isLoading && !error && subs.length === 0 && <p className="px-6 py-3">There are no webhook subscriptions currently in place.</p>}
          {subs.map((s, i) => (
            <div key={s.id} className={`${cols} py-3 text-sm items-start ${i % 2 ? "bg-portal-surface" : ""}`}>
              <span className="font-semibold">{s.description}</span>
              <span className="break-all">{s.url}</span>
              <span className="space-y-0.5">{s.event_types.map((t) => <div key={t} className="font-mono text-xs">{t}</div>)}</span>
              <span>{s.is_active ? "Active" : "Inactive"}</span>
              <span className="flex flex-col gap-1 items-start">
                <button type="button" className="text-portal-navy underline" disabled={toggle.isPending} onClick={() => toggle.mutate({ id: s.id, is_active: !s.is_active })}>{s.is_active ? "Deactivate" : "Activate"}</button>
                <button type="button" className="text-destructive underline" disabled={del.isPending} onClick={() => { if (confirm(`Delete subscription "${s.description}"?`)) del.mutate(s.id); }}>Delete</button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};
export default SubscriptionsPage;
