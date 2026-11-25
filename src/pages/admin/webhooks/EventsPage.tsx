import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useCustomer } from "@/contexts/CustomerContext";

const EventsPage = () => {
  const { selectedCustomerId } = useCustomer();
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ["webhook_events", selectedCustomerId],
    enabled: !!selectedCustomerId,
    queryFn: async () => {
      const { data, error } = await supabase.from("webhook_events").select("*").eq("customer_id", selectedCustomerId!).order("sent_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
  });
  const cols = "grid grid-cols-[1.2fr_1fr_0.8fr] gap-4 px-6";
  return (
    <AdminLayout title="Webhook events" crumbs={[{ label: "Home", to: "/admin/overview" }, { label: "Developer tools", to: "/admin/developer" }, { label: "Webhooks", to: "/admin/developer/webhooks" }, { label: "Events" }]}>
      <div className="max-w-6xl">
        <h2 className="text-3xl font-bold text-portal-navy mb-4">Latest events</h2>
        <div className="bg-portal-panel border border-portal-border rounded-md overflow-hidden">
          <div className={`${cols} bg-portal-panel-header py-3 font-semibold`}><span>Event</span><span>Event Type</span><span>Date</span></div>
          {isLoading && <p className="px-6 py-3 text-portal-muted">Loading…</p>}
          {error && <p role="alert" className="px-6 py-3 text-destructive">Events could not be loaded.</p>}
          {!isLoading && !error && events.length === 0 && <p className="px-6 py-3">There are no recent events to display</p>}
          {events.map((e, i) => (
            <div key={e.id} className={`${cols} py-3 text-sm ${i % 2 ? "bg-portal-surface" : ""}`}>
              <code className="break-all">{e.id}</code><span className="font-mono">{e.event_type}</span><span>{new Date(e.sent_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};
export default EventsPage;
